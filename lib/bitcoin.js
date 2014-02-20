'use strict';

var bitcoin = {
	Address: {},
	util: {},
	base58: {},
	ECKey: {},
	HDKey: {},
	HDMasterKey: {},
	WalletCredentials: {},
	Transaction: {}
};

if(typeof module !== 'undefined' && module.exports) {
  module.exports = bitcoin;
}