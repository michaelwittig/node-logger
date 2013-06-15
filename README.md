# cinovo-logger

cinovo-logger is an async logger for Node.js with multiple endpoints.

## Getting started

### At first you must install and require the logger.

    npm install cinovo-logger

### Next you must require the module

`````javascript
var logger = require("cinovo-logger");
`````

### Append an endpoint

There are some endpoints available:

* [cinovo-logger-console](https://github.com/cinovo/node-logger-console)
* [cinovo-logger-syslog](https://github.com/cinovo/node-logger-syslog)
* [cinovo-logger-aws](https://github.com/cinovo/node-logger-aws)

You could also write your own endpoint.

If you wish to log to console just:

	npm install cinovo-logger-console

In your JavaScript code append the endpoint.

`````javascript
logger.append(require("cinovo-logger-console")(true, true, true, true));
`````

### Log something

`````javascript
logger.debug("all values are ok");
logger.info("myscript", "all values are ok");
logger.error("myscript", "some values are not ok", {a: 10, b: 20});
logger.exception("myscript", "some values are not ok", new Error("error"));
logger.critical("myscript", "all values are not ok", {a: 10, b: 20}, function(err) { ... });
`````

### Done

Now you can log to multiple endpoints.

## API

### debug, info, error, critical

Depending on the level you want to log choose one of the four methods.

Each method takes 4 arguments
`origin`: String to indicate where the log come from, e. g. the name of the script (optional)
`message`: String to tell what happened
`metadata`: String, Number, Boolean, Array or Object to tell you more about the situation (optional)
`callback`: Function(err) Fired after log was processed by all endpoints (optional)

Examples:

`````javascript
logger.debug("all values are ok");
logger.info("myscript", "all values are ok");
logger.error("myscript", "some values are not ok", {a: 10, b: 20});
logger.critical("myscript", "all values are not ok", {a: 10, b: 20}, function(err) { ... });
`````

### exception

If you want to log an Error there is a special method `exception` which logs as an `error`

It takes 4 arguments
`origin`: String to indicate where the log come from, e. g. the name of the script (optional)
`message`: String to tell what happened
`error`: Error
`callback`: Function(err) Fired after log was processed by all endpoints (optional)

Examples:

`````javascript
logger.exception("some values are not ok", new Error("error"));
logger.exception("myscript", "some values are not ok", new Error("error"));
logger.exception("myscript", "some values are not ok", new Error("error"), function(err) { ... });
`````
