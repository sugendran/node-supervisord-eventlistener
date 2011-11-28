var events = require('events');

function Listener(){
	events.EventEmitter.call(this);
}

Listener.super_ = events.EventEmitter;
Listener.prototype = Object.create(events.EventEmitter.prototype, {
	constructor:  { 
		value: Listener, 
		enumerable: false 
	}
});

function splitData(data){
	var vals = { };
	line.split(" ").forEach(function(kvp){
		var data = kvp.split(":");
		vals[data[0]] = data[1];
	});
	return vals;
}

Listener.prototype.headersReceived = function(line) {
	this.headers = splitData(line);
	return parseInt(this.headers.len, 10);
};

Listener.prototype.payloadReceived = function(payload) {
	if(this.headers && this.headers.eventname){
		self.emit("event", vals.eventname, this.headers, payload);
	}
};

Listener.prototype.listen = function(stdin, stdout) {
	var self = this, data = "", payloadSize = 0;
	self.waitingForHeaders = true;
	stdin.resume();
	stdin.setEncoding('utf8');
	stdin.on('data', function(d){
		var s = d.toString('utf-8');
		data += s;
		if(self.waitingForHeaders === true && data[data.length - 1] == "\n") {
			payloadSize = self.headersReceived(data);
			if(payloadSize == 0){
				self.payloadReceived("");
				self.waitingForHeaders = true;
				data = "";
				stdout.write("READY 2\nOK");				
				// start it all off
				stdout.write("READY\n");
			} else {
				self.waitingForHeaders = false;
				data = "";
			}
		} else if(self.waitingForHeaders !== true && data.length >= payloadSize) {
			self.payloadReceived(splitData(data));
			self.waitingForHeaders = true;
			data = "";
			stdout.write("READY 2\nOK");
			// start it all off
			stdout.write("READY\n");
		}
	});

	// start it all off
	stdout.write("READY\n");
};

module.exports = new Listener();