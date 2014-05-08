bitcoin.Transaction = {};

(function () {

  function uint(f, size) {
    if (f.length < size)
        return 0;
    var bytes = f.slice(0, size);
    var pos = 1;
    var n = 0;
    for (var i = 0; i < size; i++) {
        var b = f.shift();
        n += b * pos;
        pos *= 256;
    }
    return size <= 4 ? n : bytes;
  }

  function u8(f)  { return uint(f,1); }
  function u16(f) { return uint(f,2); }
  function u32(f) { return uint(f,4); }
  function u64(f) { return uint(f,8); }

  function readBuffer(f, size) {
    var res = f.slice(0, size);
    for (var i = 0; i < size; i++) f.shift();
    return res;
  }

  function readString(f) {
    var len = readVarInt(f);
    return readBuffer(f, len);
  }

  function readVarInt(f) {
    var t = u8(f);
    if (t == 0xfd) return u16(f); else
    if (t == 0xfe) return u32(f); else
    if (t == 0xff) return u64(f); else
    return t;
  }

	var Script = bitcoin.Script;

  var Transaction = bitcoin.Transaction = function (doc) {
    this.version = 1;
    this.lock_time = 0;
    this.ins = [];
    this.outs = [];
    this.timestamp = null;
    this.block = null;

    if (doc) {
      if (doc.hash) this.hash = doc.hash;
      if (doc.version) this.version = doc.version;
      if (doc.lock_time) this.lock_time = doc.lock_time;
      if (doc.ins && doc.ins.length) {
        for (var i = 0; i < doc.ins.length; i++) {
          this.addInput(new TransactionIn(doc.ins[i]));
        }
      }
      if (doc.outs && doc.outs.length) {
        for (var i = 0; i < doc.outs.length; i++) {
          this.addOutput(new TransactionOut(doc.outs[i]));
        }
      }
      if (doc.timestamp) this.timestamp = doc.timestamp;
      if (doc.block) this.block = doc.block;
    }
  };

  Transaction.OP_CODESEPARATOR = 171;
  Transaction.SIGHASH_ALL = 1;
  Transaction.SIGHASH_NONE = 2;
  Transaction.SIGHASH_SINGLE = 3;
  Transaction.SIGHASH_ANYONECANPAY = 80;

  Transaction.deserialize = function(bytes) {
    var sendTx = new bitcoin.Transaction();

    var f = bytes.slice(0);
    var tx_ver = u32(f);
    var vin_sz = readVarInt(f);
    if (("number" !== typeof vin_sz) || vin_sz > 0xffff)
        return null;

    for (var i = 0; i < vin_sz; i++) {
      var op = readBuffer(f, 32);
      var n = u32(f);
      var script = new bitcoin.Script(readString(f));
      var seq = u32(f);
      var txin = new TransactionIn({
        outpoint: {
          hash: op,
          index: n
        },
        script: script,
        sequence: seq
      });
      sendTx.addInput(txin);
    }

    var vout_sz = readVarInt(f);
    if (("number" !== typeof vout_sz) || vout_sz > 0xffff)
        return null;

    for (var i = 0; i < vout_sz; i++) {
      var value = bitcoin.util.byteArrayToInt(u64(f));
      var script = new bitcoin.Script(readString(f));
      sendTx.addOutputScript(script, value);
    }
    sendTx.lock_time = u32(f);
    return sendTx;
  };

  /**
   * Turn transaction data into Transaction objects.
   *
   * Takes an array of plain JavaScript objects containing transaction data and
   * returns an array of Transaction objects.
   */
  Transaction.objectify = function (txs) {
    var objs = [];
    for (var i = 0; i < txs.length; i++) {
        objs.push(new Transaction(txs[i]));
    }
    return objs;
  };

  /**
   * Create a new txin.
   *
   * Can be called with an existing TransactionIn object to add it to the
   * transaction. Or it can be called with a Transaction object and an integer
   * output index, in which case a new TransactionIn object pointing to the
   * referenced output will be created.
   *
   * Note that this method does not sign the created input.
   */
  Transaction.prototype.addInput = function (tx, outIndex) {
    if (arguments[0] instanceof TransactionIn) {
      this.ins.push(arguments[0]);
    } else {
      this.ins.push(new TransactionIn({
        outpoint: {
          hash: tx.hash,
          index: outIndex
        },
        script: new bitcoin.Script(),
        sequence: 4294967295
      }));
    }
  };

  /**
   * Create a new txout.
   *
   * Can be called with an existing TransactionOut object to add it to the
   * transaction. Or it can be called with an Address object and a bn
   * for the amount, in which case a new TransactionOut object with those
   * values will be created.
   */
  Transaction.prototype.addOutput = function (address, value) {
    if (arguments[0] instanceof TransactionOut) {
      this.outs.push(arguments[0]);
    } else {
      this.outs.push(new TransactionOut({
        value: value,
        script: Script.createOutputScript(address)
      }));
    }
  };

  Transaction.prototype.addOutputScript = function (script, value) {
    if (arguments[0] instanceof TransactionOut) {
      this.outs.push(arguments[0]);
    } else {
      this.outs.push(new TransactionOut({
        value: value,
        script: script
      }));
    }
  };

  /**
   * Serialize this transaction.
   *
   * Returns the transaction as a byte array in the standard Bitcoin binary
   * format. This method is byte-perfect, i.e. the resulting byte array can
   * be hashed to get the transaction's standard Bitcoin hash.
   */
  Transaction.prototype.serialize = function () {
    var buffer = [];

    buffer = buffer.concat(bitcoin.util.wordsToBytes([(this.version)]).reverse());
    buffer = buffer.concat(bitcoin.util.numToVarInt(this.ins.length));

    for (var i = 0; i < this.ins.length; i++) {
      var txin = this.ins[i];
      buffer = buffer.concat(txin.outpoint.hash);
      buffer = buffer.concat(bitcoin.util.wordsToBytes([parseInt(txin.outpoint.index)]).reverse());
      var scriptBytes = txin.script.buffer;
      buffer = buffer.concat(bitcoin.util.numToVarInt(scriptBytes.length));
      buffer = buffer.concat(scriptBytes);
      buffer = buffer.concat(bitcoin.util.wordsToBytes([parseInt(txin.sequence)]).reverse());
    }

    buffer = buffer.concat(bitcoin.util.numToVarInt(this.outs.length));
    for (var i = 0; i < this.outs.length; i++) {
      var txout = this.outs[i];
      buffer = buffer.concat(bitcoin.util.numToBytes(txout.value, 5));
      var scriptBytes = txout.script.buffer;
      buffer = buffer.concat(bitcoin.util.wordsToBytes([scriptBytes.length]));
      buffer = buffer.concat(scriptBytes);
    }

    buffer = buffer.concat(bitcoin.util.wordsToBytes([this.lock_time]).reverse());
    return buffer;
  };



  /**
   * Hash transaction for signing a specific input.
   *
   * Bitcoin uses a diffe0100000001e75a273f1767b4e72b50f0c57f6886ebf73316758b3708448c1d588c1c0de5c20000000000ffffffff0200093d00000000001976a914e867aad8bd361f57c50adc37a0c018692b5b0c9a88ac301b0f000000000017a914dc0623476aefb049066b09b0147a022e6eb842918700000000rent hash for each signed transaction input. This
   * method copies the transaction, makes the necessary changes based on the
   * hashType, serializes and finally hashes the result. This hash can then be
   * used to sign the transaction input in question.
   */
  Transaction.prototype.hashTransactionForSignature = function (connectedScript, inIndex, hashType) {
    var txTmp = this.clone();

    // In case concatenating two scripts ends up with two codeseparators,
    // or an extra one at the end, this prevents all those possible
    // incompatibilities.
    /*scriptCode = scriptCode.filter(function (val) {
     return val !== OP_CODESEPARATOR;
     });*/

    // Blank out other inputs' signatures
    for (var i = 0; i < txTmp.ins.length; i++) {
      txTmp.ins[i].script = new Script();
    }

    txTmp.ins[inIndex].script = connectedScript;

    // Blank out some of the outputs
    if ((hashType & 0x1f) == Transaction.SIGHASH_NONE) {
      txTmp.outs = [];

        // Let the others update at will
      for (var i = 0; i < txTmp.ins.length; i++) {
        if (i != inIndex) {
          txTmp.ins[i].sequence = 0;
        }
      }
    } else if ((hashType & 0x1f) == Transaction.SIGHASH_SINGLE) {
        // TODO: Implement
    }

    // Blank out other inputs completely, not recommended for open transactions
    if (hashType & Transaction.SIGHASH_ANYONECANPAY) {
      txTmp.ins = [txTmp.ins[inIndex]];
    }

    var buffer = txTmp.serialize();
    buffer = buffer.concat(bitcoin.util.wordsToBytes([parseInt(hashType)]).reverse());

    return sjcl.codec.bytes.fromBits(bitcoin.util.sha256d(sjcl.codec.bytes.toBits(buffer)));
  };

  /**
   * Calculate and return the transaction's hash.
   */
  Transaction.prototype.getHash = function () {
    var buffer = this.serialize();
    return Crypto.SHA256(Crypto.SHA256(buffer, {asBytes: true}), {asBytes: true});
  };

  /**
   * Create a copy of this transaction object.
   */
  Transaction.prototype.clone = function () {
    var newTx = new Transaction();
    newTx.version = this.version;
    newTx.lock_time = this.lock_time;
    for (var i = 0; i < this.ins.length; i++) {
      var txin = this.ins[i].clone();
      newTx.addInput(txin);
    }
    for (var i = 0; i < this.outs.length; i++) {
      var txout = this.outs[i].clone();
      newTx.addOutput(txout);
    }
    return newTx;
  };

  /**
   * Get the total amount of a transaction's outputs.
   */
  Transaction.prototype.getTotalOutValue = function () {
    var totalValue = 0;
    for (var j = 0; j < this.outs.length; j++) {
      var txout = this.outs[j];
      totalValue = totalValue + txout.value;
    }
    return totalValue;
  };

  var TransactionIn = function (data) {
    this.outpoint = data.outpoint;
    if (data.script instanceof Script) {
      this.script = data.script;
    } else {
      this.script = new Script(data.script);
    }
    this.sequence = data.sequence;
  };

  TransactionIn.prototype.clone = function () {
    var newTxin = new TransactionIn({
      outpoint: {
        hash: this.outpoint.hash,
        index: this.outpoint.index
      },
      script: this.script.clone(),
      sequence: this.sequence
    });
    return newTxin;
  };

  var TransactionOut = function (data) {
    this.script = new Script(data.script);
    this.value = data.value;
  };

  TransactionOut.prototype.clone = function () {
    var newTxout = new TransactionOut({
      script: this.script.clone(),
      value: this.value
    });
    return newTxout;
  };

})();
