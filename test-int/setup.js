var exec = require('child_process').exec;
var join = require('path').join;
var fs = require('fs');
var async = require('async');

var bitcoindPath = 'bitcoind';

process.argv.forEach(function (arg) {
  if (arg.indexOf('--bitcoind=') > -1) {
    bitcoindPath = arg.substr(11, arg.length);
  }
});

var rootDir = join(__dirname, '../');
var testnetDir = join(rootDir, 'test-int/deps/bitcoin-testnet-box');

global.bitcoindCmd = function (bitcoindCommand, callback) {
  var command = bitcoindPath + ' --datadir=1 ' + bitcoindCommand; 
  inTestnetDir(command, function (error, stdout, stderr) {
    if (error) {
      throw error
    }
    callback(JSON.parse(stdout));
  });
};

var testnetProcess;

function inTestnetDir(command, callback) {
  return exec(command, { cwd: testnetDir }, callback);
}

function startTestnet(callback) {
  console.log('starting bitcoin-testnet')
  testnetProcess = inTestnetDir('make start BITCOIND="' + bitcoindPath + '"', function (error, stdout, stderr) {
    if (error) {
      throw error
    }
  });
  setTimeout(function () {
    testnetProcess.kill();
    callback();
  }, 15000);
}

function stopTestnet(callback) {
  console.log('stopping bitcoin-testnet')
  testnetProcess = inTestnetDir('make stop BITCOIND="' + bitcoindPath + '"');
  setTimeout(function () {
    inTestnetDir('make clean');
    inTestnetDir('rm 1/bitcoind.pid');
    inTestnetDir('rm 2/bitcoind.pid');
    testnetProcess.kill();
    setTimeout(callback, 1000);
  }, 3000);
}

before(function (done) {
  this.timeout(25000);
  async.waterfall([
    stopTestnet,
    startTestnet
  ], done);
});

after(function (done) {
  this.timeout(10000);
  async.waterfall([
    stopTestnet
  ], done);
});

process.on('exit', function () {
  if (testnetProcess) testnetProcess.kill();
});
