'use strict';

bitcoin.ECKey = {};

(function () {

  var _0x00 = sjcl.codec.bytes.toBits([0x00]);
  var _0x02 = sjcl.codec.bytes.toBits([0x02]);
  var _0x03 = sjcl.codec.bytes.toBits([0x03]);
  var _0x04 = sjcl.codec.bytes.toBits([0x04]);
  var Q = '3fffffffffffffffffffffffffffffffffffffffffffffffffffffffbfffff0c';

  var ECKey = bitcoin.ECKey = function (prv, opts) {
    this._curve = sjcl.ecc.curves.k256;

    if (prv) {
      this.keyPair = sjcl.ecc.ecdsa.generateKeys(this._curve, 0, sjcl.bn.fromBits(prv));
      this.prv = this.keyPair.sec.get();
    }
  };

  ECKey.prototype._decompressY = function(odd_even, x) {
    // y^2 = x^3 + ax^2 + b, so we need to perform sqrt to recover y
    var ySquared = this._curve.b.add(x.mul(this._curve.a.add(x.square()))); 
    var q = sjcl.bn.fromBits(sjcl.codec.hex.toBits(Q));
    var y = ySquared.powermod(q, this._curve.field.modulus);

    if (y.mod(2).equals(0) !== sjcl.bitArray.equal(odd_even, _0x02)) {
      y = this._curve.field.modulus.sub(y);
    }
    // reserialise curve here, expection is thrown when point is not on curve.
    return sjcl.ecc.curves.k256.fromBits(new sjcl.ecc.point(this._curve, x, y).toBits());
  };

  ECKey.prototype._pubToECPoint = function (key) {
    var xBits = sjcl.bitArray.concat(_0x00, sjcl.bitArray.bitSlice(key, 8, 256+8));
    var yBits = sjcl.bitArray.concat(_0x00, sjcl.bitArray.bitSlice(key, 256+8));

    var x = sjcl.bn.fromBits(xBits);
    var y = sjcl.bn.fromBits(yBits);

    if (y.equals(0) && this._curve.field.modulus.mod(new sjcl.bn(4)).equals(new sjcl.bn(3))) {
      return this._decompressY(sjcl.bitArray.bitSlice(key, 0, 8), x);
    }
    return new sjcl.ecc.point(this._curve, x, y);
  };

  ECKey.prototype._encodePubKey = function(point, compressed) {
    var enc = point.x.toBits();
    var y = point.y.toBits();
    var yIsEven = sjcl.bn.fromBits(y).mod(2).equals(0);

    if (compressed) {
      if (yIsEven) {
        // Compressed even pubkey
        // M = 02 || X
        enc = sjcl.bitArray.concat(_0x02, enc);
      } else {
        // Compressed uneven pubkey
        // M = 03 || X
        enc = sjcl.bitArray.concat(_0x03, enc);
      }
    } else {
      // Uncompressed pubkey
      // M = 04 || X || Y
      enc = sjcl.bitArray.concat(_0x04, enc);
      enc = sjcl.bitArray.concat(enc, y);
    }

    return enc;
  };

  ECKey.prototype.setCompressed = function(compressed) {
    this.pubKeyHash = undefined;
    this.compressed = !!compressed;
  };

  // this can be a compressed or uncompressed pub key.
  // this.compressed is only used to determine the desired output.
  ECKey.prototype.setPub = function (pub) {
    this.pub = this._pubToECPoint(pub);
  };

  ECKey.prototype.getPubPoint = function () {
    if (this.pub)  {
      return this.pub;
    }
    this.pub = this._curve.G.mult(sjcl.bn.fromBits(this.prv));
    return this.pub;
  };

  ECKey.prototype.getPub = function () {
    return this._encodePubKey(this.getPubPoint(), this.compressed);
  };

  ECKey.prototype.isValidPub = function () {
    var point = sjcl.ecc.curves.k256.fromBits(this.getPubPoint().toBits());
    return point.isValid();
  };

  ECKey.prototype.getPubKeyHash = function () {
    if (this.pubKeyHash) return this.pubKeyHash;
    return this.pubKeyHash = bitcoin.util.sha256ripe160(this.getPub());
  };

  ECKey.prototype.getBitcoinAddress = function () {
    return new bitcoin.Address(sjcl.codec.bytes.fromBits(this.getPubKeyHash()));
  };

  ECKey.prototype.sign = function (hash) {
    if (!this.keyPair) {
      throw new Error('Cannot perform a sign without a private key');
    }
    return this.keyPair.sec.signDER(hash);
  };

  ECKey.prototype.verify = function (hash, signature) {
    return keyPair.pub.verify(hash, signature);
  };

})();