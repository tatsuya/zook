# zook

**zook** is a command line tool for [Apache ZooKeeper](http://zookeeper.apache.org/), build on top of the module [alexguan/node-zookeeper-client](https://github.com/alexguan/node-zookeeper-client).

## Install

```
$ npm install zook -g
```

## Usage

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
