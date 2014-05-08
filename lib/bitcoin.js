'use strict';

var bitcoin = {
	Address: {},
	util: {},
	base58: {},
	ECKey: {},
	HDKey: {},
	HDMasterKey: {},
	Transaction: {},
	mnemonic: {},
	Builder: {}
};

if(typeof module !== 'undefined' && module.exports) {
	bitcoin.sjcl = sjcl;
  module.exports = bitcoin;
}
