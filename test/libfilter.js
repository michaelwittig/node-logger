var assert = require("assert-plus"),
	util = require("util"),
	filter = require("../lib/filter");

describe("filter", function() {
	describe("filter()", function() {
		it("should be true", function(){
			var log = {origin: "test", level: "debug"};
			assert.equal(filter.filter(log, {"*": true}), true);
			assert.equal(filter.filter(log, {"*/debug": true}), true);
			assert.equal(filter.filter(log, {"test/*": true}), true);
			assert.equal(filter.filter(log, {"test/debug": true}), true);
		});
		it("should be false", function(){
			var log = {level: "debug"};
			assert.equal(filter.filter(log, {"*": true}), true);
			assert.equal(filter.filter(log, {"*/debug": true}), true);
			assert.equal(filter.filter(log, {"test/*": true}), false);
			assert.equal(filter.filter(log, {"test/debug": true}), false);
		});
		it("chained should be true", function(){
			var log = {origin: "test", level: "debug"};
			assert.equal(filter.filter(log, {"*": true, "*/debug": true, "test/*": true, "test/debug": false}), false);
			assert.equal(filter.filter(log, {"*": true, "*/debug": true, "test/*": false, "test/debug": true}), true);
			assert.equal(filter.filter(log, {"*": true, "*/debug": false, "test/*": true, "test/debug": true}), true);
			assert.equal(filter.filter(log, {"*": false, "*/debug": true, "test/*": true, "test/debug": true}), true);

			assert.equal(filter.filter(log, {"*": false, "*/debug": true, "test/*": true, "test/debug": false}), false);
			assert.equal(filter.filter(log, {"*": false, "*/debug": true, "test/*": false, "test/debug": true}), true);
			assert.equal(filter.filter(log, {"*": false, "*/debug": false, "test/*": true, "test/debug": true}), true);
			assert.equal(filter.filter(log, {"*": false, "*/debug": true, "test/*": true, "test/debug": true}), true);

			assert.equal(filter.filter(log, {"*": true, "*/debug": false, "test/*": true, "test/debug": false}), false);
			assert.equal(filter.filter(log, {"*": true, "*/debug": false, "test/*": false, "test/debug": true}), true);
			assert.equal(filter.filter(log, {"*": true, "*/debug": false, "test/*": true, "test/debug": true}), true);
			assert.equal(filter.filter(log, {"*": false, "*/debug": false, "test/*": true, "test/debug": true}), true);

			assert.equal(filter.filter(log, {"*": true, "*/debug": true, "test/*": false, "test/debug": false}), false);
			assert.equal(filter.filter(log, {"*": true, "*/debug": true, "test/*": false, "test/debug": true}), true);
			assert.equal(filter.filter(log, {"*": true, "*/debug": false, "test/*": false, "test/debug": true}), true);
			assert.equal(filter.filter(log, {"*": false, "*/debug": true, "test/*": false, "test/debug": true}), true);

			assert.equal(filter.filter(log, {"*": true, "*/debug": true, "test/*": true, "test/debug": false}), false);
			assert.equal(filter.filter(log, {"*": true, "*/debug": true, "test/*": false, "test/debug": false}), false);
			assert.equal(filter.filter(log, {"*": true, "*/debug": false, "test/*": true, "test/debug": false}), false);
			assert.equal(filter.filter(log, {"*": false, "*/debug": true, "test/*": true, "test/debug": false}), false);
		});
	});
	describe("filter()", function() {
		it("should be ok for *", function(){
			filter.assert({"*": true});
		});
		it("should be ok for */debug", function(){
			filter.assert({"*": false, "*/debug": true});
		});
		it("should be ok for test/*", function(){
			filter.assert({"*": false, "test/*": true});
		});
		it("should fail if value is not Boolean", function() {
			assert.throws(function() {
				filter.assert({"*": "1"});
			});
		});
		it("should fail if key is not in format origin/level", function() {
			assert.throws(function() {
				filter.assert({"abcv": true});
			});
		});
		it("should fail because there is no default * rule", function() {
			assert.throws(function() {
				filter.assert({"test/*": true});
			});
		});
	});
});