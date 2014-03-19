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

});
