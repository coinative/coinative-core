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

	var MultiSigKey = bitcoin.MultiSigKey = function (hdKeys, reqSignatories, unsorted) {
		if (arguments.length === 1 && (hdKeys !== null && typeof hdKeys === 'object')) {
			return parseSerializedKey(hdKeys);
		}

		if ((hdKeys.length > 22 || hdKeys.length < 2) || reqSignatories > hdKeys.length) {
			throw new Error('Only m of 2 to 22 supported');
		};

		this.version = hdKeys[0].version;
		this.selectedOuts = [];
		this.reqSig = reqSignatories;
		this.hdKeys = hdKeys;
		this.unsorted = unsorted;

		if (!this.unsorted) {
			this.sortHdKeys();
			return;
		}

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
		var redempScript = sjcl.codec.bytes.toBits(this.redeemScript.buffer);
		var address = bitcoin.util.sha256ripe160(redempScript);
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

		return new MultiSigKey(derivedKeys, this.reqSig, this.unsorted);
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

	// recode the redeem script and return the multi-sig address, req sigs and public keys
	// representing the required parties.
	MultiSigKey.prototype.verifyScript = function () {

	};

	// MultiSigKey.prototype.createSpendTx = function (unspentOutputs, outputs, fee) {
	// 	var sendTx = new bitcoin.Transaction();
	// 	var totalUnspentOutputs = 0;
	// 	var totalOutputs = 0;

	// 	// Crypto.util.bytesToBase64(Crypto.util.hexToBytes(hash))


	// 	for (var i=0;i<unspentOutputs.length;i++) {
	// 		var tx = { hash: unspentOutputs[i].txid };
	// 		var txN = unspentOutputs[i].vout;
	// 		totalUnspentOutputs += (unspentOutputs[i].amount*1)/100000000;
	// 		sendTx.addInput(tx, txN);
	// 		var script = sjcl.codec.bytes.fromBits(sjcl.codec.hex.toBits(unspentOutputs[i].scriptPubKey));
	// 		sendTx.ins[i].script = new bitcoin.Script(script);
	// 	};

	// 	for (var i=0; i<outputs.length;i++) {
	// 		var address = new bitcoin.Address(outputs[i].hash);
	// 		var amount = new sjcl.bn(Math.round(outputs[i].amount * 1e8));
	// 		totalOutputs += outputs[i].amount*1;
	// 		sendTx.addOutput(address, amount);
	// 	};

	// 	return sendTx;
	// };

	MultiSigKey.prototype.createFundTx = function (unspentOutputs, amount, fee, changeAdd) {
		var feeValue = fee || 0.0005;

		var sendTx = new bitcoin.Transaction();
		var txAmount = new sjcl.bn(Math.round(amount * 1e8));
		var txValue = txAmount.add(new sjcl.bn(Math.round(feeValue * 1e8)));
		var availableValue = new sjcl.bn(0);

		for (var i=0;i<unspentOutputs.length;i++) {
			var tx = { hash: sjcl.codec.base64.fromBits(sjcl.codec.hex.toBits(unspentOutputs[i].txid)) };
			var txN = unspentOutputs[i].vout;

			unspentOutputs[i].out = {
				script: new bitcoin.Script(sjcl.codec.bytes.fromBits(sjcl.codec.hex.toBits(unspentOutputs[i].scriptPubKey)))
			}

			this.selectedOuts.push(unspentOutputs[i]);
			availableValue = availableValue.add(new sjcl.bn(Math.round(unspentOutputs[i].amount * 1e8)));
			sendTx.addInput(tx, txN);
		};

		var changeValue = availableValue.sub(txValue);
		sendTx.addOutput(new bitcoin.Address(this.getAddress().toString(), this.version.p2sh), txAmount);

		// get change address from |0|1|1 - chain. generate new.
		if (changeValue.greaterEquals(new sjcl.bn(0))) {
			var changeAddress = changeAdd || unspentOutputs[0].address;
			sendTx.addOutput(new bitcoin.Address(changeAddress, this.version.p2sh), changeValue);
		}

		return sendTx;
	};

	MultiSigKey.prototype.signFundTx = function (sendTx, privateKey) {
		var hashType = 1;

		for (var i = 0; i < sendTx.ins.length; i++) {
			var hash = sendTx.hashTransactionForSignature(this.selectedOuts[i].out.script, i, hashType);
			var pubKeyHash = this.selectedOuts[i].out.script.simpleOutPubKeyHash();

			var ecKey = new bitcoin.ECKey(privateKey);
			ecKey.compressed = true;

			var signature = sjcl.codec.bytes.fromBits(ecKey.sign(sjcl.codec.bytes.toBits(hash)));
			signature.push(parseInt(hashType, 10));


			sendTx.ins[i].script = new bitcoin.Script.createInputScript(signature, sjcl.codec.bytes.fromBits(ecKey.getPub()))
		}

		return sendTx;
	}


	MultiSigKey.prototype.sign = function (tx, privateKeys) {
		var sendTx = tx.deserialize(tx);

		var hashType = 1; // SIGHASH_ALL
    for (var i = 0; i < sendTx.ins.length; i++) {
      var hash = sendTx.hashTransactionForSignature(this.redeemScript, i, hashType);
      var script = new bitcoin.Script();

      // No idea why this remains in Bitcoin code...
      script.writeOp(0);

      // sign in the order of the hdkeys which are pre-sorted.
      for (var j = 0; j < this.hdKeys.length; j++ ) {
        var hdKey = this.hdKeys[j];
        if (hdKey.prv) {
	        var signature = sjcl.codec.bytes.fromBits(this.hdKeys[j].sign(sjcl.codec.bytes.toBits(hash)));
	        signature.push(parseInt(hashType, 10));
	        script.writeBytes(signature);
        }
      }

      script.writeBytes(this.redeemScript.buffer);
      sendTx.ins[i].script = script;
    }
    return sendTx;
	};

})();
