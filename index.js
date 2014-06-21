var events = require("events"),
	util = require("util"),
	assert = require("assert-plus"),
	os = require("os"),
	extend = require("extend"),
	lib = require("cinovo-logger-lib"),
	filter = require("./lib/filter");

function getFullOrigin() {
	"use strict";
	var depth = 5,
		e = new Error(),
		stack = e.stack.split("\n"),
		call, i, j, fn, file, line;
	if (stack.length < depth) {
		call = stack[stack.length - 1];
	} else {
		call = stack[depth];
	}
	call = call.replace("    at ", "");
	i = call.indexOf("(");
	j = call.indexOf(":");
	fn = call.substring(0, i - 1);
	file = call.substring(i + 1, j).replace(__dirname + "/", "");
	line = call.substring(j + 1);
	line = line.substring(0, line.indexOf(":"));
	return {
		file: file,
		line: line,
		fn: fn
	};
}

function getData(level, fullOrigin, args) {
	"use strict";
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

function findAndConvertError(o) {
	"use strict";
    var i, k, stack;
	if (Array.isArray(o)) {
        for (i = 0; i < o.length; i += 1) {
            o[i] = findAndConvertError(o[i]);
        }
        return o;
	}
    if (o instanceof Error) {
		stack = (typeof o.stack === "string") ? o.stack.replace(/([ ]{4,4})at /g, "").split("\n") : [];
		return extend({}, o, {
			message: o.message,
			type: (stack.length > 0) ? stack[0].split(":")[0] : "",
			fileName: o.fileName,
			lineNumber: o.lineNumber,
			stack: stack.slice(1)
		});
	}
    if(typeof o === "object") {
		for (k in o) {
            if (o.hasOwnProperty(k)) {
                o[k] = findAndConvertError(o[k]);
            }
        }
        return o;
	}
	return o;
}

function findAndConvertErrorFromArguments(args) {
    "use strict";
	var i;
	for (i = 0; i < args.length; i += 1) {
		args[i] = findAndConvertError(args[i]);
	}
	return args;
}

function Logger(cfg) {
	"use strict";
	events.EventEmitter.call(this);
	this.cfg = cfg || {};
	if (this.cfg.filter === undefined) {
		this.cfg.filter = {"*": true};
	} else {
		filter.assert(this.cfg.filter);
	}
	if (this.cfg.fullOrigin === undefined) {
		this.cfg.fullOrigin = false;
	}
	this.endpoints = [];
	this.stopping = false;
	this.stopped = false;
}
util.inherits(Logger, events.EventEmitter);
Logger.prototype.log = function(level, args) {
	"use strict";
	var callback, data, endpointCallbacks = 0, endpointError, self = this;
	if (this.stopped === true) {
		throw new Error("Already stopped");
	}
	if (this.endpoints.length === 0) {
		throw new Error("No endpoints appended");
	}
	if (typeof args[args.length - 1] === "function") {
		callback =  args[args.length - 1];
		args = Array.prototype.slice.apply(args, [0, args.length - 1]);
	}
	data = getData(level, this.cfg.fullOrigin, args);
	if (filter.filter(data, this.cfg.filter) === false) {
		if (callback) {
			callback();
		}
		return;
	}
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
	"use strict";
	this.log("debug", arguments);
};
Logger.prototype.info = function() {
	"use strict";
	this.log("info", arguments);
};
Logger.prototype.error = function() {
	"use strict";
	this.log("error", arguments);
};
Logger.prototype.exception = function() {
	"use strict";
	this.log("error", findAndConvertErrorFromArguments(arguments));
};

Logger.prototype.append = function(endpoint) {
	"use strict";
	assert.func(endpoint.log, "endpoint.log");
	assert.func(endpoint._log, "endpoint._log");
	assert.func(endpoint.stop, "endpoint.stop");
	assert.func(endpoint._stop, "endpoint._stop");
	if (endpoint.stopping === true) {
		throw new Error("Endpoint stopped");
	}
	var self = this;
	endpoint.on("error", function(err) {
		endpoint.logErrCount += 1;
		self.emit("endpoint_error", endpoint, err);
	});
	this.endpoints.push(endpoint);
};

Logger.prototype.remove = function(endpoint, callback) {
	"use strict";
	assert.func(endpoint.log, "endpoint.log");
	assert.func(endpoint._log, "endpoint._log");
	assert.func(endpoint.stop, "endpoint.stop");
	assert.func(endpoint._stop, "endpoint._stop");
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
	"use strict";
	var endpointCallbacks = 0, endpointError, n = this.endpoints.length, self = this, endpoint;
	function stopcb(err) {
		if (err) {
			endpointError = err;
		}
		endpoint.removeAllListeners();
		endpointCallbacks += 1;
		if (endpointCallbacks === n) {
			self.stopped = true;
			self.endpoints = [];
			self.removeAllListeners();
			callback(endpointError);
		}
	}
	assert.func(callback, "callback");
	if (this.stopping === false) {
		this.stopping = true;
		while(this.endpoints.length > 0) {
			endpoint = this.endpoints.pop();
			endpoint.stop(stopcb);
		}
	} else {
		callback(new Error("Already stopped"));
	}
};

var defaultLogger = new Logger({filter: {"*": true}});
exports.debug = function() {
	"use strict";
	defaultLogger.log("debug", arguments);
};
exports.info = function() {
	"use strict";
	defaultLogger.log("info", arguments);
};
exports.error = function() {
	"use strict";
	defaultLogger.log("error", arguments);
};
exports.critical = function() {
	"use strict";
	defaultLogger.log("critical", arguments);
};
exports.exception = function() {
	"use strict";
	defaultLogger.log("error", findAndConvertErrorFromArguments(arguments));
};
exports.on = function(event, listener) {
	"use strict";
	defaultLogger.on(event, listener);
};
exports.addListener = function(event, listener) {
	"use strict";
	defaultLogger.addListener(event, listener);
};
exports.once = function(event, listener) {
	"use strict";
	defaultLogger.once(event, listener);
};
exports.removeListener = function(event, listener) {
	"use strict";
	defaultLogger.removeListener(event, listener);
};
exports.removeAllListeners = function(event) {
	"use strict";
	defaultLogger.removeAllListeners(event);
};
exports.append = function(endpoint) {
	"use strict";
	defaultLogger.append(endpoint);
};
exports.remove = function(endpoint, callback) {
	"use strict";
	defaultLogger.remove(endpoint, callback);
};
exports.stop = function(callback) {
	"use strict";
	defaultLogger.stop(callback);
};
exports.fullOrigin = function() {
	"use strict";
	defaultLogger.cfg.fullOrigin = true;
};
exports.cfg = defaultLogger.cfg;
exports.createLogger = function(cfg) {
	"use strict";
	return new Logger(cfg);
};
