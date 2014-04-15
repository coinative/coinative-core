'use strict';

bitcoin.config = {};

(function () {

	var config = bitcoin.config = {
		versions: {
			bitcoin: {
	      testnet: {
	      	'xpubKey': 0x043587cf,
	      	'xprvKey': 0x04358394,
	        'p2sh': 196,
	        'pubKey': 111
	      },
	      livenet: {
	      	'xpubKey': 0x0488b21e,
	      	'xprvKey': 0x0488ade4,
	        'p2sh': 5,
	        'pubKey': 0
	      }
	    }
		}
	};

	config.versionsReversed = {};
	for (var currency in config.versions) {
    var networks = config.versions[currency];
    for (var network in networks) {
      var keys = networks[network];
      for (var key in keys) {
        var keyValue = keys[key];
        config.versionsReversed[keyValue] = {
          currency: currency,
          network: network,
          // FIXME: this is gross
          isPrivate: (keyValue === 0x04358394 || keyValue === 0x0488ade4)
        }
      }
    }
  };

})();
