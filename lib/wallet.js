'use strict';

bitcoin.Wallet = {};

(function () {

	var Account = function (HDKey) {
		this.addresses = [];
		this.internalAddresses = [];

		this.HDKey = HDKey.derivePublic(0);
		this.HDKeyInternal = HDKey.derivePublic(1);
	};

	Account.prototype.getNextInternalAddress = function () {
		var hdKey = this.HDKeyInternal.derivePublic(this.internalAddresses.length);
		this.internalAddresses.push(hdKey.address);
		return hdKey;
	}

	Account.createTx = function (unspent, amount, address, fee) {

	};


	var Wallet = bitcoin.Wallet = function (masterKey) {
		this.masterKey = masterKey;
		this.accounts = [];
	};

	Wallet.prototype.createStandardAccount = function () {
		// 0x80000000 enforces private key derivation, preventing a leak down the chain compromising
		// the master.
		var account = new Account(this.masterKey.derivePrivate(this.accounts.length + 0x80000000));
		this.accounts.push(account);
	};

	Wallet.prototype.createMultiSigAccount = function (otherParties, reqSigs, unsorted) {
		var multiSigKey = new bitcoin.MultiSigKey([this.masterKey.derivePrivate(this.accounts.length + 0x80000000)].concat(otherParties), reqSigs, unsorted);
		var account = new Account(multiSigKey);
		this.accounts.push(account);
	}



	Wallet.init = function () {
		var masterKey = new bitcoin.HDMasterKey();
		return new Wallet(masterKey);
	};

})();