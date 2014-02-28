'use strict';

describe('WalletCredentials', function () {
  // We're currently storing hex strings of 256 bit keys which are 64 characters long.
  var HEX_LENGTH_256BITS = 64;

  describe('new (UUID)', function () {
    var credentials = new bitcoin.WalletCredentials('00000000-0000-0000-0000-000000000000', 'password');

    it('should set id', function () {
      expect(credentials.id).to.equal('00000000-0000-0000-0000-000000000000');
    });

    it('should set serverId', function () {
      expect(credentials.serverId).to.exist;
      expect(credentials.serverId.length).to.equal(HEX_LENGTH_256BITS);
    });

    it('should set encryptionKey (non-enumerable)', function () {
      expect(credentials.encryptionKey).to.exist;
      expect(credentials.encryptionKey.length).to.equal(HEX_LENGTH_256BITS);
      expect(credentials).to.not.include.keys('encryptionKey'); // non-enumerable
    });
  });

  describe('new (alias)', function () {
    var credentials = new bitcoin.WalletCredentials('email@example.com', 'password');

    it('should set id', function () {
      expect(credentials.id).to.equal('email@example.com');
    });

    it('should set serverId', function () {
      expect(credentials.serverId).to.exist;
      expect(credentials.serverId.length).to.equal(HEX_LENGTH_256BITS);
    });
  });

  // Hopefully these tests will give us some assurance that we haven't broken the key derivation if
  // we change libraries/implementations.
  describe('regression tests', function () {
    function WC(id, password) { return new bitcoin.WalletCredentials(id, password, { iterations: 2000 }) };

    it('email@example.com | password', function () {
      var credentials = new WC('email@example.com', 'password');
      expect(credentials.serverId).to.equal('800f33e335f4cfc0188f6304739a9b51dcdc76e89fde6e7b4a0522da5ebfe22a');
    });

    it('email@example.com | password123', function () {
      var credentials = new WC('email@example.com', 'password123');
      expect(credentials.serverId).to.equal('25e3300127e691d2e257244df307216fdb8b09c35bb1928c767c5640f03bfc25');
    });

    it('email2@example.com | password123', function () {
      var credentials = new WC('email2@example.com', 'password123');
      expect(credentials.serverId).to.equal('1cdf61ee42c7be5ffdca86e04e6efc4848de9730cac37f2999234aab972d6c35');
    });

    it('00000000-0000-0000-0000-000000000000 | password', function () {
      var credentials = new WC('00000000-0000-0000-0000-000000000000', 'password');
      expect(credentials.serverId).to.equal('9da02d078df058dc1d5cdb21c6f40142dcef2a2978f4321545e26f9c0e4ffb42');
      expect(credentials.encryptionKey).to.equal('2470ccf6a862de12d085b15787a0c2988e40b8cbc36caac7c800a4e83fd2d0ab');
    });

    it('00000000-0000-0000-0000-000000000000 | password123', function () {
      var credentials = new WC('00000000-0000-0000-0000-000000000000', 'password123');
      expect(credentials.serverId).to.equal('8b2c6645f86872101513cadfd40234114b13d153d080aa1c1cfc50cae5c960c4');
      expect(credentials.encryptionKey).to.equal('f815b6a1063317f9427c41c7181794e0f5256225a991f46c0726383a4f4f8f09');
    });

    it('0584e02a-7eb2-11e3-86a6-04a7c963dfc9 | password', function () {
      var credentials = new WC('0584e02a-7eb2-11e3-86a6-04a7c963dfc9', 'password');
      expect(credentials.serverId).to.equal('7a386216a56456fe680a84252685a6f3bab2896cdd582de69bc7138c8e77e03a');
      expect(credentials.encryptionKey).to.equal('489da2a38181f224c7c591bf5b99636b08d710c7177e84a3c25aa3df61f65d7a');
    });

    it('0584e02a-7eb2-11e3-86a6-04a7c963dfc9 | password123', function () {
      var credentials = new WC('0584e02a-7eb2-11e3-86a6-04a7c963dfc9', 'password123');
      expect(credentials.serverId).to.equal('891f0acd3626a0df7e549a3e57498a7437fbb1c5114b0dfd3651e8d422cdc7f8');
      expect(credentials.encryptionKey).to.equal('2ea0a3c63b8cc602fdf5a3b91ce5ff2b512d888b7ae3c9a6243a8ba60fab9960');
    });
  });
});
