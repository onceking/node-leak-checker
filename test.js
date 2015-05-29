var prof = require('v8-profiler');
var fs = require('fs');
var leak = require('./leak');

function gc_age(){
    var ss = [];
    var n = 1 << 14;
    while(n > 0){
	var s = '' + Math.random();
	ss.push(s);
	n -= s.length;
    }
}
function gc(){
    gc_age();
    global.gc();
}


var last_samples = null;
function update_samples(samples){
    last_samples = samples;
}

function stamp(name){
    gc();
    prof.getHeapStats(update_samples, function(){});

    fs.appendFileSync(
	'/tmp/test.out',
	name + ',' + last_samples.join(',') + '\n'
    );
}

prof.startTrackingHeapObjects();
stamp('init');

for(var i=0; i<20; ++i){
    leak.noleak(100);
    stamp('post-noleak' + i);
}

for(var i=0; i<20; ++i){
    leak.leak(100);
    stamp('post-leak' + i);
}
