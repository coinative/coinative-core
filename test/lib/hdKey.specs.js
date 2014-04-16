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

  describe('testnet (chain+pub)', function () {
    var hdKey = new bitcoin.HDKey({
      chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
      pub: hex.toBits('048819FA4D69BCEB1BCBF0EC9E605FED325D63472EF703E31290B9B278DA3FC88C994DB69A4B2EEB1EE93664462B2EAD0709A8D3BF46DA9C7081A17B8EF7468882'),
      version: bitcoin.config.versions.bitcoin.testnet
    });

    var serialized = hdKey.serialize();
    var xPubKey = hex.toBytes(serialized.pub.hex);

    it('version should be set to testnet', function () {
      expect(hdKey.version).eql({
        'xpubKey': 0x043587cf,
        'xprvKey': 0x04358394,
        'p2sh': 196,
        'pubKey': 111
      });
    });

    it('should default to compressed keys', function () {
      expect(hdKey.ecKey.compressed).to.be.true;
    });

    it('should generate valid addresses', function () {
      expect(hdKey.address).equal('mjYBku4aaSgzG3FXZb9MmDRTDSuCXM3auM');
      hdKey.setCompressedAddresses(false);
      expect(hdKey.address).equal('n1JcCLKDobgC86SNePt7QqnzydApRbUeg4');
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
      expect(xPubKey.slice(0, 4)).eql(hex.toBytes('043587cf')); // 4 byte: version bytes (mainnet: 0x0488B21E public, 0x0488ADE4 private; testnet: 0x043587CF public, 0x04358394 private)
      expect(xPubKey.slice(4, 5)).eql(hex.toBytes('00')) // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants
      expect(xPubKey.slice(5, 9)).eql(hex.toBytes('00000000'));
      expect(xPubKey.slice(9, 13)).eql(hex.toBytes('00000000')); // child index
      expect(xPubKey.slice(13, 45)).eql(hex.toBytes('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271')); //chain codes
      expect(xPubKey.slice(45, 78)).eql(hex.toBytes('028819fa4d69bceb1bcbf0ec9e605fed325d63472ef703e31290b9b278da3fc88c')) // compressed pub key
    });
  });

  describe('testnet (tpubkey)', function () {
    var hdKey = bitcoin.HDKey('tpubD6NzVbkrYhZ4XpGe4x9QtGpMstk7H6AuHS2MvoUuQm8qvkppT6xEyB669TJRiMq1hTiFCmVqtosYdvYRWjaL9H2aeYMMi6hvEShHjBATKa8');

    var serialized = hdKey.serialize();
    var xPubKey = hex.toBytes(serialized.pub.hex);

    it('version should be set to testnet', function () {
      expect(hdKey.version).eql({
        'xpubKey': 0x043587cf,
        'xprvKey': 0x04358394,
        'p2sh': 196,
        'pubKey': 111
      });
    });

    it('should default to compressed keys', function () {
      expect(hdKey.ecKey.compressed).to.be.true;
    });

    it('should generate valid addresses', function () {
      expect(hdKey.address).equal('mypmLG7CkR589AvDw7C5zi4UjWDyGdVm8Q');
      hdKey.setCompressedAddresses(false);
      expect(hdKey.address).equal('mhiNbdGpRe6RxF48oJJHtwAExseMFpfPiU');
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
      expect(xPubKey.slice(0, 4)).eql(hex.toBytes('043587cf')); // 4 byte: version bytes (mainnet: 0x0488B21E public, 0x0488ADE4 private; testnet: 0x043587CF public, 0x04358394 private)
      expect(xPubKey.slice(4, 5)).eql(hex.toBytes('00')) // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants
      expect(xPubKey.slice(5, 9)).eql(hex.toBytes('00000000'));
      expect(xPubKey.slice(9, 13)).eql(hex.toBytes('00000000')); // child index
      expect(xPubKey.slice(13, 45)).eql(hex.toBytes('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271')); //chain codes
      expect(xPubKey.slice(45, 78)).eql(hex.toBytes('029181CD57EA5F3F9B8F9F7D899845DC32846D0919FAFFF8242021C658787C4D73')) // compressed pub key
    });

  });

});
