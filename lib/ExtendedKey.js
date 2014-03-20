bitcoin.ExtendedKey = {};

(function () {

  var ExtendedKey = bitcoin.ExtendedKey = function (xKey) {
    this.deserialize(xKey);
    if (!this.isValid())
      throw 'checksum failed.';
  };

  ExtendedKey.prototype.isValid = function () {
    return sjcl.bitArray.equal(sjcl.bitArray.bitSlice(this.keyHash, 0, 32), this.checksum);
  }

  ExtendedKey.prototype.deserialize = function (xKey) {
    var xPubBytes = bitcoin.base58.decode(xKey);
    var keyBytes = xPubBytes.slice(0, 78);
    this.key = sjcl.codec.bytes.toBits(keyBytes);
    this.checksum = sjcl.codec.bytes.toBits(xPubBytes.slice(78, 82));
    this.keyHash = sjcl.codec.bytes.toBits(bitcoin.util.sha256sha256(keyBytes));
  };

  ExtendedKey.isValid = function (xKey) {
    var xPubBytes = bitcoin.base58.decode(xKey);

    var keyBytes = xPubBytes.slice(0, 78);
    var checksumBytes = xPubBytes.slice(78, 82);
    var keyHash = bitcoin.util.sha256sha256(keyBytes);

    return (keyHash[0] === checksumBytes[0] && keyHash[1] === checksumBytes[1] && keyHash[2] === checksumBytes[2] && keyHash[3] === checksumBytes[3])
  }

})();
