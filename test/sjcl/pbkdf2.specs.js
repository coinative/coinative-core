'use strict'

describe('sjcl.misc.pbkdf2 Test Vectors', function () {
  // http://tools.ietf.org/html/draft-josefsson-scrypt-kdf-00#page-10
  it('Set 1', function () {
    expect(bits.toHex(sjcl.misc.pbkdf2('passwd', 'salt', 1, 64*8))).to.equal('55ac046e56e3089fec1691c22544b605f94185216dde0465e68b9d57c20dacbc49ca9cccf179b645991664b39d77ef317c71b845b1e30bd509112041d3a19783')
    expect(bits.toHex(sjcl.misc.pbkdf2('Password', 'NaCl', 80000, 64*8))).to.equal('4ddcd8f60b98be21830cee5ef22701f9641a4418d04c0414aeff08876b34ab56a1d425a1225833549adb841b51c9b3176a272bdebba1d078478f62b397f33c8d')
  });

  // http://stackoverflow.com/a/5130543
  it('Set 2', function () {
    expect(bits.toHex(sjcl.misc.pbkdf2('password', 'salt', 1, 20*8))).to.equal('120fb6cffcf8b32c43e7225256c4f837a86548c9');
    expect(bits.toHex(sjcl.misc.pbkdf2('password', 'salt', 2, 20*8))).to.equal('ae4d0c95af6b46d32d0adff928f06dd02a303f8e');
    expect(bits.toHex(sjcl.misc.pbkdf2('password', 'salt', 4096, 20*8))).to.equal('c5e478d59288c841aa530db6845c4c8d962893a0');
    //expect(sjcl.misc.pbkdf2('password', 'salt', 16777216, 20)).to.equal('cf81c66fe8cfc04d1f31ecb65dab4089f7f179e8');
    expect(bits.toHex(sjcl.misc.pbkdf2('passwordPASSWORDpassword', 'saltSALTsaltSALTsaltSALTsaltSALTsalt', 4096, 25*8))).to.equal('348c89dbcbd32b2f32d814b8116e84cf2b17347ebc1800181c');
    expect(bits.toHex(sjcl.misc.pbkdf2('pass\0word', 'sa\0lt', 4096, 16*8))).to.equal('89b69d0516f829893c696226650a8687');
  });

  // http://www.cryptosys.net/manapi/api_PBE_Kdf2.html
  it('Set 3', function () {
    expect(bits.toHex(sjcl.misc.pbkdf2('password', hex.toBits('78578e5a5d63cb06'), 2048, 24*8))).to.equal('97b5a91d35af542324881315c4f849e327c4707d1bc9d322');
  });
});
