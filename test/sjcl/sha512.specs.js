'use strict';

// https://www.cosic.esat.kuleuven.be/nessie/testvectors/hash/sha/Sha-2-512.unverified.test-vectors
describe('SHA-512 Test Vectors (NESSIE Set 1)', function () {
  it('vector# 0', function () {
    expect(bits.toHex(sjcl.hash.sha512.hash(''))).to.equal('cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e');
  });

  it('vector# 1', function () {
    expect(bits.toHex(sjcl.hash.sha512.hash('a'))).to.equal('1f40fc92da241694750979ee6cf582f2d5d7d28e18335de05abc54d0560e0f5302860c652bf08d560252aa5e74210546f369fbbbce8c12cfc7957b2652fe9a75');
  });

  it('vector# 2', function () {
    expect(bits.toHex(sjcl.hash.sha512.hash('abc'))).to.equal('ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f');
  });

  it('vector# 3', function () {
    expect(bits.toHex(sjcl.hash.sha512.hash('message digest'))).to.equal('107dbf389d9e9f71a3a95f6c055b9251bc5268c2be16d6c13492ea45b0199f3309e16455ab1e96118e8a905d5597b72038ddb372a89826046de66687bb420e7c');
  });

  it('vector# 4', function () {
    expect(bits.toHex(sjcl.hash.sha512.hash('abcdefghijklmnopqrstuvwxyz'))).to.equal('4dbff86cc2ca1bae1e16468a05cb9881c97f1753bce3619034898faa1aabe429955a1bf8ec483d7421fe3c1646613a59ed5441fb0f321389f77f48a879c7b1f1');
  });

  it('vector# 5', function () {
    expect(bits.toHex(sjcl.hash.sha512.hash('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'))).to.equal('204a8fc6dda82f0a0ced7beb8e08a41657c16ef468b228a8279be331a703c33596fd15c13b1b07f9aa1d3bea57789ca031ad85c7a71dd70354ec631238ca3445');
  });

  it('vector# 6', function () {
    expect(bits.toHex(sjcl.hash.sha512.hash('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'))).to.equal('1e07be23c26a86ea37ea810c8ec7809352515a970e9253c26f536cfc7a9996c45c8370583e0a78fa4a90041d71a4ceab7423f19c71b9d5a3e01249f0bebd5894');
  });

  it('vector# 7', function () {
    expect(bits.toHex(sjcl.hash.sha512.hash((new Array(9)).join('1234567890')))).to.equal('72ec1ef1124a45b047e8b7c75a932195135bb61de24ec0d1914042246e0aec3a2354e093d76f3048b456764346900cb130d2a4fd5dd16abb5e30bcb850dee843');
  });

  it('vector# 8', function () {
    expect(bits.toHex(sjcl.hash.sha512.hash((new Array(1000001)).join('a')))).to.equal('e718483d0ce769644e2e42c7bc15b4638e1f98b13b2044285632a803afa973ebde0ff244877ea60a4cb0432ce577c31beb009c5c2c49aa2e4eadb217ad8cc09b');
  });
});
