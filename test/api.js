var assert = require("assert-plus"),
	util = require("util"),
	logger = require("../index"),
	lib = require("cinovo-logger-lib");

var EMPTY_CB = function() {
	"use strict";
	return;
};

function DummyEndpoint() {
	"use strict";
	lib.Endpoint.call(this, true, true, true, true, "dummy");
}
util.inherits(DummyEndpoint, lib.Endpoint);
/*jslint unparam: true*/
DummyEndpoint.prototype._log = function(log, errCallback) {
	"use strict";
	errCallback();
};
/*jslint unparam: false*/
DummyEndpoint.prototype._stop = function(errCallback) {
	"use strict";
	errCallback();
};

function ErrorEndpoint() {
	"use strict";
	lib.Endpoint.call(this, true, true, true, true, "error");
}
util.inherits(ErrorEndpoint, lib.Endpoint);
/*jslint unparam: true*/
ErrorEndpoint.prototype._log = function(log, errCallback) {
	"use strict";
	errCallback(new Error("error"));
};
/*jslint unparam: false*/
ErrorEndpoint.prototype._stop = function(errCallback) {
	"use strict";
	errCallback();
};

logger.append(new DummyEndpoint());
logger.fullOrigin();

describe("API", function() {
	"use strict";
	describe("logger", function() {
		it("should emit endpoint_error Event on error event", function(done){
			var endpoint = new ErrorEndpoint();
			logger.append(endpoint);
			logger.once("endpoint_error", function(endpoint, err) {
				if (err) {
					logger.remove(endpoint, function(err) {
						if (err) {
							throw err;
						}
						done();
					});
				}
			});
			endpoint.emit("error", new Error("error"));
		});
		it("should emit endpoint_error Event on error return", function(done){
			var endpoint = new ErrorEndpoint();
			logger.append(endpoint);
			logger.once("endpoint_error", function(endpoint, err) {
				if (err) {
					logger.remove(endpoint, function(err) {
						if (err) {
							throw err;
						}
						done();
					});
				}
			});
			logger.debug("test");
		});
	});
	describe("debug", function() {
		it("should work if message is set", function(done) {
			logger.once("level_debug", function(log) {
				assert.equal(log.origin, undefined);
				assert.equal(log.message, "message");
				assert.equal(log.metadata, undefined);
				done();
			});
			logger.debug("message");
		});
		it("should work if message and callback are set", function(done) {
			logger.once("level_debug", function(log) {
				assert.equal(log.origin, undefined);
				assert.equal(log.message, "message");
				assert.equal(log.metadata, undefined);
				done();
			});
			logger.debug("message", EMPTY_CB);
		});
		it("should work if origin and message are set", function(done) {
			logger.once("level_debug", function(log) {
				assert.equal(log.origin, "origin");
				assert.equal(log.message, "message");
				assert.equal(log.metadata, undefined);
				done();
			});
			logger.debug("origin", "message");
		});
		it("should work if origin, message and callback", function(done) {
			logger.once("level_debug", function(log) {
				assert.equal(log.origin, "origin");
				assert.equal(log.message, "message");
				assert.equal(log.metadata, undefined);
				done();
			});
			logger.debug("origin", "message", EMPTY_CB);
		});
		it("should work if message and metadata are set", function(done) {
			logger.once("level_debug", function(log) {
				assert.equal(log.origin, undefined);
				assert.equal(log.message, "message");
				assert.deepEqual(log.metadata, {a: 1});
				done();
			});
			logger.debug("message", {a: 1});
		});
		it("should work if message, metadata and callback are set", function(done) {
			logger.once("level_debug", function(log) {
				assert.equal(log.origin, undefined);
				assert.equal(log.message, "message");
				assert.deepEqual(log.metadata, {a: 1});
				done();
			});
			logger.debug("message", {a: 1}, EMPTY_CB);
		});
		it("should work if message, metadata is only Boolean false and callback are set", function(done) {
			logger.once("level_debug", function(log) {
				assert.equal(log.origin, undefined);
				assert.equal(log.message, "message");
				assert.deepEqual(log.metadata, false);
				done();
			});
			logger.debug("message", false, EMPTY_CB);
		});
		it("should work if origin, message and metadata are set", function(done) {
			logger.once("level_debug", function(log) {
				assert.equal(log.origin, "origin");
				assert.equal(log.message, "message");
				assert.deepEqual(log.metadata, {a: 1});
				done();
			});
			logger.debug("origin", "message", {a: 1});
		});
		it("should work if origin, message, metadata and callback are set", function(done) {
			logger.once("level_debug", function(log) {
				assert.equal(log.origin, "origin");
				assert.equal(log.message, "message");
				assert.deepEqual(log.metadata, {a: 1});
				done();
			});
			logger.debug("origin", "message", {a: 1}, EMPTY_CB);
		});
		it("should work if all params are set", function(done) {
			logger.debug("origin", "message", {a: 1}, function(err) {
				if (err) {
					throw err;
				}
				done();
			});
		});
	});
	describe("info", function() {
		it("should work if message is set", function(done) {
			logger.once("level_info", function(log) {
				assert.equal(log.message, "message");
				done();
			});
			logger.info("message");
		});
		it("should work if origin and message are set", function(done) {
			logger.once("level_info", function(log) {
				assert.equal(log.origin, "origin");
				assert.equal(log.message, "message");
				done();
			});
			logger.info("origin", "message");
		});
		it("should work if message and metadata are set", function(done) {
			logger.once("level_info", function(log) {
				assert.equal(log.message, "message");
				assert.deepEqual(log.metadata, {a: 1});
				done();
			});
			logger.info("message", {a: 1});
		});
		it("should work if origin, message and metadata are set", function(done) {
			logger.once("level_info", function(log) {
				assert.equal(log.origin, "origin");
				assert.equal(log.message, "message");
				assert.deepEqual(log.metadata, {a: 1});
				done();
			});
			logger.info("origin", "message", {a: 1});
		});
		it("should work if all params are set", function(done) {
			logger.info("origin", "message", {a: 1}, function(err) {
				if (err) {
					throw err;
				}
				done();
			});
		});
	});
	describe("error", function() {
		it("should work if message is set", function(done) {
			logger.once("level_error", function(log) {
				assert.equal(log.message, "message");
				done();
			});
			logger.error("message");
		});
		it("should work if origin and message are set", function(done) {
			logger.once("level_error", function(log) {
				assert.equal(log.origin, "origin");
				assert.equal(log.message, "message");
				done();
			});
			logger.error("origin", "message");
		});
		it("should work if message and metadata are set", function(done) {
			logger.once("level_error", function(log) {
				assert.equal(log.message, "message");
				assert.deepEqual(log.metadata, {a: 1});
				done();
			});
			logger.error("message", {a: 1});
		});
		it("should work if origin, message and metadata are set", function(done) {
			logger.once("level_error", function(log) {
				assert.equal(log.origin, "origin");
				assert.equal(log.message, "message");
				assert.deepEqual(log.metadata, {a: 1});
				done();
			});
			logger.error("origin", "message", {a: 1});
		});
		it("should work if all params are set", function(done) {
			logger.error("origin", "message", {a: 1}, function(err) {
				if (err) {
					throw err;
				}
				done();
			});
		});
	});
	describe("exception", function() {
		it("should work if message and error are set", function(done) {
			logger.once("level_error", function(log) {
				assert.equal(log.message, "message");
				assert.equal(log.metadata.message, "test");
				assert.equal(log.metadata.type, "Error");
				done();
			});
			logger.exception("message", new Error("test"));
		});
		it("should work if origin, message and error are set", function(done) {
			logger.once("level_error", function(log) {
				assert.equal(log.origin, "origin");
				assert.equal(log.message, "message");
				assert.equal(log.metadata.message, "test");
				assert.equal(log.metadata.type, "Error");
				done();
			});
			logger.exception("origin", "message", new Error("test"));
		});
		it("should work if all params are set", function(done) {
			logger.exception("origin", "message", new Error("test"), function(err) {
				if (err) {
					throw err;
				}
				done();
			});
		});
		it("errors must be found in depth", function(done) {
			logger.once("level_error", function(log) {
				assert.equal(log.message, "message");
				assert.equal(log.metadata.a, 1);
				assert.equal(log.metadata.err.message, "test");
				assert.equal(log.metadata.err.type, "Error");
				done();
			});
			logger.exception("message", {a: 1, err: new Error("test")});
		});
		it("errors must be found in arrays", function(done) {
			logger.once("level_error", function(log) {
				assert.equal(log.message, "message");
				assert.equal(log.metadata[0], 1);
				assert.equal(log.metadata[1].message, "test");
				assert.equal(log.metadata[1].type, "Error");
				done();
			});
			logger.exception("message", [1, new Error("test")]);
		});
		it("props of errors must be contained", function(done) {
			logger.once("level_error", function(log) {
				assert.equal(log.message, "message");
				assert.equal(log.metadata.message, "test");
				assert.equal(log.metadata.type, "Error");
				assert.equal(log.metadata.testProp, true);
				done();
			});
			var err = new Error("test");
			err.testProp = true;
			logger.exception("message", err);
		});
	});
	describe("critical", function() {
		it("should work if message is set", function(done) {
			logger.once("level_critical", function(log) {
				assert.equal(log.message, "message");
				done();
			});
			logger.critical("message");
		});
		it("should work if origin and message are set", function(done) {
			logger.once("level_critical", function(log) {
				assert.equal(log.origin, "origin");
				assert.equal(log.message, "message");
				done();
			});
			logger.critical("origin", "message");
		});
		it("should work if message and metadata are set", function(done) {
			logger.once("level_critical", function(log) {
				assert.equal(log.message, "message");
				assert.deepEqual(log.metadata, {a: 1});
				done();
			});
			logger.critical("message", {a: 1});
		});
		it("should work if origin, message and metadata are set", function(done) {
			logger.once("level_critical", function(log) {
				assert.equal(log.origin, "origin");
				assert.equal(log.message, "message");
				assert.deepEqual(log.metadata, {a: 1});
				done();
			});
			logger.critical("origin", "message", {a: 1});
		});
		it("should work if all params are set", function(done) {
			logger.critical("origin", "message", {a: 1}, function(err) {
				if (err) {
					throw err;
				}
				done();
			});
		});
	});
	describe("append", function() {
		it("should work if all params are set7", function() {
			var e = new DummyEndpoint();
			logger.append(e);
		});
	});
	describe("remove", function() {
		it("should work if all params are set", function(done) {
			var e = new DummyEndpoint();
			logger.append(e);
			logger.remove(e, function(err) {
				if (err) {
					throw err;
				}
				done();
			});
		});
	});
	describe("fullOrigin", function() {
		it("should be test/api.js in line 383", function(done) {
			logger.once("level_debug", function(log) {
				assert.equal(log.fullOrigin.file, "test/api.js", "log.fullOrigin.file");
				assert.equal(log.fullOrigin.line, 383, "log.fullOrigin.line");
				done();
			});
			logger.debug("message");
		});
	});
	describe("stop", function() {
		it("should work if all params are set", function(done) {
			var e = new DummyEndpoint();
			logger.append(e);
			logger.stop(function(err) {
				if (err) {
					throw err;
				}
				done();
			});
		});
	});
	describe("createLogger", function() {
		it("should work", function(done) {
			var e = new DummyEndpoint(),
				l = logger.createLogger();
			l.append(e);
			l.once("level_debug", function(log) {
				assert.equal(log.origin, undefined);
				assert.equal(log.message, "test");
				assert.equal(log.metadata, undefined);
				assert.equal(log.fullOrigin, undefined);
				l.stop(function(err) {
					if (err) {
						throw err;
					}
					done();
				});
			});
			l.debug("test");
		});
		it("should work with fullOrigin cgf", function(done) {
			var e = new DummyEndpoint(),
				l = logger.createLogger({fullOrigin: true});
			l.append(e);
			l.once("level_debug", function(log) {
				assert.equal(log.origin, undefined);
				assert.equal(log.message, "test");
				assert.equal(log.metadata, undefined);
				assert.equal(log.fullOrigin.file, "test/api.js");
				l.stop(function(err) {
					if (err) {
						throw err;
					}
					done();
				});
			});
			l.debug("test");
		});
	});
	describe("filtering", function() {
		it("should work", function(done) {
			var l = logger.createLogger({filter: {"*": true, "test/*": false}});
			l.append(new DummyEndpoint());
			l.once("level_debug", function() {
				assert.fail("should be filtered");
			});
			l.debug("test", "message");
			l.stop(function(err) {
				if (err) {
					throw err;
				}
				done();
			});
		});
	});
});
