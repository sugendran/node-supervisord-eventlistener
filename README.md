# node-supervisord-eventlistener

This library implements a Supervisord event listener for Node.js.

## Install

`npm install supervisord-eventlistener`

## Usage

**Sample Node.js Program**

```javascript
var supervisor = require("supervisord-eventlistener");
supervisor.on("event", function(type, headers, data) {
	//Gets called for all events
	console.error("Event type:", type);
	console.error("Headers:", headers);
	console.error("Data:", data);
});
supervisor.on("PROCESS_STATE_STOPPING", function(headers, data) {
	//Only called for PROCESS_STATE_STOPPING events
	console.error("Process state stopping");
	console.error("Headers:", headers);
	console.error("Data:", data);
});
supervisor.listen(process.stdin, process.stdout);
```

**Sample Supervisor Configuration**

```
[eventlistener:monitoring]
command = /usr/bin/nodejs /home/user/your_node_program.js
events = PROCESS_STATE,PROCESS_COMMUNICATION,SUPERVISOR_STATE_CHANGE
```


### More Documentation

List of event types: [click here](http://supervisord.org/events.html#event-types)

See [http://supervisord.org/events.html](http://supervisord.org/events.html) for more documentation.
