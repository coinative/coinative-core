'use strict';
// http://homes.esat.kuleuven.be/~bosselae/sjcl.hash.ripemd160.hash.html
describe('RIPEMD-160 Test Vectors', function () {
  it('vector# 0', function () {
    expect(bits.toHex(sjcl.hash.ripemd160.hash(''))).to.equal('9c1185a5c5e9fc54612808977ee8f548b2258d31');
  });

  it('vector# 1', function () {
    expect(bits.toHex(sjcl.hash.ripemd160.hash('a'))).to.equal('0bdc9d2d256b3ee9daae347be6f4dc835a467ffe');
  });

  it('vector# 2', function () {
    expect(bits.toHex(sjcl.hash.ripemd160.hash('abc'))).to.equal('8eb208f7e05d987a9b044a8e98c6b087f15a0bfc');
  });

  it('vector# 3', function () {
    expect(bits.toHex(sjcl.hash.ripemd160.hash('message digest'))).to.equal('5d0689ef49d2fae572b881b123a85ffa21595f36');
  });

  it('vector# 4', function () {
    expect(bits.toHex(sjcl.hash.ripemd160.hash('abcdefghijklmnopqrstuvwxyz'))).to.equal('f71c27109c692c1b56bbdceb5b9d2865b3708dbc');
  });

  it('vector# 5', function () {
    expect(bits.toHex(sjcl.hash.ripemd160.hash('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'))).to.equal('12a053384a9c0c88e405a06c27dcf49ada62eb2b');
  });

  it('vector# 6', function () {
    expect(bits.toHex(sjcl.hash.ripemd160.hash('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'))).to.equal('b0e20b6e3116640286ed3a87a5713079b21f5189');
  });

  it('vector# 7', function () {
    expect(bits.toHex(sjcl.hash.ripemd160.hash((new Array(9)).join('1234567890')))).to.equal('9b752e45573d4b39f4dbd3323cab82bf63326bfb');
  });

  it('vector# 8', function () {
    expect(bits.toHex(sjcl.hash.ripemd160.hash((new Array(1000001)).join('a')))).to.equal('52783243c1697bdbe16d37f97f68f08325dc1528');
  });
});
