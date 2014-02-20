'use strict';
// https://www.cosic.esat.kuleuven.be/nessie/testvectors/hash/sha/Sha-2-256.unverified.test-vectors
describe('SHA-256 Test Vectors (NESSIE Set 1)', function () {
  it('vector# 0', function () {
    expect(bits.toHex(sjcl.hash.sha256.hash(''))).to.equal('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('vector# 1', function () {
    expect(bits.toHex(sjcl.hash.sha256.hash('a'))).to.equal('ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb');
  });

  it('vector# 2', function () {
    expect(bits.toHex(sjcl.hash.sha256.hash('abc'))).to.equal('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('vector# 3', function () {
    expect(bits.toHex(sjcl.hash.sha256.hash('message digest'))).to.equal('f7846f55cf23e14eebeab5b4e1550cad5b509e3348fbc4efa3a1413d393cb650');
  });

  it('vector# 4', function () {
    expect(bits.toHex(sjcl.hash.sha256.hash('abcdefghijklmnopqrstuvwxyz'))).to.equal('71c480df93d6ae2f1efad1447c66c9525e316218cf51fc8d9ed832f2daf18b73');
  });

  it('vector# 5', function () {
    expect(bits.toHex(sjcl.hash.sha256.hash('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'))).to.equal('248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
  });

  it('vector# 6', function () {
    expect(bits.toHex(sjcl.hash.sha256.hash('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'))).to.equal('db4bfcbd4da0cd85a60c3c37d3fbd8805c77f15fc6b1fdfe614ee0a7c8fdb4c0');
  });

  it('vector# 7', function () {
    expect(bits.toHex(sjcl.hash.sha256.hash((new Array(9)).join('1234567890')))).to.equal('f371bc4a311f2b009eef952dd83ca80e2b60026c8e935592d0f9c308453c813e');
  });

  it('vector# 8', function () {
    expect(bits.toHex(sjcl.hash.sha256.hash((new Array(1000001)).join('a')))).to.equal('cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0');
  });
});
