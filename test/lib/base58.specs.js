'use strict';
// https://tools.ietf.org/html/rfc5869
describe('Base58', function () {
  it('Test Case 1', function () {
    var privateKeyAndChecksum = "801184cd2cdd640ca42cfc3a091c51d549b2f016d454b2774019c2b2d2e08529fd206ec97e";
    var privateKeyWIF = bitcoin.base58.encode(hex.toBytes(privateKeyAndChecksum));
    var privateKeyWIFDec = bytes.toHex(bitcoin.base58.decode(privateKeyWIF));

    expect(privateKeyWIF).to.equal('5Hx15HFGyep2CfPxsJKe2fXJsCVn5DEiyoeGGF6JZjGbTRnqfiD');
    expect(privateKeyAndChecksum).to.equal(privateKeyWIFDec);
  });
  it('Testcase 2', function () {
    var unencodedAddress = "003c176e659bea0f29a3e9bf7880c112b1b31b4dc826268187";
    var addressEnc = bitcoin.base58.encode(hex.toBytes(unencodedAddress));
    var addressDec = bytes.toHex(bitcoin.base58.decode(addressEnc));

    expect(addressEnc).to.equal('16UjcYNBG9GTK4uq2f7yYEbuifqCzoLMGS');
    expect(unencodedAddress).to.equal(addressDec);
  });


});
