sjcl.ecc.ecdsa.secretKey.prototype.signDER = function(hash, paranoia) {
  return this.encodeDER(this.sign(hash, paranoia));
};

sjcl.ecc.ecdsa.publicKey.prototype.verifyDER = function (hash, signature) {
  return this.verify(hash, this.decodeDER(signature));
};

sjcl.ecc.ecdsa.secretKey.prototype.encodeDER = function(rs) {
  var w = sjcl.bitArray,
      R = this._curve.r,
      l = R.bitLength();

  var rb = sjcl.codec.bytes.fromBits(w.bitSlice(rs,0,l)),
      sb = sjcl.codec.bytes.fromBits(w.bitSlice(rs,l,2*l));

  while (!rb[0] && rb.length) rb.shift();
  while (!sb[0] && sb.length) sb.shift();

  // If high bit is set, prepend an extra zero byte (DER signed integer)
  if (rb[0] && 0x80) rb.unshift(0);
  if (sb[0] && 0x80) sb.unshift(0);

  var buffer = [].concat(
    0x30,
    4 + rb.length + sb.length,
    0x02,
    rb.length,
    rb,
    0x02,
    sb.length,
    sb
  );

  return sjcl.codec.bytes.toBits(buffer);
};

sjcl.ecc.ecdsa.publicKey.prototype.decodeDER = function(signature) {
  var sig = sjcl.codec.bytes.fromBits(signature);

  if (sig[0] != 0x30) {
    throw new Error('Signature not valid DER sequence');
  }

  if (sig[2] != 0x02) {
    throw new Error("First element in signature must be a DER Integer");
  }

  var rbLength = sig[3];
  var rbStart = 4;
  var rbEnd = 4 + rbLength;

  var secondElm = sig[rbLength + 4];
  if (secondElm != 0x02) {
    throw new Error("Second element in signature must be a DER Integer");
  }

  var sbLength = sig[rbLength + 4 + 1];
  var sbStart = rbLength + 4 + 2;

  var rBa = sig.slice(rbStart, rbEnd);
  var sBa = sig.slice(sbStart, sbStart + sbLength);

  // if any have a prepended the length (i.e. 33) then remove the zero extra byte
  if (rBa.length == 33 && rBa[0] === 0) {
    rBa = rBa.slice(1);
  }
  if (sBa.length == 33 && sBa[0] === 0) {
    sBa = sBa.slice(1);
  }

  var res =  sjcl.bitArray.concat(sjcl.codec.bytes.toBits(rBa), sjcl.codec.bytes.toBits(sBa));
  return res;
};
