var prof = require('v8-profiler');
var heapdump = require('heapdump');
var fs = require('fs');
var leak = require('./leak');

var last_samples = null;
function update_samples(samples){
    last_samples = samples;
}

function stamp(name){
    var last = prof.getHeapStats(update_samples, function(){});
    fs.writeSync(1, name + ',' + last + ','  + last_samples.join(',') + '\n');
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

heapdump.writeSnapshot('/tmp/hd')
