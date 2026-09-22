import 'dart:typed_data';
import 'package:flutter_test/flutter_test.dart';
import 'package:balex/core/proto/proto_engine.dart';
import 'package:balex/core/proto/bale_proto.dart';

void main() {
  group('Protobuf Wire Engine Tests', () {
    test('Varint encoding and decoding', () {
      final w = ProtoWriter();
      w.writeVarint(300);
      w.writeVarint(0);
      w.writeVarint(1);
      w.writeVarint(BigInt.from(123456789012345));

      final bytes = w.finish();
      final r = ProtoReader(bytes);

      expect(r.readVarint().toInt(), 300);
      expect(r.readVarint().toInt(), 0);
      expect(r.readVarint().toInt(), 1);
      expect(r.readVarint(), BigInt.from(123456789012345));
    });

    test('String and Bytes encoding and decoding', () {
      final w = ProtoWriter();
      w.writeString(1, 'سلام بله');
      w.writeBytes(2, Uint8List.fromList([1, 2, 3, 4]));

      final bytes = w.finish();
      final r = ProtoReader(bytes);

      final tag1 = r.readTag();
      expect(tag1.fieldNumber, 1);
      expect(tag1.wireType, wireBytes);
      expect(r.readString(r.readVarint().toInt()), 'سلام بله');

      final tag2 = r.readTag();
      expect(tag2.fieldNumber, 2);
      expect(tag2.wireType, wireBytes);
      expect(r.readBytes(r.readVarint().toInt()), Uint8List.fromList([1, 2, 3, 4]));
    });
  });

  group('Bale Protocol Framing Tests', () {
    test('Handshake request framing', () {
      final hs = BaleProto.encodeHandshakeRequest(
        mkprotoVersion: 1,
        apiVersion: 171248,
      );
      expect(hs.isNotEmpty, isTrue);

      final w = ProtoWriter();
      w.writeBool(1, true);
      w.writeUint32(2, 171248);
      final decoded = BaleProto.decodeHandshakeResponse(w.finish());
      expect(decoded.isSupported, isTrue);
      expect(decoded.serverVersion, 171248);
    });

    test('Ping & Pong framing', () {
      final pingBytes = BaleProto.encodePing(987654321);
      expect(pingBytes.isNotEmpty, isTrue);

      final pong = BaleProto.decodePong(pingBytes);
      expect(pong, 987654321);
    });

    test('Metadata serialization round-trip', () {
      final meta = {
        'client': 'BaleX-Desktop',
        'is_human': true,
        'delay_ms': 1200,
      };
      final bytes = BaleProto.encodeMetadata(meta);
      final decoded = BaleProto.decodeMetadata(bytes);

      expect(decoded['client'], 'BaleX-Desktop');
      expect(decoded['is_human'], true);
      expect(decoded['delay_ms'], 1200);
    });

    test('Bale RPC Request and Response framing', () {
      final reqBytes = BaleProto.encodeRequest(
        index: 42,
        serviceName: 'bale.messaging.v2.Messaging',
        method: 'SendMessage',
        payload: Uint8List.fromList([10, 20, 30]),
      );
      expect(reqBytes.isNotEmpty, isTrue);

      // Build mock RPC response
      final respWriter = ProtoWriter();
      respWriter.writeBytes(2, Uint8List.fromList([100, 200]));
      respWriter.writeInt64(3, 42);

      final decodedResp = BaleProto.decodeResponse(respWriter.finish());
      expect(decodedResp.index, 42);
      expect(decodedResp.response, Uint8List.fromList([100, 200]));
      expect(decodedResp.error, isNull);
    });

    test('Bale Domain Models: Inquire Destination PAN', () {
      final inquireBytes = BaleProto.encodeInquireDestinationPan(
        cardId: 'card_1',
        destinationPan: '6037991234567890',
        amount: 500000,
      );
      expect(inquireBytes.isNotEmpty, isTrue);

      final respW = ProtoWriter();
      respW.writeString(1, 'رضا اسماعیلی');
      respW.writeString(2, 'بانک ملی ایران');

      final decoded = BaleProto.decodeInquireDestinationPanResponse(respW.finish());
      expect(decoded.cardHolderName, 'رضا اسماعیلی');
      expect(decoded.bankName, 'بانک ملی ایران');
    });

    test('Bale Domain Models: Transfer Money By Card', () {
      final transferBytes = BaleProto.encodeTransferMoneyByCard(
        sourceCardId: 'card_1',
        destinationPan: '6104337788990011',
        amount: 2500000,
        pin2: '123456',
        cvv2: '345',
        expireDate: '07/04',
        description: 'تست انتقال وجه',
      );
      expect(transferBytes.isNotEmpty, isTrue);

      final respW = ProtoWriter();
      respW.writeString(1, 'TRK998877');
      respW.writeString(2, 'RRN123456789');
      respW.writeBool(3, true);

      final decoded = BaleProto.decodeTransferMoneyResponse(respW.finish());
      expect(decoded.trackingCode, 'TRK998877');
      expect(decoded.rrn, 'RRN123456789');
      expect(decoded.success, isTrue);
    });

    test('Bale Domain Models: StartPhoneAuth and ValidateCode', () {
      final startAuthBytes = BaleProto.encodeStartPhoneAuth(
        phoneNumber: '09120000000',
        deviceTitle: 'BaleX Mobile',
      );
      expect(startAuthBytes.isNotEmpty, isTrue);

      final respW = ProtoWriter();
      respW.writeString(1, 'tx_hash_123456');
      final decodedStart = BaleProto.decodeStartPhoneAuthResponse(respW.finish());
      expect(decodedStart.transactionHash, 'tx_hash_123456');

      final validateBytes = BaleProto.encodeValidateCode(
        code: '12345',
        transactionHash: 'tx_hash_123456',
      );
      expect(validateBytes.isNotEmpty, isTrue);

      final userW = ProtoWriter();
      userW.writeInt32(1, 998877);
      userW.writeString(2, 'کاربر بله');
      userW.writeString(3, 'bale_user');
      userW.writeString(5, '09120000000');

      final jwtW = ProtoWriter();
      jwtW.writeString(1, 'jwt_token_sample');

      final valRespW = ProtoWriter();
      valRespW.writeMessage(2, userW.finish());
      valRespW.writeMessage(4, jwtW.finish());

      final decodedVal = BaleProto.decodeValidateCodeResponse(valRespW.finish());
      expect(decodedVal.id, 998877);
      expect(decodedVal.name, 'کاربر بله');
      expect(decodedVal.username, 'bale_user');
      expect(decodedVal.phone, '09120000000');
      expect(decodedVal.jwt, 'jwt_token_sample');

      // Test real Bale schema with int64 accessHash (wireVarint) and 64-bit value
      final realUserW = ProtoWriter();
      realUserW.writeInt32(1, 123456);
      realUserW.writeInt64(2, 9223372036854775807); // large 64-bit accessHash
      realUserW.writeString(3, 'کاربر واقعی بله');
      final nickW = ProtoWriter();
      nickW.writeString(1, 'real_bale_user');
      realUserW.writeMessage(9, nickW.finish());

      final realValRespW = ProtoWriter();
      realValRespW.writeMessage(2, realUserW.finish());
      final jwtW2 = ProtoWriter();
      jwtW2.writeString(1, 'jwt_token_sample');
      realValRespW.writeMessage(4, jwtW2.finish());

      final realDecoded = BaleProto.decodeValidateCodeResponse(realValRespW.finish());
      expect(realDecoded.id, 123456);
      expect(realDecoded.name, 'کاربر واقعی بله');
      expect(realDecoded.username, 'real_bale_user');
      expect(realDecoded.jwt, 'jwt_token_sample');
    });

    test('Bale Phone Normalization Tests', () {
      expect(BaleProto.normalizePhoneNumber('09123456789'), BigInt.from(989123456789));
      expect(BaleProto.normalizePhoneNumber('+989123456789'), BigInt.from(989123456789));
      expect(BaleProto.normalizePhoneNumber('989123456789'), BigInt.from(989123456789));
      expect(BaleProto.normalizePhoneNumber('9123456789'), BigInt.from(989123456789));
      expect(BaleProto.normalizePhoneNumber('۰۹۱۲۳۴۵۶۷۸۹'), BigInt.from(989123456789));
    });

    test('Bale SMS Code Normalization Tests', () {
      expect(BaleProto.normalizeCode('12345'), '12345');
      expect(BaleProto.normalizeCode('۱۲۳۴۵'), '12345');
      expect(BaleProto.normalizeCode('١٢٣٤٥'), '12345');
      expect(BaleProto.normalizeCode(' 12 345 '), '12345');
      expect(BaleProto.normalizeCode('12-345'), '12345');
    });

    test('gRPC-Web 5-byte Framing Round-Trip', () {
      final sample = Uint8List.fromList([10, 20, 30, 40, 50, 60]);
      final framed = BaleProto.encodeGrpcWebFrame(sample);
      expect(framed.length, sample.length + 5);
      expect(framed[0], 0x00); // data flag
      // Length prefix 6 (big-endian 4 bytes)
      expect(framed[1], 0);
      expect(framed[2], 0);
      expect(framed[3], 0);
      expect(framed[4], 6);

      final deframed = BaleProto.decodeGrpcWebFrame(framed);
      expect(deframed, sample);
    });

    test('Bale Domain Models: ValidatePassword encoding', () {
      final passBytes = BaleProto.encodeValidatePassword(
        password: 'my_secret_password',
        transactionHash: 'tx_abc_123',
        isJwt: true,
      );
      expect(passBytes.isNotEmpty, isTrue);
    });
  });
}

