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

#### on, addListener(level, listener)

Adds a listener to the end of the listeners array for the specified evel.

* `level`: String["debug", "warning", "error", "critical"]
* `listener`: Function(level, log)
    * `level`: String["debug", "warning", "error", "critical"]
    * `log`: Log

#### once(level, listener)

Adds a **one time** listener for the level. This listener is invoked only the next time the level is fired, after which it is removed.

* `level`: String["debug", "warning", "error", "critical"]
* `listener`: Function(level, log)
    * `level`: String["debug", "warning", "error", "critical"]
    * `log`: Log

#### removeListener(level, listener)

Remove a listener from the listener array for the specified event.

* `level`: String["debug", "warning", "error", "critical"]
* `listener`: Function(level, log)
    * `level`: String["debug", "warning", "error", "critical"]
    * `log`: Log

#### removeAllListeners([level])

Removes all listeners, or those of the specified event.

* `level`: String["debug", "warning", "error", "critical"] (optional)

### append(appender)

* `appender`: must extend logger.Endpoint see **Custom Endpoint**

### remove(appender, errCallback)

* `appender`: must extend logger.Endpoint see **Custom Endpoint**
* `errCallback`: Function(err)
    * `err`: Error

### stop(errCallback)

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

## Custom Endpoint

TODO
