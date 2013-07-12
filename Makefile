default: test

jslint:
	@echo "jslint"
	@jslint *.js

circular:
	@echo "circular"
	@madge --circular --format amd .

mocha:
	@echo "mocha"
	@mocha test/*.js
	@echo

test: mocha circular
	@echo "test"
	@echo

outdated:
	@echo "outdated modules?"
	@npmedge
