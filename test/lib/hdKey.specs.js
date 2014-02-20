'use strict';
// https://tools.ietf.org/html/rfc5869
describe('HDKey', function () {
  describe('no opts argument (no opts)', function () {
    it('should throw error', function () {
      expect(function () { new bitcoin.HDKey() }).to.throw();
    });
  });

  describe('no prv or pub key', function () {
    it('should throw error no keys defined', function () {
      expect(function () { new bitcoin.HDKey({}) }).to.throw('no keys defined');
    });
  });

  describe('chain code != 256 bits', function () {
    it('should throw error when chain code is not 256 bits', function () {
      expect(function () { new bitcoin.HDKey({ chain: []}) }).to.throw('invalid chain code');
    });
  });

  describe('invalid public key', function () {
    it ('should throw not on the curve', function () {
      expect(function () { new bitcoin.HDKey({ 
        chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'), 
        pub: hex.toBits('') })
      }).to.throw('not on the curve!');
    })
  });

  describe('mainnet (valid pub key)', function () {
    var hdKey = new bitcoin.HDKey({ 
      chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'), 
      pub: hex.toBits('04FE9764BA6F1CC2102C394CD558EF463D25F509FF936ABF4AD81F84E8F4773848755B64F5C32E6AA5E461E241133475250182E29C1D3C89D7B5478A4569A389DB')
    });
    var serialized = hdKey.serialize();
    var xPubKey = hex.toBytes(serialized.pub.hex);

    it('should default version to mainnet', function () {
      expect(hdKey.version).eql({
        'xpubKey': '0x0488B21E',
        'xprvKey': '0x0488ADE4',
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
      expect(xPubKey.slice(0, 4)).eql(hex.toBytes('0x0488B21E')); // 4 byte: version bytes (mainnet: 0x0488B21E public, 0x0488ADE4 private; testnet: 0x043587CF public, 0x04358394 private)
      expect(xPubKey.slice(4, 5)).eql(hex.toBytes('0x00')) // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants
      expect(xPubKey.slice(5, 9)).eql(hex.toBytes('0x00000000'));
      expect(xPubKey.slice(9, 13)).eql(hex.toBytes('0x00000000')); // child index
      expect(xPubKey.slice(13, 45)).eql(hex.toBytes('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271')); //chain codes
      expect(xPubKey.slice(45, 78)).eql(hex.toBytes('03FE9764BA6F1CC2102C394CD558EF463D25F509FF936ABF4AD81F84E8F4773848')) // compressed pub key
    });
  });

  describe('deserializeKey', function () {
    it('should throw error on invalid key size', function () {
      expect(function () { bitcoin.HDKey.deserializeKey(hex.toBits('')) }).to.throw('Not enough data');
    });

    it('should throw error on unknown version', function () {
      expect(function () { bitcoin.HDKey.deserializeKey(hex.toBits('0499b21e0000000000000000009452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed27103fe9764ba6f1cc2102c394cd558ef463d25f509ff936abf4ad81f84e8f4773848')) }).to.throw('No version found. Invalid Key');
    });

    describe('mainnet xpubkey', function () {
      var hdKey = bitcoin.HDKey.deserializeKey(hex.toBits('0488b21e0000000000000000009452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed27103fe9764ba6f1cc2102c394cd558ef463d25f509ff936abf4ad81f84e8f4773848'));

      var serialized = hdKey.serialize();
      var xPubKey = hex.toBytes(serialized.pub.hex);

      it('should default version to mainnet', function () {
        expect(hdKey.version).eql({
          'xpubKey': '0x0488B21E',
          'xprvKey': '0x0488ADE4',
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
        expect(xPubKey.slice(0, 4)).eql(hex.toBytes('0x0488B21E')); // 4 byte: version bytes (mainnet: 0x0488B21E public, 0x0488ADE4 private; testnet: 0x043587CF public, 0x04358394 private)
        expect(xPubKey.slice(4, 5)).eql(hex.toBytes('0x00')) // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants
        expect(xPubKey.slice(5, 9)).eql(hex.toBytes('0x00000000'));
        expect(xPubKey.slice(9, 13)).eql(hex.toBytes('0x00000000')); // child index
        expect(xPubKey.slice(13, 45)).eql(hex.toBytes('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271')); //chain codes
        expect(xPubKey.slice(45, 78)).eql(hex.toBytes('03FE9764BA6F1CC2102C394CD558EF463D25F509FF936ABF4AD81F84E8F4773848')) // compressed pub key
        
      });
    });
  });

  describe('new HDKey | mainnet (prv key)', function () {
    bitcoin.HDKey.deserializeKey(hex.toBits('0488b21e03d8ab493700000001f366f48f1ea9f2d1d3fe958c95ca84ea18e4c4ddb9366c336c927eb246fb38cb03a7d1d856deb74c508e05031f9895dab54626251b3806e16b4bd12e781a7df5b9'))

    // var hdKey = new bitcoin.HDKey({ 
    //   chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'), 
    //   prv: hex.toBits('0A2B93F2918025B0E5BC47A2265A69AE9570E96EFE88FE9C4F4D173E486E47F6') });

    // it('should default to mainnet version', function () {
    //   expect(hdKey.version).eql({
    //     'private': '0x0488ADE4',
    //     'public': '0x0488B21E'
    //   });
    // });

    // it('should default to uncompressed keys', function () {
    //   expect(hdKey.ecKey.compressed).to.be.true;
    // });

    // it('should generate valid public key', function () {
    //   expect(hdKey.address).equal('16TCjdfJrdZb7Xw7UCbpws9FaCvjn9aEA6');
    //   hdKey.setCompressedAddresses(false);
    //   expect(hdKey.address).equal('138esfSPncLrXPRhQkWZmDsFyGjiNrsFjP');
    // });


  });





  it ('Deserialize xpubkey', function () {
    //var hdKey = bitcoin.HDKey.deserializeKey(hex.toBits('0488b21e03d8ab493700000001f366f48f1ea9f2d1d3fe958c95ca84ea18e4c4ddb9366c336c927eb246fb38cb03a7d1d856deb74c508e05031f9895dab54626251b3806e16b4bd12e781a7df5b9'));
    //console.log('check', hdKey)
    // expect(hdKey.)


  });

});
