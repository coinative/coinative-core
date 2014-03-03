describe('Mnemonic', function () {

  describe('Word list', function() {
    it('contains 1626 words', function() {
      expect(bitcoin.mnemonic.words.length).equal(1626);
    })
  });

  describe('#decodeHex', function(){
    it('returns empty string when there are less than 3 words', function(){
      var wlist = [ "like", "like" ];
      expect(bitcoin.mnemonic.decodeHex(wlist)).equal('');
    })

    it('works for first word repeated 3 times', function(){
      var wlist = [ "like", "like", "like" ];
      expect(bitcoin.mnemonic.decodeHex(wlist)).equal('00000000');
    })

    it('works for last word repeated 3 times', function(){
      var wlist = [ "weary", "weary", "weary" ];
      expect(bitcoin.mnemonic.decodeHex(wlist)).equal('00000659');
    })

    it('works for the largest combo', function(){
      var wlist = [ "fail", "husband","howl" ];
      expect(bitcoin.mnemonic.decodeHex(wlist)).equal('ffffffff');
    })

    it('works for last 12 words', function(){
      var wlist = [
        "spiral", "squeeze", "strain", "sunset", "suspend", "sympathy",
        "thigh", "throne", "total", "unseen", "weapon", "weary"
      ];

      expect(bitcoin.mnemonic.decodeHex(wlist)).equal('0028644c0028644f0028645200286455');
    })
  })

  describe('#encodeHex', function(){
    it('returns empty passphrase when input is less than 8 characters', function () {
      expect(bitcoin.mnemonic.encodeHex("0000000")).eql([]);
    })

    it('works for first word repeated 3 times', function(){
      var wlist = [ "like", "like", "like" ];
      expect(bitcoin.mnemonic.encodeHex('00000000')).eql(wlist);
    })

    it('works for last word repeated 3 times', function(){
      var wlist = [ "weary", "weary", "weary" ];
      expect(bitcoin.mnemonic.encodeHex('00000659')).eql(wlist);
    })

    it('works for the largest combo', function(){
      var wlist = [ "fail", "husband","howl" ];
      expect(bitcoin.mnemonic.encodeHex('ffffffff'), wlist)
    })

    it('works for last 12 words', function(){
      var wlist = [
        "spiral", "squeeze", "strain", "sunset", "suspend", "sympathy",
        "thigh", "throne", "total", "unseen", "weapon", "weary"
      ];
      expect(bitcoin.mnemonic.encodeHex('0028644c0028644f0028645200286455')).eql(wlist);
    })

    it('throws an exception when the input is not a valid hex string', function () {
      expect(function () { bitcoin.mnemonic.encodeHex('ghijklmnopq12345') } ).to.throw();
    });

    it('test', function(){
      var wlist = [
        "spiral", "squeeze", "strain", "sunset", "suspend", "sympathy",
        "thigh", "throne", "total", "unseen", "weapon", "weary"
      ];

      var mnemonic = bitcoin.mnemonic.encodeUtf8('v19sharky101password123')
      var mnemonicDecoded = bitcoin.mnemonic.decodeUtf8(mnemonic);
      

      console.log(mnemonic);
      console.log(mnemonicDecoded)

      expect(bitcoin.mnemonic.encodeHex('0028644c0028644f0028645200286455')).eql(wlist);
    })

  })
});

  
