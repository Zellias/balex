import 'dart:typed_data';
import 'proto_engine.dart';

/// Bale Peer Types
enum BalePeerType {
  unknown(0),
  private(1),
  group(2),
  channel(3),
  bot(4),
  supergroup(5);

  final int value;
  const BalePeerType(this.value);

  static BalePeerType fromValue(int val) {
    return BalePeerType.values.firstWhere(
      (e) => e.value == val,
      orElse: () => BalePeerType.unknown,
    );
  }
}

/// Bale Typing Types
enum BaleTypingType {
  unknown(0),
  text(1),
  voiceRecording(2),
  sendingVoice(3),
  sendingFile(4),
  sendingPhoto(5),
  sendingVideo(6),
  sendingMusic(7),
  choosingSticker(8),
  choosingGif(9),
  creatingGiftPacket(10);

  final int value;
  const BaleTypingType(this.value);
}

/// Bale Server Message Model
class BaleServerMessage {
  final BaleRpcResponse? response;
  final Uint8List? update;
  final bool terminateSession;
  final int? pong;
  final BaleHandshakeResponse? handshakeResponse;

  BaleServerMessage({
    this.response,
    this.update,
    this.terminateSession = false,
    this.pong,
    this.handshakeResponse,
  });
}

class BaleHandshakeResponse {
  final bool isSupported;
  final int serverVersion;

  BaleHandshakeResponse({required this.isSupported, required this.serverVersion});
}

class BaleRpcResponse {
  final int index;
  final Uint8List? response;
  final BaleRpcError? error;

  BaleRpcResponse({required this.index, this.response, this.error});
}

class BaleRpcError {
  final int code;
  final String message;
  final Map<String, dynamic>? details;

  BaleRpcError({required this.code, required this.message, this.details});

  @override
  String toString() => 'BaleRpcError(code: $code, message: $message)';
}

class BaleIncomingMessage {
  final int peerType;
  final int peerId;
  final int senderId;
  final BigInt date;
  final BigInt randomId;
  final String text;
  const BaleIncomingMessage({required this.peerType, required this.peerId, required this.senderId, required this.date, required this.randomId, required this.text});
}

class BaleDialogRecord {
  final int peerType;
  final int peerId;
  final String title;
  final String lastMessage;
  final int unreadCount;
  const BaleDialogRecord({required this.peerType, required this.peerId, required this.title, required this.lastMessage, required this.unreadCount});
}

class BaleDialogsPage {
  final List<BaleDialogRecord> dialogs;
  const BaleDialogsPage(this.dialogs);
}

/// Bale Protocol Codec
class BaleProto {
  static const int protocolVersion = 1;
  static const int apiVersion = 171248;

  // -------------------------------------------------------------
  // Handshake & Ping
  // -------------------------------------------------------------
  static Uint8List encodeHandshakeRequest({
    int mkprotoVersion = protocolVersion,
    int apiVersion = apiVersion,
  }) {
    final w = ProtoWriter();
    w.writeUint32(1, mkprotoVersion);
    w.writeUint32(2, apiVersion);
    return w.finish();
  }

  static BaleHandshakeResponse decodeHandshakeResponse(Uint8List buf) {
    final r = ProtoReader(buf);
    bool isSupported = true;
    int serverVersion = 0;
    while (r.hasMore) {
      final tag = r.readTag();
      if (tag.fieldNumber == 1) {
        isSupported = r.readBool();
      } else if (tag.fieldNumber == 2) {
        serverVersion = r.readUint32();
      } else {
        r.skip(tag.wireType);
      }
    }
    return BaleHandshakeResponse(isSupported: isSupported, serverVersion: serverVersion);
  }

  static Uint8List encodePing(int randomId) {
    final w = ProtoWriter();
    w.writeInt64(1, randomId);
    return w.finish();
  }

  static int decodePong(Uint8List buf) {
    final r = ProtoReader(buf);
    int randomId = 0;
    while (r.hasMore) {
      final tag = r.readTag();
      if (tag.fieldNumber == 1) {
        randomId = r.readInt64().toInt();
      } else {
        r.skip(tag.wireType);
      }
    }
    return randomId;
  }

  // -------------------------------------------------------------
  // Metadata & RPC Frames
  // -------------------------------------------------------------
  static Uint8List encodeMetadata(Map<String, dynamic> metadata) {
    final w = ProtoWriter();
    metadata.forEach((key, val) {
      if (val == null) return;
      final itemW = ProtoWriter();
      itemW.writeString(1, key);

      final valW = ProtoWriter();
      if (val is bool) {
        valW.writeBool(2, val);
      } else if (val is int) {
        valW.writeInt32(3, val);
      } else {
        valW.writeString(1, val.toString());
      }
      itemW.writeMessage(2, valW.finish());
      w.writeMessage(1, itemW.finish());
    });
    return w.finish();
  }

  static Map<String, dynamic> decodeMetadata(Uint8List buf) {
    final r = ProtoReader(buf);
    final result = <String, dynamic>{};
    while (r.hasMore) {
      final tag = r.readTag();
      if (tag.fieldNumber == 1 && tag.wireType == wireBytes) {
        final itemLen = r.readVarint().toInt();
        final itemR = r.readSubReader(itemLen);
        String key = '';
        dynamic val = '';
        while (itemR.hasMore) {
          final t = itemR.readTag();
          if (t.fieldNumber == 1) {
            key = itemR.readString(itemR.readVarint().toInt());
          } else if (t.fieldNumber == 2) {
            final vLen = itemR.readVarint().toInt();
            final vR = itemR.readSubReader(vLen);
            while (vR.hasMore) {
              final vt = vR.readTag();
              if (vt.fieldNumber == 1) {
                val = vR.readString(vR.readVarint().toInt());
              } else if (vt.fieldNumber == 2) {
                val = vR.readBool();
              } else if (vt.fieldNumber == 3) {
                val = vR.readInt32();
              } else {
                vR.skip(vt.wireType);
              }
            }
          } else {
            itemR.skip(t.wireType);
          }
        }
        if (key.isNotEmpty) result[key] = val;
      } else {
        r.skip(tag.wireType);
      }
    }
    return result;
  }

  static Uint8List encodeRequest({
    required int index,
    required String serviceName,
    required String method,
    Uint8List? payload,
    Map<String, dynamic>? metadata,
  }) {
    final w = ProtoWriter();
    w.writeString(1, serviceName);
    w.writeString(2, method);
    if (payload != null && payload.isNotEmpty) {
      w.writeBytes(3, payload);
    }
    if (metadata != null && metadata.isNotEmpty) {
      w.writeMessage(4, encodeMetadata(metadata));
    }
    w.writeInt64(5, index);
    return w.finish();
  }

  static BaleRpcResponse decodeResponse(Uint8List buf) {
    final r = ProtoReader(buf);
    int index = 0;
    Uint8List? responseBytes;
    BaleRpcError? error;

    while (r.hasMore) {
      final tag = r.readTag();
      if (tag.fieldNumber == 1) {
        final len = r.readVarint().toInt();
        final errBuf = r.readBytes(len);
        error = decodeErrorStatus(errBuf);
      } else if (tag.fieldNumber == 2) {
        final len = r.readVarint().toInt();
        responseBytes = r.readBytes(len);
      } else if (tag.fieldNumber == 3) {
        index = r.readVarint().toInt();
      } else {
        r.skip(tag.wireType);
      }
    }
    return BaleRpcResponse(index: index, response: responseBytes, error: error);
  }

  static BaleRpcError decodeErrorStatus(Uint8List buf) {
    final r = ProtoReader(buf);
    int code = 0;
    String message = '';
    Map<String, dynamic>? details;

    while (r.hasMore) {
      final tag = r.readTag();
      if (tag.fieldNumber == 1) {
        code = r.readVarint().toInt();
      } else if (tag.fieldNumber == 2) {
        message = r.readString(r.readVarint().toInt());
      } else if (tag.fieldNumber == 3) {
        final len = r.readVarint().toInt();
        details = decodeMetadata(r.readBytes(len));
      } else {
        r.skip(tag.wireType);
      }
    }
    return BaleRpcError(code: code, message: message, details: details);
  }

  // -------------------------------------------------------------
  // Top-Level WebSocket Frames
  // -------------------------------------------------------------
  static Uint8List encodeClientMessage({
    Uint8List? requestBytes,
    int? ping,
    Uint8List? handshakeRequestBytes,
  }) {
    final w = ProtoWriter();
    if (requestBytes != null) {
      w.writeMessage(1, requestBytes);
    }
    if (ping != null) {
      w.writeMessage(2, encodePing(ping));
    }
    if (handshakeRequestBytes != null) {
      w.writeMessage(3, handshakeRequestBytes);
    }
    return w.finish();
  }

  static BaleServerMessage decodeServerMessage(Uint8List buf) {
    final r = ProtoReader(buf);
    BaleRpcResponse? response;
    Uint8List? update;
    bool terminateSession = false;
    int? pong;
    BaleHandshakeResponse? handshakeResponse;

    while (r.hasMore) {
      final tag = r.readTag();
      if (tag.fieldNumber == 1) {
        final len = r.readVarint().toInt();
        response = decodeResponse(r.readBytes(len));
      } else if (tag.fieldNumber == 2) {
        final len = r.readVarint().toInt();
        final updateR = r.readSubReader(len);
        while (updateR.hasMore) {
          final ut = updateR.readTag();
          if (ut.fieldNumber == 1) {
            final uLen = updateR.readVarint().toInt();
            update = updateR.readBytes(uLen);
          } else {
            updateR.skip(ut.wireType);
          }
        }
      } else if (tag.fieldNumber == 3) {
        terminateSession = true;
        final len = r.readVarint().toInt();
        r.readBytes(len);
      } else if (tag.fieldNumber == 4) {
        final len = r.readVarint().toInt();
        pong = decodePong(r.readBytes(len));
      } else if (tag.fieldNumber == 5) {
        final len = r.readVarint().toInt();
        handshakeResponse = decodeHandshakeResponse(r.readBytes(len));
      } else {
        r.skip(tag.wireType);
      }
    }

    return BaleServerMessage(
      response: response,
      update: update,
      terminateSession: terminateSession,
      pong: pong,
      handshakeResponse: handshakeResponse,
    );
  }

  static BaleIncomingMessage? decodeIncomingMessage(Uint8List buf) {
    final outer = ProtoReader(buf);
    while (outer.hasMore) {
      final tag = outer.readTag();
      if (tag.fieldNumber != 55) { outer.skip(tag.wireType); continue; }
      final len = outer.readVarint().toInt();
      final r = ProtoReader(outer.readBytes(len));
      var peerType = 0, peerId = 0, senderId = 0;
      var date = BigInt.zero, randomId = BigInt.zero;
      var text = '';
      while (r.hasMore) {
        final t = r.readTag();
        if (t.fieldNumber == 1) { final n = r.readVarint().toInt(); final p = decodePeer(r.readBytes(n)); peerType = p.type; peerId = p.id; }
        else if (t.fieldNumber == 2) { senderId = r.readVarint().toInt(); }
        else if (t.fieldNumber == 3) { date = r.readVarint(); }
        else if (t.fieldNumber == 4) { randomId = r.readVarint(); }
        else if (t.fieldNumber == 5) { final n = r.readVarint().toInt(); text = decodeMessageText(r.readBytes(n)); }
        else { r.skip(t.wireType); }
      }
      return BaleIncomingMessage(peerType: peerType, peerId: peerId, senderId: senderId, date: date, randomId: randomId, text: text);
    }
    return null;
  }

  static String decodeMessageText(Uint8List buf) {
    final r = ProtoReader(buf);
    while (r.hasMore) {
      final t = r.readTag();
      if (t.fieldNumber == 1) {
        final n = r.readVarint().toInt();
        final inner = ProtoReader(r.readBytes(n));
        while (inner.hasMore) { final it = inner.readTag(); if (it.fieldNumber == 1) { final l = inner.readVarint().toInt(); return inner.readString(l); } inner.skip(it.wireType); }
      } else { r.skip(t.wireType); }
    }
    return '';
  }

  static BaleDialogsPage decodeDialogsPage(Uint8List buf) {
    final users = <int, String>{};
    final records = <BaleDialogRecord>[];
    final r = ProtoReader(buf);
    while (r.hasMore) {
      final tag = r.readTag();
      if (tag.wireType != wireBytes) { r.skip(tag.wireType); continue; }
      final len = r.readVarint().toInt();
      final item = r.readBytes(len);
      if (tag.fieldNumber == 2) {
        final user = _decodeUser(item);
        if (user.$1 != 0) users[user.$1] = user.$2;
      } else if (tag.fieldNumber == 3) {
        final dialog = _decodeDialog(item);
        if (dialog != null) records.add(dialog);
      }
    }
    return BaleDialogsPage(records.map((d) => BaleDialogRecord(peerType: d.peerType, peerId: d.peerId, title: d.title.isEmpty ? (users[d.peerId] ?? 'گفتگوی بله') : d.title, lastMessage: d.lastMessage, unreadCount: d.unreadCount)).toList());
  }

  static (int, String) _decodeUser(Uint8List buf) {
    final r = ProtoReader(buf); var id = 0; var name = '';
    while (r.hasMore) {
      final t = r.readTag();
      if (t.fieldNumber == 1) {
        id = r.readVarint().toInt();
      } else if (t.fieldNumber == 2) {
        final n = r.readVarint().toInt();
        name = r.readString(n);
      } else {
        r.skip(t.wireType);
      }
    }
    return (id, name);
  }

  static BaleDialogRecord? _decodeDialog(Uint8List buf) {
    final r = ProtoReader(buf); var type = 0, id = 0, unread = 0; var title = '', last = '';
    while (r.hasMore) {
      final t = r.readTag();
      if (t.fieldNumber == 1 && t.wireType == wireBytes) { final n = r.readVarint().toInt(); final p = decodePeer(r.readBytes(n)); type = p.type; id = p.id; }
      else if (t.fieldNumber == 2 && t.wireType == wireVarint) { unread = r.readVarint().toInt(); }
      else if (t.fieldNumber == 3 && t.wireType == wireBytes) {
        final n = r.readVarint().toInt();
        final raw = r.readBytes(n);
        final text = decodeMessageText(raw);
        if (text.isNotEmpty) {
          last = text;
        } else {
          final nested = _decodeUser(raw);
          if (nested.$2.isNotEmpty) title = nested.$2;
        }
      }
      else { r.skip(t.wireType); }
    }
    return id == 0 ? null : BaleDialogRecord(peerType: type == 0 ? 1 : type, peerId: id, title: title, lastMessage: last, unreadCount: unread);
  }

  // -------------------------------------------------------------
  // Domain Protobuf Models (Bale Messaging, Auth, Banking)
  // -------------------------------------------------------------
  static Uint8List encodePeer({required int type, required int id}) {
    final w = ProtoWriter();
    w.writeInt32(1, type);
    w.writeInt32(2, id);
    return w.finish();
  }

  static ({int type, int id}) decodePeer(Uint8List buf) {
    final r = ProtoReader(buf);
    int type = 0;
    int id = 0;
    while (r.hasMore) {
      final tag = r.readTag();
      if (tag.fieldNumber == 1) {
        type = r.readInt32();
      } else if (tag.fieldNumber == 2) {
        id = r.readInt32();
      } else {
        r.skip(tag.wireType);
      }
    }
    return (type: type, id: id);
  }

  // -------------------------------------------------------------
  // gRPC-Web Framing & Phone Normalization
  // -------------------------------------------------------------

  static BigInt normalizePhoneNumber(String rawPhone) {
    const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    var converted = rawPhone;
    for (int i = 0; i < 10; i++) {
      converted = converted.replaceAll(persian[i], '$i').replaceAll(arabic[i], '$i');
    }
    var digits = converted.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.startsWith('0098')) {
      digits = '98${digits.substring(4)}';
    } else if (digits.startsWith('0')) {
      digits = '98${digits.substring(1)}';
    } else if (!digits.startsWith('98')) {
      digits = '98$digits';
    }
    return BigInt.tryParse(digits) ?? BigInt.zero;
  }

  static Uint8List encodeGrpcWebFrame(Uint8List payload) {
    final byteData = ByteData(5 + payload.length);
    byteData.setUint8(0, 0); // 0 = Data frame
    byteData.setUint32(1, payload.length, Endian.big);
    final result = byteData.buffer.asUint8List();
    result.setRange(5, 5 + payload.length, payload);
    return result;
  }

  static Uint8List decodeGrpcWebFrame(Uint8List body) {
    if (body.isEmpty) return Uint8List(0);
    if (body.length < 5) return body;
    try {
      int offset = 0;
      while (offset + 5 <= body.length) {
        final flag = body[offset];
        final byteData = ByteData.sublistView(body, offset + 1, offset + 5);
        final len = byteData.getUint32(0, Endian.big);
        offset += 5;
        final maxAvail = body.length - offset;
        final safeLen = (len > maxAvail) ? maxAvail : len;
        if (flag == 0) {
          // Data frame
          return body.sublist(offset, offset + safeLen);
        } else {
          // 0x80 = Trailers frame
          offset += safeLen;
        }
      }
    } catch (_) {
      // Fallback cleanly without bubbling RangeError
    }
    return body;
  }

  // Auth: StartPhoneAuth (official RPC: bale.auth.v1.Auth.StartPhoneAuth)
  static Uint8List encodeStartPhoneAuth({
    required dynamic phoneNumber,
    String deviceTitle = 'BaleX Mobile',
    int appId = 4,
    String apiKey = 'C28D46DC4C3A7A26564BFCC48B929086A95C93C98E789A19847BEE8627DE4E7D',
    List<int>? deviceHash,
  }) {
    final w = ProtoWriter();
    BigInt phoneBigInt;
    if (phoneNumber is String) {
      phoneBigInt = normalizePhoneNumber(phoneNumber);
    } else if (phoneNumber is int) {
      phoneBigInt = BigInt.from(phoneNumber);
    } else if (phoneNumber is BigInt) {
      phoneBigInt = phoneNumber;
    } else {
      phoneBigInt = BigInt.zero;
    }

    // Field 1: int64 phoneNumber
    w.writeInt64(1, phoneBigInt);
    // Field 2: int32 appId (4)
    w.writeInt32(2, appId);
    // Field 3: string apiKey
    w.writeString(3, apiKey);
    // Field 4: bytes deviceHash
    final hashBytes = deviceHash ?? List<int>.generate(16, (i) => (i * 17) % 256);
    w.writeBytes(4, hashBytes);
    // Field 5: string deviceTitle
    w.writeString(5, deviceTitle);

    return w.finish();
  }

  static ({String transactionHash}) decodeStartPhoneAuthResponse(Uint8List buf) {
    final r = ProtoReader(buf);
    String txHash = '';
    while (r.hasMore) {
      final tag = r.readTag();
      if (tag.fieldNumber == 1) {
        txHash = r.readString(r.readVarint().toInt());
      } else {
        r.skip(tag.wireType);
      }
    }
    return (transactionHash: txHash);
  }

  static String normalizeCode(String rawCode) {
    const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    var converted = rawCode;
    for (int i = 0; i < 10; i++) {
      converted = converted.replaceAll(persian[i], '$i').replaceAll(arabic[i], '$i');
    }
    return converted.replaceAll(RegExp(r'[^0-9]'), '').trim();
  }

  // Auth: ValidateCode (bale.auth.v1.Auth.ValidateCode)
  static Uint8List encodeValidateCode({
    required String code,
    required String transactionHash,
    bool isJwt = true,
    int language = 1,
  }) {
    final cleanCode = normalizeCode(code);
    final w = ProtoWriter();
    // Field 1: string transactionHash
    w.writeString(1, transactionHash);
    // Field 2: string code
    w.writeString(2, cleanCode);
    // Field 3: BoolValue { value: isJwt }
    if (isJwt) {
      final sub = ProtoWriter();
      sub.writeBool(1, true);
      w.writeMessage(3, sub.finish());
    }
    // Field 5: int32 language
    w.writeInt32(5, language);
    return w.finish();
  }

  // Auth: ValidatePassword (bale.auth.v1.Auth.ValidatePassword - 2FA)
  static Uint8List encodeValidatePassword({
    required String password,
    required String transactionHash,
    bool isJwt = true,
    int language = 1,
  }) {
    final w = ProtoWriter();
    // Field 1: string transactionHash
    w.writeString(1, transactionHash);
    // Field 2: string password
    w.writeString(2, password);
    // Field 3: BoolValue { value: isJwt }
    if (isJwt) {
      final sub = ProtoWriter();
      sub.writeBool(1, true);
      w.writeMessage(3, sub.finish());
    }
    // Field 4: int32 language
    w.writeInt32(4, language);
    return w.finish();
  }

  static ({int id, String name, String username, String phone, String? jwt}) decodeValidateCodeResponse(Uint8List buf) {
    final r = ProtoReader(buf);
    int id = 0;
    String name = '';
    String username = '';
    String phone = '';
    String? jwt;

    try {
      while (r.hasMore) {
        final tag = r.readTag();
        if (tag.fieldNumber == 2) {
          // user sub-message
          final len = r.readVarint().toInt();
          final userR = r.readSubReader(len);
          while (userR.hasMore) {
            final ut = userR.readTag();
            if (ut.fieldNumber == 1) {
              id = userR.readInt32();
            } else if (ut.fieldNumber == 2) {
              if (ut.wireType == wireBytes) {
                final sLen = userR.readVarint().toInt();
                final str = userR.readString(sLen);
                if (name.isEmpty) name = str;
              } else {
                // int64 accessHash
                userR.skip(ut.wireType);
              }
            } else if (ut.fieldNumber == 3) {
              if (ut.wireType == wireBytes) {
                final sLen = userR.readVarint().toInt();
                final str = userR.readString(sLen);
                if (name.isEmpty) {
                  name = str;
                } else if (username.isEmpty) {
                  username = str;
                }
              } else {
                userR.skip(ut.wireType);
              }
            } else if (ut.fieldNumber == 4) {
              // StringValue localName
              if (ut.wireType == wireBytes) {
                final sLen = userR.readVarint().toInt();
                final localR = userR.readSubReader(sLen);
                while (localR.hasMore) {
                  final lt = localR.readTag();
                  if (lt.fieldNumber == 1 && lt.wireType == wireBytes) {
                    final lStr = localR.readString(localR.readVarint().toInt());
                    if (name.isEmpty) name = lStr;
                  } else {
                    localR.skip(lt.wireType);
                  }
                }
              } else {
                userR.skip(ut.wireType);
              }
            } else if (ut.fieldNumber == 5) {
              if (ut.wireType == wireBytes) {
                phone = userR.readString(userR.readVarint().toInt());
              } else {
                userR.skip(ut.wireType);
              }
            } else if (ut.fieldNumber == 9) {
              // StringValue nick (username)
              if (ut.wireType == wireBytes) {
                final sLen = userR.readVarint().toInt();
                final nickR = userR.readSubReader(sLen);
                while (nickR.hasMore) {
                  final nt = nickR.readTag();
                  if (nt.fieldNumber == 1 && nt.wireType == wireBytes) {
                    username = nickR.readString(nickR.readVarint().toInt());
                  } else {
                    nickR.skip(nt.wireType);
                  }
                }
              } else {
                userR.skip(ut.wireType);
              }
            } else if (ut.fieldNumber == 17) {
              // contactInfo
              if (ut.wireType == wireBytes) {
                final sLen = userR.readVarint().toInt();
                final contactR = userR.readSubReader(sLen);
                while (contactR.hasMore) {
                  final ct = contactR.readTag();
                  if (ct.wireType == wireBytes) {
                    final str = contactR.readString(contactR.readVarint().toInt());
                    if (phone.isEmpty && RegExp(r'^[0-9+]+$').hasMatch(str)) {
                      phone = str;
                    }
                  } else {
                    contactR.skip(ct.wireType);
                  }
                }
              } else {
                userR.skip(ut.wireType);
              }
            } else {
              userR.skip(ut.wireType);
            }
          }
        } else if (tag.fieldNumber == 3) {
          // config
          r.skip(tag.wireType);
        } else if (tag.fieldNumber == 4) {
          // StringValue wrapper { value: jwt }
          if (tag.wireType == wireBytes) {
            final len = r.readVarint().toInt();
            final sub = r.readSubReader(len);
            while (sub.hasMore) {
              final st = sub.readTag();
              if (st.fieldNumber == 1 && st.wireType == wireBytes) {
                jwt = sub.readString(sub.readVarint().toInt());
              } else {
                sub.skip(st.wireType);
              }
            }
          } else {
            r.skip(tag.wireType);
          }
        } else {
          r.skip(tag.wireType);
        }
      }
    } catch (_) {
      // Graceful fallback without throwing
    }

    return (id: id, name: name, username: username, phone: phone, jwt: jwt);
  }

  // Auth: SendCode (Fallback)
  static Uint8List encodeSendCode({required String phoneNumber}) {
    final w = ProtoWriter();
    w.writeString(1, phoneNumber);
    return w.finish();
  }

  static ({String smsHash, int timeoutSeconds}) decodeSendCodeResponse(Uint8List buf) {
    final r = ProtoReader(buf);
    String smsHash = '';
    int timeout = 60;
    while (r.hasMore) {
      final tag = r.readTag();
      if (tag.fieldNumber == 1) {
        smsHash = r.readString(r.readVarint().toInt());
      } else if (tag.fieldNumber == 2) {
        timeout = r.readInt32();
      } else {
        r.skip(tag.wireType);
      }
    }
    return (smsHash: smsHash, timeoutSeconds: timeout);
  }

  // Auth: SignIn (Fallback)
  static Uint8List encodeSignIn({
    required String smsHash,
    required String code,
    required String phoneNumber,
  }) {
    final w = ProtoWriter();
    w.writeString(1, smsHash);
    w.writeString(2, code);
    w.writeString(3, phoneNumber);
    return w.finish();
  }

  // Messaging: LoadDialogs (bale.messaging.v2.Messaging.LoadDialogs)
  static Uint8List encodeLoadDialogs({int limit = 20, int? startDate}) {
    final w = ProtoWriter();
    w.writeInt64(1, startDate ?? 0);
    w.writeInt32(2, limit);
    w.writeInt32(4, 0); // dialogType: all dialogs
    return w.finish();
  }

  // Messaging: SendTextMessage
  static Uint8List encodeSendMessage({
    required int peerType,
    required int peerId,
    required int randomId,
    required String text,
    int? quotedMessageDate,
  }) {
    final w = ProtoWriter();
    // 1: peer
    w.writeMessage(1, encodePeer(type: peerType, id: peerId));
    // 2: randomId
    w.writeInt64(2, randomId);
    // 3: message content (TextMessage)
    final msgW = ProtoWriter();
    final textMsgW = ProtoWriter();
    textMsgW.writeString(1, text);
    msgW.writeMessage(1, textMsgW.finish());
    w.writeMessage(3, msgW.finish());

    // 4: quotedMessage
    if (quotedMessageDate != null && quotedMessageDate > 0) {
      final quoteW = ProtoWriter();
      quoteW.writeInt64(1, quotedMessageDate);
      w.writeMessage(4, quoteW.finish());
    }

    return w.finish();
  }

  // Messaging: SendTyping
  static Uint8List encodeSendTyping({
    required int peerType,
    required int peerId,
    int typingType = 1, // text
  }) {
    final w = ProtoWriter();
    w.writeMessage(1, encodePeer(type: peerType, id: peerId));
    w.writeInt32(2, typingType);
    return w.finish();
  }

  // Messaging: MessageRead
  static Uint8List encodeMessageRead({
    required int peerType,
    required int peerId,
    required int startDate,
  }) {
    final w = ProtoWriter();
    w.writeMessage(1, encodePeer(type: peerType, id: peerId));
    w.writeInt64(2, startDate);
    return w.finish();
  }

  // Banking: InquireDestinationPan (client.sap / client.bank)
  static Uint8List encodeInquireDestinationPan({
    required String cardId,
    required String destinationPan,
    required int amount,
  }) {
    final w = ProtoWriter();
    w.writeString(1, cardId);
    w.writeString(2, destinationPan);
    w.writeInt64(3, amount);
    return w.finish();
  }

  static ({String cardHolderName, String bankName}) decodeInquireDestinationPanResponse(Uint8List buf) {
    final r = ProtoReader(buf);
    String name = 'کاربر بله';
    String bank = '';
    while (r.hasMore) {
      final tag = r.readTag();
      if (tag.fieldNumber == 1) {
        name = r.readString(r.readVarint().toInt());
      } else if (tag.fieldNumber == 2) {
        bank = r.readString(r.readVarint().toInt());
      } else {
        r.skip(tag.wireType);
      }
    }
    return (cardHolderName: name, bankName: bank);
  }

  // Banking: TransferMoneyByCard
  static Uint8List encodeTransferMoneyByCard({
    required String sourceCardId,
    required String destinationPan,
    required int amount,
    required String pin2,
    required String cvv2,
    required String expireDate,
    String? description,
  }) {
    final w = ProtoWriter();
    w.writeString(1, sourceCardId);
    w.writeString(2, destinationPan);
    w.writeInt64(3, amount);
    w.writeString(4, pin2);
    w.writeString(5, cvv2);
    w.writeString(6, expireDate);
    if (description != null && description.isNotEmpty) {
      w.writeString(7, description);
    }
    return w.finish();
  }

  static ({String trackingCode, String rrn, bool success}) decodeTransferMoneyResponse(Uint8List buf) {
    final r = ProtoReader(buf);
    String trackingCode = '';
    String rrn = '';
    bool success = true;
    while (r.hasMore) {
      final tag = r.readTag();
      if (tag.fieldNumber == 1) {
        trackingCode = r.readString(r.readVarint().toInt());
      } else if (tag.fieldNumber == 2) {
        rrn = r.readString(r.readVarint().toInt());
      } else if (tag.fieldNumber == 3) {
        success = r.readBool();
      } else {
        r.skip(tag.wireType);
      }
    }
    return (trackingCode: trackingCode, rrn: rrn, success: success);
  }

  // -------------------------------------------------------------
  // Media Messaging (Document Message & DocumentEx)
  // -------------------------------------------------------------

  static Uint8List encodeDocumentExPhoto({required int width, required int height}) {
    final w = ProtoWriter();
    w.writeInt32(1, width);
    w.writeInt32(2, height);
    final wrapper = ProtoWriter();
    wrapper.writeMessage(1, w.finish());
    return wrapper.finish();
  }

  static Uint8List encodeDocumentExVoice({required int duration, List<int>? waveForm}) {
    final w = ProtoWriter();
    w.writeInt32(1, duration);
    if (waveForm != null && waveForm.isNotEmpty) {
      w.writeBytes(2, Uint8List.fromList(waveForm));
    }
    final wrapper = ProtoWriter();
    wrapper.writeMessage(3, w.finish());
    return wrapper.finish();
  }

  static Uint8List encodeDocumentExAudio({required int duration, String title = '', String performer = ''}) {
    final w = ProtoWriter();
    w.writeInt32(1, duration);
    if (title.isNotEmpty) w.writeString(2, title);
    if (performer.isNotEmpty) w.writeString(3, performer);
    final wrapper = ProtoWriter();
    wrapper.writeMessage(5, w.finish());
    return wrapper.finish();
  }

  static Uint8List encodeDocumentExVideo({required int width, required int height, required int duration}) {
    final w = ProtoWriter();
    w.writeInt32(1, width);
    w.writeInt32(2, height);
    w.writeInt32(3, duration);
    final wrapper = ProtoWriter();
    wrapper.writeMessage(2, w.finish());
    return wrapper.finish();
  }

  static Uint8List encodeDocumentMessage({
    required BigInt fileId,
    required BigInt accessHash,
    int fileSize = 0,
    String name = 'document.bin',
    String mimeType = 'application/octet-stream',
    Uint8List? extBytes,
    String? caption,
  }) {
    final w = ProtoWriter();
    w.writeInt64(1, fileId);
    w.writeInt64(2, accessHash);
    if (fileSize > 0) w.writeInt32(3, fileSize);
    if (name.isNotEmpty) w.writeString(4, name);
    if (mimeType.isNotEmpty) w.writeString(5, mimeType);
    if (extBytes != null && extBytes.isNotEmpty) {
      w.writeMessage(7, extBytes);
    }
    if (caption != null && caption.isNotEmpty) {
      final cw = ProtoWriter();
      cw.writeString(1, caption);
      w.writeMessage(8, cw.finish());
    }
    return w.finish();
  }

  static Uint8List encodeStickerMessage({
    required BigInt stickerId,
    BigInt? accessHash,
    BigInt? stickerPackId,
  }) {
    final w = ProtoWriter();
    w.writeInt64(1, stickerId);
    if (accessHash != null) w.writeInt64(2, accessHash);
    if (stickerPackId != null) w.writeInt64(3, stickerPackId);
    return w.finish();
  }

  // Messaging: UpdateMessage
  static Uint8List encodeUpdateMessage({
    required int peerType,
    required int peerId,
    required BigInt rid,
    required String newText,
  }) {
    final w = ProtoWriter();
    w.writeMessage(1, encodePeer(type: peerType, id: peerId));
    w.writeInt64(2, rid);

    final msgW = ProtoWriter();
    final textW = ProtoWriter();
    textW.writeString(1, newText);
    msgW.writeMessage(15, textW.finish());
    w.writeMessage(3, msgW.finish());

    return w.finish();
  }

  // Messaging: ForwardMessages
  static Uint8List encodeForwardMessages({
    required int toPeerType,
    required int toPeerId,
    required List<BigInt> rids,
    required List<({int fromPeerType, int fromPeerId, BigInt mid})> messages,
    bool hideSender = false,
  }) {
    final w = ProtoWriter();
    w.writeMessage(1, encodePeer(type: toPeerType, id: toPeerId));
    for (final rid in rids) {
      w.writeInt64(2, rid);
    }
    for (final m in messages) {
      final fmw = ProtoWriter();
      fmw.writeMessage(1, encodePeer(type: m.fromPeerType, id: m.fromPeerId));
      fmw.writeInt64(2, m.mid);
      w.writeMessage(3, fmw.finish());
    }
    if (hideSender) {
      w.writeBool(5, hideSender);
    }
    return w.finish();
  }

  // Messaging: PinMessage
  static Uint8List encodePinMessage({
    required int peerType,
    required int peerId,
    required BigInt mid,
  }) {
    final w = ProtoWriter();
    w.writeMessage(1, encodePeer(type: peerType, id: peerId));
    w.writeInt64(2, mid);
    return w.finish();
  }

  // Messaging: DeleteMessage
  static Uint8List encodeDeleteMessage({
    required int peerType,
    required int peerId,
    required List<BigInt> mids,
  }) {
    final w = ProtoWriter();
    w.writeMessage(1, encodePeer(type: peerType, id: peerId));
    for (final mid in mids) {
      w.writeInt64(2, mid);
    }
    return w.finish();
  }

  // -------------------------------------------------------------
  // Contacts Management (bale.users.v1.Users)
  // -------------------------------------------------------------
  static Uint8List encodeImportContacts(List<({int phone, String? name})> contacts) {
    final w = ProtoWriter();
    for (final c in contacts) {
      final cw = ProtoWriter();
      cw.writeInt64(1, BigInt.from(c.phone));
      if (c.name != null && c.name!.isNotEmpty) {
        final nw = ProtoWriter();
        nw.writeString(1, c.name!);
        cw.writeMessage(2, nw.finish());
      }
      w.writeMessage(1, cw.finish());
    }
    return w.finish();
  }

  static Uint8List encodeAddContact({required int uid, BigInt? accessHash}) {
    final w = ProtoWriter();
    w.writeInt32(1, uid);
    w.writeInt64(2, accessHash ?? BigInt.zero);
    return w.finish();
  }

  static Uint8List encodeRemoveContact({required int uid, BigInt? accessHash}) {
    final w = ProtoWriter();
    w.writeInt32(1, uid);
    w.writeInt64(2, accessHash ?? BigInt.zero);
    return w.finish();
  }

  static Uint8List encodeSearchContacts(String query) {
    final w = ProtoWriter();
    w.writeString(1, query);
    return w.finish();
  }

  // -------------------------------------------------------------
  // User Profile & Privacy (bale.users.v1.Users)
  // -------------------------------------------------------------
  static Uint8List encodeEditName(String name) {
    final w = ProtoWriter();
    w.writeString(1, name);
    return w.finish();
  }

  static Uint8List encodeEditAbout(String about) {
    final w = ProtoWriter();
    final sub = ProtoWriter();
    sub.writeString(1, about);
    w.writeMessage(1, sub.finish());
    return w.finish();
  }

  static Uint8List encodeEditNickName(String nick) {
    final w = ProtoWriter();
    final sub = ProtoWriter();
    sub.writeString(1, nick);
    w.writeMessage(1, sub.finish());
    return w.finish();
  }

  static Uint8List encodeCheckNickName(String nick) {
    final w = ProtoWriter();
    w.writeString(1, nick);
    return w.finish();
  }

  static Uint8List encodeBlockUser(int userId) {
    final w = ProtoWriter();
    w.writeMessage(1, encodePeer(type: 1, id: userId));
    return w.finish();
  }

  static Uint8List encodeUnblockUser(int userId) {
    final w = ProtoWriter();
    w.writeMessage(1, encodePeer(type: 1, id: userId));
    return w.finish();
  }

  // -------------------------------------------------------------
  // Reactions (bale.abacus.v1.Abacus)
  // -------------------------------------------------------------
  static Uint8List encodeMessageSetReaction({
    required int peerType,
    required int peerId,
    required BigInt rid,
    required String code,
    BigInt? date,
  }) {
    final w = ProtoWriter();
    w.writeMessage(1, encodePeer(type: peerType, id: peerId));
    w.writeInt64(2, rid);
    w.writeString(3, code);
    if (date != null) w.writeInt64(4, date);
    return w.finish();
  }

  static Uint8List encodeMessageRemoveReaction({
    required int peerType,
    required int peerId,
    required BigInt rid,
    required String code,
    BigInt? date,
  }) {
    final w = ProtoWriter();
    w.writeMessage(1, encodePeer(type: peerType, id: peerId));
    w.writeInt64(2, rid);
    w.writeString(3, code);
    if (date != null) w.writeInt64(4, date);
    return w.finish();
  }

  // -------------------------------------------------------------
  // Chat Folders (bale.messaging.v2.Messaging)
  // -------------------------------------------------------------
  static Uint8List encodeCreateFolder({required String title, List<int> peerIds = const []}) {
    final w = ProtoWriter();
    w.writeString(1, title);
    for (final id in peerIds) {
      w.writeMessage(2, encodePeer(type: 1, id: id));
    }
    return w.finish();
  }

  static Uint8List encodeDeleteFolder(int folderId) {
    final w = ProtoWriter();
    w.writeInt32(1, folderId);
    return w.finish();
  }

  // -------------------------------------------------------------
  // Polls (bale.poll.v1.Poll & Messaging)
  // -------------------------------------------------------------
  static Uint8List encodeCreatePoll({
    required String question,
    List<String> options = const [],
    bool isAnonymous = true,
    bool isMultipleChoice = false,
    bool isQuiz = false,
  }) {
    final w = ProtoWriter();
    w.writeString(1, question);
    for (final opt in options) {
      final ow = ProtoWriter();
      ow.writeString(1, opt);
      w.writeMessage(2, ow.finish());
    }
    w.writeBool(3, isAnonymous);
    w.writeBool(4, isMultipleChoice);
    w.writeBool(5, isQuiz);
    return w.finish();
  }

  // -------------------------------------------------------------
  // Gift Packets & Mini Apps (Cash, Gold, Appzar, Ketf)
  // -------------------------------------------------------------
  static Uint8List encodeGiftPacketMessage({
    required int giftCount,
    required BigInt totalAmount,
    int givingType = 0,
    String? walletId,
    String? regarding,
    int? ownerUserId,
    int coverId = 1,
    bool showTotalAmount = true,
  }) {
    final w = ProtoWriter();
    w.writeInt32(1, giftCount);
    w.writeInt64(2, totalAmount);
    if (givingType != 0) w.writeInt32(3, givingType);
    if (walletId != null && walletId.isNotEmpty) {
      final sw = ProtoWriter();
      sw.writeString(1, walletId);
      w.writeMessage(4, sw.finish());
    }
    if (regarding != null && regarding.isNotEmpty) {
      final sw = ProtoWriter();
      sw.writeString(1, regarding);
      w.writeMessage(5, sw.finish());
    }
    if (ownerUserId != null && ownerUserId != 0) w.writeInt32(6, ownerUserId);
    final cw = ProtoWriter();
    cw.writeInt32(1, coverId);
    w.writeMessage(7, cw.finish());
    final bw = ProtoWriter();
    bw.writeBool(1, showTotalAmount);
    w.writeMessage(8, bw.finish());
    return w.finish();
  }

  static Uint8List encodeOpenGiftPacket({
    required int peerType,
    required int peerId,
    required BigInt date,
    required BigInt randomId,
    String receiverWalletId = '',
    int pageNo = 1,
    int orderType = 0,
  }) {
    final w = ProtoWriter();
    final mw = ProtoWriter();
    mw.writeMessage(1, encodePeer(type: peerType, id: peerId));
    mw.writeInt64(2, date);
    mw.writeInt64(3, randomId);
    w.writeMessage(1, mw.finish());
    if (receiverWalletId.isNotEmpty) w.writeString(2, receiverWalletId);
    w.writeInt32(3, pageNo);
    w.writeInt32(4, orderType);
    return w.finish();
  }

  static Uint8List encodeOpenGoldGiftPacket(BigInt giftPacketId) {
    final w = ProtoWriter();
    w.writeInt64(1, giftPacketId);
    return w.finish();
  }

  static Uint8List encodeSendGoldGiftPacket({
    required int peerType,
    required int peerId,
    required BigInt amountMilligrams,
    required BigInt count,
    String description = '',
    int givingType = 0,
    BigInt? randomId,
  }) {
    final w = ProtoWriter();
    w.writeInt64(2, amountMilligrams);
    w.writeInt64(3, count);
    if (description.isNotEmpty) w.writeString(4, description);
    if (givingType != 0) w.writeInt32(5, givingType);
    if (randomId != null) w.writeInt64(6, randomId);
    w.writeMessage(7, encodePeer(type: peerType, id: peerId));
    return w.finish();
  }

  static Uint8List encodeGetWebappHash({required int botUserId, String data = ''}) {
    final w = ProtoWriter();
    w.writeInt32(1, botUserId);
    if (data.isNotEmpty) w.writeString(2, data);
    return w.finish();
  }

  static Uint8List encodeSendMiniAppData({
    required int botUserId,
    String queryId = '',
    String data = '',
    String buttonText = '',
  }) {
    final w = ProtoWriter();
    w.writeInt32(1, botUserId);
    if (queryId.isNotEmpty) {
      final qw = ProtoWriter();
      qw.writeString(1, queryId);
      w.writeMessage(2, qw.finish());
    }
    if (data.isNotEmpty) {
      final dw = ProtoWriter();
      dw.writeString(1, data);
      w.writeMessage(3, dw.finish());
    }
    if (buttonText.isNotEmpty) {
      final bw = ProtoWriter();
      bw.writeString(1, buttonText);
      w.writeMessage(4, bw.finish());
    }
    return w.finish();
  }
}
