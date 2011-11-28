var listener = require("./index");

listener.on('event', function(eventName, headers, data){
	process.stderr.write("Event: " + eventName + "\n");
	for(a in headers) {
		process.stderr.write( a + ": " + headers[a] + "\n");
	}
	if(data !== "") {
		for(a in data) {
			process.stderr.write( a + ": " + data[a] + "\n");
		}
	}
	process.stderr.write("\n\n");
});

listener.listen(process.stdin, process.stdout);
