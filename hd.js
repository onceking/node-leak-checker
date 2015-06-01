var fs = require('fs');
var parser = require('heapsnapshot-parser');

var snapshotFile = fs.readFileSync('/tmp/hd.heapsnapshot', {encoding: "utf-8"});
var snapshot = parser.parse(snapshotFile);
