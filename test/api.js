var assert = require("assert-plus"),
	util = require("util"),
	logger = require("../index");

function DummyEndpoint() {
	logger.Endpoint.call(this, true, true, true, true, "dummy");
}
util.inherits(DummyEndpoint, logger.Endpoint);
DummyEndpoint.prototype.log = function(log, errCallback) {
	errCallback();
};
DummyEndpoint.prototype.stop = function(errCallback) {
	errCallback();
};

function ErrorEndpoint() {
	logger.Endpoint.call(this, true, true, true, true, "error");
}
util.inherits(ErrorEndpoint, logger.Endpoint);
ErrorEndpoint.prototype.log = function(log, errCallback) {
	errCallback(new Error("error"));
};
ErrorEndpoint.prototype.stop = function(errCallback) {
	errCallback();
};

logger.append(new DummyEndpoint());
logger.fullOrigin();

describe("API", function() {
	describe("Endpoint", function() {
		it("should work if all params are set", function(){
			new logger.Endpoint(true, true, true, true, "test");
		});
		it("should not work if one of params are not set", function(){
			assert.throws(function() {
				new logger.Endpoint(true, true, true, true);
			});
		});
		it("should not work if one of params is not not bool", function(){
			assert.throws(function() {
				new logger.Endpoint(true, true, true, "true", "test");
			});
		});
		it("should emit events", function(done){
			var endpoint = new logger.Endpoint(true, true, true, true, "test");
			endpoint.once("test", function(err) {
				if (err) throw err;
				done();
			});
			endpoint.emit("test");
		});
	});
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
			logger.debug("message", function() {});
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
			logger.debug("origin", "message", function() {});
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
			logger.debug("message", {a: 1}, function() {});
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
			logger.debug("origin", "message", {a: 1}, function() {});
		});
		it("should work if all params are set", function(done) {
			logger.debug("origin", "message", {a: 1}, function(err) {
				if (err) throw err;
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
				if (err) throw err;
				done();
			})
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
				if (err) throw err;
				done();
			})
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
				} else {
					done();
				}
			})
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
				if (err) throw err;
				done();
			})
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
				} else {
					done();
				}
			});
		});
	});
	describe("fullOrigin", function() {
		it("should be test/api.js in line 302", function(done) {
			logger.once("level_debug", function(log) {
				assert.equal(log.fullOrigin.file, "test/api.js", "log.fullOrigin.file");
				assert.equal(log.fullOrigin.line, 342, "log.fullOrigin.line");
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
				} else {
					done();
				}
			});
		});
	});
});
