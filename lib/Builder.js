'use strict';

bitcoin.Builder = {};

(function () {

  function deserialize(opts) {
    var txBits = sjcl.codec.hex.toBits(opts.tx);
    var txBytes = sjcl.codec.bytes.fromBits(txBits);

    this.fee = opts.fee;
    this.transaction = bitcoin.Transaction.deserialize(txBytes);
    this.unspentOutputs = opts.unspentOutputs;
    for (var i = 0;i<this.unspentOutputs.length;i++) {
      this._parseInput(this.unspentOutputs[i], i);
    }
  };

  var Builder = bitcoin.Builder = function (opts) {
    opts = opts || {};

    this.fee = opts.fee || 10000;
    this.signhash = opts.signhash || bitcoin.Transaction.SIGHASH_ALL
    this.inputsSigned = 0;
    this.signaturesAdded = 0;
    this.remainderOutput = opts.remainderOutput;
    this._inputs = [];

    if (opts.tx) {
      deserialize.call(this, opts);
    } else {
      this.transaction = new bitcoin.Transaction();
    }

    return this;
  };

  Builder.prototype._getScriptForOutput = function (output) {
    if (output.address) {
      return bitcoin.Script.createOutputScript(new bitcoin.Address(output.address));
    } else if (output.nreq && output.pubKeys) {
      return bitcoin.Script.createMultiSigOutputScript(output.nreq, output.pubKeys);
    } else {
      throw Error('unsupported output.');
    }
  };

  Builder.prototype._checkFee = function () {
    var valueOutIncFee = this.valueOut + this.fee;
    if (this.availableValue < valueOutIncFee) {
      throw Error('transaction input value < output value');
    }
  };

  Builder.prototype._setRemainder = function () {
    var remainder = this.availableValue - this.valueOut - this.fee;
    if (remainder > 0) {
      this.remainderOutput = this.remainderOutput || this.unspentOutputs[0];
      var value = remainder;
      var script = this._getScriptForOutput(this.remainderOutput);
      this.transaction.addOutputScript(script, value);
    };
  };

  Builder.prototype._parseInput = function (input, i) {
    var scriptPubKey = new bitcoin.Script(sjcl.codec.bytes.fromBits(sjcl.codec.hex.toBits(input.scriptPubKey)));
    this._inputs.push({
      address: input.address,
      scriptPubKey: scriptPubKey,
      scriptType: scriptPubKey.getOutType(),
      i: i
    });
  }

  Builder.prototype.setUnspent = function(unspentOutputs) {
    this.availableValue = 0;

    for (var i=0;i<unspentOutputs.length;i++) {
      var input = unspentOutputs[i];
      var tx = { hash: (sjcl.codec.bytes.fromBits(sjcl.codec.hex.toBits(input.txid))).reverse() };
      var txN = input.vout;
      this.transaction.addInput(tx, txN);
      this._parseInput(input, i);
      this.availableValue = this.availableValue + input.value;
    };

    this.unspentOutputs = unspentOutputs;
    return this;
  };

  Builder.prototype.setOutputs = function(outputs) {
    if (!this.unspentOutputs || this.unspentOutputs.length === 0) {
      throw Error('No unspentOutputs');
    }

    this.valueOut = 0;
    var l = outputs.length;

    for (var i=0;i<l;i++) {
      var output = outputs[i];

      var value = output.value;
      var script = this._getScriptForOutput(output);

      this.transaction.addOutputScript(script, value);
      this.valueOut = this.valueOut + value;
    };

    this._checkFee();
    this._setRemainder();

    return this;
  };

  Builder.prototype._scriptIsAppended = function(script, scriptToAddBuf) {
    var len = script.chunks.length;
    if (script.chunks[len-1] === undefined)
      return false;
    if (typeof script.chunks[len-1] === 'number')
      return false;

    return sjcl.bitArray.equal(sjcl.codec.bytes.toBits(script.chunks[len-1]), sjcl.codec.bytes.toBits(scriptToAddBuf));
  };

  Builder.prototype._addScript = function(scriptBuf, scriptToAddBuf) {
    var script = new bitcoin.Script(scriptBuf);
    if (!this._scriptIsAppended(script, scriptToAddBuf)) {
      script.chunks.push(scriptToAddBuf);
      script.updateBuffer();
    }
    return script;
  };

  Builder.prototype._isSignedWithKey = function(hdKey, scriptSig, sigHash, nreq) {
    var ret = false;
    for(var i=1; i<=nreq; i++) {
      var chunk = scriptSig.chunks[i];
      if (!chunk || ((chunk instanceof Array) && chunk.length === 0))
        continue;

      var sigRaw = sjcl.codec.bytes.toBits(chunk.slice(0,chunk.length-1));
      try {
        ret = hdKey.ecKey.verify(sigHash, sigRaw);
      } catch (e) {

      }
    }
    return ret;
  };

  Builder.prototype._initMultiSig = function (scriptSig, nreq) {
    var wasUpdated = false;
    if (scriptSig.chunks.length < (nreq + 1)) {
      wasUpdated = true;
      scriptSig.chunks[0] = 0x00;
      while (scriptSig.chunks.length <= nreq) {
        scriptSig.chunks.push([]);
      }
    }
    return wasUpdated;
  };

  Builder.prototype._updateMultiSig = function (hdKey, scriptSig, txSigHash, nreq) {
    var wasUpdated = this._initMultiSig(scriptSig, nreq);

    var sigHash = sjcl.codec.bytes.toBits(txSigHash);
    if (this._isSignedWithKey(hdKey, scriptSig, sigHash, nreq)) {
      return null;
    }

    for (var i = 1; i <= nreq; i++) {
      var chunk = scriptSig.chunks[i];
      if(!((chunk instanceof Array) && chunk.length === 0))
        continue;


      var sigRaw = hdKey.ecKey.sign(sigHash);
      var sigRAWBytes = sjcl.codec.bytes.fromBits(sigRaw);
      var verify = hdKey.ecKey.verify(sigHash, sigRaw)
      scriptSig.chunks[i] = sjcl.codec.bytes.fromBits(sigRaw).concat([this.signhash]);

      scriptSig.updateBuffer();
      wasUpdated = true;
      break;
    }
    return wasUpdated ? scriptSig : null;
  };

  Builder.prototype._signMultiSig = function (pubKeyMap, input, txSigHash) {
    var pubKeys = input.scriptPubKey.capture();
    var nreq = input.scriptPubKey.chunks[0] - 80;

    var scriptSig = this.transaction.ins[input.i].script;
    var signaturesAdded = 0;

    for(var j=0; j<pubKeys.length && scriptSig.countMissingSignatures(); j++) {
      var signingKey = pubKeyMap[pubKeys[j]];

      if (!signingKey || !signingKey.prv)
        continue;

      var newScriptSig = this._updateMultiSig(signingKey, scriptSig, txSigHash, nreq);
      if (newScriptSig) {
        scriptSig = newScriptSig;
        signaturesAdded++;
      }
    }

    return {
      isFullySigned: scriptSig.countMissingSignatures() === 0,
      signaturesAdded: signaturesAdded,
      script: scriptSig
    }
  }

  Builder.prototype._signScriptHash = function (pubKeyMap, multiSigKey, input) {
    var redeemScript = multiSigKey.redeemScript;
    var redeemScriptType = redeemScript.getOutType();
    if (redeemScriptType != 'Multisig') {
      throw Error('Unsupported script type.');
    }
    var newInput = {
      i: input.i,
      scriptPubKey: redeemScript,
      scriptType: redeemScriptType
    };
    var newTxSigHash = this.transaction.hashTransactionForSignature(redeemScript, input.i, this.signhash);
    var ret = this._signMultiSig(pubKeyMap, newInput, newTxSigHash);
    if (ret && ret.script && ret.signaturesAdded) {
      ret.script = this._addScript(ret.script, redeemScript.buffer);
    }
    return ret;
  };

  Builder.prototype.sign = function (multiSigKey) {
    if (this.transaction.ins.length === 0) {
      throw Error('No inputs defined.');
    }

    if(this.transaction.outs.length === 0) {
      throw Error('No outputs defined.');
    }

    var pubKeyMap = {};
    for(var i=0;i<multiSigKey.hdKeys.length;i++) {
      var hdKey = multiSigKey.hdKeys[i];
      pubKeyMap[hdKey.pub] = hdKey;
    };

    for(var i=0; i<this._inputs.length;i++) {
      var input = this._inputs[i];
      if (input.scriptType != 'P2SH') {
        throw Error('Unsupported OutType');
      }

      var ret = this._signScriptHash(pubKeyMap, multiSigKey, input);
      if (ret && ret.script) {
        this.transaction.ins[i].script = ret.script;
        if (ret.isFullySigned) this.inputsSigned++;
        if (ret.signaturesAdded) this.signaturesAdded += ret.signaturesAdded;
      }
    }
    return this;
  };

  Builder.prototype.serialize = function () {
    var data = {
      fee: this.fee,
      signhash: this.signhash,
      inputsSigned: this.inputsSigned,
      signaturesAdded: this.signaturesAdded,
      remainderOutput: this.remainderOutput,
      unspentOutputs: this.unspentOutputs
    };

    var txBytes = this.transaction.serialize();
    var txHex = sjcl.codec.hex.fromBits(sjcl.codec.bytes.toBits(txBytes));

    data.tx = txHex;
    return data;
  };


})();
