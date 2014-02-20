'use strict';

describe('Wallet', function () {
  
  describe('init', function () {
    var wallet = bitcoin.Wallet.init();
    wallet.createStandardAccount();
    // console.log(wallet);
    wallet.createMultiSigAccount([
      new bitcoin.HDKey({
        chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
        compressed: false,
        pub: hex.toBits('041558d6cc3c80504aab547c199161a45bfa726caefa70938a89d3c7cb5ad8c245b01e930bc6c9d489492be16a1c89b13ec0ba36345cf8f9813ff8457d7201d208')
      }),
      new bitcoin.HDKey({
        chain: hex.toBits('9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'),
        compressed: false,
        pub: hex.toBits('041086f00a358a099eb92c9ae7c3a48f0d37ae58c3952edc87a293c9c449e438f993dc90bb34e827040cc2e8ee42d1cc713ed3d99aa4a74bfd859a05278bf64954')
      })
    ])
    // wallet.accounts[1].getNextInternalAddress();
    // console.log(wallet);
  });



});
