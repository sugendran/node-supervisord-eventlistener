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

function splitData(line){
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

Listener.prototype.payloadReceived = function(payload, stdout) {
	if(this.headers && this.headers.eventname){
		stdout.write("RESULT 2\nOK");
		this.emit("event", this.headers.eventname, this.headers, payload);
		stdout.write("READY\n");
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
		if(self.waitingForHeaders === true && s.indexOf("\n") !== -1) {
			var br = data.indexOf("\n"),
				headers = data.substring(0, br),
				payloadSize = self.headersReceived(headers),
				remainder = data.substr(br + 1);
			if(payloadSize == 0){
				self.payloadReceived("", stdout);
				self.waitingForHeaders = true;
				data = "";
			} else if(payloadSize == remainder.length) {
				self.payloadReceived(splitData(remainder), stdout);
				self.waitingForHeaders = true;
				data = "";
			} else {
				self.waitingForHeaders = false;
				data = remainder;
			}
		} else if(self.waitingForHeaders !== true && data.length >= payloadSize) {
			self.payloadReceived(splitData(data), stdout);
			self.waitingForHeaders = true;
			data = "";
		}
	});

	// start it all off
	stdout.write("READY\n");
};

module.exports = new Listener();