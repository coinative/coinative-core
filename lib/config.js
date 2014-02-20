'use strict';

bitcoin.config = {};

(function () {

	var config = bitcoin.config = {
		versions: {
			bitcoin: {
	      testnet: {
	      	'xpubKey': '0x043587CF',
	      	'xprvKey': '0x04358394',
	        'p2sh': 196,
	        'pubKey': 111
	      },
	      production: {
	      	'xpubKey': '0x0488B21E',
	      	'xprvKey': '0x0488ADE4',
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
      var keys = config.versions[currency][network];
      for (var key in keys) {
        var keyValue = config.versions[currency][network][key];
        config.versionsReversed[keyValue] = {
          currency: currency,
          network: network,
          isPrivate: (key == 'private')
        }
      }
    }
  };

})();