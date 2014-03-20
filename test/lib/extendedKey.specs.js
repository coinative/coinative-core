'use strict';
// https://tools.ietf.org/html/rfc5869
describe('ExtendedKey', function () {
  describe('no argument', function () {
    it('should throw error', function () {
      expect(function () { new bitcoin.ExtendedKey() }).to.throw();
    });
  });

  describe('invalid xPubKey', function () {
    it ('should throw checksum error', function () {
      expect(function () { new bitcoin.ExtendedKey('xpub661MyMwAqRbcG25ncmAKgMUzYmeTHhfqjoS4aFRm4rNxBUA7Nt79pjRFuTzRn3xUnSJ6zM4VDkxt2mZd1ksEPy4n3ik1CVWpZwAt9xA1bdY') }).to.throw();
    });
  });

   describe('invalid xPrvKey', function () {
    it ('should throw checksum error', function () {
      expect(function () { new bitcoin.ExtendedKey('xprv661MyMwAqRbcG25ncmAKgMUzYmeTHhfqjoS4aFRm4rNxBUA7Nt79pjRFuTzRn3xUnSJ6zM4VDkxt2mZd1ksEPy4n3ik1CVWpZwAt9xA1bdY') }).to.throw();
    });
  });

  describe('valid xPubKey', function () {
    it ('check is valid', function () {
      expect(bitcoin.ExtendedKey.isValid('xpub661MyMwAqRbcEpTi9tVh9oQzztHs696NnszzcHt5r1bz7f6NfrTduncsHcp1YYX427mxSbCXFpAB3BewA6LEvB1ngSLSQjwL8JDiSKTWokQ')).to.be.true;
    });

    it ('should not error', function () {
      var extendedKey = new bitcoin.ExtendedKey('xpub661MyMwAqRbcEpTi9tVh9oQzztHs696NnszzcHt5r1bz7f6NfrTduncsHcp1YYX427mxSbCXFpAB3BewA6LEvB1ngSLSQjwL8JDiSKTWokQ');
      expect(bits.toHex(extendedKey.key)).equal('0488b21e0000000000000000001bc1475dd8509cc418b90b7963439db3250865771c72eee7471ce1100abd40d60252b38445a2f265716267cc05e1fd9f595d47f42c614c9a9d54cdada70e2bf6cc')
    })

  })

});
