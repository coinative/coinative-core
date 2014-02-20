'use strict';
/**
 * HMAC-based Extract-and-Expand Key Derivation Function (HKDF)
 *
 * See https://tools.ietf.org/html/rfc5869
 */
/**
 * HMAC-based Extract-and-Expand Key Derivation Function (HKDF)
 *
 * See https://tools.ietf.org/html/rfc5869
 */
sjcl.misc.hkdf = {
  extract: function (key, message) {
    return sjcl.codec.hex.fromBits(new sjcl.misc.hmac(sjcl.codec.bytes.toBits(key), sjcl.hash.sha256)
           .encrypt(sjcl.codec.bytes.toBits(message)));
  },
  expand: function (prk, info, l) {
    if (typeof prk === 'string') {
      prk = sjcl.codec.bytes.fromBits(sjcl.codec.utf8String.toBits(prk));
    }
    if (typeof info === 'string') {
      info = sjcl.codec.bytes.fromBits(sjcl.codec.utf8String.toBits(info));
    }
    // hardcode hash length to 32 as we're using SHA-256
    var hashlen = 32;
    l = l || hashlen;

    var output = [];
    var n = Math.ceil(l / hashlen);
    var ti = [];

    for (var i = 1; i <= n; i++) {
      ti = sjcl.codec.bytes.fromBits(new sjcl.misc.hmac(sjcl.codec.bytes.toBits(prk), sjcl.hash.sha256).encrypt(sjcl.codec.bytes.toBits(ti.concat(info).concat(i))))
      output = output.concat(ti);
    }

    if (output.length > l) {
      output = output.slice(0, l);
    }

    return sjcl.codec.hex.fromBits(sjcl.codec.bytes.toBits(output));
  }
};
