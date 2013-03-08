/* Documentation for Supervisord's event listener protocol can be found
here: http://supervisord.org/events.html */

var EventEmitter = require('events').EventEmitter,
	util = require('util');

function Listener() {
	EventEmitter.call(this);
}
util.inherits(Listener, EventEmitter);

/* Key-value pairs are delimited by a single space in a given line.
	The key and value in the key-value pair are separated by a colon `:`
	Example line: `process_name:foo group_name:bar pid:123`
*/
function splitData(line) {
	var vals = {};
	line.split(" ").forEach(function(kvp){
		var data = kvp.split(":");
		vals[data[0]] = data[1];
	});
	return vals;
}

/* Parses a header line and returns the length of the payload to follow. */
Listener.prototype.headersReceived = function(line) {
	this.headers = splitData(line);
	return parseInt(this.headers.len, 10);
};

/* Emits "event" with the event name, headers, and payload. Then, we tell
Supervisord that we are ready to receive more events. */
Listener.prototype.payloadReceived = function(payload, stdout) {
	if(this.headers && this.headers.eventname) {
		stdout.write("RESULT 2\nOK");
		this.emit("event", this.headers.eventname, this.headers, payload);
		this.emit(this.headers.eventname, this.headers, payload);
		stdout.write("READY\n");
	}
};

/* Start listening for events on `stdin` */
Listener.prototype.listen = function(stdin, stdout) {
	//Set initial state
	var self = this,
		data = "",
		payloadSize;
	//If I'm not waiting for headers, I'm waiting for the payload
	self.waitingForHeaders = true;
	//Start reading from stdin
	stdin.resume();
	stdin.setEncoding('utf8');
	stdin.on('data', function(str) {
		data += str;
		//Parse headers
		if(self.waitingForHeaders === true && str.indexOf("\n") !== -1) {
			//We now have the headers
			var br = data.indexOf("\n"),
				headers = data.substring(0, br),
				payloadSize = self.headersReceived(headers);
				//ignore "\n" and put remainder back into `data`
				data = data.substr(br + 1);
			if(payloadSize == 0) {
				//No payload; go ahead and emit "event"
				self.payloadReceived(null, stdout);
				//self.waitingForHeaders = true;
				//wait for next header...
			} else {
				//We need to parse the payload
				self.waitingForHeaders = false;
			}
		}
		//Parse payload
		if(self.waitingForHeaders !== true && data.length >= payloadSize) {
			//We now have the payload
			var payload = data.substr(0, payloadSize);
			//put the remainder back into `data`
			data = data.substr(payloadSize);
			//Parse payload and emit "event"
			self.payloadReceived(splitData(payload), stdout);
			self.waitingForHeaders = true;
		}
	});
	//Tell Supervisord that I'm ready to receive events
	stdout.write("READY\n");
};

module.exports = new Listener();
