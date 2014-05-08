'use strict';

bitcoin.util = {};

(function () {

	var util = bitcoin.util;

	util.intToBits = function (i) {
	  return sjcl.codec.bytes.toBits([
	    i >>> 24 & 0xFF,
	    i >>> 16 & 0xFF,
	    i >>> 8 & 0xFF,
	    i & 0xFF
	  ]);
	};

  var b = sjcl.bitArray;
  var sha256 = sjcl.hash.sha256.hash;
  var ripemd160 = sjcl.hash.ripemd160.hash;

	util.sha256d = function (data) {
    return sha256(sha256(data));
  };

  util.sha256dCheck = function (data) {
    return b.bitSlice(util.sha256d(data), 0, 32);
  };

	util.sha256ripe160 = function (data) {
		return ripemd160(sha256(data))
	};

  /**
   * Verify a 4-byte sha256d checksum and returns the verified data.
   * Throws on an invalid checksum.
   */
  util.verifyChecksum = function (bits) {
    var len = b.bitLength(bits);
    var data = b.bitSlice(bits, 0, len - 32);
    var checksum = b.bitSlice(bits, len - 32);
    if (!b.equal(util.sha256dCheck(data), checksum)) {
      throw new Error('invalid checksum');
    }
    return data;
  };

	util.wordsToBytes = function (words) {
		for (var bytes = [], b = 0; b < words.length * 32; b += 8)
      bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
    return bytes;
	};

	util.numToVarInt = function(i) {
		if (i < 0xfd) {
      // unsigned char
      return [i];
    } else if (i <= 1<<16) {
      // unsigned short (LE)
      return [0xfd, i & 255, i >>> 8];
    } else if (i <= 1<<32) {
      // unsigned int (LE)
      return [0xfe].concat(this.wordsToBytes([i]));
    } else {
      // unsigned long long (LE)
      return [0xff].concat(this.wordsToBytes([i >>> 32, i]));
    }
	};

  util.numToBytes = function(num, bytes) {
    if (bytes === undefined) bytes = 8
    if (bytes === 0) return []
    return [num % 256].concat(util.numToBytes(Math.floor(num / 256), bytes - 1));
  };

  util.byteArrayToInt = function(byteArray) {
    var value = 0;
    for (var i = byteArray.length - 1; i >= 0; i--) {
      value = (value * 256) + byteArray[i];
    }
    return value;
  };

})();
