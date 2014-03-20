'use strict';

bitcoin.Address = {};

(function () {

	function sha256sha256(message) {
		var hash = sjcl.codec.bytes.toBits(message);
		return sjcl.codec.bytes.fromBits(sjcl.hash.sha256.hash(sjcl.hash.sha256.hash(hash)));
	};

	var Address = bitcoin.Address = function (hash, version) {
		if ('string' == typeof hash) {
			this.decodeString(hash);
			return;
		}

		this.hash = hash;
		this.version = version || Address.versions.bitcoin.production.pubKey;
	};

	Address.prototype.toString = function () {
		var hash = this.hash.slice(0);
    hash.unshift(this.version);
    var checksum = sha256sha256(hash);
    return bitcoin.base58.encode(hash.concat(checksum.slice(0, 4)));
	};

	Address.prototype.decodeString = function (string) {
		var bytes = bitcoin.base58.decode(string);
		var hash = bytes.slice(0, 21);
		var checksum = sha256sha256(hash);

		if (checksum[0] != bytes[21] || checksum[1] != bytes[22] ||
      	checksum[2] != bytes[23] || checksum[3] != bytes[24]) {
    	throw "Checksum validation failed!";
  	}

  	var version = hash.shift();
  	var versionInfo = Address.versionsReversed[version];

  	if (!versionInfo) {
    	throw "Version " + version + " not supported!";
  	}

  	this.hash = hash;
  	this.version = version;
	};

	Address.prototype.isP2SH = function () {
		var versionInfo = Address.versionsReversed[this.version];
		return versionInfo.type == 'p2sh';
	};

	Address.prototype.isPubKey = function () {
		var versionInfo = Address.versionsReversed[this.version];
		return versionInfo.type == 'pubKey';
	};

  Address.isValid = function (address) {
    var bytes = bitcoin.base58.decode(address);
    var hash = bytes.slice(0, 21);
    var checksum = sha256sha256(hash);

    if (checksum[0] != bytes[21] || checksum[1] != bytes[22] ||
        checksum[2] != bytes[23] || checksum[3] != bytes[24]) {
      return false;
    }
    return true;
  }

	Address.versions = {
		bitcoin: {
      testnet: {
        'p2sh': 196,
        'pubKey': 111
      },
      production: {
        'p2sh': 5,
        'pubKey': 0
      }
    }
	};

	Address.versionsReversed = [];
	for (var currency in Address.versions) {
    var networks = Address.versions[currency];
    for (var network in networks) {
      var keys = Address.versions[currency][network];
      for (var key in keys) {
        var keyValue = Address.versions[currency][network][key];
        Address.versionsReversed[keyValue] = {
          currency: currency,
          network: network,
          type: key
        }
      }
    }
  };


})();
