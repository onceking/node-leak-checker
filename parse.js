var fs = require('fs');
var readline = require('readline');
var parser = require('heapsnapshot-parser');

var path = process.argv[2];

function arr2map(arr){
    var map = {};
    for(var i=0; i<arr.length; ++i){
	map[arr[i]] = true;
    }
    return map;
}
var NON_LEAKABLE_NAME_MAP = arr2map([
    '(map descriptors)',
    '(transition array)',
    'system',
    'system / TypeFeedbackInfo',
    '(code deopt data)',
    '(function scope info)'
]);
var NON_LEAKABLE_TYPE_MAP = arr2map(['code', 'hidden']);


var heap = parser.parse(fs.readFileSync(path + '.heapsnapshot', {encoding: "utf-8"}));
var buckets = [];

function heap_objs_by_range(from, to){
    var nodes = [];
    for(var i=from; i<=to; ++i){
	var node = heap.nodesById[i];
	if(node){
	    nodes.push(node);
	}
    }
    return nodes;
}

var lines = fs.readFileSync(path + '.log').toString().split("\n");
var last_heap_id = -1;
for(var li=0; li<lines.length; ++li){
    var l = lines[li];
    var parts = l.split(',');
    var label = parts[0];
    var last = parseInt(parts[1], 10);
    for(var i=2; i<parts.length;++i){
	var idx   = parts[i];
	var count = parseInt(parts[++i], 10);
	var size  = parseInt(parts[++i], 10);

	if(buckets[idx] === undefined){
	    buckets[idx] = {
		label: label,
		from: last_heap_id + 1,
		to: last,
		sizes: []
	    };
	    last_heap_id = last;
	}

	buckets[idx].sizes.push({
	    label: label,
	    count: count,
	    size: size
	});
    }
}


console.log('Possible Leaks:');
for(var i=1; i<buckets.length; ++i){
    var b = buckets[i];
    var ss = b.sizes;
    var objs = heap_objs_by_range(b.from, b.to);
    var non_leakale_objs = {};
    var non_leakale_size = 0;

    for(var j=0; j<objs.length; ++j){
	var o = objs[j];
	if(NON_LEAKABLE_TYPE_MAP[o.type] ||
	   NON_LEAKABLE_NAME_MAP[o.name] ||
	   (o.referrers.length == 1 &&
	    (o.referrers[0].name === 'number_string_cache')
	   )
	  ){
	    non_leakale_objs[o.id] = o;
	}
    }

    var changed = true;
    while(changed){
	changed = false;
	for(var j=0; j<objs.length; ++j){
	    var o = objs[j];
	    if(!non_leakale_objs.hasOwnProperty(o.id)){

		var k;
		for(k=0; k<o.referrers.length; ++k){
		    if(!non_leakale_objs.hasOwnProperty(o.referrers[k].fromNode.id)){
			break;
		    }
		}
		if(k === o.referrers.length){
		    non_leakale_objs[o.id] = o;
		    changed = true;
		}
	    }
	}
    }
    Object.keys(non_leakale_objs).forEach(function(id) {
	non_leakale_size += non_leakale_objs[id].self_size;
    });


    if(ss[ss.length-1].size > non_leakale_size){
	console.log('*** ' + b.label + '[' + b.from + ',' + b.to + ']');

	var count = 0;
	var size = 0;
	for(var j=0; j<ss.length; ++j){
	    var s = ss[j];
	    console.log('    @' + s.label +
			'  COUNT: ' + s.count + '/' + (s.count - count) +
			'  SIZE: ' + s.size + '/' + (s.size - size)
		       );
	    size = s.size;
	    count = s.count;
	}

	console.log('    > ' + 'NON-LEAKABLE: ' + non_leakale_size + '/' + size);
	size -= non_leakale_size;
	for(var j=0; j<objs.length; ++j){
	    var o = objs[j];
	    if(!non_leakale_objs.hasOwnProperty(o.id)){
		console.log('    > ' + o.type + ': ' +
			    o.self_size + '/' + size + ': ' +
			    o.toShortString());
		size -= o.self_size;

		for(k=0; k<o.referrers.length; ++k){
		    if(!non_leakale_objs.hasOwnProperty(o.referrers[k].fromNode.id)){
			console.log('    >> ' + heap.nodesById[o.referrers[k].fromNode.id].toShortString());
		    }
		}

	    }
	}
    }
}
