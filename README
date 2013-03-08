# node-supervisord-eventlistener

This library implements a Supervisord event listener for Node.js.

## Install

`npm install supervisord-eventlistener`

## Usage

```javascript
var supervisor = require("supervisord-eventlistener");
supervisor.on("event", function(name, headers, data) {
  console.error("Event name:", name);
	console.error("Headers:", headers);
	console.error("Data:", data);
});
supervisor.listen(process.stdin, process.stdout);
```

See [http://supervisord.org/events.html](http://supervisord.org/events.html) for more documentation.
