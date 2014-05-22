'use strict';

bitcoin.MultiSigKey = {};

(function () {

	function parseSerializedKey (data) {
		var hdKeys = [];
		for (var i=0;i<data.keys.length;i++) {
			hdKeys.push(bitcoin.HDKey(data.keys[i]));
		}
		return new MultiSigKey(hdKeys, data.sigs);
	};

	var MultiSigKey = bitcoin.MultiSigKey = function (hdKeys, reqSignatories) {
		if (arguments.length === 1 && (hdKeys !== null && typeof hdKeys === 'object')) {
			return parseSerializedKey(hdKeys);
		}

		if ((hdKeys.length > 22 || hdKeys.length < 2) || reqSignatories > hdKeys.length) {
			throw new Error('Only m of 2 to 22 supported');
		}

		this.version = hdKeys[0].version;
		this.compressed = hdKeys[0].ecKey.compressed;

		this.reqSig = reqSignatories;
		this.hdKeys = hdKeys;

		this._generateRedeemScript();
	};

	MultiSigKey.prototype._generateRedeemScript = function () {
		var pubKeys = [];
		for (var i = 0 ; i < this.hdKeys.length ; i++) {
		 	pubKeys[i] = sjcl.codec.bytes.fromBits(this.hdKeys[i].pub);
		}

		this.redeemScript = bitcoin.Script.createMultiSigOutputScript(this.reqSig, pubKeys);
		this.address = this.getAddress().toString();
	};

	MultiSigKey.prototype.sortHdKeys = function () {
		for (var i=0; i<this.hdKeys.length; i++){
		  for (var j=0; j<this.hdKeys.length; j++) {
		  	var a = sjcl.bn.fromBits(this.hdKeys[j].pub);
		  	var b = sjcl.bn.fromBits(this.hdKeys[i].pub);
		    if (a.greaterEquals(b)){
		      var temp = this.hdKeys[i];
		      this.hdKeys[i] = this.hdKeys[j];
		      this.hdKeys[j] = temp;
		    }
		  }
		};

		this._generateRedeemScript();
	};

	MultiSigKey.prototype.getAddress = function() {
		var redeemScript = sjcl.codec.bytes.toBits(this.redeemScript.buffer);
		var address = bitcoin.util.sha256ripe160(redeemScript);
		return new bitcoin.Address(address, this.version.p2sh);
	};

	MultiSigKey.prototype.derivePublic = function (i) {
		if (i >= 0x80000000)  {
      throw new Error('Cannot perform private derivation using the public child key derivation function');
    }
		var derivedKeys = [];
		for (var j=0;j<this.hdKeys.length;j++) {
			derivedKeys.push(this.hdKeys[j].derivePublic(i));
		}

		return new MultiSigKey(derivedKeys, this.reqSig);
	};

	MultiSigKey.prototype.derive = function (i) {
		if (i >= 0x80000000)  {
      throw new Error('Cannot perform private derivation using the public child key derivation function');
    }
		var derivedKeys = [];
		for (var j=0;j<this.hdKeys.length;j++) {
			var hdKey = this.hdKeys[j];
			if (hdKey.prv) {
				hdKey = hdKey.derivePrivate(i);
			} else {
				hdKey = hdKey.derivePublic(i);
			}

			derivedKeys.push(hdKey);
		}

		return new MultiSigKey(derivedKeys, this.reqSig);
	};

	MultiSigKey.prototype.serialize = function () {
		var xPubKeys = [];
		for (var i=0;i<this.hdKeys.length;i++) {
			xPubKeys.push(this.hdKeys[i].serialize().pub.b58);
		}
		return {
			keys: xPubKeys,
			sigs: this.reqSig
		}
	};

})();
