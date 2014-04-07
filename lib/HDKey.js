'use strict';

bitcoin.HDKey = {};

(function () {

  var HDKey = bitcoin.HDKey = function (opts) {
    if (opts && opts.chain && sjcl.bitArray.bitLength(opts.chain) != 256) throw new Error('invalid chain code');
    if (!opts.pub && !opts.prv) throw new Error('no keys defined');

    this.chain = opts.chain; // need to make sure this is 32 bits. or
    this._hmacChain = new sjcl.misc.hmac(this.chain, sjcl.hash.sha512);

    this.version = opts.version || bitcoin.config.versions.bitcoin.production;

    if (opts.prv) {
      this.prv = opts.prv;
    }

    this.ecKey = new bitcoin.ECKey(this.prv, {
      version: bitcoin.config.versionsReversed[this.version['xpubKey']]
    });

    this.ecKey.setCompressed(opts.compressed != undefined ? opts.compressed : true);

    if (opts.pub) {
      this.ecKey.setPub(opts.pub);
    }

    this.pub = this.ecKey.getPub();
    this.id = this.ecKey.getPubKeyHash();
    this.address = this.ecKey.getBitcoinAddress().toString();

    this.fpr = sjcl.bitArray.bitSlice(this.id, 0, 32);
    this.depth = opts.depth || 0;
    this.parent = opts.parent || sjcl.codec.bytes.toBits([0, 0, 0, 0]);
    this.child = opts.child || 0;
  };

  HDKey.prototype.setCompressedAddresses = function (compressed) {
    this.ecKey.setCompressed(compressed);
    this.id = this.ecKey.getPubKeyHash();
    this.address = this.ecKey.getBitcoinAddress().toString();
    this.fpr = sjcl.bitArray.bitSlice(this.id, 0, 32);
  };

  HDKey.prototype.derivePrivate = function (i) {
    if (!this.prv) {
      throw new Error('Cannot perform private derivation without a private key');
    }

    var I;
    var ib = bitcoin.util.intToBits(i);
    var kpar = sjcl.bn.fromBits(this.prv);

    if (i >= 0x80000000) {
      I = this._hmacChain.encrypt(sjcl.bitArray.concat(sjcl.codec.bytes.toBits([0x00]), sjcl.bitArray.concat(this.prv, ib)));
    } else {
      var point = this.ecKey._curve.G.mult(kpar);
      var enc = sjcl.bitArray.concat(this.ecKey._encodePubKey(point, true), ib);
      I = this._hmacChain.encrypt(enc);
    }

    var IL = sjcl.bn.fromBits(sjcl.bitArray.bitSlice(I, 0, 256));
    var IR = sjcl.bitArray.bitSlice(I, 256);
    var ki = IL.add(kpar).mod(this.ecKey._curve.r);

    var c = IL.greaterEquals(this.ecKey._curve.r);
    if (c > 0) return;
    if (ki.equals(0)) return;

    return new bitcoin.HDKey({
      prv: ki.toBits(),
      chain: IR,
      depth: this.depth + 1,
      parent: this.fpr,
      child: i
    });
  };

  HDKey.prototype.derivePublic = function (i) {
    if (i >= 0x80000000)  {
      throw new Error('Cannot perform private derivation using the public child key derivation function');
    }

    var ib = bitcoin.util.intToBits(i);
    var point = this.ecKey.getPubPoint();
    var I = this._hmacChain.encrypt(sjcl.bitArray.concat(this.pub, ib));
    var IL = sjcl.bn.fromBits(sjcl.bitArray.bitSlice(I, 0, 256));
    var IR = sjcl.bitArray.bitSlice(I, 256);

    var ILMult = this.ecKey._curve.G.mult(IL);
    var Ki = new sjcl.ecc.point(this.ecKey._curve, point.toJac().add(ILMult).toAffine().x, ILMult.toJac().add(point).toAffine().y);

    var c = IL.greaterEquals(this.ecKey._curve.r);
    if (c > 0) return;
    // to fix
    //if (Ki.isInfinity()) return;

    return new bitcoin.HDKey({
      pub: this.ecKey._encodePubKey(Ki),
      chain: IR,
      depth: this.depth + 1,
      parent: this.fpr,
      child: i
    });
  };

  HDKey.prototype.serialize = function () {
    var serialized = {};

    var pub = this._serializePublicKey();
    var pubChecksum = bitcoin.util.sha256sha256(pub);
    serialized.pub = {
      hex: sjcl.codec.hex.fromBits(sjcl.codec.bytes.toBits(pub)),
      b58: bitcoin.base58.encode(pub.concat(pubChecksum.slice(0, 4)))
    };

    if (this.prv) {
      var prv = this._serializePrivateKey();
      var prvChecksum = bitcoin.util.sha256sha256(prv);
      serialized.prv = {
        hex: sjcl.codec.hex.fromBits(sjcl.codec.bytes.toBits(prv)),
        b58: bitcoin.base58.encode(prv.concat(prvChecksum.slice(0, 4)))
      };
    }

    return serialized;
  };

  HDKey.prototype._serializePublicKey = function () {
    var pub = sjcl.codec.bytes.fromBits(bitcoin.util.intToBits(this.version['xpubKey']))
      .concat(sjcl.codec.bytes.fromBits(bitcoin.util.intToBits(this.depth))[3])
      .concat(sjcl.codec.bytes.fromBits(this.parent))
      .concat(sjcl.codec.bytes.fromBits(bitcoin.util.intToBits(this.child)))
      .concat(sjcl.codec.bytes.fromBits(this.chain))
      .concat(sjcl.codec.bytes.fromBits(this.pub));

    return pub;
  }

  // supports either xpub or xprv keys in hex format (as bits) or
  // a ExtendedKey Object
  HDKey.deserializeKey = function (extKey) {
    if (extKey instanceof bitcoin.ExtendedKey) {
      extKey = extKey.key;
    }

    if (sjcl.bitArray.bitLength(extKey) != 624) {
      throw new Error('Not enough data');
    }

    var keyVersion = sjcl.bitArray.bitSlice(extKey, 0, 32);
    var version = '0x' + sjcl.codec.hex.fromBits(keyVersion).toString().toUpperCase();
    var versionInfo = bitcoin.config.versionsReversed[version];

    if (!versionInfo) {
      throw new Error('No version found. Invalid Key');
    }

    var opts = {
      version: bitcoin.config.versions[versionInfo.currency][versionInfo.network],
      depth: parseInt(sjcl.codec.hex.fromBits(sjcl.bitArray.bitSlice(extKey, 32, 40))),
      parent: sjcl.bitArray.bitSlice(extKey, 40, 72), // to bytes
      child: parseInt(sjcl.codec.hex.fromBits(sjcl.bitArray.bitSlice(extKey, 72, 104))), // to int
      chain: sjcl.bitArray.bitSlice(extKey, 104, 360)
    };

    if (versionInfo.isPrivate) {
      opts['prv'] = sjcl.bitArray.bitSlice(extKey, 368, 624);
    } else {
      opts['pub'] = sjcl.bitArray.bitSlice(extKey, 360, 624);
    }

    return new HDKey(opts);
  };

  HDKey.prototype._serializePrivateKey = function () {
    if (!this.prv)  {
      throw new Error('Cannot serialize private key without a private key');
    }

    var prv = sjcl.codec.bytes.fromBits(bitcoin.util.intToBits(this.version['xprvKey']))
      .concat(sjcl.codec.bytes.fromBits(bitcoin.util.intToBits(this.depth))[3])
      .concat(sjcl.codec.bytes.fromBits(this.parent))
      .concat(sjcl.codec.bytes.fromBits(bitcoin.util.intToBits(this.child)))
      .concat(sjcl.codec.bytes.fromBits(this.chain))
      .concat([0x00].concat(sjcl.codec.bytes.fromBits(this.prv)));

    return prv;
  };

})();
