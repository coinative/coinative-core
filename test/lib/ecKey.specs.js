'use strict';

describe('ECKey', function () {

  describe('sign and verify', function () {
    var privateKeyHex = 'e91671c46231f833a6406ccbea0e3e392c76c167bac1cb013f6f1013980455c2';
    var ecKey = new bitcoin.ECKey({ prv: sjcl.codec.hex.toBits(privateKeyHex) });
    var hash = sjcl.hash.sha256.hash('message');

    // it('sign', function () {
    //   for (var i = 0; i < 1000; i++) {
    //     var signature = ecKey.sign(hash);
    //     var sigBytes = bits.toBytes(signature);

    //     try {
    //     ecKey.verify(hash, signature)

    //     } catch (e) {
    //       console.log('err', e);
    //       console.log(sigBytes.length, sigBytes);
    //       console.log(bits.toBytes(ecKey.keyPair.pub.decodeDER(signature)))
    //       break;
    //     }

    //   }
    // })

    // it('test', function () {
    //  // [48, 69, 2, 32, 0, 53, 66, 240, 80, 6, 33, 156, 108, 81, 119, 18, 90, 136, 160, 192, 209, 80, 179, 186, 18, 104, 12, 102, 38, 226, 154, 213, 219, 134, 189, 21, 2, 33, 0, 57, 128, 238, 11, 31, 193, 228, 135, 74, 51, 16, 17, 216, 194, 47, 85, 16, 55, 58, 169, 124, 245, 216, 106, 34, 120, 20, 141, 55, 192, 99, 130]
    //  // [53, 66, 240, 80, 6, 33, 156, 108, 81, 119, 18, 90, 136, 160, 192, 209, 80, 179, 186, 18, 104, 12, 102, 38, 226, 154, 213, 219, 134, 189, 21, 57, 128, 238, 11, 31, 193, 228, 135, 74, 51, 16, 17, 216, 194, 47, 85, 16, 55, 58, 169, 124, 245, 216, 106, 34, 120, 20, 141, 55, 192, 99, 130]
    //   // var sigRaw = bytes.toBits([75, 191, 93, 214, 13, 144, 44, 135, 234, 225, 234, 233, 198, 37, 188, 148, 18, 248, 50, 97, 81, 194, 229, 150, 9, 197, 174, 234, 80, 48, 238, 121, 174, 176, 56, 48, 56, 88, 204, 234, 126, 118, 87, 198, 98, 120, 59, 243, 62, 121, 240, 76, 79, 205, 125, 42, 77, 18, 239, 113, 84, 42, 65]);
    //   // var sigDER = ecKey.keyPair.sec.encodeDER(sigRaw);


    //   var sigBits = bytes.toBits();
    //   console.log(bits.toBytes(sigBits))

    //   var w = sjcl.bitArray,
    //     R = ecKey.keyPair.pub._curve.r,
    //     l = ecKey.keyPair.pub._curveBitLength;

    //   var r = sjcl.bn.fromBits(w.bitSlice(sigBits,0,l));
    //   var s = sjcl.bn.fromBits(w.bitSlice(sigBits,l,2*l));

    //   console.log(bits.toBytes(r.toBits()), l);
    //   console.log(bits.toBytes(s.toBits()), l);

    //   var sigDER = ecKey.keyPair.sec.encodeDER(sigBits);
    //   console.log('DER signed: ', bits.toBytes(sigDER));

    //   var sigDERDecode = ecKey.keyPair.pub.decodeDER(sigDER);
    //   console.log('DER decoded: ', bits.toBytes(sigDERDecode));

    //   var rdec = sjcl.bn.fromBits(w.bitSlice(sigDERDecode,0,l));
    //   var sdec = sjcl.bn.fromBits(w.bitSlice(sigDERDecode,l,2*l));

    //   console.log(bits.toBytes(rdec.toBits()), l);
    //   console.log(bits.toBytes(sdec.toBits()), l);

    //   ecKey.keyPair.pub.verifyDER(hash, sigDER)




    //   // var sigBitsDER = bytes.toBits([48, 69, 2, 32, 0, 173, 225, 166, 163, 218, 234, 120, 43, 76, 129, 174, 130, 220, 80, 236, 165, 95, 218, 118, 178, 106, 162, 20, 23, 177, 19, 31, 196, 107, 144, 254, 2, 33, 0, 19, 230, 95, 223, 107, 207, 103, 132, 30, 186, 125, 1, 244, 215, 85, 48, 94, 3, 23, 86, 158, 49, 63, 6, 175, 39, 200, 178, 124, 227, 181, 151])
    //   //ecKey.keyPair.pub.verifyDER(hash, sigDER);

    // })




  })
});
