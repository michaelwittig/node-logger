var safejson = require("../lib/safejson"),
	assert = require("assert-plus");

describe("formatter.json", function(){
	describe("()", function() {
		it("should handle circular dependencies", function() {
			var circular = {
				a: 1
			};
			circular.b = circular;
			var json = safejson(circular);
			assert.equal(json, '{"a":1,"b":"Circular"}', "json");
		});
	});
});
