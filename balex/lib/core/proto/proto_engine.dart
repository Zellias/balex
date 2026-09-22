import 'dart:convert';
import 'dart:typed_data';

/// Protobuf Wire Types
const int wireVarint = 0;
const int wireFixed64 = 1;
const int wireBytes = 2;
const int wireStartGroup = 3;
const int wireEndGroup = 4;
const int wireFixed32 = 5;

/// High-performance Protobuf Writer in pure Dart
class ProtoWriter {
  final BytesBuilder _builder = BytesBuilder(copy: false);

  void writeTag(int fieldNumber, int wireType) {
    writeVarint((fieldNumber << 3) | wireType);
  }

  void writeVarint(dynamic val) {
    if (val == null) return;
    BigInt bVal;
    if (val is int) {
      bVal = BigInt.from(val);
    } else if (val is BigInt) {
      bVal = val;
    } else if (val is bool) {
      bVal = val ? BigInt.one : BigInt.zero;
    } else if (val is String) {
      final parsed = BigInt.tryParse(val);
      if (parsed == null) return;
      bVal = parsed;
    } else {
      return;
    }

    if (bVal < BigInt.zero) {
      // 64-bit two's complement for negative integers
      bVal = bVal.toUnsigned(64);
    }

    final bytes = <int>[];
    while (bVal >= BigInt.from(0x80)) {
      bytes.add((bVal.toUnsigned(8).toInt() & 0x7f) | 0x80);
      bVal = bVal >> 7;
    }
    bytes.add(bVal.toUnsigned(8).toInt() & 0x7f);
    _builder.add(bytes);
  }

  void writeUint32(int fieldNumber, int? val) {
    if (val == null || val == 0) return;
    writeTag(fieldNumber, wireVarint);
    writeVarint(val);
  }

  void writeInt32(int fieldNumber, int? val) {
    if (val == null || val == 0) return;
    writeTag(fieldNumber, wireVarint);
    writeVarint(val);
  }

  void writeInt64(int fieldNumber, dynamic val) {
    if (val == null || val == 0 || val == BigInt.zero || val == '0') return;
    writeTag(fieldNumber, wireVarint);
    writeVarint(val);
  }

  void writeBool(int fieldNumber, bool? val) {
    if (val == null || !val) return;
    writeTag(fieldNumber, wireVarint);
    writeVarint(1);
  }

  void writeString(int fieldNumber, String? str) {
    if (str == null || str.isEmpty) return;
    final bytes = utf8.encode(str);
    writeTag(fieldNumber, wireBytes);
    writeVarint(bytes.length);
    _builder.add(bytes);
  }

  void writeBytes(int fieldNumber, List<int>? bytes) {
    if (bytes == null || bytes.isEmpty) return;
    writeTag(fieldNumber, wireBytes);
    writeVarint(bytes.length);
    _builder.add(bytes);
  }

  void writeMessage(int fieldNumber, List<int>? subMsgBytes) {
    if (subMsgBytes == null || subMsgBytes.isEmpty) return;
    writeBytes(fieldNumber, subMsgBytes);
  }

  Uint8List finish() {
    return _builder.takeBytes();
  }
}

/// High-performance Protobuf Reader in pure Dart
class ProtoReader {
  final Uint8List _buf;
  int _offset = 0;

  ProtoReader(this._buf, [int offset = 0]) : _offset = offset;

  bool get hasMore => _offset < _buf.length;
  int get remaining => _buf.length - _offset;

  ({int fieldNumber, int wireType}) readTag() {
    final raw = readVarint().toInt();
    final fieldNumber = raw >> 3;
    final wireType = raw & 0x07;
    return (fieldNumber: fieldNumber, wireType: wireType);
  }

  BigInt readVarint() {
    BigInt result = BigInt.zero;
    int shift = 0;
    while (_offset < _buf.length) {
      final b = _buf[_offset++];
      result |= BigInt.from(b & 0x7f) << shift;
      if ((b & 0x80) == 0) {
        return result;
      }
      shift += 7;
      if (shift >= 64) {
        break;
      }
    }
    return result;
  }

  int readInt32() => readVarint().toInt();
  int readUint32() => readVarint().toUnsigned(32).toInt();
  BigInt readInt64() => readVarint();
  bool readBool() => readVarint() != BigInt.zero;

  Uint8List readBytes(int length) {
    if (length <= 0) return Uint8List(0);
    if (_offset >= _buf.length) return Uint8List(0);
    final maxAvailable = _buf.length - _offset;
    final safeLen = (length > maxAvailable) ? maxAvailable : length;
    if (safeLen <= 0) return Uint8List(0);
    final end = _offset + safeLen;
    final bytes = Uint8List.sublistView(_buf, _offset, end);
    _offset = end;
    return bytes;
  }

  String readString(int length) {
    final bytes = readBytes(length);
    return utf8.decode(bytes, allowMalformed: true);
  }

  ProtoReader readSubReader(int length) {
    final subBytes = readBytes(length);
    return ProtoReader(subBytes);
  }

  void skip(int wireType) {
    switch (wireType) {
      case wireVarint:
        readVarint();
        break;
      case wireFixed64:
        final maxAvail = _buf.length - _offset;
        _offset += (maxAvail < 8) ? maxAvail : 8;
        break;
      case wireBytes:
        final len = readVarint().toInt();
        if (len > 0) {
          final maxAvail = _buf.length - _offset;
          _offset += (len > maxAvail) ? maxAvail : len;
        }
        break;
      case wireFixed32:
        final maxAvail = _buf.length - _offset;
        _offset += (maxAvail < 4) ? maxAvail : 4;
        break;
      default:
        break;
    }
  }
}
