'use strict';

describe('Builder', function () {
  describe('setUnspent', function () {
    var utxos = [{
        address: "2NDJbzwzsmRgD2o5HHXPhuq5g6tkKTjYkd6",
        txid: "c2e50d1c8c581d8c4408378b751633f7eb86687fc5f0502be7b467173f275ae7",
        vout: 0,
        value: 5000000,  //0.05
        scriptPubKey: "a914dc0623476aefb049066b09b0147a022e6eb8429187",
      }];

    var builder = new bitcoin.Builder()
      .setUnspent(utxos);

    it('should generate tx inputs', function () {
      expect(builder.transaction.ins.length).equal(1);
      var tx = builder.transaction.ins[0];
      expect(tx.outpoint.hash).eql(hex.toBytes('e75a273f1767b4e72b50f0c57f6886ebf73316758b3708448c1d588c1c0de5c2'));
      expect(tx.outpoint.index).equal(0);
      expect(tx.script.buffer).eql([]);
    });

    it('set available value', function () {
      expect(builder.availableValue).equal(5000000)
    });
  });

  describe('setOutputs', function () {
    it('should error when no unspent outputs', function () {
      expect(function () {
        new bitcoin.Builder().setOutputs([{}]);
      }).to.throw('No unspentOutputs');
    });

    it('should error when not enough value for fee', function () {
      expect(function () {
        new bitcoin.Builder()
        .setUnspent({
          address: "2NDJbzwzsmRgD2o5HHXPhuq5g6tkKTjYkd6",
          txid: "c2e50d1c8c581d8c4408378b751633f7eb86687fc5f0502be7b467173f275ae7",
          vout: 0,
          value: 5000000,  //0.05
          scriptPubKey: "a914dc0623476aefb049066b09b0147a022e6eb8429187",
        })
        .setOutputs([{
          address: 'n2hoFVbPrYQf7RJwiRy1tkbuPPqyhAEfbp',
          value: 5000000 // 0.04
        }]);
      }).to.throw('transaction input value < output value');
    });

    describe('output to Address', function () {
      var utxos = [{
        address: "2NDJbzwzsmRgD2o5HHXPhuq5g6tkKTjYkd6",
        txid: "c2e50d1c8c581d8c4408378b751633f7eb86687fc5f0502be7b467173f275ae7",
        vout: 0,
        value: 5000000,  //0.05
        scriptPubKey: "a914dc0623476aefb049066b09b0147a022e6eb8429187",
      }];

      var builder = new bitcoin.Builder()
        .setUnspent(utxos);

      var txBuild = builder.setOutputs([{
        address: 'n2hoFVbPrYQf7RJwiRy1tkbuPPqyhAEfbp',
        value: 4000000 // 0.04
      }]);

      it('set valueOut', function () {
        expect(txBuild.transaction.outs.length).equal(2);
        expect(txBuild.valueOut).equal(4000000)
      })

      it('should create address tx out', function () {
         var txOut = txBuild.transaction.outs[0];
        expect(txOut.script.getOutType()).equal('Address');
        expect(txOut.value).equal(4000000);
      });

      it('should create change P2SH tx out', function () {
        var txChange = txBuild.transaction.outs[1];
        expect(txChange.script.getOutType()).equal('P2SH');
        expect(txChange.value).equal(990000);
      });
    });

    describe('output to P2SH', function () {
      var utxos = [{
        address: "2NDJbzwzsmRgD2o5HHXPhuq5g6tkKTjYkd6",
        txid: "c2e50d1c8c581d8c4408378b751633f7eb86687fc5f0502be7b467173f275ae7",
        vout: 0,
        value: 5000000,  //0.05
        scriptPubKey: "a914dc0623476aefb049066b09b0147a022e6eb8429187",
      }];

      var builder = new bitcoin.Builder()
        .setUnspent(utxos);

      var txBuild = builder.setOutputs([{
        address: '2NDJbzwzsmRgD2o5HHXPhuq5g6tkKTjYkd6', //P2SH address
        value: 4000000 // 0.04
      }]);

      it('set valueOut', function () {
        expect(txBuild.transaction.outs.length).equal(2);
        expect(txBuild.valueOut).equal(4000000)
      })

      it('should create P2SH tx out', function () {
         var txOut = txBuild.transaction.outs[0];
        expect(txOut.script.getOutType()).equal('P2SH');
        expect(txOut.value).equal(4000000);
      });

      it('should create change P2SH tx out', function () {
        var txChange = txBuild.transaction.outs[1];
        expect(txChange.script.getOutType()).equal('P2SH');
        expect(txChange.value).equal(990000);
      });
    });

  });

  describe('sign', function () {
    it('should error when no inputs', function () {
      var multiSigKey = new bitcoin.HDKey({
        chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
        prv: hex.toBits('0702720CFA513FB6F5C4AE05235EDE82E0B996593CCC08D0626165430495C664'),
        version: bitcoin.config.versions.bitcoin.testnet
      });

      expect(function () {
        new bitcoin.Builder().sign(multiSigKey)
      }).to.throw('No inputs defined.');
    });

    it('should error when no outputs', function () {
      var multiSigKey = new bitcoin.HDKey({
        chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
        prv: hex.toBits('0702720CFA513FB6F5C4AE05235EDE82E0B996593CCC08D0626165430495C664'),
        version: bitcoin.config.versions.bitcoin.testnet
      });

      expect(function () {
        new bitcoin.Builder()
          .setUnspent([{
            address: "2NDJbzwzsmRgD2o5HHXPhuq5g6tkKTjYkd6",
            txid: "c2e50d1c8c581d8c4408378b751633f7eb86687fc5f0502be7b467173f275ae7",
            vout: 0,
            value: 5000000,  //0.05
            scriptPubKey: "a914dc0623476aefb049066b09b0147a022e6eb8429187"
          }])
          .sign(multiSigKey)
      }).to.throw('No outputs defined.');
    });
  });

  describe('Vector (testnet) - P2SH 3 of 5', function () {
    var multiSigKey = new bitcoin.MultiSigKey([
      new bitcoin.HDKey({
        chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
        prv: hex.toBits('0702720CFA513FB6F5C4AE05235EDE82E0B996593CCC08D0626165430495C664'),
        version: bitcoin.config.versions.bitcoin.testnet
      }),
      new bitcoin.HDKey({
        chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
        prv: hex.toBits('F0EDC87C15EBD56D7A09265377C85210607A95852D3689FC733A8E963DAFEB9E'),
        version: bitcoin.config.versions.bitcoin.testnet
      }),
      new bitcoin.HDKey({
        chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
        prv: hex.toBits('49233184D3B1B3347AF77437CB831860E50A0B09513F2D7D862F7AE7DB994E68'),
        version: bitcoin.config.versions.bitcoin.testnet
      }),
      new bitcoin.HDKey({
        chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
        prv: hex.toBits('9FB0F8EC9AEC84CB45D01596FC2211F243D2EB0C19C59AEEB947EFAFD91942AA'),
        version: bitcoin.config.versions.bitcoin.testnet
      }),
      new bitcoin.HDKey({
        chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
        prv: hex.toBits('71EFBB5D74DC32E28288E5C1FA0E8CEA873B18561D0F2AD30B0D24061EE2A8F8'),
        version: bitcoin.config.versions.bitcoin.testnet
      })
    ], 3);

    describe('redeem P2SH', function () {
      var utxos = [{
        address: "2NDJbzwzsmRgD2o5HHXPhuq5g6tkKTjYkd6",
        txid: "c2e50d1c8c581d8c4408378b751633f7eb86687fc5f0502be7b467173f275ae7",
        vout: 0,
        value: 5000000,  //0.05
        scriptPubKey: "a914dc0623476aefb049066b09b0147a022e6eb8429187",
      }];

      var builder = new bitcoin.Builder()
        .setUnspent(utxos)
        .setOutputs([{
          address: 'n2hoFVbPrYQf7RJwiRy1tkbuPPqyhAEfbp',
          value: 4000000 // 0.04
        }]);

      var unsignedTx = builder.serialize();
      var signedTx = builder
          .sign(multiSigKey)
          .serialize();

      it('serialized (hex) unsigned transaction', function () {
        expect(unsignedTx.tx).to.equal('0100000001e75a273f1767b4e72b50f0c57f6886ebf73316758b3708448c1d588c1c0de5c20000000000ffffffff0200093d00000000001976a914e867aad8bd361f57c50adc37a0c018692b5b0c9a88ac301b0f000000000017a914dc0623476aefb049066b09b0147a022e6eb842918700000000');
      });

      it('deserialize unsigned transaction', function () {
        var newTx = new bitcoin.Builder(unsignedTx);
        expect(unsignedTx.tx).to.equal(newTx.serialize().tx)
      });

      it('serialised (hex) signed transaction', function () {
        expect(signedTx.tx).to.contain('0100000001e75a273f1767b4e72b50f0c57f6886ebf73316758b3708448c1d588c1c0de5c200000000fd8e010049');
        expect(signedTx.tx).to.contain('ffffffff0200093d00000000001976a914e867aad8bd361f57c50adc37a0c018692b5b0c9a88ac301b0f000000000017a914dc0623476aefb049066b09b0147a022e6eb842918700000000');
      });

      it('deserialize signed transaction', function () {
        var newTx = new bitcoin.Builder(signedTx);
        expect(signedTx.tx).to.equal(newTx.serialize().tx)
      });

    });
  });
});
