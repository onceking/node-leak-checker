var prof = require('v8-profiler');
var leak = require('./leak');

var last_samples = null;
function update_samples(samples){
    last_samples = samples;
}

function stamp(name){
    prof.getHeapStats(update_samples, function(){});
    console.log(
	name + ',' + last_samples.join(',')
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
