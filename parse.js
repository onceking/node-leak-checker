var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

var buckets = [];
rl.on('line', function(l){
    var parts = l.split(',');
    var label = parts[0];
    for(var i=1; i<parts.length;++i){
	var idx   = parts[i];
	var count = parseInt(parts[++i], 10);
	var size  = parseInt(parts[++i], 10);

	if(buckets[idx] === undefined){
	    buckets[idx] = [];
	}

	buckets[idx].push({
	    label: label,
	    count: count,
	    size: size
	});
    }
});

rl.on('close', function(){
    var leaks_by_label = [];
    var label_map = {};

    for(var i=0; i<buckets.length; ++i){
	var b = buckets[i];
	if(b !== undefined && b[b.length-1].size !== 0){
	    if(label_map[b[0].label] === undefined){
		label_map[b[0].label] = leaks_by_label.length;
		leaks_by_label[label_map[b[0].label]] = [];
	    }
	    leaks_by_label[label_map[b[0].label]].push(i);
	}
    }

    if(leaks_by_label.length > 0){
	console.log('Possible Leaks:');
	for(var i=0; i<leaks_by_label.length; ++i){
	    var l = leaks_by_label[i];
	    var b0 = buckets[l[0]][0];

	    console.log('** ' + b0.label);

	    for(var j=0; j<l.length; ++j){
		var bs = buckets[l[j]];
		var count = 0;
		var size = 0;
		for(var k=0; k<bs.length; ++k){
		    var b = bs[k];
		    console.log(
			'**** @' + b.label +
			    '  COUNT: ' + b.count + '/' + (b.count - count) +
			    '  SIZE: ' + b.size + '/' + (b.size - size)
		    );
		    size = b.size;
		    count = b.count;
		}
	    }
	}
    }

});
