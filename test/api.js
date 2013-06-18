var assert = require("assert-plus"),
	util = require("util"),
	logger = require("../index");

function DummyEndpoint() {
	logger.Endpoint.call(this, true, true, true, true);
}
util.inherits(DummyEndpoint, logger.Endpoint);
DummyEndpoint.prototype.log = function(log, errCallback) {
	errCallback();
};

logger.append(new DummyEndpoint());
logger.fullOrigin();

describe("API", function(){
	describe("Endpoint", function() {
		it("should work if all 4 params are set", function(){
			new logger.Endpoint(true, true, true, true);
		});
		it("should not work if onf of 4 params are not set", function(){
			assert.throws(function() {
				new logger.Endpoint(true, true, true);
			});
		});
		it("should not work if onf of 4 params is not not bool", function(){
			assert.throws(function() {
				new logger.Endpoint(true, true, true, "true");
			});
		});
		it("should emit events", function(done){
			var endpoint = new logger.Endpoint(true, true, true, true);
			endpoint.on("test", function(err) {
				if (err) throw err;
				done();
			});
			endpoint.emit("test");
		});
	});
	describe("debug, info, error, exception, critical", function() {
		it("should work if message is set", function(done) {
			logger.once("debug", function(log) {
				assert.equal(log.message, "message");
				done();
			});
			logger.debug("message");
		});
		it("should work if origin and message are set", function(done) {
			logger.once("debug", function(log) {
				assert.equal(log.origin, "origin");
				assert.equal(log.message, "message");
				done();
			});
			logger.debug("origin", "message");
		});
		it("should work if message and metadata are set", function(done) {
			logger.once("debug", function(log) {
				assert.equal(log.message, "message");
				assert.deepEqual(log.metadata, {a: 1});
				done();
			});
			logger.debug("message", {a: 1});
		});
		it("should work if origin, message and metadata are set", function(done) {
			logger.once("debug", function(log) {
				assert.equal(log.origin, "origin");
				assert.equal(log.message, "message");
				assert.deepEqual(log.metadata, {a: 1});
				done();
			});
			logger.debug("origin", "message", {a: 1});
		});
		it("should work if all params are set", function(done) {
			logger.debug("origin", "message", {a: 1}, function(err) {
				if (err) throw err;
				done();
			})
		});
	});
	describe("fullOrigin", function() {
		it("should be test/api.js in line 87", function(done) {
			logger.once("debug", function(log) {
				assert.equal(log.fullOrigin.file, "test/api.js", "log.fullOrigin.file");
				assert.equal(log.fullOrigin.line, 87, "log.fullOrigin.line");
				done();
			});
			logger.debug("message");
		});
	});
});
