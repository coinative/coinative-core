var chai = require('chai');
var bitcoin = require('../dist/coinative-core.min');

var sjcl = require('sjcl');
global.sjcl = sjcl;

var fs = require('fs');
fs.readdirSync('./lib/sjcl-ext').forEach(function (file) {
	require('../lib/sjcl-ext/' + file.substring(0, file.length - 3));
});

var convert = require('./convert');
Object.keys(convert).forEach(function (helper) {
	global[helper] = convert[helper]
});

global.assert = chai.assert;
global.expect = chai.expect;
global.bitcoin = bitcoin;
