var assert = require("assert-plus");

/**
 * @param log Log - log object
 * @param filter Object - String(origin/level) -> Boolean
 */
exports.filter = function(log, filter) {
	var global = undefined, specific = undefined;
	if (filter["*"] !== undefined) {
		global = filter["*"];
	}
	if (filter["*/" + log.level] !== undefined) {
		global = filter["*/" + log.level];
	}
	if (log.origin) {
		if (filter[log.origin + "/*"] !== undefined) {
			specific = filter[log.origin + "/*"];
		}
		if (filter[log.origin + "/" + log.level] !== undefined) {
			specific = filter[log.origin + "/" + log.level];
		}

	}
	if (specific !== undefined) {
		return specific;
	}
	if (global !== undefined) {
		return global;
	}
	return false;
};

exports.assert = function(filter) {
	var i;
	for (i in filter) {
		if (filter.hasOwnProperty(i)) {
			assert.bool(filter[i], "value");
			if (i !== "*") {
				var s = i.split("/");
				assert.equal(s.length, 2, "format mut be origin/level");
			}
		}
	}
	if  (filter["*"] === undefined) {
		assert.fail("there is no * specified in the filter");
	}
};
