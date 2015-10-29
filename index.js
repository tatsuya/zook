#!/usr/bin/env node

'use strict';

var util = require('util');
var zookeeper = require('node-zookeeper-client');

var DEFAULT_ZOOKEEPER_SERVER = 'localhost:2181';

/**
 * Output log only if environment variable DEBUG is enabled.
 */
function debug() {
  if (process.env.DEBUG) {
    // Because arguments is an array-like object, it must be called with Function.prototype.apply().
    console.log('DEBUG: %s', util.format.apply(util, arguments));
  }
}

var argv = require('yargs')
  .usage('Usage: zook <command> [options]')
  .command('exists', 'Check existence of a node', function(yargs) {
    argv = yargs
      .option('s', {
        alias: 'server',
        desc: 'Comma separated host:port pairs'
      })
      .option('p', {
        alias: 'path',
        desc: 'Path of the node',
        required: true
      })
      .default({
        server: DEFAULT_ZOOKEEPER_SERVER
      })
      .help('h')
      .alias('h', 'help')
      .argv;
  })
  .command('create', 'Create a node', function(yargs) {
    argv = yargs
      .option('s', {
        alias: 'server',
        desc: 'Comma separated host:port pairs'
      })
      .option('p', {
        alias: 'path',
        desc: 'Path of the node',
        required: true
      })
      .option('d', {
        alias: 'data',
        desc: 'Data assosiated with the node'
      })
      .default({
        server: DEFAULT_ZOOKEEPER_SERVER
      })
      .help('h')
      .alias('h', 'help')
      .argv;
  })
  .command('remove', 'Delete a node', function(yargs) {
    argv = yargs
      .option('s', {
        alias: 'server',
        desc: 'Comma separated host:port pairs'
      })
      .option('p', {
        alias: 'path',
        desc: 'Path of the node',
        required: true
      })
      .default({
        server: DEFAULT_ZOOKEEPER_SERVER
      })
      .help('h')
      .alias('h', 'help')
      .argv;
  })
  .demand(1)
  .option('s', {
    alias: 'server',
    desc: 'Comma separated host:port pairs'
  })
  .example('zook exists -s localhost:2181 -p /zookeeper/quota')
  .help('h')
  .alias('h', 'help')
  .version(function() {
    return require('./package').version;
  })
  .argv;

var commands = {
  exists: function() {
    client.exists(path, function(err, stat) {
      if (err) {
        console.log(err);
        exit(1, 'Failed to check existence of a node "%s".', path);
      }

      if (stat) {
        console.log('Node "%s" exists.', path);
      } else {
        console.log('Node "%s" does not exist.', path)
      }
    });
  },
  create: function() {
    var data = argv.data ? new Buffer(argv.data) : null;
    client.create(path, data, function(err) {
      if (err) {
        var code = err.getCode();
        switch (code) {
          case zookeeper.Exception.NODE_EXISTS:
            exit(1, 'Failed to create a node "%s" because the node already exists.', path);
            break;
          case zookeeper.Exception.NO_NODE:
            exit(1, 'Failed to create a node "%s" because the node does not exist.', path);
            break;
          default:
            console.log(err);
            exit(1, 'Failed to create a node "%s".', path);
        }
      }

      if (data) {
        exit(0, 'Node "%s" is created with data "%s".', path, argv.data);
      } else {
        exit(0, 'Node "%s" is created.', path);
      }
    });
  },
  remove: function() {
    client.remove(path, function(err) {
      if (err) {
        var code = err.getCode();
        switch (code) {
          case zookeeper.Exception.NO_NODE:
            exit(1, 'Failed to remove a node "%s" because the node does not exist.', path);
            break;
          default:
            console.log(err);
            exit(1, 'Failed to remove a node "%s".', path);
        }
      }

      exit(0, 'Node "%s" is deleted.', path);
    });
  }
};

var commandName = argv._.shift();
var command = commands[commandName];
if (!command) {
  console.log('Unsupported command "%s".', commandName);
  process.exit(1);
}

var connectionString = argv.server;
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
function exit(code, message) {
  // Remove first argument (exit code) from arguments object.
  Array.prototype.shift.apply(arguments);

  // Check if message exits.
  if (arguments.length) {
    // If message is given then apply to `console.log()`.
    console.log.apply(console, arguments);
  }

  // Close the connection if its state is not DISCONNECTED.
  var state = client.getState();
  if (state !== zookeeper.State.DISCONNECTED) {
    debug('Closing the connection before exiting...');
    client.close();
  }

  process.exit(code);
}

var INITIAL_CONNECTION_TIMEOUT_MS = 3000;

var timeout = setTimeout(function() {
  exit(1, 'Cannot connect to "%s".', connectionString);
}, INITIAL_CONNECTION_TIMEOUT_MS);

client.once('connected', function() {
  // clear initial timeout setting.
  clearTimeout(timeout);

  debug('Connected to the server.');

  debug('Running "%s" command.', commandName);
  command();

  client.close();
});

client.once('connectedReadOnly', function() {
  clearTimeout(timeout);
	debug('connectedReadOnly');
});

client.once('disconnected', function() {
  clearTimeout(timeout);
  debug('The connection between client and server is dropped.');
});

client.once('expired', function() {
  clearTimeout(timeout);
	debug('expired')
});

client.once('authenticationFailed', function() {
  clearTimeout(timeout);
	debug('authenticationFailed')
});

client.connect();
