'use strict';

describe('Private Derivation', function () {
  describe('Test Vector 1', function () {
    var m = new bitcoin.HDKey(hex.toBits('000102030405060708090a0b0c0d0e0f'))

    it('m', function () {
      var s = m.serialize();

      expect(hex.fromBits(m.id)).to.equal('3442193e1bb70916e914552172cd4e2dbc9df811');
      expect(m.address).to.equal('15mKKb2eos1hWa6tisdPwwDC1a5J1y9nma');
      expect(hex.fromBits(m.prv)).to.equal('e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35');
      expect(hex.fromBits(m.pub)).to.equal('0339a36013301597daef41fbe593a02cc513d0b55527ec2df1050e2e8ff49c85c2');
      expect(hex.fromBits(m.chain)).to.equal('873dff81c02f525623fd1fe5167eac3a55a049de3d314bb42ee227ffed37d508');
      expect(s.pub.hex).to.equal('0488b21e000000000000000000873dff81c02f525623fd1fe5167eac3a55a049de3d314bb42ee227ffed37d5080339a36013301597daef41fbe593a02cc513d0b55527ec2df1050e2e8ff49c85c2');
      expect(s.prv.hex).to.equal('0488ade4000000000000000000873dff81c02f525623fd1fe5167eac3a55a049de3d314bb42ee227ffed37d50800e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35');
      expect(s.pub.b58).to.equal('xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8');
      expect(s.prv.b58).to.equal('xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi');
    });

    it('m/0\'', function () {
      var key = m.derivePrivate(0 + 0x80000000);
      var s = key.serialize();

      expect(bits.toHex(key.id)).to.equal('5c1bd648ed23aa5fd50ba52b2457c11e9e80a6a7');
      expect(key.address).to.equal('19Q2WoS5hSS6T8GjhK8KZLMgmWaq4neXrh');
      expect(hex.fromBits(key.prv)).to.equal('edb2e14f9ee77d26dd93b4ecede8d16ed408ce149b6cd80b0715a2d911a0afea');
      expect(hex.fromBits(key.pub)).to.equal('035a784662a4a20a65bf6aab9ae98a6c068a81c52e4b032c0fb5400c706cfccc56');
      expect(hex.fromBits(key.chain)).to.equal('47fdacbd0f1097043b78c63c20c34ef4ed9a111d980047ad16282c7ae6236141');
      expect(s.pub.hex).to.equal('0488b21e013442193e8000000047fdacbd0f1097043b78c63c20c34ef4ed9a111d980047ad16282c7ae6236141035a784662a4a20a65bf6aab9ae98a6c068a81c52e4b032c0fb5400c706cfccc56');
      expect(s.prv.hex).to.equal('0488ade4013442193e8000000047fdacbd0f1097043b78c63c20c34ef4ed9a111d980047ad16282c7ae623614100edb2e14f9ee77d26dd93b4ecede8d16ed408ce149b6cd80b0715a2d911a0afea');
      expect(s.pub.b58).to.equal('xpub68Gmy5EdvgibQVfPdqkBBCHxA5htiqg55crXYuXoQRKfDBFA1WEjWgP6LHhwBZeNK1VTsfTFUHCdrfp1bgwQ9xv5ski8PX9rL2dZXvgGDnw');
      expect(s.prv.b58).to.equal('xprv9uHRZZhk6KAJC1avXpDAp4MDc3sQKNxDiPvvkX8Br5ngLNv1TxvUxt4cV1rGL5hj6KCesnDYUhd7oWgT11eZG7XnxHrnYeSvkzY7d2bhkJ7');
    });

    it('m/0\'/1', function () {
      var key = m.derivePrivate(0 + 0x80000000)
                 .derivePrivate(1);
      var s = key.serialize();

      expect(hex.fromBits(key.id)).to.equal('bef5a2f9a56a94aab12459f72ad9cf8cf19c7bbe');
      expect(key.address).to.equal('1JQheacLPdM5ySCkrZkV66G2ApAXe1mqLj');
      expect(hex.fromBits(key.prv)).to.equal('3c6cb8d0f6a264c91ea8b5030fadaa8e538b020f0a387421a12de9319dc93368');
      expect(hex.fromBits(key.pub)).to.equal('03501e454bf00751f24b1b489aa925215d66af2234e3891c3b21a52bedb3cd711c');
      expect(hex.fromBits(key.chain)).to.equal('2a7857631386ba23dacac34180dd1983734e444fdbf774041578e9b6adb37c19');
      expect(s.pub.hex).to.equal('0488b21e025c1bd648000000012a7857631386ba23dacac34180dd1983734e444fdbf774041578e9b6adb37c1903501e454bf00751f24b1b489aa925215d66af2234e3891c3b21a52bedb3cd711c');
      expect(s.prv.hex).to.equal('0488ade4025c1bd648000000012a7857631386ba23dacac34180dd1983734e444fdbf774041578e9b6adb37c19003c6cb8d0f6a264c91ea8b5030fadaa8e538b020f0a387421a12de9319dc93368');
      expect(s.pub.b58).to.equal('xpub6ASuArnXKPbfEwhqN6e3mwBcDTgzisQN1wXN9BJcM47sSikHjJf3UFHKkNAWbWMiGj7Wf5uMash7SyYq527Hqck2AxYysAA7xmALppuCkwQ');
      expect(s.prv.b58).to.equal('xprv9wTYmMFdV23N2TdNG573QoEsfRrWKQgWeibmLntzniatZvR9BmLnvSxqu53Kw1UmYPxLgboyZQaXwTCg8MSY3H2EU4pWcQDnRnrVA1xe8fs');
    });

    it('m/0\'/1/2\'', function () {
      var key = m.derivePrivate(0 + 0x80000000)
                 .derivePrivate(1)
                 .derivePrivate(2 + 0x80000000);
      var s = key.serialize();

      expect(hex.fromBits(key.id)).to.equal('ee7ab90cde56a8c0e2bb086ac49748b8db9dce72');
      expect(key.address).to.equal('1NjxqbA9aZWnh17q1UW3rB4EPu79wDXj7x');
      expect(hex.fromBits(key.prv)).to.equal('cbce0d719ecf7431d88e6a89fa1483e02e35092af60c042b1df2ff59fa424dca');
      expect(hex.fromBits(key.pub)).to.equal('0357bfe1e341d01c69fe5654309956cbea516822fba8a601743a012a7896ee8dc2');
      expect(hex.fromBits(key.chain)).to.equal('04466b9cc8e161e966409ca52986c584f07e9dc81f735db683c3ff6ec7b1503f');
      expect(s.pub.hex).to.equal('0488b21e03bef5a2f98000000204466b9cc8e161e966409ca52986c584f07e9dc81f735db683c3ff6ec7b1503f0357bfe1e341d01c69fe5654309956cbea516822fba8a601743a012a7896ee8dc2');
      expect(s.prv.hex).to.equal('0488ade403bef5a2f98000000204466b9cc8e161e966409ca52986c584f07e9dc81f735db683c3ff6ec7b1503f00cbce0d719ecf7431d88e6a89fa1483e02e35092af60c042b1df2ff59fa424dca');
      expect(s.pub.b58).to.equal('xpub6D4BDPcP2GT577Vvch3R8wDkScZWzQzMMUm3PWbmWvVJrZwQY4VUNgqFJPMM3No2dFDFGTsxxpG5uJh7n7epu4trkrX7x7DogT5Uv6fcLW5');
      expect(s.prv.b58).to.equal('xprv9z4pot5VBttmtdRTWfWQmoH1taj2axGVzFqSb8C9xaxKymcFzXBDptWmT7FwuEzG3ryjH4ktypQSAewRiNMjANTtpgP4mLTj34bhnZX7UiM');
    });

    it('m/0\'/1/2\'/2', function () {
      var key = m.derivePrivate(0 + 0x80000000)
                 .derivePrivate(1)
                 .derivePrivate(2 + 0x80000000)
                 .derivePrivate(2);
      var s = key.serialize();

      expect(hex.fromBits(key.id)).to.equal('d880d7d893848509a62d8fb74e32148dac68412f');
      expect(key.address).to.equal('1LjmJcdPnDHhNTUgrWyhLGnRDKxQjoxAgt');
      expect(hex.fromBits(key.prv)).to.equal('0f479245fb19a38a1954c5c7c0ebab2f9bdfd96a17563ef28a6a4b1a2a764ef4');
      expect(hex.fromBits(key.pub)).to.equal('02e8445082a72f29b75ca48748a914df60622a609cacfce8ed0e35804560741d29');
      expect(hex.fromBits(key.chain)).to.equal('cfb71883f01676f587d023cc53a35bc7f88f724b1f8c2892ac1275ac822a3edd');
      expect(s.pub.hex).to.equal('0488b21e04ee7ab90c00000002cfb71883f01676f587d023cc53a35bc7f88f724b1f8c2892ac1275ac822a3edd02e8445082a72f29b75ca48748a914df60622a609cacfce8ed0e35804560741d29');
      expect(s.pub.b58).to.equal('xpub6FHa3pjLCk84BayeJxFW2SP4XRrFd1JYnxeLeU8EqN3vDfZmbqBqaGJAyiLjTAwm6ZLRQUMv1ZACTj37sR62cfN7fe5JnJ7dh8zL4fiyLHV');
      expect(s.prv.hex).to.equal('0488ade404ee7ab90c00000002cfb71883f01676f587d023cc53a35bc7f88f724b1f8c2892ac1275ac822a3edd000f479245fb19a38a1954c5c7c0ebab2f9bdfd96a17563ef28a6a4b1a2a764ef4');
      expect(s.prv.b58).to.equal('xprvA2JDeKCSNNZky6uBCviVfJSKyQ1mDYahRjijr5idH2WwLsEd4Hsb2Tyh8RfQMuPh7f7RtyzTtdrbdqqsunu5Mm3wDvUAKRHSC34sJ7in334');
    });

    it('m/0\'/1/2\'/1000000000', function () {
      var key = m.derivePrivate(0 + 0x80000000)
                 .derivePrivate(1)
                 .derivePrivate(2 + 0x80000000)
                 .derivePrivate(2)
                 .derivePrivate(1000000000);
      var s = key.serialize();

      expect(hex.fromBits(key.id)).to.equal('d69aa102255fed74378278c7812701ea641fdf32');
      expect(key.address).to.equal('1LZiqrop2HGR4qrH1ULZPyBpU6AUP49Uam');
      expect(hex.fromBits(key.prv)).to.equal('471b76e389e528d6de6d816857e012c5455051cad6660850e58372a6c3e6e7c8');
      expect(hex.fromBits(key.pub)).to.equal('022a471424da5e657499d1ff51cb43c47481a03b1e77f951fe64cec9f5a48f7011');
      expect(hex.fromBits(key.chain)).to.equal('c783e67b921d2beb8f6b389cc646d7263b4145701dadd2161548a8b078e65e9e');
      expect(s.pub.hex).to.equal('0488b21e05d880d7d83b9aca00c783e67b921d2beb8f6b389cc646d7263b4145701dadd2161548a8b078e65e9e022a471424da5e657499d1ff51cb43c47481a03b1e77f951fe64cec9f5a48f7011');
      expect(s.pub.b58).to.equal('xpub6H1LXWLaKsWFhvm6RVpEL9P4KfRZSW7abD2ttkWP3SSQvnyA8FSVqNTEcYFgJS2UaFcxupHiYkro49S8yGasTvXEYBVPamhGW6cFJodrTHy');
      expect(s.prv.hex).to.equal('0488ade405d880d7d83b9aca00c783e67b921d2beb8f6b389cc646d7263b4145701dadd2161548a8b078e65e9e00471b76e389e528d6de6d816857e012c5455051cad6660850e58372a6c3e6e7c8');
      expect(s.prv.b58).to.equal('xprvA41z7zogVVwxVSgdKUHDy1SKmdb533PjDz7J6N6mV6uS3ze1ai8FHa8kmHScGpWmj4WggLyQjgPie1rFSruoUihUZREPSL39UNdE3BBDu76');
    });
  });

  describe('Test Vector 2', function () {
    var m = new bitcoin.HDKey(hex.toBits('fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542'));

    it('m', function () {
      var s = m.serialize();

      expect(bits.toHex(m.id)).to.equal('bd16bee53961a47d6ad888e29545434a89bdfe95');
      expect(m.address).to.equal('1JEoxevbLLG8cVqeoGKQiAwoWbNYSUyYjg');
      expect(bits.toHex(m.prv)).to.equal('4b03d6fc340455b363f51020ad3ecca4f0850280cf436c70c727923f6db46c3e');
      expect(bits.toHex(m.pub)).to.equal('03cbcaa9c98c877a26977d00825c956a238e8dddfbd322cce4f74b0b5bd6ace4a7');
      expect(bits.toHex(m.chain)).to.equal('60499f801b896d83179a4374aeb7822aaeaceaa0db1f85ee3e904c4defbd9689');
      expect(s.pub.hex).to.equal('0488b21e00000000000000000060499f801b896d83179a4374aeb7822aaeaceaa0db1f85ee3e904c4defbd968903cbcaa9c98c877a26977d00825c956a238e8dddfbd322cce4f74b0b5bd6ace4a7');
      expect(s.pub.b58).to.equal('xpub661MyMwAqRbcFW31YEwpkMuc5THy2PSt5bDMsktWQcFF8syAmRUapSCGu8ED9W6oDMSgv6Zz8idoc4a6mr8BDzTJY47LJhkJ8UB7WEGuduB');
      expect(s.prv.hex).to.equal('0488ade400000000000000000060499f801b896d83179a4374aeb7822aaeaceaa0db1f85ee3e904c4defbd9689004b03d6fc340455b363f51020ad3ecca4f0850280cf436c70c727923f6db46c3e');
      expect(s.prv.b58).to.equal('xprv9s21ZrQH143K31xYSDQpPDxsXRTUcvj2iNHm5NUtrGiGG5e2DtALGdso3pGz6ssrdK4PFmM8NSpSBHNqPqm55Qn3LqFtT2emdEXVYsCzC2U');
    });

    it('m/0', function () {
      var key = m.derivePrivate(0);
      var s = key.serialize();

      expect(bits.toHex(key.id)).to.equal('5a61ff8eb7aaca3010db97ebda76121610b78096');
      expect(key.address).to.equal('19EuDJdgfRkwCmRzbzVBHZWQG9QNWhftbZ');
      expect(bits.toHex(key.prv)).to.equal('abe74a98f6c7eabee0428f53798f0ab8aa1bd37873999041703c742f15ac7e1e');
      expect(bits.toHex(key.pub)).to.equal('02fc9e5af0ac8d9b3cecfe2a888e2117ba3d089d8585886c9c826b6b22a98d12ea');
      expect(bits.toHex(key.chain)).to.equal('f0909affaa7ee7abe5dd4e100598d4dc53cd709d5a5c2cac40e7412f232f7c9c');
      expect(s.pub.hex).to.equal('0488b21e01bd16bee500000000f0909affaa7ee7abe5dd4e100598d4dc53cd709d5a5c2cac40e7412f232f7c9c02fc9e5af0ac8d9b3cecfe2a888e2117ba3d089d8585886c9c826b6b22a98d12ea');
      expect(s.pub.b58).to.equal('xpub69H7F5d8KSRgmmdJg2KhpAK8SR3DjMwAdkxj3ZuxV27CprR9LgpeyGmXUbC6wb7ERfvrnKZjXoUmmDznezpbZb7ap6r1D3tgFxHmwMkQTPH');
      expect(s.prv.hex).to.equal('0488ade401bd16bee500000000f0909affaa7ee7abe5dd4e100598d4dc53cd709d5a5c2cac40e7412f232f7c9c00abe74a98f6c7eabee0428f53798f0ab8aa1bd37873999041703c742f15ac7e1e');
      expect(s.prv.b58).to.equal('xprv9vHkqa6EV4sPZHYqZznhT2NPtPCjKuDKGY38FBWLvgaDx45zo9WQRUT3dKYnjwih2yJD9mkrocEZXo1ex8G81dwSM1fwqWpWkeS3v86pgKt');
    });

    it('m/0/2147483647\'', function () {
      var key = m.derivePrivate(0)
                 .derivePrivate(2147483647 + 0x80000000);
      var s = key.serialize();

      expect(bits.toHex(key.id)).to.equal('d8ab493736da02f11ed682f88339e720fb0379d1');
      expect(key.address).to.equal('1Lke9bXGhn5VPrBuXgN12uGUphrttUErmk');
      expect(bits.toHex(key.prv)).to.equal('877c779ad9687164e9c2f4f0f4ff0340814392330693ce95a58fe18fd52e6e93');
      expect(bits.toHex(key.pub)).to.equal('03c01e7425647bdefa82b12d9bad5e3e6865bee0502694b94ca58b666abc0a5c3b');
      expect(bits.toHex(key.chain)).to.equal('be17a268474a6bb9c61e1d720cf6215e2a88c5406c4aee7b38547f585c9a37d9');
      expect(s.pub.hex).to.equal('0488b21e025a61ff8effffffffbe17a268474a6bb9c61e1d720cf6215e2a88c5406c4aee7b38547f585c9a37d903c01e7425647bdefa82b12d9bad5e3e6865bee0502694b94ca58b666abc0a5c3b');
      expect(s.pub.b58).to.equal('xpub6ASAVgeehLbnwdqV6UKMHVzgqAG8Gr6riv3Fxxpj8ksbH9ebxaEyBLZ85ySDhKiLDBrQSARLq1uNRts8RuJiHjaDMBU4Zn9h8LZNnBC5y4a');
      expect(s.prv.hex).to.equal('0488ade4025a61ff8effffffffbe17a268474a6bb9c61e1d720cf6215e2a88c5406c4aee7b38547f585c9a37d900877c779ad9687164e9c2f4f0f4ff0340814392330693ce95a58fe18fd52e6e93');
      expect(s.prv.b58).to.equal('xprv9wSp6B7kry3Vj9m1zSnLvN3xH8RdsPP1Mh7fAaR7aRLcQMKTR2vidYEeEg2mUCTAwCd6vnxVrcjfy2kRgVsFawNzmjuHc2YmYRmagcEPdU9');
    });

    it('m/0/2147483647\'/1', function () {
      var key = m.derivePrivate(0)
                 .derivePrivate(2147483647 + 0x80000000)
                 .derivePrivate(1);
      var s = key.serialize();

      expect(bits.toHex(key.id)).to.equal('78412e3a2296a40de124307b6485bd19833e2e34');
      expect(key.address).to.equal('1BxrAr2pHpeBheusmd6fHDP2tSLAUa3qsW');
      expect(bits.toHex(key.prv)).to.equal('704addf544a06e5ee4bea37098463c23613da32020d604506da8c0518e1da4b7');
      expect(bits.toHex(key.pub)).to.equal('03a7d1d856deb74c508e05031f9895dab54626251b3806e16b4bd12e781a7df5b9');
      expect(bits.toHex(key.chain)).to.equal('f366f48f1ea9f2d1d3fe958c95ca84ea18e4c4ddb9366c336c927eb246fb38cb');
      expect(s.pub.hex).to.equal('0488b21e03d8ab493700000001f366f48f1ea9f2d1d3fe958c95ca84ea18e4c4ddb9366c336c927eb246fb38cb03a7d1d856deb74c508e05031f9895dab54626251b3806e16b4bd12e781a7df5b9');
      expect(s.pub.b58).to.equal('xpub6DF8uhdarytz3FWdA8TvFSvvAh8dP3283MY7p2V4SeE2wyWmG5mg5EwVvmdMVCQcoNJxGoWaU9DCWh89LojfZ537wTfunKau47EL2dhHKon');
      expect(s.prv.hex).to.equal('0488ade403d8ab493700000001f366f48f1ea9f2d1d3fe958c95ca84ea18e4c4ddb9366c336c927eb246fb38cb00704addf544a06e5ee4bea37098463c23613da32020d604506da8c0518e1da4b7');
      expect(s.prv.b58).to.equal('xprv9zFnWC6h2cLgpmSA46vutJzBcfJ8yaJGg8cX1e5StJh45BBciYTRXSd25UEPVuesF9yog62tGAQtHjXajPPdbRCHuWS6T8XA2ECKADdw4Ef');
    });

    it('m/0/2147483647\'/1/2147483646\'', function () {
      var key = m.derivePrivate(0)
                 .derivePrivate(2147483647 + 0x80000000)
                 .derivePrivate(1)
                 .derivePrivate(2147483646 + 0x80000000);
      var s = key.serialize();

      expect(bits.toHex(key.id)).to.equal('31a507b815593dfc51ffc7245ae7e5aee304246e');
      expect(key.address).to.equal('15XVotxCAV7sRx1PSCkQNsGw3W9jT9A94R');
      expect(bits.toHex(key.prv)).to.equal('f1c7c871a54a804afe328b4c83a1c33b8e5ff48f5087273f04efa83b247d6a2d');
      expect(bits.toHex(key.pub)).to.equal('02d2b36900396c9282fa14628566582f206a5dd0bcc8d5e892611806cafb0301f0');
      expect(bits.toHex(key.chain)).to.equal('637807030d55d01f9a0cb3a7839515d796bd07706386a6eddf06cc29a65a0e29');
      expect(s.pub.hex).to.equal('0488b21e0478412e3afffffffe637807030d55d01f9a0cb3a7839515d796bd07706386a6eddf06cc29a65a0e2902d2b36900396c9282fa14628566582f206a5dd0bcc8d5e892611806cafb0301f0');
      expect(s.pub.b58).to.equal('xpub6ERApfZwUNrhLCkDtcHTcxd75RbzS1ed54G1LkBUHQVHQKqhMkhgbmJbZRkrgZw4koxb5JaHWkY4ALHY2grBGRjaDMzQLcgJvLJuZZvRcEL');
      expect(s.prv.hex).to.equal('0488ade40478412e3afffffffe637807030d55d01f9a0cb3a7839515d796bd07706386a6eddf06cc29a65a0e2900f1c7c871a54a804afe328b4c83a1c33b8e5ff48f5087273f04efa83b247d6a2d');
      expect(s.prv.b58).to.equal('xprvA1RpRA33e1JQ7ifknakTFpgNXPmW2YvmhqLQYMmrj4xJXXWYpDPS3xz7iAxn8L39njGVyuoseXzU6rcxFLJ8HFsTjSyQbLYnMpCqE2VbFWc');
    });

    it('m/0/2147483647\'/1/2147483646\'/2', function () {
      var key = m.derivePrivate(0)
                 .derivePrivate(2147483647 + 0x80000000)
                 .derivePrivate(1)
                 .derivePrivate(2147483646 + 0x80000000)
                 .derivePrivate(2);
      var s = key.serialize();

      expect(bits.toHex(key.id)).to.equal('26132fdbe7bf89cbc64cf8dafa3f9f88b8666220');
      expect(key.address).to.equal('14UKfRV9ZPUp6ZC9PLhqbRtxdihW9em3xt');
      expect(bits.toHex(key.prv)).to.equal('bb7d39bdb83ecf58f2fd82b6d918341cbef428661ef01ab97c28a4842125ac23');
      expect(bits.toHex(key.pub)).to.equal('024d902e1a2fc7a8755ab5b694c575fce742c48d9ff192e63df5193e4c7afe1f9c');
      expect(bits.toHex(key.chain)).to.equal('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271');
      expect(s.pub.hex).to.equal('0488b21e0531a507b8000000029452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271024d902e1a2fc7a8755ab5b694c575fce742c48d9ff192e63df5193e4c7afe1f9c');
      expect(s.pub.b58).to.equal('xpub6FnCn6nSzZAw5Tw7cgR9bi15UV96gLZhjDstkXXxvCLsUXBGXPdSnLFbdpq8p9HmGsApME5hQTZ3emM2rnY5agb9rXpVGyy3bdW6EEgAtqt');
      expect(s.prv.hex).to.equal('0488ade40531a507b8000000029452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed27100bb7d39bdb83ecf58f2fd82b6d918341cbef428661ef01ab97c28a4842125ac23');
      expect(s.prv.b58).to.equal('xprvA2nrNbFZABcdryreWet9Ea4LvTJcGsqrMzxHx98MMrotbir7yrKCEXw7nadnHM8Dq38EGfSh6dqA9QWTyefMLEcBYJUuekgW4BYPJcr9E7j');
    });
  });
});

describe('Public Derivation', function () {
  describe('Test Vector 1', function () {
    var m = new bitcoin.HDKey(hex.toBits('000102030405060708090a0b0c0d0e0f'));

    it('m/0\'/1', function () {
      var key = m.derivePrivate(0 + 0x80000000)
                 .derivePublic(1);
      var s = key.serialize();

      expect(bits.toHex(key.id)).to.equal('bef5a2f9a56a94aab12459f72ad9cf8cf19c7bbe');
      expect(key.address).to.equal('1JQheacLPdM5ySCkrZkV66G2ApAXe1mqLj');
      expect(bits.toHex(key.pub)).to.equal('03501e454bf00751f24b1b489aa925215d66af2234e3891c3b21a52bedb3cd711c');
      expect(bits.toHex(key.chain)).to.equal('2a7857631386ba23dacac34180dd1983734e444fdbf774041578e9b6adb37c19');
      expect(s.pub.hex).to.equal('0488b21e025c1bd648000000012a7857631386ba23dacac34180dd1983734e444fdbf774041578e9b6adb37c1903501e454bf00751f24b1b489aa925215d66af2234e3891c3b21a52bedb3cd711c');
      expect(s.pub.b58).to.equal('xpub6ASuArnXKPbfEwhqN6e3mwBcDTgzisQN1wXN9BJcM47sSikHjJf3UFHKkNAWbWMiGj7Wf5uMash7SyYq527Hqck2AxYysAA7xmALppuCkwQ');
    });

    it('m/0\'/1/2\'/2', function () {
      var key = m.derivePrivate(0 + 0x80000000)
                 .derivePrivate(1)
                 .derivePrivate(2 + 0x80000000)
                 .derivePublic(2);
      var s = key.serialize();

      expect(bits.toHex(key.id)).to.equal('d880d7d893848509a62d8fb74e32148dac68412f');
      expect(key.address).to.equal('1LjmJcdPnDHhNTUgrWyhLGnRDKxQjoxAgt');
      expect(bits.toHex(key.pub)).to.equal('02e8445082a72f29b75ca48748a914df60622a609cacfce8ed0e35804560741d29');
      expect(bits.toHex(key.chain)).to.equal('cfb71883f01676f587d023cc53a35bc7f88f724b1f8c2892ac1275ac822a3edd');
      expect(s.pub.hex).to.equal('0488b21e04ee7ab90c00000002cfb71883f01676f587d023cc53a35bc7f88f724b1f8c2892ac1275ac822a3edd02e8445082a72f29b75ca48748a914df60622a609cacfce8ed0e35804560741d29');
      expect(s.pub.b58).to.equal('xpub6FHa3pjLCk84BayeJxFW2SP4XRrFd1JYnxeLeU8EqN3vDfZmbqBqaGJAyiLjTAwm6ZLRQUMv1ZACTj37sR62cfN7fe5JnJ7dh8zL4fiyLHV');
    });

    it('m/0\'/1/2\'/2/1000000000', function () {
      var key = m.derivePrivate(0 + 0x80000000)
                 .derivePrivate(1)
                 .derivePrivate(2 + 0x80000000)
                 .derivePublic(2)
                 .derivePublic(1000000000);
      var s = key.serialize();

      expect(bits.toHex(key.id)).to.equal('d69aa102255fed74378278c7812701ea641fdf32');
      expect(key.address).to.equal('1LZiqrop2HGR4qrH1ULZPyBpU6AUP49Uam');
      expect(bits.toHex(key.pub)).to.equal('022a471424da5e657499d1ff51cb43c47481a03b1e77f951fe64cec9f5a48f7011');
      expect(bits.toHex(key.chain)).to.equal('c783e67b921d2beb8f6b389cc646d7263b4145701dadd2161548a8b078e65e9e');
      expect(s.pub.hex).to.equal('0488b21e05d880d7d83b9aca00c783e67b921d2beb8f6b389cc646d7263b4145701dadd2161548a8b078e65e9e022a471424da5e657499d1ff51cb43c47481a03b1e77f951fe64cec9f5a48f7011');
      expect(s.pub.b58).to.equal('xpub6H1LXWLaKsWFhvm6RVpEL9P4KfRZSW7abD2ttkWP3SSQvnyA8FSVqNTEcYFgJS2UaFcxupHiYkro49S8yGasTvXEYBVPamhGW6cFJodrTHy');
    });
  });

  describe('Test Vector 2', function () {
    var m = new bitcoin.HDKey(hex.toBits('fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542'));

    it('m/0', function () {
      var key = m.derivePublic(0);
      var s = key.serialize();

      expect(bits.toHex(key.id)).to.equal('5a61ff8eb7aaca3010db97ebda76121610b78096');
      expect(key.address).to.equal('19EuDJdgfRkwCmRzbzVBHZWQG9QNWhftbZ');
      expect(bits.toHex(key.pub)).to.equal('02fc9e5af0ac8d9b3cecfe2a888e2117ba3d089d8585886c9c826b6b22a98d12ea');
      expect(bits.toHex(key.chain)).to.equal('f0909affaa7ee7abe5dd4e100598d4dc53cd709d5a5c2cac40e7412f232f7c9c');
      expect(s.pub.hex).to.equal('0488b21e01bd16bee500000000f0909affaa7ee7abe5dd4e100598d4dc53cd709d5a5c2cac40e7412f232f7c9c02fc9e5af0ac8d9b3cecfe2a888e2117ba3d089d8585886c9c826b6b22a98d12ea');
      expect(s.pub.b58).to.equal('xpub69H7F5d8KSRgmmdJg2KhpAK8SR3DjMwAdkxj3ZuxV27CprR9LgpeyGmXUbC6wb7ERfvrnKZjXoUmmDznezpbZb7ap6r1D3tgFxHmwMkQTPH');
    });

    it('m/0/2147483647\'/1', function () {
      var key = m.derivePrivate(0)
                 .derivePrivate(2147483647 + 0x80000000)
                 .derivePublic(1);
      var s = key.serialize();

      expect(bits.toHex(key.id)).to.equal('78412e3a2296a40de124307b6485bd19833e2e34');
      expect(key.address).to.equal('1BxrAr2pHpeBheusmd6fHDP2tSLAUa3qsW');
      expect(bits.toHex(key.pub)).to.equal('03a7d1d856deb74c508e05031f9895dab54626251b3806e16b4bd12e781a7df5b9');
      expect(bits.toHex(key.chain)).to.equal('f366f48f1ea9f2d1d3fe958c95ca84ea18e4c4ddb9366c336c927eb246fb38cb');
      expect(s.pub.hex).to.equal('0488b21e03d8ab493700000001f366f48f1ea9f2d1d3fe958c95ca84ea18e4c4ddb9366c336c927eb246fb38cb03a7d1d856deb74c508e05031f9895dab54626251b3806e16b4bd12e781a7df5b9');
      expect(s.pub.b58).to.equal('xpub6DF8uhdarytz3FWdA8TvFSvvAh8dP3283MY7p2V4SeE2wyWmG5mg5EwVvmdMVCQcoNJxGoWaU9DCWh89LojfZ537wTfunKau47EL2dhHKon');
    });

    it('m/0/2147483647\'/1/2147483646\'/2', function () {
      var key = m.derivePrivate(0)
                 .derivePrivate(2147483647 + 0x80000000)
                 .derivePrivate(1)
                 .derivePrivate(2147483646 + 0x80000000)
                 .derivePublic(2);
      var s = key.serialize();

      expect(bits.toHex(key.id)).to.equal('26132fdbe7bf89cbc64cf8dafa3f9f88b8666220');
      expect(key.address).to.equal('14UKfRV9ZPUp6ZC9PLhqbRtxdihW9em3xt');
      expect(bits.toHex(key.pub)).to.equal('024d902e1a2fc7a8755ab5b694c575fce742c48d9ff192e63df5193e4c7afe1f9c');
      expect(bits.toHex(key.chain)).to.equal('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271');
      expect(s.pub.hex).to.equal('0488b21e0531a507b8000000029452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271024d902e1a2fc7a8755ab5b694c575fce742c48d9ff192e63df5193e4c7afe1f9c');
      expect(s.pub.b58).to.equal('xpub6FnCn6nSzZAw5Tw7cgR9bi15UV96gLZhjDstkXXxvCLsUXBGXPdSnLFbdpq8p9HmGsApME5hQTZ3emM2rnY5agb9rXpVGyy3bdW6EEgAtqt');
    });
  });
});
