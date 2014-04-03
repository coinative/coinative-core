'use strict';
/**
 * Contains the privileged data for accessing and encrypting/decrypting wallets, or for retrieving
 * the wallet UUID.
 *
 * We don't store the password or prk and make the encryptionKey non-enumerable to prevent
 * accidental access/serialisation of these values. Obviously we can't protect them from JavaScript
 * or debugger access but this is a best effort.
 *
 * @constructor
 * @param {string} id - This is either a UUID or an alias (i.e. an email or phone number).
 * @param {string} password - The user's password.
 */
bitcoin.WalletCredentials = {};

(function () {
  var defaults = { iterations: 2000 };

  var WalletCredentials = bitcoin.WalletCredentials = function (id, password, opts) {
    opts = opts || defaults;
    this.id = id;
    // Use PBKDF2-HMAC-SHA256 (https://tools.ietf.org/html/rfc2898) for key derivation and use
    // HKDF-Expand (http://tools.ietf.org/html/rfc5869) to derive encryptionKey and walletId from the
    // result. Don't store the prk or password.
    var prk = sjcl.misc.pbkdf2(password, this.id, opts.iterations, 256);

    // If this is an alias the encryptionKey is unnecessary

    // Prevent accidental serialisation compromising the encryption key
    Object.defineProperty(this, 'encryptionKey', {
      enumerable: false,
      value: sjcl.codec.hex.fromBits(sjcl.misc.hkdf.expand(prk, 'encryption key'))
    });

    this.walletId = sjcl.codec.hex.fromBits(sjcl.misc.hkdf.expand(prk, 'server identifier'));
  };
})();
