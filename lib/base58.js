'use strict';

// https://en.bitcoin.it/wiki/Base58Check_encoding
(function () {
  var b = sjcl.bitArray;

  function toBitArray(bn) {
    var bytes = bn.abs().toByteArray();
    // Empty array, nothing to do
    if (!bytes.length) {
      return bytes;
    }
    // remove leading 0
    if (bytes[0] === 0) {
      bytes = bytes.slice(1);
    }
    // all values must be positive
    for (var i = 0; i < bytes.length; i++) {
      bytes[i] = (bytes[i] < 0) ? bytes[i] + 256 : bytes[i];
    }
    return sjcl.codec.bytes.toBits(bytes);
  }

  function fromBitArray(bits) {
    var bytes = sjcl.codec.bytes.fromBits(bits);
    if (!bytes.length) {
      return new BigInteger(0);
    } else if (bytes[0] & 0x80) {
      // Prepend a zero so the BigInteger class doesn't mistake this
      // for a negative integer.
      return new BigInteger([0].concat(bytes));
    } else {
      return new BigInteger(bytes);
    }
  }

  var alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  var base = new BigInteger(null);
  base.fromInt(58);

  var positions = {};
  for (var i = 0; i < alphabet.length; i++) {
    positions[alphabet[i]] = i;
  }

  // Convert a byte array to a base58-encoded string.
  // Written by Mike Hearn for BitcoinJ.
  //   Copyright (c) 2011 Google Inc.
  // Ported to JavaScript by Stefan Thomas.

  bitcoin.base58 = {
    encode: function (input) {
      var bi = fromBitArray(input);
      var chars = [];

      while (bi.compareTo(base) >= 0) {
        var mod = bi.mod(base);
        chars.push(alphabet[mod.intValue()]);
        bi = bi.subtract(mod).divide(base);
      }
      chars.push(alphabet[bi.intValue()]);

      // Convert leading zeros too.
      for (var i = 0; i < input.length; i++) {
        if (b.extract(input, i * 8, (i + 1) * 8) === 0x00) {
          chars.push(alphabet[0]);
        } else {
          break;
        }
      }
      return chars.reverse().join('');
    },

    // decode a base58 string into a byte array
    // input should be a base58 encoded string
    // @return Array
    decode: function (input) {
      var base = new BigInteger(null);
      base.fromInt(58);

      var length = input.length;
      var num = BigInteger.ZERO;
      for (var i = 0; i < length; i++) {
        var alphChar = input[i];
        var p = positions[alphChar];

        // if we encounter an invalid character, decoding fails
        if (p === undefined) {
          throw new Error('invalid base58 string: ' + input);
        }

        var pNum = new BigInteger(null);
        pNum.fromInt(p);

        num = num.multiply(base).add(pNum);
      }

      var bits = toBitArray(num);

      for (var i = 0; i < length; i++) {
        if (input[i] === '1') {
          bits = b.concat([b.partial(8, 0)], bits);
        } else {
          break;
        }
      }

      return bits;
    }
  };
})();
