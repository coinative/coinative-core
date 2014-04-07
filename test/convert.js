var hex = {
  toBits: sjcl.codec.hex.toBits,
  fromBits: sjcl.codec.hex.fromBits,
  toBytes: function (hex) {
    return  sjcl.codec.bytes.fromBits(this.toBits(hex));
  }
};

var bytes = {
  toBits: sjcl.codec.bytes.toBits,
  fromBits: sjcl.codec.bytes.fromBits,
  toHex: function (bytes) {
    return sjcl.codec.hex.fromBits(this.toBits(bytes));
  }
};

var bits = { toHex: sjcl.codec.hex.fromBits };

if(typeof module !== 'undefined' && module.exports){
 	module.exports = {
 		hex: hex,
 		bytes: bytes,
 		bits: bits
 	}
}

