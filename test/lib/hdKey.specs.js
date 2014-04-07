'use strict';

describe('HDKey', function () {
  describe('invalid constructor arguments', function () {
    var chain = hex.toBits('0000000000000000000000000000000000000000000000000000000000000000');

    it('no opts', function () {
      expect(function () { new bitcoin.HDKey() }).to.throw();
    });

    it('invalid chain code', function () {
      expect(function () { new bitcoin.HDKey({ chain: [] }) }).to.throw('invalid chain code');
    });

    it('no keys', function () {
      expect(function () { new bitcoin.HDKey({ chain: chain }) }).to.throw('no keys defined');
    });

    it ('public key not on the curve', function () {
      expect(function () { new bitcoin.HDKey({
        chain: chain,
        pub: hex.toBits('') })
      }).to.throw('not on the curve!');
    });
  });

  describe('isValid', function () {
    it('invalid keys', function () {
      expect(bitcoin.HDKey.isValid('ypub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8')).to.be.false;
      expect(bitcoin.HDKey.isValid('yprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi')).to.be.false;
    });

    it ('valid keys', function () {
      expect(bitcoin.HDKey.isValid('xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8')).to.be.true;
      expect(bitcoin.HDKey.isValid('xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi')).to.be.true;
    });
  });

  describe('mainnet (chain+pub)', function () {
    var hdKey = new bitcoin.HDKey({
      chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
      pub: hex.toBits('04fe9764ba6f1cc2102c394cd558ef463d25f509ff936abf4ad81f84e8f4773848755b64f5c32e6aa5e461e241133475250182e29c1d3c89d7b5478a4569a389db')
    });
    var serialized = hdKey.serialize();
    var xPubKey = hex.toBytes(serialized.pub.hex);

    it('should default version to mainnet', function () {
      expect(hdKey.version).eql({
        'xpubKey': 0x0488b21e,
        'xprvKey': 0x0488ade4,
        'p2sh': 5,
        'pubKey': 0
      });
    });

    it('should default to compressed keys', function () {
      expect(hdKey.ecKey.compressed).to.be.true;
    });

    it('should generate valid addresses', function () {
      expect(hdKey.address).equal('16TCjdfJrdZb7Xw7UCbpws9FaCvjn9aEA6');
      hdKey.setCompressedAddresses(false);
      expect(hdKey.address).equal('138esfSPncLrXPRhQkWZmDsFyGjiNrsFjP');
    });

    it('should throw error on private key dervivation', function () {
      expect(function () { hdKey.derivePrivate(1) }).to.throw('Cannot perform private derivation without a private key');
    });

    it('can derive new public key with public key derivation (< 0x80000000)', function () {
      var childHdKey = hdKey.derivePublic(1);
      expect(bytes.toHex(childHdKey.parent)).equal(bytes.toHex(hdKey.fpr))
    });

    it('should throw error on public key by private dervivation (> 0x80000000)', function () {
      expect(function () { hdKey.derivePublic(1 + 0x80000000) }).to.throw('Cannot perform private derivation using the public child key derivation function');
    });

    it('should serialize pubkey only', function () {
      expect(serialized).to.have.property('pub');
      expect(serialized).to.not.have.property('prv');
    });

    it('serialized hex xpubkey should conform to BIP32 spec', function () {
      expect(xPubKey.slice(0, 4)).eql(hex.toBytes('0488b21e')); // 4 byte: version bytes (mainnet: 0x0488B21E public, 0x0488ADE4 private; testnet: 0x043587CF public, 0x04358394 private)
      expect(xPubKey.slice(4, 5)).eql(hex.toBytes('00')) // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants
      expect(xPubKey.slice(5, 9)).eql(hex.toBytes('00000000'));
      expect(xPubKey.slice(9, 13)).eql(hex.toBytes('00000000')); // child index
      expect(xPubKey.slice(13, 45)).eql(hex.toBytes('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271')); //chain codes
      expect(xPubKey.slice(45, 78)).eql(hex.toBytes('03fe9764ba6f1cc2102c394cd558ef463d25f509ff936abf4ad81f84e8f4773848')) // compressed pub key
    });
  });

  describe('mainnet (xpubkey)', function () {
    var hdKey = bitcoin.HDKey('xpub661MyMwAqRbcFqSvGjzP9GyNMfkZQVfoPFwY7PknFsDiBHmtKtt89uBachDqCGrJkCorkYgwMAScotJfJJzLxtLRuoNgsZULWaTSHGt2E18');

    var serialized = hdKey.serialize();
    var xPubKey = hex.toBytes(serialized.pub.hex);

    it('should default version to mainnet', function () {
      expect(hdKey.version).eql({
        'xpubKey': 0x0488b21e,
        'xprvKey': 0x0488ade4,
        'p2sh': 5,
        'pubKey': 0
      });
    });

    it('should default to compressed keys', function () {
      expect(hdKey.ecKey.compressed).to.be.true;
    });

    it('should generate valid addresses', function () {
      expect(hdKey.address).equal('13t8adp97X5vrzmWWJfhrtxH3CbaJJGjqS');
      hdKey.setCompressedAddresses(false);
      expect(hdKey.address).equal('15zKe3238goXAupNLUSFAuQ3gusxnUyW1K');
    });

    it('should throw error on private key dervivation', function () {
      expect(function () { hdKey.derivePrivate(1) }).to.throw('Cannot perform private derivation without a private key');
    });

    it('can derive new public key with public key derivation (< 0x80000000)', function () {
      var childHdKey = hdKey.derivePublic(1);
      expect(bytes.toHex(childHdKey.parent)).equal(bytes.toHex(hdKey.fpr))
    });

    it('should throw error on public key by private dervivation (> 0x80000000)', function () {
      expect(function () { hdKey.derivePublic(1 + 0x80000000) }).to.throw('Cannot perform private derivation using the public child key derivation function');
    });

    it('should serialize pubkey only', function () {
      expect(serialized).to.have.property('pub');
      expect(serialized).to.not.have.property('prv');
    });

    it('serialized hex xpubkey should conform to BIP32 spec', function () {
      expect(xPubKey.slice(0, 4)).eql(hex.toBytes('0488b21e')); // 4 byte: version bytes (mainnet: 0x0488B21E public, 0x0488ADE4 private; testnet: 0x043587CF public, 0x04358394 private)
      expect(xPubKey.slice(4, 5)).eql(hex.toBytes('00')) // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants
      expect(xPubKey.slice(5, 9)).eql(hex.toBytes('00000000'));
      expect(xPubKey.slice(9, 13)).eql(hex.toBytes('00000000')); // child index
      expect(xPubKey.slice(13, 45)).eql(hex.toBytes('81e79e3eab011fec94262a7d8619f7dcf09c4192312d59e10518402ae0ad18ed')); //chain codes
      expect(xPubKey.slice(45, 78)).eql(hex.toBytes('03d5162875f5337e594c3f8d966719a93f95677d6311c74dfcd4b65a4c1259150e')) // compressed pub key
    });

  });
});
