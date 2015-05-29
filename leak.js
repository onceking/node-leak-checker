function op(arr, n){
    for(var i=0; i<n; ++i){
	var d = new Date(Date.now() + Math.random()*100);
	arr.push(d);
	arr.push(d + '');
	arr.push(d.getTime());
    }
}

var bucket = [];

module.exports = {
    leak: function(n){ op(bucket, n); },
    noleak: function(n){ op([], n); }
}
