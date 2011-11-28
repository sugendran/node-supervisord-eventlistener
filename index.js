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
	if(this.headers.eventname){
		self.emit("event", vals.eventname, this.headers, payload);
	}
};

Listener.prototype.listen = function(stdin, stdout) {
	var self = this, data = "", payloadSize = 0;
	stdin.on('data', function(d){
		var s = d.toString('utf-8');
		data += s;
		if(self.waitingForHeaders && data[data.length - 1] == "\n") {
			payloadSize = self.headersReceived(data);
			if(payloadSize == 0){
				self.payloadReceived("");
				self.waitingForHeaders = true;
				data = "";
				stdout.write("READY 2\nOK");				
			} else {
				self.waitingForHeaders = false;
				data = "";
			}
		} else if(data.length >= payloadSize) {
			self.payloadReceived(data);
			self.waitingForHeaders = true;
			data = "";
			stdout.write("READY 2\nOK");
		}
	});

	// start it all off
	this.waitingForHeaders = true;
	stdout.write("READY\n");
};

module.exports = new Listener();