var listener = require("./index");

listener.on('event', function(eventName, headers, data){
	process.stderr.write("Event: " + eventName + "\n");
	for(a in headers) {
		process.stderr.write( a + ": " + headers[a] + "\n");
	}
	if(data != "") {
		process.stderr.write("data:" + ": " + data + "\n");
	}
	process.stderr.write("\n\n");
});

listener.listen(process.stdin, process.stdout);
