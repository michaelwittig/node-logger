var events = require("events"),
	util = require("util"),
	assert = require("assert-plus"),
	os = require("os"),
	filter = require("./lib/filter");

function getFullOrigin() {
	var depth = 5;
	var e = new Error();
	var stack = e.stack.split("\n");
	var call;
	if (stack.length < depth) {
		call = stack[stack.length - 1];
	} else {
		call = stack[depth];
	}
	call = call.replace("    at ", "");
	var i = call.indexOf("(");
	var j = call.indexOf(":");
	var fn = call.substring(0, i - 1);
	var file = call.substring(i + 1, j).replace(__dirname + "/", "");
	var line = call.substring(j + 1);
	line = line.substring(0, line.indexOf(":"));
	return {
		file: file,
		line: line,
		fn: fn
	};
}

function getData(level, fullOrigin, args) {
	var data = {
		level: level,
		date: new Date(),
		pid: process.pid,
		hostname: os.hostname()
	};
	if (args.length === 3) {
		if (typeof args[0] === "string" && typeof args[1] === "string") {
			data.origin = args[0];
			data.message = args[1];
			data.metadata = args[2];
		} else {
			throw new Error("1. and 2. parameter must be a string");
		}
	} else if (args.length === 2) {
		if (typeof args[0] === "string" && typeof args[1] === "string") {
			data.origin = args[0];
			data.message = args[1];
			data.metadata = undefined;
		} else if (typeof args[0] === "string") {
			data.origin = undefined;
			data.message = args[0];
			data.metadata = args[1];
		} else {
			throw new Error("1. parameter must be a string");
		}
	} else if (args.length === 1) {
		data.origin = undefined;
		data.message = args[0];
		data.metadata = undefined;
	} else {
		throw new Error("Only 1, 2 or 3 parameters are allowed");
	}
	if (fullOrigin) {
		data.fullOrigin = getFullOrigin();
	}
	return data;
}

function extractError(arguments) {
	var i;
	for (i = 0; i < arguments.length; i += 1) {
		var arg = arguments[i];
		if (arg instanceof Error) {
			var stack = (typeof arg.stack === "string") ? arg.stack.replace(/    at /g, "").split("\n") : [];
			arguments[i] = {
				message: arg.message,
				type: (stack.length > 0) ? stack[0].split(":")[0] : "",
				fileName: arg.fileName,
				lineNumber: arg.lineNumber,
				stack: stack.slice(1)
			};
		}
	}
	return arguments;
}

function Endpoint(debug, info, error, critical, name) {
	assert.bool(debug, "debug");
	assert.bool(info, "info");
	assert.bool(error, "error");
	assert.bool(critical, "critical");
	assert.string(name, "name");
	events.EventEmitter.call(this);
	this.levels = {
		debug: debug,
		info: info,
		error: error,
		critical: critical
	};
	this.name = name;
	this.logErrCount = 0;
}
util.inherits(Endpoint, events.EventEmitter);

function Logger(cfg) {
	events.EventEmitter.call(this);
	this.cfg = cfg || {};
	if (this.cfg.filter) {
		filter.assert(this.cfg.filter);
	}
	if (this.cfg.fullOrigin === undefined) {
		this.cfg.fullOrigin = false;
	}
	this.endpoints = [];
	this.stopped = false;
}
util.inherits(Logger, events.EventEmitter);
Logger.prototype.log = function(level, args) {
	if (this.stopped === true) {
		new Error("Already stopped");
	}
	if (this.endpoints.length === 0) {
		throw new Error("No endpoints appended");
	}
	var callback = undefined;
	if (typeof args[args.length - 1] === "function") {
		callback =  args[args.length - 1];
		args = Array.prototype.slice.apply(args, [0, args.length - 1]);
	}
	var data = getData(level, this.cfg.fullOrigin, args);
	if (this.cfg.filter) {
		if (filter.filter(data, this.cfg.filter) === false) {
			if (callback) {
				callback();
			}
			return;
		}
	}
	var endpointCallbacks = 0, endpointError = undefined;
	var self = this;
	this.endpoints.forEach(function(endpoint) {
		if (endpoint.levels[data.level] === true) {
			endpoint.log(data, function(err) {
				if (err) {
					endpoint.logErrCount += 1;
					endpointError = err;
					self.emit("endpoint_error", endpoint, err);
				}
				endpointCallbacks += 1;
				if (endpointCallbacks ===  self.endpoints.length) {
					if (callback) {
						callback(endpointError);
					} else {
						if (endpointError) {
							self.emit("error", endpointError);
						}
					}
				}
			});
		}
	});
	this.emit("level_" + data.level, data);
};
Logger.prototype.debug = function() {
	this.log("debug", arguments);
};
Logger.prototype.info = function() {
	this.log("info", arguments);
};
Logger.prototype.error = function() {
	this.log("error", arguments);
};
Logger.prototype.exception = function() {
	this.log("error", extractError(arguments));
};

Logger.prototype.append = function(endpoint) {
	assert.ok(endpoint instanceof Endpoint, "endpoint");
	assert.func(endpoint.log, "endpoint.log");
	assert.func(endpoint.stop, "endpoint.stop");
	// TODO check if the endpoint was stopped before
	var self = this;
	endpoint.on("error", function(err) {
		endpoint.logErrCount += 1;
		self.emit("endpoint_error", endpoint, err);
	});
	this.endpoints.push(endpoint);
};

Logger.prototype.remove = function(endpoint, callback) {
	assert.ok(endpoint instanceof Endpoint, "endpoint");
	assert.func(endpoint.log, "endpoint.log");
	assert.func(endpoint.stop, "endpoint.stop");
	assert.func(callback, "callback");
	var idx = this.endpoints.indexOf(endpoint);
	if (idx !== -1) {
		this.endpoints.splice(idx, 1);
		endpoint.stop(function(err) {
			endpoint.removeAllListeners();
			if (err)  {
				callback(err);
			} else {
				callback();
			}
		});
	} else {
		callback(new Error("Endpoint was not appended"));
	}
};
Logger.prototype.stop = function(callback) {
	assert.func(callback, "callback");
	if (this.stopped === false) {
		this.stopped = true;
		var endpointCallbacks = 0, endpointError = undefined, n = this.endpoints.length, self = this;
		this.endpoints.forEach(function(endpoint) {
			endpoint.stop(function(err) {
				if (err) {
					endpointError = err;
				}
				endpoint.removeAllListeners();
				endpointCallbacks += 1;
				if (endpointCallbacks === n) {
					self.endpoints = [];
					self.removeAllListeners();
					callback(endpointError);
				}
			});
		});
	} else {
		callback(new Error("Already stopped"));
	}
};

var defaultLogger = new Logger({filter: {"*": true}});

exports.debug = function(origin, message, metadata, callback) {
	defaultLogger.log("debug", arguments);
};
exports.info = function(origin, message, metadata, callback) {
	defaultLogger.log("info", arguments);
};
exports.error = function(origin, message, metadata, callback) {
	defaultLogger.log("error", arguments);
};
exports.critical = function(origin, message, metadata, callback) {
	defaultLogger.log("critical", arguments);
};
exports.exception = function(origin, message, err, callback) {
	defaultLogger.log("error", extractError(arguments));
};
exports.on = function(event, listener) {
	defaultLogger.on(event, listener);
};
exports.addListener = function(event, listener) {
	defaultLogger.addListener(event, listener);
};
exports.once = function(event, listener) {
	defaultLogger.once(event, listener);
};
exports.removeListener = function(event, listener) {
	defaultLogger.removeListener(event, listener);
};
exports.removeAllListeners = function(event) {
	defaultLogger.removeAllListeners(event);
};
exports.append = function(endpoint) {
	defaultLogger.append(endpoint);
};
exports.remove = function(endpoint, callback) {
	defaultLogger.remove(endpoint, callback);
};
exports.stop = function(callback) {
	defaultLogger.stop(callback);
};
exports.fullOrigin = function() {
	defaultLogger.cfg.fullOrigin = true;
};
exports.cfg = defaultLogger.cfg;
exports.Endpoint = Endpoint;
exports.createLogger = function(cfg) {
	return new Logger(cfg);
};
