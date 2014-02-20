'use strict';
// https://tools.ietf.org/html/rfc5869
describe('Address', function () {
  
  it('should throw when address is empty', function () {
    expect(function () { new bitcoin.Address('') }).to.throw('Checksum validation failed!');
  });

  it('should throw when address is has invalid checksum', function () {
    expect(function () { new bitcoin.Address('1AGNa15ZQXAZUgFiqJ2i7Z2DPU2J6hW62j') }).to.throw('Checksum validation failed!');
  });

  it('should throw when address is invalid base58 string', function () {
    expect(function () { new bitcoin.Address('1AGNa15ZQXAZUgFiqJ2i7Z2DPU2J6hW62!') }).to.throw('invalid base58 string: 1AGNa15ZQXAZUgFiqJ2i7Z2DPU2J6hW62!');
  });

  describe('Prod bitcoin address', function () {
    var address = new bitcoin.Address('14AEM78shds6aVAc2D1ewNvuvTiSazzR2r');

    it('should default to prod version', function () {
      expect(address.isP2SH()).to.be.false;
      expect(address.version).equal(bitcoin.Address.versions.bitcoin.production.pubKey);
    });

    it('should generate prod bitcoin address', function () {
      expect(address.toString()).equal('14AEM78shds6aVAc2D1ewNvuvTiSazzR2r');
    });
  });

  describe('Prod p2sh bitcoin address', function () {
    var address = new bitcoin.Address('3Faj1Lk5dmEhjiVw2RRT5w8iRrAUiwY2z3');

    it('should default to prod p2sh version', function () {
      expect(address.isP2SH()).to.be.true;
      expect(address.version).equal(bitcoin.Address.versions.bitcoin.production.p2sh);
    });

    it('should generate prod p2sh bitcoin address', function () {
      expect(address.toString()).equal('3Faj1Lk5dmEhjiVw2RRT5w8iRrAUiwY2z3');
    });
  });

  describe('Prod pub key hash | No version specified', function () {
    var address = new bitcoin.Address(hex.toBytes('3442193e1bb70916e914552172cd4e2dbc9df811'));

    it('should default to prod version', function () {
      expect(address.isP2SH()).to.be.false;
      expect(address.version).equal(bitcoin.Address.versions.bitcoin.production.pubKey);
    });

    it('should generate prod bitcoin address', function () {
      expect(address.toString()).equal('15mKKb2eos1hWa6tisdPwwDC1a5J1y9nma');
    });
  });

  describe('Prod pub key hash | p2shVersion', function () {
    var address = new bitcoin.Address(hex.toBytes('3442193e1bb70916e914552172cd4e2dbc9df811'), bitcoin.Address.versions.bitcoin.production.p2sh);

    it('should default to prod version', function () {
      expect(address.isP2SH()).to.be.true;
      expect(address.version).equal(bitcoin.Address.versions.bitcoin.production.p2sh);
    });

    it('should generate prod bitcoin address', function () {
      expect(address.toString()).equal('36TLF8X6MmL5bjoKqyHzNZa8A6N1dbNoZM');
    });
  });

  describe('Testnet bitcoin address', function () {
    var address = new bitcoin.Address('mntxtHc2WLnUvZHUh5ZZbyTxLwCpvgoTwL');

    it('should default to testnet version', function () {
      expect(address.isP2SH()).to.be.false;
      expect(address.version).equal(bitcoin.Address.versions.bitcoin.testnet.pubKey);
    });

    it('should generate testnet bitcoin address', function () {
      expect(address.toString()).equal('mntxtHc2WLnUvZHUh5ZZbyTxLwCpvgoTwL');
    });
  });

  describe('Testnet p2sh bitcoin address', function () {
    var address = new bitcoin.Address('2N78w55g7FDk3wW8UhZ3Kht7yeCNeXMxh4z');

    it('should default to testnet version', function () {
      expect(address.isP2SH()).to.be.true;
      expect(address.version).equal(bitcoin.Address.versions.bitcoin.testnet.p2sh);
    });

    it('should generate testnet bitcoin address', function () {
      expect(address.toString()).equal('2N78w55g7FDk3wW8UhZ3Kht7yeCNeXMxh4z');
    });
  });

  describe('Prod pub key hash | p2shVersion', function () {
    var address = new bitcoin.Address(hex.toBytes('3442193e1bb70916e914552172cd4e2dbc9df811'), bitcoin.Address.versions.bitcoin.production.p2sh);

    it('should default to prod version', function () {
      expect(address.isP2SH()).to.be.true;
      expect(address.version).equal(bitcoin.Address.versions.bitcoin.production.p2sh);
    });

    it('should generate prod bitcoin address', function () {
      expect(address.toString()).equal('36TLF8X6MmL5bjoKqyHzNZa8A6N1dbNoZM');
    });
  });

  describe('regression tests', function () {

  });

});
