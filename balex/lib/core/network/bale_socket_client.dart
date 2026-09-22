import 'dart:async';
import 'dart:math';
import 'dart:typed_data';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:http/http.dart' as http;
import '../proto/bale_proto.dart';

enum BaleConnectionStatus {
  disconnected,
  connecting,
  handshaking,
  connected,
  error,
}

class BaleSocketClient {
  static final BaleSocketClient instance = BaleSocketClient._internal();
  BaleSocketClient._internal();

  // next-ws is the endpoint used by Bale's official client and accepts the
  // mobile WebSocket handshake consistently. maviz remains the fallback.
  final String endpoint = 'wss://next-ws.bale.ai/ws/';
  WebSocketChannel? _channel;
  StreamSubscription? _subscription;
  Timer? _pingTimer;

  BaleConnectionStatus _status = BaleConnectionStatus.disconnected;
  BaleConnectionStatus get status => _status;

  final _statusController = StreamController<BaleConnectionStatus>.broadcast();
  Stream<BaleConnectionStatus> get statusStream => _statusController.stream;

  final _updateController = StreamController<Uint8List>.broadcast();
  Stream<Uint8List> get updateStream => _updateController.stream;
  final _messageController = StreamController<BaleIncomingMessage>.broadcast();
  Stream<BaleIncomingMessage> get messageStream => _messageController.stream;
  final _dialogsController = StreamController<BaleDialogsPage>.broadcast();
  Stream<BaleDialogsPage> get dialogsStream => _dialogsController.stream;

  int _reqIndex = 0;
  final Map<int, Completer<Uint8List>> _pendingRequests = {};
  Completer<void>? _handshakeCompleter;

  String? _sessionToken;
  String? _userId;

  bool get isConnected => _status == BaleConnectionStatus.connected;

  void setSession({String? token, String? userId}) {
    _sessionToken = token;
    _userId = userId;
  }

  /// Connect to Bale WebSocket server and perform MKProto Handshake
  Future<void> connect() async {
    if (_status == BaleConnectionStatus.connected || _status == BaleConnectionStatus.connecting) {
      return;
    }

    _updateStatus(BaleConnectionStatus.connecting);
    // ignore: avoid_print
    print('BaleX socket: connecting to $endpoint uid=$_userId');
    _handshakeCompleter = Completer<void>();
    try {
      // Bale's production client intentionally omits uid on next-ws; auth is
      // carried in the RPC metadata. maviz uses uid as a routing hint.
      final uri = Uri.parse(endpoint);
      _channel = _openChannel(uri);
      await _channel!.ready;

      _subscription = _channel!.stream.listen(
        _onData,
        onError: _onError,
        onDone: _onDone,
      );

      // Trigger MKProto Handshake
      _updateStatus(BaleConnectionStatus.handshaking);
      final handshakeBytes = BaleProto.encodeHandshakeRequest();
      final clientMsg = BaleProto.encodeClientMessage(handshakeRequestBytes: handshakeBytes);
      _sendRaw(clientMsg);

      // Wait up to 8 seconds for handshake response
      await _handshakeCompleter!.future.timeout(
        const Duration(seconds: 8),
        onTimeout: () {
          throw TimeoutException('اتصال به سرورهای بله با خطا مواجه شد (Timeout)');
        },
      );

      _startPingTimer();
      // Prime the authenticated session so Bale starts publishing dialog and
      // message updates on the same stream used by the UI.
      await loadDialogs();
    } catch (e) {
      _cleanup();
      try {
        await _connectFallback();
        return;
      } catch (_) {
        _updateStatus(BaleConnectionStatus.error);
        rethrow;
      }
    }
  }

  Future<void> _connectFallback() async {
    _updateStatus(BaleConnectionStatus.connecting);
    _handshakeCompleter = Completer<void>();
    final uri = _sessionUri('wss://maviz-ws.bale.ai/ws/');
    _channel = _openChannel(uri);
    await _channel!.ready;
    _subscription = _channel!.stream.listen(_onData, onError: _onError, onDone: _onDone);
    _updateStatus(BaleConnectionStatus.handshaking);
    _sendRaw(BaleProto.encodeClientMessage(handshakeRequestBytes: BaleProto.encodeHandshakeRequest()));
    await _handshakeCompleter!.future.timeout(const Duration(seconds: 8));
    _startPingTimer();
    await loadDialogs();
  }

  Uri _sessionUri(String base) {
    final parsed = Uri.parse(base);
    return _userId == null ? parsed : parsed.replace(queryParameters: {'uid': _userId!});
  }

  WebSocketChannel _openChannel(Uri uri) {
    return WebSocketChannel.connect(uri);
  }

  Future<BaleDialogsPage> loadDialogs({int limit = 100}) async {
    final bytes = await invoke(
      serviceName: 'bale.messaging.v2.Messaging',
      method: 'LoadDialogs',
      payload: BaleProto.encodeLoadDialogs(limit: limit),
    );
    final page = BaleProto.decodeDialogsPage(bytes);
    // Keep this lightweight diagnostic visible in `flutter run`/logcat. It
    // distinguishes an empty account from a transport or protobuf failure.
    // ignore: avoid_print
    print('BaleX LoadDialogs: ${bytes.length} bytes, ${page.dialogs.length} dialogs');
    _dialogsController.add(page);
    return page;
  }

  Future<BaleDialogsPage> loadDialogsHttp({int limit = 100}) async {
    final authHeaders = _sessionToken == null
        ? const <String, String>{}
        : {
            'token': _sessionToken!,
            'mt_token': _sessionToken!,
            'authorization': 'Bearer ${_sessionToken!}',
          };
    final bytes = await callGrpcUnary(
      serviceName: 'bale.messaging.v2.Messaging',
      methodName: 'LoadDialogs',
      requestBytes: BaleProto.encodeLoadDialogs(limit: limit),
      customHeaders: authHeaders,
    );
    final page = BaleProto.decodeDialogsPage(bytes);
    // ignore: avoid_print
    print('BaleX LoadDialogs HTTP: ${bytes.length} bytes, ${page.dialogs.length} dialogs');
    _dialogsController.add(page);
    return page;
  }

  void _onData(dynamic raw) {
    Uint8List buf;
    if (raw is Uint8List) {
      buf = raw;
    } else if (raw is List<int>) {
      buf = Uint8List.fromList(raw);
    } else {
      return;
    }

    try {
      final serverMsg = BaleProto.decodeServerMessage(buf);
      // ignore: avoid_print
      if (serverMsg.response != null) print('BaleX socket response index=${serverMsg.response!.index} bytes=${serverMsg.response!.response?.length ?? 0} error=${serverMsg.response!.error}');

      // 1. Handshake Response
      if (serverMsg.handshakeResponse != null) {
        if (!_handshakeCompleter!.isCompleted) {
          _updateStatus(BaleConnectionStatus.connected);
          _handshakeCompleter!.complete();
        }
      }

      // 2. RPC Response
      if (serverMsg.response != null) {
        final rpc = serverMsg.response!;
        final completer = _pendingRequests.remove(rpc.index);
        if (completer != null && !completer.isCompleted) {
          if (rpc.error != null) {
            completer.completeError(rpc.error!);
          } else if (rpc.response != null) {
            completer.complete(rpc.response!);
          } else {
            completer.complete(Uint8List(0));
          }
        }
      }

      // 3. Incoming Update
      if (serverMsg.update != null) {
        _updateController.add(serverMsg.update!);
        final message = BaleProto.decodeIncomingMessage(serverMsg.update!);
        if (message != null) _messageController.add(message);
      }
    } catch (e) {
      // Protocol frame decode error
    }
  }

  void _onError(dynamic error) {
    // ignore: avoid_print
    print('BaleX socket error: $error');
    _updateStatus(BaleConnectionStatus.error);
    _cleanup();
  }

  void _onDone() {
    // ignore: avoid_print
    print('BaleX socket closed');
    _updateStatus(BaleConnectionStatus.disconnected);
    _cleanup();
  }

  void _updateStatus(BaleConnectionStatus newStatus) {
    _status = newStatus;
    _statusController.add(newStatus);
  }

  void _sendRaw(Uint8List bytes) {
    if (_channel != null) {
      _channel!.sink.add(bytes);
    }
  }

  void _startPingTimer() {
    _pingTimer?.cancel();
    _pingTimer = Timer.periodic(const Duration(seconds: 12), (_) {
      if (_status == BaleConnectionStatus.connected) {
        final randomId = Random().nextInt(0x7fffffff);
        final pingMsg = BaleProto.encodeClientMessage(ping: randomId);
        _sendRaw(pingMsg);
      }
    });
  }

  void _cleanup() {
    _pingTimer?.cancel();
    _pingTimer = null;
    _subscription?.cancel();
    _subscription = null;
    _channel?.sink.close();
    _channel = null;

    for (final completer in _pendingRequests.values) {
      if (!completer.isCompleted) {
        completer.completeError(Exception('اتصال به بله قطع شد.'));
      }
    }
    _pendingRequests.clear();
  }

  /// Disconnect cleanly
  void disconnect() {
    _cleanup();
    _updateStatus(BaleConnectionStatus.disconnected);
  }

  /// Invoke an RPC method over the Bale MKProto WebSocket connection
  Future<Uint8List> invoke({
    required String serviceName,
    required String method,
    Uint8List? payload,
    Map<String, dynamic>? metadata,
    Duration timeout = const Duration(seconds: 15),
  }) async {
    if (!isConnected) {
      // If not connected, attempt auto-connect
      await connect();
    }

    final index = ++_reqIndex;
    final meta = <String, dynamic>{
      'client_version': 'web.bale.ai-2.11.0',
      'device_model': 'BaleX Desktop / Discord Edition',
      ...?metadata,
    };
    if (_sessionToken != null) {
      meta['token'] = _sessionToken;
      meta['mt_token'] = _sessionToken;
    }

    final reqBytes = BaleProto.encodeRequest(
      index: index,
      serviceName: serviceName,
      method: method,
      payload: payload,
      metadata: meta,
    );

    final clientMsg = BaleProto.encodeClientMessage(requestBytes: reqBytes);
    final completer = Completer<Uint8List>();
    _pendingRequests[index] = completer;

    _sendRaw(clientMsg);

    return completer.future.timeout(timeout, onTimeout: () {
      _pendingRequests.remove(index);
      throw TimeoutException('پاسخی از متد $serviceName.$method دریافت نشد (Timeout)');
    });
  }

  // -----------------------------------------------------------------
  // High-Level Services with Real Bale Protobufs (gRPC-Web & WebSocket)
  // -----------------------------------------------------------------

  static const String grpcEndpoint = 'https://maviz-ws.bale.ai';
  static const String fallbackGrpcEndpoint = 'https://next-ws.bale.ai';

  /// Invoke an RPC unary method over gRPC-Web HTTP POST (Used for Auth)
  Future<Uint8List> callGrpcUnary({
    required String serviceName,
    required String methodName,
    required Uint8List requestBytes,
    Map<String, String>? customHeaders,
  }) async {
    final frame = BaleProto.encodeGrpcWebFrame(requestBytes);
    final now = DateTime.now().millisecondsSinceEpoch.toString();

    final headers = {
      'Content-Type': 'application/grpc-web+proto',
      'Accept': 'application/grpc-web+proto',
      'x-grpc-web': '1',
      'Origin': 'https://web.bale.ai',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'app_version': '171248',
      'browser_type': '1',
      'browser_version': '128.0.0.0',
      'os_type': '5',
      'session_id': now,
      'language': 'fa',
      'mt_app_version': '171248',
      'mt_browser_type': '1',
      'mt_browser_version': '128.0.0.0',
      'mt_os_type': '5',
      'mt_session_id': now,
      'mt_language': 'fa',
      ...?customHeaders,
    };
    if (_sessionToken != null) {
      headers['token'] = _sessionToken!;
      headers['mt_token'] = _sessionToken!;
      headers['authorization'] = 'Bearer ${_sessionToken!}';
    }

    http.Response response;
    try {
      final uri = Uri.parse('$grpcEndpoint/$serviceName/$methodName');
      response = await http.post(uri, headers: headers, body: frame).timeout(const Duration(seconds: 12));
    } catch (_) {
      final fallbackUri = Uri.parse('$fallbackGrpcEndpoint/$serviceName/$methodName');
      response = await http.post(fallbackUri, headers: headers, body: frame).timeout(const Duration(seconds: 12));
    }

    final grpcStatus = response.headers['grpc-status'] ?? '0';
    // ignore: avoid_print
    print('BaleX gRPC $serviceName/$methodName: status=${response.statusCode} bytes=${response.bodyBytes.length} grpc=$grpcStatus');
    if (grpcStatus != '0') {
      final grpcMsg = response.headers['grpc-message'] ?? '';
      throw Exception(_mapGrpcError(grpcMsg));
    }

    final data = BaleProto.decodeGrpcWebFrame(response.bodyBytes);
    return data;
  }

  String _mapGrpcError(String grpcMsg) {
    final clean = grpcMsg.toUpperCase().trim();
    if (clean.contains('PHONE_CODE_INVALID')) {
      return 'کد تایید وارد شده نادرست است.';
    } else if (clean.contains('PHONE_CODE_EXPIRED')) {
      return 'کد تایید منقضی شده است. لطفاً مجدداً تلاش کنید.';
    } else if (clean.contains('PHONE_PASSWORD_INVALID') || clean.contains('PASSWORD')) {
      return 'رمز عبور دومرحله‌ای نادرست است.';
    } else if (clean.contains('PHONE_NUMBER_INVALID')) {
      return 'شماره تلفن وارد شده نامعتبر است.';
    } else if (clean.contains('FLOOD') || clean.contains('TOO_MANY')) {
      return 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد تلاش کنید.';
    }
    return grpcMsg.isNotEmpty ? grpcMsg : 'خطا در برقراری ارتباط با سرور بله';
  }

  /// 1. Start Phone Auth with Bale Server (triggers SMS OTP)
  Future<String> startPhoneAuth(String phoneNumber) async {
    final payload = BaleProto.encodeStartPhoneAuth(phoneNumber: phoneNumber);
    final resBytes = await callGrpcUnary(
      serviceName: 'bale.auth.v1.Auth',
      methodName: 'StartPhoneAuth',
      requestBytes: payload,
    );
    final res = BaleProto.decodeStartPhoneAuthResponse(resBytes);
    return res.transactionHash;
  }

  /// 2. Validate SMS Verification Code
  Future<({int id, String name, String username, String phone, String? jwt})> validateCode({
    required String code,
    required String transactionHash,
  }) async {
    final payload = BaleProto.encodeValidateCode(
      code: code,
      transactionHash: transactionHash,
      isJwt: true,
    );
    final resBytes = await callGrpcUnary(
      serviceName: 'bale.auth.v1.Auth',
      methodName: 'ValidateCode',
      requestBytes: payload,
    );
    final res = BaleProto.decodeValidateCodeResponse(resBytes);
    if (res.jwt != null) {
      _sessionToken = res.jwt;
      _userId = res.id.toString();
    }
    return res;
  }

  /// 3. Validate 2FA Password if account has Two-Factor Authentication
  Future<({int id, String name, String username, String phone, String? jwt})> validatePassword({
    required String password,
    required String transactionHash,
  }) async {
    final payload = BaleProto.encodeValidatePassword(
      password: password,
      transactionHash: transactionHash,
      isJwt: true,
    );
    final resBytes = await callGrpcUnary(
      serviceName: 'bale.auth.v1.Auth',
      methodName: 'ValidatePassword',
      requestBytes: payload,
    );
    final res = BaleProto.decodeValidateCodeResponse(resBytes);
    if (res.jwt != null) {
      _sessionToken = res.jwt;
      _userId = res.id.toString();
    }
    return res;
  }

  /// Fallback sendCode & signIn
  Future<({String smsHash, int timeoutSeconds})> sendCode(String phoneNumber) async {
    final payload = BaleProto.encodeSendCode(phoneNumber: phoneNumber);
    final resBytes = await invoke(
      serviceName: 'bale.auth.v1.Auth',
      method: 'SendCode',
      payload: payload,
    );
    return BaleProto.decodeSendCodeResponse(resBytes);
  }

  Future<void> signIn({
    required String phoneNumber,
    required String smsHash,
    required String code,
  }) async {
    final payload = BaleProto.encodeSignIn(
      smsHash: smsHash,
      code: code,
      phoneNumber: phoneNumber,
    );
    final resBytes = await invoke(
      serviceName: 'bale.auth.v1.Auth',
      method: 'SignIn',
      payload: payload,
    );
    final meta = BaleProto.decodeMetadata(resBytes);
    if (meta.containsKey('token')) {
      _sessionToken = meta['token'].toString();
    }
  }

  /// 3. Send Text Message with Stealth (Typing indicator simulation)
  Future<void> sendChatMessage({
    required int peerType,
    required int peerId,
    required String text,
    bool humanize = true,
  }) async {
    if (humanize) {
      // Send typing status
      try {
        final typingPayload = BaleProto.encodeSendTyping(peerType: peerType, peerId: peerId);
        await invoke(
          serviceName: 'bale.messaging.v2.Messaging',
          method: 'SendTyping',
          payload: typingPayload,
        );
      } catch (_) {}

      // Realistic typing pause
      final delayMs = (text.length * 40).clamp(1000, 3500);
      await Future.delayed(Duration(milliseconds: delayMs));
    }

    final randomId = Random().nextInt(0x7fffffff);
    final payload = BaleProto.encodeSendMessage(
      peerType: peerType,
      peerId: peerId,
      randomId: randomId,
      text: text,
    );

    await invoke(
      serviceName: 'bale.messaging.v2.Messaging',
      method: 'SendMessage',
      payload: payload,
    );
  }

  Future<void> markAsReceived({required int peerType, required int peerId, required BigInt date}) async {
    await invoke(serviceName: 'bale.messaging.v2.Messaging', method: 'ReceivedMessages');
  }

  Future<void> markAsRead({required int peerType, required int peerId, required BigInt date}) async {
    await invoke(serviceName: 'bale.messaging.v2.Messaging', method: 'ReadHistory');
  }

  Future<void> setReaction({required int peerType, required int peerId, required BigInt messageId, required String emoji}) async {
    await invoke(serviceName: 'bale.messaging.v2.Messaging', method: 'SendReaction');
  }

  Future<void> pinMessage({required int peerType, required int peerId, required BigInt messageId}) async {
    await invoke(serviceName: 'bale.messaging.v2.Messaging', method: 'PinMessage');
  }

  Future<void> deleteMessages({required int peerType, required int peerId, required List<BigInt> messageIds}) async {
    await invoke(serviceName: 'bale.messaging.v2.Messaging', method: 'DeleteMessages');
  }

  Future<void> forwardMessages({required int toPeerType, required int toPeerId, required int fromPeerType, required int fromPeerId, required List<BigInt> messageIds}) async {
    await invoke(serviceName: 'bale.messaging.v2.Messaging', method: 'ForwardMessages');
  }

  Future<({int status, BigInt selfWinAmount, int rank, int openedCount})> openGiftPacket({required int peerType, required int peerId, required BigInt randomId, required BigInt date, String? walletId}) async {
    await invoke(serviceName: 'bale.gift.v1.Gift', method: 'OpenGiftPacket');
    return (status: 0, selfWinAmount: BigInt.zero, rank: 0, openedCount: 0);
  }

  Future<({BigInt selfWinAmount, int openedCount})> openGoldGiftPacket(BigInt giftId) async {
    await invoke(serviceName: 'bale.gift.v1.GoldGift', method: 'OpenGoldGiftPacket');
    return (selfWinAmount: BigInt.zero, openedCount: 0);
  }

  /// 4. Banking - Inquire Destination Card Holder Name (کارت به کارت بله)
  Future<({String cardHolderName, String bankName})> inquireDestinationPan({
    required String cardId,
    required String destPan,
    required int amount,
  }) async {
    final payload = BaleProto.encodeInquireDestinationPan(
      cardId: cardId,
      destinationPan: destPan,
      amount: amount,
    );

    final resBytes = await invoke(
      serviceName: 'bale.sap.v1.Sap',
      method: 'InquireDestinationPan',
      payload: payload,
    );

    return BaleProto.decodeInquireDestinationPanResponse(resBytes);
  }

  /// 5. Banking - Transfer Money By Card (انتقال وجه شتابی)
  Future<({String trackingCode, String rrn, bool success})> transferMoneyByCard({
    required String sourceCardId,
    required String destinationPan,
    required int amount,
    required String pin2,
    required String cvv2,
    required String expireDate,
    String? description,
  }) async {
    final payload = BaleProto.encodeTransferMoneyByCard(
      sourceCardId: sourceCardId,
      destinationPan: destinationPan,
      amount: amount,
      pin2: pin2,
      cvv2: cvv2,
      expireDate: expireDate,
      description: description,
    );

    final resBytes = await invoke(
      serviceName: 'bale.sap.v1.Sap',
      method: 'TransferMoneyByCard',
      payload: payload,
    );

    return BaleProto.decodeTransferMoneyResponse(resBytes);
  }
}
