'use strict';

describe('Address', function () {
  it('should throw when address is empty', function () {
    expect(function () { new bitcoin.Address('') }).to.throw('invalid length');
  });

  it('should throw when address has invalid checksum', function () {
    expect(function () { new bitcoin.Address('1AGNa15ZQXAZUgFiqJ2i7Z2DPU2J6hW62j') }).to.throw('invalid checksum');
  });

  it('should throw when address is invalid base58 string', function () {
    expect(function () { new bitcoin.Address('1AGNa15ZQXAZUgFiqJ2i7Z2DPU2J6hW62!') }).to.throw('invalid base58 string: 1AGNa15ZQXAZUgFiqJ2i7Z2DPU2J6hW62!');
  });

  describe('livenet', function () {
    it('pay-to-pubkey, from string', function () {
      var address = new bitcoin.Address('14AEM78shds6aVAc2D1ewNvuvTiSazzR2r');

      expect(address.isP2SH()).to.be.false;
      expect(address.version).equal(bitcoin.Address.versions.livenet.pubKey);
      expect(address.toString()).equal('14AEM78shds6aVAc2D1ewNvuvTiSazzR2r');
    });

    it('pay-to-script-hash, from string', function () {
      var address = new bitcoin.Address('3Faj1Lk5dmEhjiVw2RRT5w8iRrAUiwY2z3');

      expect(address.isP2SH()).to.be.true;
      expect(address.version).equal(bitcoin.Address.versions.livenet.p2sh);
      expect(address.toString()).equal('3Faj1Lk5dmEhjiVw2RRT5w8iRrAUiwY2z3');
    });

    it('pay-to-pubkey, from hash', function () {
      var address = new bitcoin.Address(hex.toBits('3442193e1bb70916e914552172cd4e2dbc9df811'));

      expect(address.isP2SH()).to.be.false;
      expect(address.version).equal(bitcoin.Address.versions.livenet.pubKey);
      expect(address.toString()).equal('15mKKb2eos1hWa6tisdPwwDC1a5J1y9nma');
    });

    it('pay-to-script-hash, from hash+version', function () {
      var address = new bitcoin.Address(hex.toBits('3442193e1bb70916e914552172cd4e2dbc9df811'), bitcoin.Address.versions.livenet.p2sh);

      expect(address.isP2SH()).to.be.true;
      expect(address.version).equal(bitcoin.Address.versions.livenet.p2sh);
      expect(address.toString()).equal('36TLF8X6MmL5bjoKqyHzNZa8A6N1dbNoZM');
    });
  });

  describe('testnet', function () {
    it('pay-to-pubkey, from string', function () {
      var address = new bitcoin.Address('mntxtHc2WLnUvZHUh5ZZbyTxLwCpvgoTwL');

      expect(address.isP2SH()).to.be.false;
      expect(address.version).equal(bitcoin.Address.versions.testnet.pubKey);
      expect(address.toString()).equal('mntxtHc2WLnUvZHUh5ZZbyTxLwCpvgoTwL');
    });

    it('pay-to-script-hash, from string', function () {
      var address = new bitcoin.Address('2N78w55g7FDk3wW8UhZ3Kht7yeCNeXMxh4z');

      expect(address.isP2SH()).to.be.true;
      expect(address.version).equal(bitcoin.Address.versions.testnet.p2sh);
      expect(address.toString()).equal('2N78w55g7FDk3wW8UhZ3Kht7yeCNeXMxh4z');
    });
  });
});
