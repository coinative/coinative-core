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

	util.sha256sha256 = function (message) {
    return sjcl.codec.bytes.fromBits(sjcl.hash.sha256.hash(sjcl.hash.sha256.hash(sjcl.codec.bytes.toBits(message))));
  };

	util.sha256ripe160 = function (pubKey) {
		return sjcl.hash.ripemd160.hash(sjcl.hash.sha256.hash(pubKey))
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
      return [0xfd, i >>> 8, i & 255];
    } else if (i <= 1<<32) {
      // unsigned int (LE)
      return [0xfe].concat(this.wordsToBytes([i]));
    } else {
      // unsigned long long (LE)
      return [0xff].concat(this.wordsToBytes([i >>> 32, i]));
    }
	}

})();