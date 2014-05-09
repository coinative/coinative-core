'use strict'
// http://tools.ietf.org/html/rfc4231
describe('MultiSigKey', function () {
  describe('(invalid inputs)', function () {
    it ('should error where public keys > 22', function () {
      expect(function () { new bitcoin.MultiSigKey(new Array(22), 2) }).to.throw();
    });

    it ('should error where public keys < 2', function () {
      expect(function () { new bitcoin.MultiSigKey([1,2], 2) }).to.throw();
    });

    it ('should error where signatories > pubkeys', function () {
      expect(function () { new bitcoin.MultiSigKey([1,2,3], 4) }).to.throw();
    });
  });

  describe('Sorted HDKeys (public)', function () {
    var multiSigKey = new bitcoin.MultiSigKey([
      new bitcoin.HDKey({
        compressed: false,
        chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
        pub: hex.toBits('041558d6cc3c80504aab547c199161a45bfa726caefa70938a89d3c7cb5ad8c245b01e930bc6c9d489492be16a1c89b13ec0ba36345cf8f9813ff8457d7201d208') }),
      new bitcoin.HDKey({
        compressed: false,
        chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
        pub: hex.toBits('041086f00a358a099eb92c9ae7c3a48f0d37ae58c3952edc87a293c9c449e438f993dc90bb34e827040cc2e8ee42d1cc713ed3d99aa4a74bfd859a05278bf64954') })
    ], 2, true);

    it('should sort keys in accending pubkey order', function () {
      expect(bytes.toHex(multiSigKey.redeemScript.buffer)).equal('5241041558d6cc3c80504aab547c199161a45bfa726caefa70938a89d3c7cb5ad8c245b01e930bc6c9d489492be16a1c89b13ec0ba36345cf8f9813ff8457d7201d20841041086f00a358a099eb92c9ae7c3a48f0d37ae58c3952edc87a293c9c449e438f993dc90bb34e827040cc2e8ee42d1cc713ed3d99aa4a74bfd859a05278bf6495452ae');

      multiSigKey.sortHdKeys();

      expect(bits.toHex(multiSigKey.hdKeys[0].pub)).equal('041086f00a358a099eb92c9ae7c3a48f0d37ae58c3952edc87a293c9c449e438f993dc90bb34e827040cc2e8ee42d1cc713ed3d99aa4a74bfd859a05278bf64954');
      expect(bits.toHex(multiSigKey.hdKeys[1].pub)).equal('041558d6cc3c80504aab547c199161a45bfa726caefa70938a89d3c7cb5ad8c245b01e930bc6c9d489492be16a1c89b13ec0ba36345cf8f9813ff8457d7201d208');
    });

    it('should regenerate redeemScript with ordered public keys', function () {
      expect(bytes.toHex(multiSigKey.redeemScript.buffer)).equal('5241041086f00a358a099eb92c9ae7c3a48f0d37ae58c3952edc87a293c9c449e438f993dc90bb34e827040cc2e8ee42d1cc713ed3d99aa4a74bfd859a05278bf6495441041558d6cc3c80504aab547c199161a45bfa726caefa70938a89d3c7cb5ad8c245b01e930bc6c9d489492be16a1c89b13ec0ba36345cf8f9813ff8457d7201d20852ae');
    });
  });

  describe('Uncompressed HDKeys (public)', function () {
    // bitcoind addmultisigaddress 2 '["041558d6cc3c80504aab547c199161a45bfa726caefa70938a89d3c7cb5ad8c245b01e930bc6c9d489492be16a1c89b13ec0ba36345cf8f9813ff8457d7201d208",
    // "041086f00a358a099eb92c9ae7c3a48f0d37ae58c3952edc87a293c9c449e438f993dc90bb34e827040cc2e8ee42d1cc713ed3d99aa4a74bfd859a05278bf64954"]'
    it('2 of 2, unsorted', function () {
      var multiSigKey = new bitcoin.MultiSigKey([
        new bitcoin.HDKey({
          compressed: false,
          chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
          pub: hex.toBits('041558d6cc3c80504aab547c199161a45bfa726caefa70938a89d3c7cb5ad8c245b01e930bc6c9d489492be16a1c89b13ec0ba36345cf8f9813ff8457d7201d208') }),
        new bitcoin.HDKey({
          compressed: false,
          chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
          pub: hex.toBits('041086f00a358a099eb92c9ae7c3a48f0d37ae58c3952edc87a293c9c449e438f993dc90bb34e827040cc2e8ee42d1cc713ed3d99aa4a74bfd859a05278bf64954') })
      ], 2, true);

      expect(multiSigKey.getAddress().toString()).equal('3F9F3gm8WpnxBMuXS3TSrdJWKbYUpEhogW');
    });
  });

  describe('Public Key Derivation', function () {
    var multiSigKey = new bitcoin.MultiSigKey([
      new bitcoin.HDKey({
        chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
        pub: hex.toBits('03d728ad6757d4784effea04d47baafa216cf474866c2d4dc99b1e8e3eb936e730')
      }),
      new bitcoin.HDKey({
        chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
        pub: hex.toBits('02d83bba35a8022c247b645eed6f81ac41b7c1580de550e7e82c75ad63ee9ac2fd')
      }),
      new bitcoin.HDKey({
        chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
        pub: hex.toBits('03aeb681df5ac19e449a872b9e9347f1db5a0394d2ec5caf2a9c143f86e232b0d9')
      }),
    ], 2, true);

    it('can derive new multiSigKey key with public key derivation (< 0x80000000)', function () {
      var childMultiSigKey = multiSigKey.derivePublic(1);
      expect(bytes.toHex(childMultiSigKey.hdKeys[0].parent)).equal(bytes.toHex(multiSigKey.hdKeys[0].fpr));
      expect(bytes.toHex(childMultiSigKey.hdKeys[1].parent)).equal(bytes.toHex(multiSigKey.hdKeys[1].fpr));
      expect(bytes.toHex(childMultiSigKey.hdKeys[2].parent)).equal(bytes.toHex(multiSigKey.hdKeys[2].fpr));
    });


    it('should throw error on public key by private dervivation (> 0x80000000)', function () {
      expect(function () { multiSigKey.derivePublic(1 + 0x80000000) }).to.throw('Cannot perform private derivation using the public child key derivation function');
    });

  });

  describe('regression tests', function () {
    // https://bitcointalk.org/index.php?topic=82213.20
    describe('2 of 3, uncompressed keys, unsorted', function () {
      var multiSigKey = new bitcoin.MultiSigKey([
        new bitcoin.HDKey({
          compressed: false,
          chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
          pub: hex.toBits('0446fc07bc99bef8e7a875249657c65e1f1793fd0bf45e2c39d539b6f8fcd44676acc552ab886c11eb08f4a275e7bb7dc4fdaf9c4b2228856f168a69df7d216fbc')
        }),
        new bitcoin.HDKey({
          compressed: false,
          chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
          pub: hex.toBits('04df70eb0107ed08e1ddcd4b4d85d26bf8cca301f5c98fd15f5efef12ba4de72bfef7287f964e304207164c003029449740aaae2d6af1ff7ae3f6bb27f3012296c')
        }),
        new bitcoin.HDKey({
          compressed: false,
          chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
          pub: hex.toBits('046003581a3ff5bc3dedaa6da4834ce7bcd49d3f114ce15791f6b5de8b0cec81a46db2eb8cf84d2db845854c57788c7283ab4040aeb3595bc5c68303a17fdde7c8')
        })
      ],2, true);

      it('Create redeemScript', function () {
        expect(bytes.toHex(multiSigKey.redeemScript.buffer)).equal('52410446fc07bc99bef8e7a875249657c65e1f1793fd0bf45e2c39d539b6f8fcd44676acc552ab886c11eb08f4a275e7bb7dc4fdaf9c4b2228856f168a69df7d216fbc4104df70eb0107ed08e1ddcd4b4d85d26bf8cca301f5c98fd15f5efef12ba4de72bfef7287f964e304207164c003029449740aaae2d6af1ff7ae3f6bb27f3012296c41046003581a3ff5bc3dedaa6da4834ce7bcd49d3f114ce15791f6b5de8b0cec81a46db2eb8cf84d2db845854c57788c7283ab4040aeb3595bc5c68303a17fdde7c853ae');
      });

      it('Create P2SH Address', function () {
        expect(multiSigKey.getAddress().toString()).equal('3EffXJKyYB9zWh2dhx2hcccqBK8DGC7x2x');
      });
    });

    describe('2 of 3, compressed keys, unsorted', function () {
      var multiSigKey = new bitcoin.MultiSigKey([
        new bitcoin.HDKey({
          chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
          pub: hex.toBits('0246fc07bc99bef8e7a875249657c65e1f1793fd0bf45e2c39d539b6f8fcd44676')
        }),
        new bitcoin.HDKey({
          chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
          pub: hex.toBits('02df70eb0107ed08e1ddcd4b4d85d26bf8cca301f5c98fd15f5efef12ba4de72bf')
        }),
        new bitcoin.HDKey({
          chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
          pub: hex.toBits('026003581a3ff5bc3dedaa6da4834ce7bcd49d3f114ce15791f6b5de8b0cec81a4')
        })
      ],2, true);

      it('Create redeemScript', function () {
        expect(bytes.toHex(multiSigKey.redeemScript.buffer)).equal('52210246fc07bc99bef8e7a875249657c65e1f1793fd0bf45e2c39d539b6f8fcd446762102df70eb0107ed08e1ddcd4b4d85d26bf8cca301f5c98fd15f5efef12ba4de72bf21026003581a3ff5bc3dedaa6da4834ce7bcd49d3f114ce15791f6b5de8b0cec81a453ae');
      });

      it('Create P2SH Address', function () {
        expect(multiSigKey.getAddress().toString()).equal('3Dfbkn7ukNC85ZkZLXp6tDZYpm5jpMxKBR');
      });
    });

    describe('2 of 3, testnet', function () {
      var multiSigKey = new bitcoin.MultiSigKey([
        new bitcoin.HDKey({
          chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
          pub: hex.toBits('0348E6D9C02B25EE89C676012D1800E325A94F14D36A6D03E4934B2150B85860D2'),
          version: bitcoin.config.versions.bitcoin.testnet
        }),
        new bitcoin.HDKey({
          chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
          pub: hex.toBits('02A75CCCD6E8338DF75CF742BA6EE1102B47D69D3E761D6A957089E53D66452957'),
          version: bitcoin.config.versions.bitcoin.testnet
        }),
        new bitcoin.HDKey({
          chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
          pub: hex.toBits('02CF692CE1C022948BB3E88DB5AE94664C08FB5DEF1122EA2F99F3324E0E6D4297'),
          version: bitcoin.config.versions.bitcoin.testnet
        })
      ],2, true);

      it('Create redeemScript', function () {
        expect(bytes.toHex(multiSigKey.redeemScript.buffer)).equal('52210348e6d9c02b25ee89c676012d1800e325a94f14d36a6d03e4934b2150b85860d22102a75cccd6e8338df75cf742ba6ee1102b47d69d3e761d6a957089e53d664529572102cf692ce1c022948bb3e88db5ae94664c08fb5def1122ea2f99f3324e0e6d429753ae');
      });

      it('Create P2SH Address', function () {
        expect(multiSigKey.getAddress().toString()).equal('2Mv4o98qqSc9DtK4CTuCvk9BTwv2MrAQrrA');
      });
    });

  });
});
