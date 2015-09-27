# zook

**Zook** is a command line tool for [Apache ZooKeeper](http://zookeeper.apache.org/). The command should be as simple as like the following:

```
$ zook exists --path /zookeeper/quota
```

This will check the existence of the zookeeper node with given path: `/zookeeper/quota`.

Zook is built on top of [alexguan/node-zookeeper-client](https://github.com/alexguan/node-zookeeper-client) and as that module noted it is currently tested to work with ZooKeeper version 3.4.*.

## Install

Zook is a command like tool so it is strongly recommended to install globally with `-d` option.

```
$ npm install zook -g
```

## Usage

This usage can also be printed by `zook -h` or `zook --help`.

```
Usage: zook <command> [options]

Commands:
  exists  Check existence of a node
  create  Create a node
  remove  Delete a node

Options:
  -s, --server  Comma separated host:port pairs      [default: "localhost:2181"]
  -p, --path    Path of the node                                      [required]
  -h, --help    Show help                                              [boolean]

Examples:
  /home/tatsuyaoiw/.nodebrew/current/bin/
  zook exists -s localhost:2181 -p /
```

## Note

zook is still very early and most of the features are currently work in progress.
