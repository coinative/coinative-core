'use strict';

bitcoin.HDMasterKey = {};

(function () {
	var SEED = 'Bitcoin seed';

	var HDMasterKey = bitcoin.HDMasterKey = function (seed) {
	  var seedBits = seed ? sjcl.codec.hex.toBits(seed) : sjcl.random.randomWords(8);
	  var masterSeed = new sjcl.misc.hmac(sjcl.codec.utf8String.toBits(SEED), sjcl.hash.sha512).encrypt(seedBits);

	  var masterKey = new bitcoin.HDKey({
	    prv: sjcl.bitArray.bitSlice(masterSeed, 0, 256),
	    chain: sjcl.bitArray.bitSlice(masterSeed, 256)
	  });

	  return masterKey;
	};

})();