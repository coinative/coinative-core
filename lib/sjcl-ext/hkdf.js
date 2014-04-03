/** @fileOverview HMAC-based Extract-and-Expand Key Derivation Function (HKDF)
 *
 * This implementation is as specified in RFC 5869.
 *
 * @author Ben Shepheard
 */

/** HMAC-based Extract-and-Expand Key Derivation Function (HKDF)
 *
 * By default the HMAC-Hash function is SHA-256.
 */
sjcl.misc.hkdf = {
  /** Extract a fixed-length pseudorandom key from an input keying material.
   *
   * @param {bitArray|String} salt The salt.
   * @param {bitArray|String} ikm The input keying material, e.g. a password.
   * @param {Object} [Hash=sjcl.hash.sha256] The hash function to use.
   * @return {bitArray} The derived key.
   */
  extract: function (salt, ikm, Hash) {
    if (typeof salt === 'string') {
      salt = sjcl.codec.utf8String.toBits(salt);
    }

    if (typeof ikm === 'string') {
      ikm = sjcl.codec.utf8String.toBits(ikm);
    }

    Hash = Hash || sjcl.hash.sha256;

    var prf = new sjcl.misc.hmac(salt, Hash);
    return prf.encrypt(ikm);
  },

  /** Expand a fixed-length pseudorandom key to additional pseudorandom keys.
   *
   * @param {bitArray|String} prk The pseudorandom key. Must be at least as long
   *                              as the output size of the hash function.
   * @param {bitArray|String} info Application specific information.
   * @param {Number} [length] The length of the derived key. Defaults to the
                              output size of the hash function.
   * @param {Object} [Hash=sjcl.hash.sha256] The hash function to use.
   * @return {bitArray} The derived key.
   */
  expand: function (prk, info, length, Hash) {
    if (length < 0) {
      throw sjcl.exception.invalid("invalid params to hkdf");
    }

    if (typeof prk === 'string') {
      prk = sjcl.codec.utf8String.toBits(prk);
    }

    if (typeof info === 'string') {
      info = sjcl.codec.utf8String.toBits(info);
    }

    Hash = Hash || sjcl.hash.sha256;

    var prf = new sjcl.misc.hmac(prk, Hash),
        i, t = [], out = [], b = sjcl.bitArray,
        os = Hash.prototype.outputSize || 256,
        length = length || os,
        n = Math.ceil(length / os);

    for (i = 1; i <= n; i++) {
      t = prf.encrypt(b.concat(t, b.concat(info, [b.partial(8, i)])));
      out = out.concat(t);
    }

    out = b.clamp(out, length);

    return out;
  }
};
