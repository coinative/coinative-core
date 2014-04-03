'use strict';

var vectors = require('./hkdf.vectors.js');

// https://tools.ietf.org/html/rfc5869
describe('sjcl.misc.hkdf', function () {
  describe('sha256', function () {
    vectors.sha256.forEach(function (vector, i) {
      it('vector ' + i, function () {
        var ikm = hex.toBits(vector.ikm);
        var salt = hex.toBits(vector.salt);
        var info = hex.toBits(vector.info);
        var prk = sjcl.misc.hkdf.extract(salt, ikm);
        expect(hex.fromBits(prk)).to.equal(vector.prk);
        var okm = sjcl.misc.hkdf.expand(prk, info, vector.okm.length * 4);
        expect(hex.fromBits(okm)).to.equal(vector.okm);
      });
    });
  });

  // Not currently working as sjcl Hash functions don't have an output size
  // describe('sha1', function () {
  //   vectors.sha1.forEach(function (vector, i) {
  //     it('vector ' + i, function () {
  //       var ikm = hex.toBits(vector.ikm);
  //       var salt = hex.toBits(vector.salt);
  //       var info = hex.toBits(vector.info);
  //       var prk = sjcl.misc.hkdf.extract(salt, ikm, sjcl.hash.sha1);
  //       expect(hex.fromBits(prk)).to.equal(vector.prk);
  //       var okm = sjcl.misc.hkdf.expand(prk, info, vector.okm.length * 4);
  //       expect(hex.fromBits(okm)).to.equal(vector.okm);
  //     });
  //   });
  // });
});
