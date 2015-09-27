'use strict';

var exec = require('child_process').exec;
var path = require('path');
var zook = path.join(__dirname + '../../index.js');

/**
 * Execute command with given arguments.
 */
exports.exec = function(args) {
  var cmd = 'node ' + zook + ' ' + args;

  exec(cmd, function(err, stdout, stderr) {
    if (err) {
      console.log('ecec error: ' + err);
      return;
    }
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
  });
};
