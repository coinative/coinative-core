'use strict';
// https://en.bitcoin.it/wiki/Base58Check_encoding
bitcoin.base58 = {};

(function() {

  function toByteArrayUnsigned(bn) {
    var ba = bn.abs().toByteArray();
    // Empty array, nothing to do
    if (!ba.length) {
      return ba;
    }
    // remove leading 0
    if (ba[0] === 0) {
      ba = ba.slice(1);
    }
    // all values must be positive
    for (var i=0 ; i<ba.length ; ++i) {
      ba[i] = (ba[i] < 0) ? ba[i] + 256 : ba[i];
    }
    return ba;
  }

  function fromByteArrayUnsigned(ba) {
    if (!ba.length) {
      return new BigInteger(0);
    } else if (ba[0] & 0x80) {
      // Prepend a zero so the BigInteger class doesn't mistake this
      // for a negative integer.
      return new BigInteger([0].concat(ba));
    } else {
      return new BigInteger(ba);
    }
  }

  var alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  var base = new BigInteger(null);
  base.fromInt(58);

  var positions = {};
  for (var i=0 ; i < alphabet.length ; ++i) {
    positions[alphabet[i]] = i;
  }

  // Convert a byte array to a base58-encoded string.
  // Written by Mike Hearn for BitcoinJ.
  //   Copyright (c) 2011 Google Inc.
  // Ported to JavaScript by Stefan Thomas.

  var base58 = bitcoin.base58;
  base58.encode = function (input) {
    var bi = fromByteArrayUnsigned(input);
    var chars = [];

    while (bi.compareTo(base) >= 0) {
      var mod = bi.mod(base);
      chars.push(alphabet[mod.intValue()]);
      bi = bi.subtract(mod).divide(base);
    }
    chars.push(alphabet[bi.intValue()]);

    // Convert leading zeros too.
    for (var i = 0; i < input.length; i++) {
      if (input[i] === 0x00) {
        chars.push(alphabet[0]);
      } else {
        break;
      }
    }
    return chars.reverse().join('');
  };


  // decode a base58 string into a byte array
  // input should be a base58 encoded string
  // @return Array
  base58.decode = function (input) {
    var base = new BigInteger(null);
    base.fromInt(58);

    var length = input.length;
    var num = BigInteger.ZERO;
    var leadingZero = 0;
    var seenOther = false;
    for (var i=0; i<length ; ++i) {
      var alphChar = input[i];
      var p = positions[alphChar];

      // if we encounter an invalid character, decoding fails
      if (p === undefined) {
        throw new Error('invalid base58 string: ' + input);
      }

      var pNum = new BigInteger(null);
      pNum.fromInt(p);

      num = num.multiply(base).add(pNum);

      if (alphChar === '1' && !seenOther) {
        ++leadingZero;
      }
      else {
        seenOther = true;
      }
    }

    var bytes = toByteArrayUnsigned(num);

    // remove leading zeros
    while (leadingZero-- > 0) {
      bytes.unshift(0);
    }
    return bytes;
  };

})();

