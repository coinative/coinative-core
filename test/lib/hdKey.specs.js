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
      var child = hdKey.derivePublic(1);
      expect(child.parent).to.eql(hdKey.fpr);
      expect(child.child).to.equal(1);
      expect(child.depth).to.equal(hdKey.depth + 1);
      expect(child.version).to.eql(hdKey.version);
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
      var child = hdKey.derivePublic(1);
      expect(child.parent).to.eql(hdKey.fpr);
      expect(child.child).to.equal(1);
      expect(child.depth).to.equal(hdKey.depth + 1);
      expect(child.version).to.eql(hdKey.version);
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

  describe('mainnet (xprvkey)', function () {
    var hdKey = bitcoin.HDKey('xprv9x6CNcVVo6MbqTgRwxV782YKjykcdgKvFCXiarNeuz9A9djwf8RmVKbm1UZEao55zWUFdZjUxLnEBYSYzPfRXg3aFeuSmkAmR4g799tr7XP');

    var serialized = hdKey.serialize();
    var xPubKey = hex.toBytes(serialized.pub.hex);
    var xPrvKey = hex.toBytes(serialized.prv.hex);

    it('version should be set to mainnet', function () {
      expect(hdKey.version).eql({
        'xpubKey': 0x0488b21e,
        'xprvKey': 0x0488ade4,
        'p2sh': 5,
        'pubKey': 0
      });
    });

    it('should generate correct xpubkey', function () {
      expect(serialized.pub.b58).to.equal('xpub6B5Yn82PdTuu3wku3z27VAV4J1b7393mcRTKPEnGUKg92S56Cfk237vErincMLgL3X1agVnbfiUPgMNicAvNXvvBorVf8oKi5i8DEq46PSU');
    });

    it('should default to compressed keys', function () {
      expect(hdKey.ecKey.compressed).to.be.true;
    });

    it('should generate valid addresses', function () {
      expect(hdKey.address).equal('13NT9tp2AvtXY3Mp8gcxSUNcPC6AnDPB69');
      hdKey.setCompressedAddresses(false);
      expect(hdKey.address).equal('1BZQUWSXLYgwr2VgEqweg5z9bL2JnKgoQo');
    });

    it('should generate child at position 1', function () {
      expect(hdKey.child).to.equal(1);
    });

    it('can derive new private key with private derivation', function () {
      var child = hdKey.derivePrivate(1);
      expect(child.parent).to.eql(hdKey.fpr);
      expect(child.child).to.equal(1);
      expect(child.depth).to.equal(hdKey.depth + 1);
      expect(child.version).to.eql(hdKey.version);
    });

    it('can derive new private key with hardened private key derivation (> 0x80000000)', function () {
      var child = hdKey.derivePrivate(1 + 0x80000000);
      expect(child.parent).to.eql(hdKey.fpr);
      expect(child.child).to.equal(2147483649);
      expect(child.depth).to.equal(hdKey.depth + 1);
      expect(child.version).to.eql(hdKey.version);
    });

    it('can derive new public key with public key derivation (< 0x80000000)', function () {
      var child = hdKey.derivePublic(1);
      expect(child.parent).to.eql(hdKey.fpr);
      expect(child.child).to.equal(1);
      expect(child.depth).to.equal(hdKey.depth + 1);
      expect(child.version).to.eql(hdKey.version);
    });

    it('should throw error on public key by private dervivation (> 0x80000000)', function () {
      expect(function () { hdKey.derivePublic(1 + 0x80000000) }).to.throw('Cannot perform private derivation using the public child key derivation function');
    });

    it('should serialize pub and prv keys', function () {
      expect(serialized).to.have.property('pub');
      expect(serialized).to.have.have.property('prv');
    });

    it('serialized xpubkey should conform to BIP32 spec', function () {
      expect(xPubKey.slice(0, 4)).eql(hex.toBytes('0488B21E')); // 4 byte: version bytes (mainnet: 0x0488B21E public, 0x0488ADE4 private; testnet: 0x043587CF public, 0x04358394 private)
      expect(xPubKey.slice(4, 5)).eql(hex.toBytes('02')) // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants
      expect(xPubKey.slice(5, 9)).eql(hex.toBytes('b2134185'));
      expect(xPubKey.slice(9, 13)).eql(hex.toBytes('00000001')); // child index
      expect(xPubKey.slice(13, 45)).eql(hex.toBytes('bef58a946d16c8c175041bde4006b73434b3524f6317935506f944b379e874de')); //chain codes
      expect(xPubKey.slice(45, 78)).eql(hex.toBytes('02157ff2eb722cb80f3d4836a6d47623727a396bc8afcaf854072bab7862db052f')) // compressed pub key
    });

    it('serialized xprvkey should conform to BIP32 spec', function () {
      expect(xPrvKey.slice(0, 4)).eql(hex.toBytes('0488ADE4')); // 4 byte: version bytes (mainnet: 0x0488B21E public, 0x0488ADE4 private; testnet: 0x043587CF public, 0x04358394 private)
      expect(xPrvKey.slice(4, 5)).eql(hex.toBytes('02')) // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants
      expect(xPrvKey.slice(5, 9)).eql(hex.toBytes('b2134185'));
      expect(xPrvKey.slice(9, 13)).eql(hex.toBytes('00000001')); // child index
      expect(xPrvKey.slice(13, 45)).eql(hex.toBytes('bef58a946d16c8c175041bde4006b73434b3524f6317935506f944b379e874de')); //chain codes
      expect(xPrvKey.slice(45, 78)).eql(hex.toBytes('007ed609b5aa631927227a1bd5b7e870d4d9ac158a35c286031b7bdb507e2a42a0')) // compressed pub key
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
      var child = hdKey.derivePublic(1);
      expect(child.parent).to.eql(hdKey.fpr);
      expect(child.child).to.equal(1);
      expect(child.depth).to.equal(hdKey.depth + 1);
      expect(child.version).to.eql(hdKey.version);
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
      var child = hdKey.derivePublic(1);
      expect(child.parent).to.eql(hdKey.fpr);
      expect(child.child).to.equal(1);
      expect(child.depth).to.equal(hdKey.depth + 1);
      expect(child.version).to.eql(hdKey.version);
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

  describe('testnet (tprvkey)', function () {
    var hdKey = bitcoin.HDKey('tprv8diKvhCKB3daUuYVf7rFg9efLQKz66E2Qc1prDcmWX14aLPWTJZspYdikNcpe9xRzLbR21BmDsAb8aDsjK7SG7wvLC7uEupNUnchSzuuQQf');

    var serialized = hdKey.serialize();
    var xPubKey = hex.toBytes(serialized.pub.hex);
    var xPrvKey = hex.toBytes(serialized.prv.hex);

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
      expect(hdKey.address).equal('muuo1M9dzVXxpd4YV3deSyTwmKY3dhCWLY');
      hdKey.setCompressedAddresses(false);
      expect(hdKey.address).equal('miM4ysBjXsZpTzpJVUW3Yc3TjtzxREb3as');
    });

    it('should generate child at position 1', function () {
      expect(hdKey.child).to.equal(1);
    });

    it('can derive new private key with private derivation', function () {
      var child = hdKey.derivePrivate(1);
      expect(child.parent).to.eql(hdKey.fpr);
      expect(child.child).to.equal(1);
      expect(child.depth).to.equal(hdKey.depth + 1);
      expect(child.version).to.eql(hdKey.version);
    });

    it('can derive new private key with hardened private key derivation (> 0x80000000)', function () {
      var child = hdKey.derivePrivate(1 + 0x80000000);

      expect(child.parent).to.eql(hdKey.fpr);
      expect(child.child).to.equal(2147483649);
      expect(child.depth).to.equal(hdKey.depth + 1);
      expect(child.version).to.eql(hdKey.version);
    });

    it('can derive new public key with public key derivation (< 0x80000000)', function () {
      var child = hdKey.derivePublic(1);
      expect(child.parent).to.eql(hdKey.fpr);
      expect(child.child).to.equal(1);
      expect(child.depth).to.equal(hdKey.depth + 1);
      expect(child.version).to.eql(hdKey.version);
    });

    it('should throw error on public key by private dervivation (> 0x80000000)', function () {
      expect(function () { hdKey.derivePublic(1 + 0x80000000) }).to.throw('Cannot perform private derivation using the public child key derivation function');
    });

    it('should serialize pub and prv keys', function () {
      expect(serialized).to.have.property('pub');
      expect(serialized).to.have.have.property('prv');
    });

    it('serialized xpubkey should conform to BIP32 spec', function () {
      expect(xPubKey.slice(0, 4)).eql(hex.toBytes('043587cf')); // 4 byte: version bytes (mainnet: 0x0488B21E public, 0x0488ADE4 private; testnet: 0x043587CF public, 0x04358394 private)
      expect(xPubKey.slice(4, 5)).eql(hex.toBytes('02')) // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants
      expect(xPubKey.slice(5, 9)).eql(hex.toBytes('236c336e'));
      expect(xPubKey.slice(9, 13)).eql(hex.toBytes('00000001')); // child index
      expect(xPubKey.slice(13, 45)).eql(hex.toBytes('bb151535c5a19d8de99a34ffbf9acde8fc47039d1f2d4b3a7de07a7f10c2e7c6')); //chain codes
      expect(xPubKey.slice(45, 78)).eql(hex.toBytes('0270f8766030de843ff194e3e20a42ba7a52840a15f1d4dd3d21acc48af278be53')) // compressed pub key
    });

    it('serialized xprvkey should conform to BIP32 spec', function () {
      expect(xPrvKey.slice(0, 4)).eql(hex.toBytes('04358394')); // 4 byte: version bytes (mainnet: 0x0488B21E public, 0x0488ADE4 private; testnet: 0x043587CF public, 0x04358394 private)
      expect(xPrvKey.slice(4, 5)).eql(hex.toBytes('02')) // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants
      expect(xPrvKey.slice(5, 9)).eql(hex.toBytes('236c336e'));
      expect(xPrvKey.slice(9, 13)).eql(hex.toBytes('00000001')); // child index
      expect(xPrvKey.slice(13, 45)).eql(hex.toBytes('bb151535c5a19d8de99a34ffbf9acde8fc47039d1f2d4b3a7de07a7f10c2e7c6')); //chain codes
      expect(xPrvKey.slice(45, 78)).eql(hex.toBytes('00678cf93753a5ecd3ad5108cc0e1737d0af4f0662186b2e57b2adc185eaa92a17')) // compressed pub key
    });

  });

});
