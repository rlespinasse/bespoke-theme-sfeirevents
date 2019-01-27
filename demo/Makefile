.DEFAULT_GOAL = build

.PHONY: need-gulp
need-gulp:
	type gulp || npm install -g gulp-cli

.PHONY: build
build: need-gulp configure
	gulp

clean:
	rm -rf dist || true

# Slides server
PORT ?= 8000
SLIDES_SERVER := http://localhost:$(PORT)

.PHONY: serve-slides
serve-slides: need-gulp configure
	gulp serve

.PHONY: show-slides
show-slides:
	open $(SLIDES_SERVER)

# Presentation server
.PHONY: serve-presentation
serve-presentation:
	type enprez || npm install -g ensuite-present
	enprez

.PHONY: show-presentation
show-presentation:
	open http://localhost:4320/pages/viewer/
	open http://localhost:4320/pages/console/?slide-deck-url=$(SLIDES_SERVER)/?ensuite

# PDF generation
.PHONY: generate-pdf
generate-pdf:
	rm -rf dist/export || true
	$(MAKE) dist/export/sfeirschool-content.pdf

dist/export/sfeirschool-content.pdf:
	type decktape || npm install -g decktape
	mkdir -p dist/export/screenshots
	cd dist/export/; decktape --screenshots bespoke $(SLIDES_SERVER) sfeirschool-content.pdf

.PHONY: show-pdf
show-pdf: dist/export/sfeirschool-content.pdf
	open dist/export/sfeirschool-content.pdf

# Configuration
.PHONY: configure
configure: node_modules .bundle/gems

node_modules:
	type yarn || npm install -g yarn
	yarn

.bundle/gems:
	type bundle || gem install bundler
	bundle --path=.bundle/gems

reset-configuration: clean
	rm -rf node_modules || true
	rm -rf .bundle || true
