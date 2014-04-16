'use strict';

bitcoin.Address = {};

(function () {
  var b = sjcl.bitArray;

  /**
   * Parse an address string, throwing an error if it's invalid.
   */
  function parseAddress(address) {
    if (typeof address !== 'string') {
      throw new Error('not a string');
    }

    var bits = bitcoin.base58.decode(address);

    if (b.bitLength(bits) !== 200) {
      throw new Error('invalid length');
    }

    var data = bitcoin.util.verifyChecksum(bits);

    var version = b.extract(data, 0, 8);
    var versionInfo = bitcoin.config.versionsReversed[version];

    if (!versionInfo) {
      throw new Error('invalid version');
    }

    return {
      version: version,
      hash: b.bitSlice(data, 8)
    };
  }

  /**
   * Create an address object from an address string or hash+version.
   * Throws on invalid address string.
   */
  var Address = bitcoin.Address = function (hash, version) {
    if (typeof hash === 'string') {
      var result = parseAddress(hash);
      this.version = result.version;
      this.hash = result.hash;
      return;
    }

    this.version = version || bitcoin.config.versions.bitcoin.livenet.pubKey;
    this.hash = hash;
  };

  /**
   * Test whether this address is a pay-to-script-hash address.
   */
  Address.prototype.isP2SH = function () {
    return ((bitcoin.config.versions.bitcoin.livenet.p2sh === this.version
      || bitcoin.config.versions.bitcoin.testnet.p2sh === this.version))
  };

  /**
   * Test whether this address is a pay-to-pubkey/pay-to-pubkey-hash address.
   */
  Address.prototype.isPubKey = function () {
    return ((bitcoin.config.versions.bitcoin.livenet.pubKey === this.version
      || bitcoin.config.versions.bitcoin.testnet.pubKey === this.version))
  };

  /**
   * Return the base58 encoded string representation of this address.
   */
  Address.prototype.toString = function () {
    var hash = b.concat([b.partial(8, this.version)], this.hash);
    var checksum = bitcoin.util.sha256dCheck(hash);
    return bitcoin.base58.encode(b.concat(hash, checksum));
  };

  /**
   * Test whether a string is a valid address.
   */
  Address.isValid = function (address) {
    // Not ideal, but it prevents us having to duplicate the validation checks.
    try {
      parseAddress(address);
      return true;
    } catch (e) {
      return false;
    }
  };

})();
