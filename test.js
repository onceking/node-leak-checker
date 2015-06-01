var Checker = require('./index');
var leak = require('./leak');

chk = new Checker('/tmp/nlc');

for(var i=0; i<20; ++i){
    leak.noleak(100);
    chk.stamp('post-noleak' + i);
}

for(var i=0; i<20; ++i){
    leak.leak(100);
    chk.stamp('post-leak' + i);
}

chk.stop();
