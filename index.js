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

function toLog(log) {
	log.date = new Date();
	if (log.metadata && typeof log.metadata !== "object") {
		log.metadata = {data: log.metadata};
	}
	var callbacks = 0;
	endpoints.forEach(function(endpoint) {
		if (endpoint.levels[log.level] === true) {
			endpoint.log(log, function(err) {
				if (err) {
					endpoint.logErrCount += 1;
				}
			});
		}
	});
	emitter.emit(log.level, log.level, log.origin);
}

function getOrigin(origin, depth) {
	if (fullOrigin) {
		depth = 3 + depth;
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
		var file = call.substring(i + 1, j).replace(config.getStr("dirName") + "/", "");
		var line = call.substring(j + 1);
		line = line.substring(0, line.indexOf(":"));
		return origin + " " + file + "[" + fn + ":" + line + "] #" + process.pid;
	}
	return origin + "#" + process.pid;
}

/**
 * @param origin Origin
 * @param message Message
 * @param data Data
 * @param originDepth The depth in the stack trace that gives the current execution line of interest (optional, default:=0)
 */
exports.debug = function(origin, message, data, originDepth) {
	originDepth = (originDepth === undefined) ? 0 : originDepth;
	var log = {
		level: "debug",
		origin: getOrigin(origin, originDepth),
		message: message,
		metadata: data
	};
	toLog(log);
};
/**
 * @param origin Origin
 * @param message Message
 * @param data Data
 * @param originDepth The depth in the stack trace that gives the current execution line of interest (optional, default:=0)
 */
exports.info = function(origin, message, data, originDepth) {
	originDepth = (originDepth === undefined) ? 0 : originDepth;
	var log = {
		level: "info",
		origin: getOrigin(origin, originDepth),
		message: message,
		metadata: data
	};
	toLog(log);
};
/**
 * @param origin Origin
 * @param message Message
 * @param data Data
 * @param originDepth The depth in the stack trace that gives the current execution line of interest (optional, default:=0)
 */
exports.error = function(origin, message, data, originDepth) {
	originDepth = (originDepth === undefined) ? 0 : originDepth;
	var log = {
		level: "error",
		origin: getOrigin(origin, originDepth),
		message: message,
		metadata: data
	};
	toLog(log);
};
/**
 * @param origin Origin
 * @param message Message
 * @param data Data
 * @param originDepth The depth in the stack trace that gives the current execution line of interest (optional, default:=0)
 */
exports.critical = function(origin, message, data, originDepth) {
	originDepth = (originDepth === undefined) ? 0 : originDepth;
	var log = {
		level: "critical",
		origin: getOrigin(origin, originDepth),
		message: message,
		metadata: data
	};
	toLog(log);
};
/**
 * @param origin Origin
 * @param message Message
 * @param e Error
 * @param originDepth The depth in the stack trace that gives the current execution line of interest (optional, default:=0)
 */
exports.exception = function(origin, message, e, originDepth) {
	originDepth = (originDepth === undefined) ? 0 : originDepth;
	var log = {
		level: "error",
		origin: getOrigin(origin, originDepth),
		message: message,
		metadata: e.stack
	};
	toLog(log);
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
exports.Endpoint = Endpoint;
fullOrigin = function() {
	fullOrigin = true;
};
