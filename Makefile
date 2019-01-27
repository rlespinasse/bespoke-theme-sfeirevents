.DEFAULT_GOAL = build

.PHONY: need-gulp
need-gulp:
	type gulp || npm install -g gulp-cli

.PHONY: build
build: need-gulp configure
	gulp

clean:
	rm -rf dist || true

# Demo
.PHONY: build-demo
build-demo: reset-configuration build
	cd demo/ && $(MAKE) reset-configuration build
	rm -rf docs || true
	mv demo/dist docs

# Configuration
.PHONY: configure
configure: node_modules

node_modules:
	type yarn || npm install -g yarn
	yarn

reset-configuration: clean
	rm -rf node_modules || true
