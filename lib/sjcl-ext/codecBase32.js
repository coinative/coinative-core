'use strict';
/** @namespace Base32 encoding/decoding */
sjcl.codec.base32 = {
	/** The base32 alphabet.
	* @private
	*/
	_chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",

	/** Convert from a bitArray to a base32 string. */
	fromBits: function (arr, _noEquals) {
		var out = "", i, bits=0, c = sjcl.codec.base32._chars, ta=0, bl = sjcl.bitArray.bitLength(arr);
		for (i=0; out.length * 5 < bl; ) {
			out += c.charAt((ta ^ arr[i]>>>bits) >>> 27);
			if (bits < 5) {
				ta = arr[i] << (5-bits);
				bits += 27;
				i++;
			} else {
				ta <<= 5;
				bits -= 5;
			}
		}
		while (out.length % 8 && !_noEquals) { out += "="; }
		return out;
	},

	/** Convert from a base32 string to a bitArray */
	toBits: function(str) {
		str = str.replace(/\s|=/g,'');
		var out = [], i, bits=0, c = sjcl.codec.base32._chars, ta=0, x;
		for (i=0; i<str.length; i++) {
			x = c.indexOf(str.charAt(i));
			if (x < 0) {
				throw new sjcl.exception.invalid("this isn't base32!");
			}
			if (bits > 27) {
				bits -= 27;
				out.push(ta ^ x>>>bits);
				ta  = x << (32-bits);
			} else {
				bits += 5;
				ta ^= x << (32-bits);
			}
		}
		if (bits&56) {
			out.push(sjcl.bitArray.partial(bits&56, ta, 1));
		}
		return out;
	}
};
