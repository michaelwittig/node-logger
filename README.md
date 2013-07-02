`````
                                                   ___
       __                                         /\_ \
  ___ /\_\    ___     ___   __  __    ___         \//\ \     ___      __      __      __   _ __
 /'___\/\ \ /' _ `\  / __`\/\ \/\ \  / __`\  _______\ \ \   / __`\  /'_ `\  /'_ `\  /'__`\/\`'__\
/\ \__/\ \ \/\ \/\ \/\ \L\ \ \ \_/ |/\ \L\ \/\______\\_\ \_/\ \L\ \/\ \L\ \/\ \L\ \/\  __/\ \ \/
\ \____\\ \_\ \_\ \_\ \____/\ \___/ \ \____/\/______//\____\ \____/\ \____ \ \____ \ \____\\ \_\
 \/____/ \/_/\/_/\/_/\/___/  \/__/   \/___/          \/____/\/___/  \/___L\ \/___L\ \/____/ \/_/
                                                                      /\____/ /\____/
                                                                      \_/__/  \_/__/
`````

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
* [cinovo-logger-file](https://github.com/cinovo/node-logger-file)
* [cinovo-logger-syslog](https://github.com/cinovo/node-logger-syslog)
* [cinovo-logger-aws](https://github.com/cinovo/node-logger-aws)

You could also write your own endpoint (see Custom Endpoint).

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

### debug, info, error, critical([origin], message, [metadata], [callback])

Depending on the level you want to log choose one of the four methods.

* `origin`: String to indicate where the log come from, e. g. the name of the script (optional)
* `message`: String to tell what happened
* `metadata`: String, Number, Boolean, Array or Object to tell you more about the situation (optional)
* `callback`: Function(err) Fired after log was processed by all endpoints (optional)
    * `err`: Error (optional)

**Examples:**

`````javascript
logger.debug("all values are ok");
logger.info("myscript", "all values are ok");
logger.error("myscript", "some values are not ok", {a: 10, b: 20});
logger.critical("myscript", "all values are not ok", {a: 10, b: 20}, function(err) { ... });
`````

### exception([origin], message, error, [callback])

If you want to log an Error there is a special method `exception` which logs as an `error`

* `origin`: String to indicate where the log come from, e. g. the name of the script (optional)
* `message`: String to tell what happened
* `error`: Error
* `callback`: Function(err) Fired after log was processed by all endpoints (optional)
    * `err`: Error (optional)

**Examples:**

`````javascript
logger.exception("some values are not ok", new Error("error"));
logger.exception("myscript", "some values are not ok", new Error("error"));
logger.exception("myscript", "some values are not ok", new Error("error"), function(err) { ... });
`````

### Log

The log object contains the following fields:

`````
{
	level: String["debug", "warning", "error", "critical"]
	date: Date
	pid: Number
	hostname: String
	origin: String to indicate where the log come from, e. g. the name of the script (optional)
	message: String to tell what happened
	metadata: String, Number, Boolean, Array or Object to tell you more about the situation (optional)
	fullOrigin: {
		file: String of the file name,
		line: Number of the line,
		fn: String of the invoked function name
	} (optional)
}
`````

### EventEmitter

The cinovo-logger is also an [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter).

#### on, addListener(event, listener)

Adds a listener to the end of the listeners array for the specified event.

* `event`: String
* `listener`: Function - see Events for signature

#### once(event, listener)

Adds a **one time** listener for the event. This listener is invoked only the next time the level is fired, after which it is removed.

* `event`: String
* `listener`: Function - see Events for signature

#### removeListener(event, listener)

Remove a listener from the listener array for the specified event.

* `event`: String
* `listener`: Function - see Events for signature

#### removeAllListeners([event])

Removes all listeners, or those of the specified event.

* `event`: String (optional)

### append(appender)

* `appender`: must extend logger.Endpoint see **Custom Endpoint**

### remove(appender, callback)

* `appender`: must extend logger.Endpoint see **Custom Endpoint**
* `errCallback`: Function(err)
    * `err`: Error

### stop(callback)

Stop all endpoints to avoid data loss.

* `errCallback`: Function(err)
    * `err`: Error

### fullOrigin()

Activates `fullOrigin` output in `log`. Locates the caller of an log function `debug`, `info`, `error`, `exception`, `critical` by:

`````
{
	file: String of the file name,
	line: Number of the line,
	fn: String of the invoked function name
}
`````

### Events

#### level_debug(log)

On `debug` log.

* `log`: Log

#### level_info(log)

On `info` log.

* `log`: Log

#### level_error(log)

On `error` log.

* `log`: Log

#### level_critical(log)

On `critical` log.

* `log`: Log

#### error(err)

If you use on of the log methods `debug`, `info`, `error`, `exception`, `critical` without the optional `callback` and an Error occurs it is emitted.

* `err`: Error

#### endpoint_error(endpoint, err)

If an endpoint.log() returned an error or an error was emitted by an endpoint.

* `endpoint`: Endpoint
* `err`: Error

## Custom Endpoint

You must extend the cinovo-logger.Endpoint.

`````javascript
var logger = require("cinovo-logger");
function CustomEndpoint(debug, info, error, critical) {
	logger.Endpoint.call(this, debug, info, error, critical, "customName");
}
util.inherits(CustomEndpoint, logger.Endpoint);
````

And you must implement at least this two methods:
`````javascript
CustomEndpoint.prototype.log = function(log, callback) {
	// write the log object and call the callback if the log is written
	callback();
};
CustomEndpoint.prototype.stop = function(callback) {
	/// stop the endpoint, call the callback if finished and all logs are written
	callback();
};
`````
