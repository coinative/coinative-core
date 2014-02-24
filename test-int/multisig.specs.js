var join = require('path').join;
var exec = require('child_process').exec;
var bitcoin = require('../dist/coinative-core-min');

var rootDir = join(__dirname, '../');
var testnetDir = join(rootDir, 'test-int/deps/bitcoin-testnet-box');

describe('Multisig', function () {
	describe('Create P2SH Address', function () {
		it ('test1', function () {
			console.log('running test')
			bitcoindCmd('getbalance', function (res) {
				console.log(res);
			})



		});
 
		//var multiSigKey = bitcoin.MultisigKey()
	})
});