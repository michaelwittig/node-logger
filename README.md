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

[![Build Status](https://secure.travis-ci.org/cinovo/node-logger.png)](http://travis-ci.org/cinovo/node-logger)
[![NPM version](https://badge.fury.io/js/cinovo-logger.png)](http://badge.fury.io/js/cinovo-logger)

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
* [cinovo-logger-notificationcenter](https://github.com/cinovo/node-logger-notificationcenter)
* [cinovo-logger-loggly](https://github.com/cinovo/node-logger-loggly)

You could also write your own endpoint (see Custom Endpoint).

If you wish to log to console just:

	npm install cinovo-logger-console

In your JavaScript code append the endpoint.

`````javascript
logger.append(require("cinovo-logger-console")(true, true, true, true));
`````

If you wish to log to syslog just:

	npm install cinovo-logger-syslog

In your JavaScript code append the endpoint.

`````javascript
logger.append(require("cinovo-logger-syslog").local(true, true, true, true, "test", "local0"));
`````

You could also log to [file](https://github.com/cinovo/node-logger-file), [AWS (S3, SQS, SNS)](https://github.com/cinovo/node-logger-aws), [Mac OS X Notification Center](https://github.com/cinovo/node-logger-notificationcenter) or [Loggly](https://github.com/cinovo/node-logger-loggly)

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

## Integrate

You are likely to use some other npms so we tried to integrate cinovo-logger with some popular npms by providing wrapprs:

* [cinovo-logger-socket.io](https://github.com/cinovo/node-logger-socket.io)

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
	level: String["debug", "info", "error", "critical"]
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

### append(endpoint)

* `endpoint`: must extend Endpoint see **Custom Endpoint**

### remove(endpoint, callback)

* `endpoint`: must extend Endpoint see **Custom Endpoint**
* `callback`: Function(err)
    * `err`: Error

### stop(callback)

Stop all endpoints to avoid data loss.

* `callback`: Function(err)
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

## Advanced Stuff

### Multiple logger instances

From time to time it makes sense to have more than one logger instance.

`````javascript
var myLogger = require("cinovo-logger").createLogger();

myLogger.append(require("cinovo-logger-console")(true, true, true, true));

myLogger.debug("all values are ok");
`````

### Configuration

You can configure the logger during creation or after creation.

**during creation:**

`````javascript
var cfg = {
	fullOrigin: false,
	filter: {
		"*": true
	}
};
var myLogger = require("cinovo-logger").createLogger(cfg);
`````

**after creation:**

`````javascript
var logger = require("cinovo-logger");
// do something
logger.cfg.fullOrigin = true;
`````

#### Options

There are several options available:

##### fullOrigin

`Boolean` - Activates `fullOrigin` output in `log`. (default: `false`)

**Examples:**

`````javascript
var cfg = {
	fullOrigin: true
};
`````

##### filter

`Object` - Allow or block `log` from `origin` and/or `level`. (default: `{"*": true}`)

**Examples:**

`````javascript`
var cfg = {
	filter: {
		"*": false,					// block everything (required)
		"*/critical": true,			// but allow critical `level`
		"myorigin/*": true,			// and allow everything from `origin` myorigin
		"yourorigin/debug": true,	// and allow everything from `origin` yourorigin and `level` debug
	}
};
`````

### Custom Endpoint

You must extend the cinovo-logger.lib.Endpoint.

`````javascript
var lib = require("cinovo-logger-lib");
function CustomEndpoint(debug, info, error, critical) {
	lib.Endpoint.call(this, debug, info, error, critical, "customName");
}
util.inherits(CustomEndpoint, lib.Endpoint);
`````

And you must implement at least this two methods:

`````javascript
CustomEndpoint.prototype._log = function(log, callback) {
	// write the log object and call the callback if the log is written
	callback();
};
CustomEndpoint.prototype._stop = function(callback) {
	// stop the endpoint, call the callback if finished and all logs are written
	try {
    	callback();
    } finally {
    	this.emit("stop");
    }
};
`````
