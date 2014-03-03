'use strict';

var bitcoin = {
	Address: {},
	util: {},
	base58: {},
	ECKey: {},
	HDKey: {},
	HDMasterKey: {},
	WalletCredentials: {},
	Transaction: {},
	mnemonic: {}
};

if(typeof module !== 'undefined' && module.exports) {
  module.exports = bitcoin;
}