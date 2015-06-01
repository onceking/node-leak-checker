var prof = require('v8-profiler');
var heapdump = require("heapdump");
var fs = require('fs');


function Sample(name){
    this.name = name;
    this.last_id = null;
    this.samples = [];
    this.index = Sample.index++;
}
Sample.index = 0;
Sample.prototype.update = function(samples){
    Array.prototype.push.apply(this.samples, samples);
}

function Checker(path){
    this.path = path;
    this.fd = fs.openSync(path + '.log', 'w');

    this.sample = null;

    prof.startTrackingHeapObjects();
    this.stamp('init');
}

Checker.prototype.write_sample = function(){
    if(this.sample !== null && this.sample.last_id !== null){
	fs.writeSync(
	    this.fd,
	    this.sample.name + '-' + this.sample.index + ',' +
		this.sample.last_id + ',' +
		this.sample.samples.join(',') + '\n');
	this.sample = null;
    }
}

Checker.prototype.stamp = function(name){
    var self = this;
    this.sample = new Sample(name);
    this.sample.last_id = prof.getHeapStats(
	function(x){self.sample.update(x);},
	function(){self.write_sample();});
    this.write_sample();
}

Checker.prototype.stop = function(){
    fs.closeSync(this.fd);
    prof.stopTrackingHeapObjects();
    heapdump.writeSnapshot(this.path + '.heapsnapshot')
}


module.exports = Checker;
