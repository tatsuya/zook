#!/usr/bin/env node

'use strict';

var util = require('util');
var yargs = require('yargs');
var zookeeper = require('node-zookeeper-client');

var argv = yargs
  .usage('Usage: $0 <command> [options]')
  .command('exists', 'Check existence of a node')
  .command('create', 'Create a node')
  .command('remove', 'Delete a node')
  .demand(1)
  .example('$0 exists -s localhost:2181 -p /')
  .alias('s', 'server')
  .describe('s', 'Comma separated host:port pairs')
  .demand('p')
  .alias('p', 'path')
  .describe('p', 'Path of the node')
  .default({
    server: 'localhost:2181'
  })
  .help('h')
  .alias('h', 'help')
  .argv;

var connectionString = argv.server;
var command = argv._.shift();
var path = argv.path;

var client = zookeeper.createClient(connectionString);

/**
 * Helper function to exit the process with given error message.
 *
 * 1. Close the connection if its state is not DISCONNECTED.
 * 2. Print an given message.
 * 3. Exit the process with status `1`.
 *
 * @param  {message} - Arguments to be passed in console.log().
 */
function exitWithError(message) {
  // Remove first argument from arguments object.
  // Array.prototype.shift.apply(arguments);

  // Check if message exits.
  if (arguments.length) {
    // If message is given then apply to `console.log()`.
    console.log.apply(console, arguments);
  }

  // Close the connection if its state is not DISCONNECTED.
  var state = client.getState();
  if (state !== zookeeper.State.DISCONNECTED) {
    console.log('Closing the connection before exiting...');
    client.close();
  }

  process.exit(1);
}

var INITIAL_CONNECTION_TIMEOUT_MS = 3000;

var timeout = setTimeout(function() {
  exitWithError('Cannot connect to "%s".', connectionString);
}, INITIAL_CONNECTION_TIMEOUT_MS);


client.once('connected', function() {
  // clear initial timeout setting.
  clearTimeout(timeout);

  console.log('Connected to the server.');

  console.log('Running "%s" command.', command);
  switch (command) {
    case 'exists':
      exists();
      break;
    case 'create':
      exitWithError('Command "%s" is not implemented yet.', command)
      break;
    case 'remove':
      remove();
      break;
    default:
      exitWithError('Unsupported command "%s".', command)
  }

  function exists() {
    client.exists(path, function(err, stat) {
      if (err) {
        console.log(err);
        exitWithError('Failed to check existence of a node "%s"', path);
      }

      if (stat) {
        console.log('Node "%s" exists.', path);
      } else {
        console.log('Node "%s" does not exist.', path)
      }

      client.close();
    });
  }

  function remove() {
    client.remove(path, function(err) {
      if (err) {
        console.log(err);
        exitWithError('Failed to remove a node "%s"', path);
      }

      console.log('Node "%s" is deleted.', path);

      client.close();
    });
  }
});

client.once('connectedReadOnly', function() {
  clearTimeout(timeout);
	console.log('connectedReadOnly');
});

client.once('disconnected', function() {
  clearTimeout(timeout);
  console.log('The connection between client and server is dropped.');
});

client.once('expired', function() {
  clearTimeout(timeout);
	console.log('expired')
});

client.once('authenticationFailed', function() {
  clearTimeout(timeout);
	console.log('authenticationFailed')
});

client.connect();
