var events = require("events");

var emitter = new events.EventEmitter();
var endpoints = [];
var fullOrigin = false;

function Endpoint(debug, info, error, critial) {
	this.levels = {
		debug: debug,
		info: info,
		error: error,
		critical: critial
	};
	this.logErrCount = 0;
}

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

function getData(level, args) {
	var data = {
		level: level,
		date: new Date(),
		pid: process.pid
	};
	if (args.length >= 3) {
		if (typeof args[0] === "string" && typeof args[1] === "string") {
			data.origin = args[0];
			data.message = args[1];
			data.metadata = args[2];
		} else {
			throw new Error("1. and 2. parameter must be a string");
		}
	} else if (args.length >= 2) {
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
	} else if (args.length >= 1) {
		data.origin = undefined;
		data.message = args[0];
		data.metadata = undefined;
	} else {
		throw new Error("Only 1, 2, 3 or 4 parameters are allowed");
	}
	if (fullOrigin) {
		data.fullOrigin = getFullOrigin();
	}
	return data;
}

function log(level, args) {
	if (endpoints.length === 0) {
		throw new Error("No endpoints appended");
	}
	var data = getData(level, args);
	var callback = undefined;
	if (typeof args[args.length - 1] === "function") {
		callback =  args[args.length - 1];
	}
	emitter.emit(data.level, data);
	var endpointCallbacks = 0, endpointError = undefined;
	endpoints.forEach(function(endpoint) {
		if (endpoint.levels[data.level] === true) {
			endpoint.log(data, function(err) {
				if (err) {
					endpoint.logErrCount += 1;
					endpointError = err;
				}
				endpointCallbacks += 1;
				if (endpointCallbacks ===  endpoints.length) {
					if (callback) {
						callback(endpointError);
					}
				}
			});
		}
	});
}

/**
 * @param [origin] Origin
 * @param message Message
 * @param [metadata] Metadata
 * @param [callback] Callback
 */
exports.debug = function(origin, message, metadata, callback) {
	log("debug", arguments);
};
/**
 * @param [origin] Origin
 * @param message Message
 * @param [metadata] Metadata
 * @param [callback] Callback
 */
exports.info = function(origin, message, metadata, callback) {
	log("info", arguments);
};
/**
 * @param [origin] Origin
 * @param message Message
 * @param [metadata] Metadata
 * @param [callback] Callback
 */
exports.error = function(origin, message, metadata, callback) {
	log("error", arguments);
};
/**
 * @param [origin] Origin
 * @param message Message
 * @param [metadata] Metadata
 * @param [callback] Callback
 */
exports.critical = function(origin, message, metadata, callback) {
	log("critical", arguments);
};
/**
 * @param [origin] Origin
 * @param message Message
 * @param err Error
 * @param [callback] Callback
 */
exports.exception = function(origin, message, err, callback) {
	log("error", arguments);
};
/**
 * @param level [info,err,crit]
 * @param listener function(level, origin)
 */
exports.on = function(level, listener) {
	emitter.on(level, listener);
};
/**
 * @param level [info,err,crit]
 * @param listener function(level, origin)
 */
exports.addListener = function(level, listener) {
	emitter.addListener(level, listener);
};
/**
 * @param level [info,err,crit]
 * @param listener function(level, origin)
 */
exports.once = function(level, listener) {
	emitter.once(level, listener);
};
/**
 * @param level [info,err,crit]
 * @param listener function(level, origin)
 */
exports.removeListener = function(level, listener) {
	emitter.removeListener(level, listener);
};
/**
 * @param [level]
 */
exports.removeAllListeners = function(level) {
	emitter.removeAllListeners(level);
};
exports.append = function(endpoint) {
	endpoints.push(endpoint);
};
exports.Endpoint = Endpoint;
exports.fullOrigin = function() {
	fullOrigin = true;
};
