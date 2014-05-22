'use strict';

bitcoin.HDKey = {};

(function () {
  var b = sjcl.bitArray;

  /**
   * Derive a key from a master seed.
   */
  function deriveFromMasterSeed(seed, version) {
    var key = sjcl.codec.utf8String.toBits('Bitcoin seed');
    var masterSeed = new sjcl.misc.hmac(key, sjcl.hash.sha512).encrypt(seed);

    return {
      prv: b.bitSlice(masterSeed, 0, 256),
      chain: b.bitSlice(masterSeed, 256),
      version: version
    };
  }

  /**
   * Parse an extended public key with checksum.
   *
   * format (656 bits):
   *    0 - version (32)
   *   32 - depth (8)
   *   40 - fingerprint (32)
   *   72 - child number (32)
   *  104 - chain code (256)
   *  360 - pub or prv key (264)
   *  624 - checksum (32)
   */
  function parseExtendedKey(xkey) {
    var bits = bitcoin.base58.decode(xkey);

    if (b.bitLength(bits) !== 656) {
      throw new Error('invalid data');
    }

    var data = bitcoin.util.verifyChecksum(bits);


    // Todo. refactor versioning.
    var version = parseInt(sjcl.codec.hex.fromBits(b.bitSlice(data, 0, 32)), 16);
    var versionInfo = bitcoin.config.versionsReversed[version];
    if (!versionInfo) {
      throw new Error('invalid version');
    }


    var opts = {
      version: bitcoin.config.versions.bitcoin[versionInfo.network],
      depth: b.extract(data, 32, 8),
      parent: b.bitSlice(data, 40, 72),
      child: parseInt(sjcl.codec.hex.fromBits(b.bitSlice(data, 72, 104)), 16),
      chain: b.bitSlice(data, 104, 360)
    };

    if (versionInfo.isPrivate) {
      // Discard the prefixed 0x00 byte
      opts.prv = b.bitSlice(data, 368);
    } else {
      opts.pub = b.bitSlice(data, 360);
    }

    return opts;
  }

  /**
   * Create a HDKey object.
   *
   * Can be called either with a master seed, serialized extended key or with a
   * HDKey-like object (must contain `chain` and either `prv` or `pub`).
   *
   * Secret data is exposed on this object so care must be taken to keep this
   * object secure.
   */
  var HDKey = bitcoin.HDKey = function (opts) {
    if (!opts) {
      throw new Error('no opts');
    }
    // Support passing a serialized extended key
    if (typeof opts === 'string') {
      return new HDKey(parseExtendedKey(opts));
    }
    // Support a master seed
    if (Array.isArray(opts.seed)) {
      return new HDKey(deriveFromMasterSeed(opts.seed, opts.version));
    }
    if (!opts.chain || sjcl.bitArray.bitLength(opts.chain) !== 256) {
      throw new Error('invalid chain code');
    }
    if (!opts.pub && !opts.prv) {
      throw new Error('no keys defined');
    }

    this.chain = opts.chain;
    this._hmacChain = new sjcl.misc.hmac(opts.chain, sjcl.hash.sha512);

    // FIXME: this is a bit weird
    this.version = opts.version || bitcoin.config.versions.bitcoin.livenet;

    if (opts.prv) {
      this.prv = opts.prv;
    }

    this.ecKey = new bitcoin.ECKey({prv: opts.prv, pub: opts.pub, version: this.version });
    this.ecKey.setCompressed(typeof opts.compressed === 'boolean' ? opts.compressed : true);

    this.pub = this.ecKey.getPub();
    this.id = this.ecKey.getPubKeyHash();
    this.address = this.ecKey.getBitcoinAddress().toString();

    this.fpr = sjcl.bitArray.bitSlice(this.id, 0, 32);
    this.depth = opts.depth || 0;
    this.parent = opts.parent || [0];
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
      child: i,
      version: this.version
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
    // FIXME:
    //if (Ki.isInfinity()) return;

    return new bitcoin.HDKey({
      pub: this.ecKey._encodePubKey(Ki),
      chain: IR,
      depth: this.depth + 1,
      parent: this.fpr,
      child: i,
      version: this.version
    });
  };

  HDKey.prototype.serialize = function () {
    var serialized = {};

    var pub = this._serializePublicKey();
    serialized.pub = {
      hex: sjcl.codec.hex.fromBits(pub),
      b58: bitcoin.base58.encode(b.concat(pub, bitcoin.util.sha256dCheck(pub)))
    };

    if (this.prv) {
      var prv = this._serializePrivateKey();
      serialized.prv = {
        hex: sjcl.codec.hex.fromBits(prv),
        b58: bitcoin.base58.encode(b.concat(prv, bitcoin.util.sha256dCheck(prv)))
      };
    }

    return serialized;
  };

  HDKey.prototype._serializePublicKey = function () {
    var pub = [this.version['xpubKey']];
    pub = b.concat(pub, [b.partial(8, this.depth)]);
    pub = b.concat(pub, this.parent);
    pub = b.concat(pub, [this.child]);
    pub = b.concat(pub, this.chain);
    pub = b.concat(pub, this.pub);
    return pub;
  }

  HDKey.prototype._serializePrivateKey = function () {
    if (!this.prv)  {
      throw new Error('Cannot serialize private key without a private key');
    }

    var prv = [this.version['xprvKey']];
    prv = b.concat(prv, [b.partial(8, this.depth)]);
    prv = b.concat(prv, this.parent);
    prv = b.concat(prv, [this.child]);
    prv = b.concat(prv, this.chain);
    prv = b.concat(prv, b.concat([b.partial(8, 0x00)], this.prv));
    return prv;
  };

  /**
   * Test whether a string is a valid extended key.
   */
  HDKey.isValid = function (xkey) {
    // Not ideal, but it prevents us having to duplicate the validation checks.
    try {
      parseExtendedKey(xkey);
      return true;
    } catch (e) {
      return false;
    }
  };

})();
