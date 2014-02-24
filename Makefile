LIB_ROOT_FILE = ./lib/bitcoin.js
LIB_SJCL_SRC = node_modules/sjcl/sjcl.js
LIB_JSBN_SRC = ./lib/legacy/jsbn.js
LIB_SRC = $(LIB_ROOT_FILE) $(shell find ./lib ! -name "bitcoin.js" -name "*.js" -maxdepth 1)
LIB_SJCL_EXT_SRC = $(shell find ./lib/sjcl-ext -name "*.js")
BITCOIND = bitcoind

clean:
	rm -rf bitcoin.js

build-sjcl: 
	cd node_modules/sjcl/ && ./configure --with-all --compress=none && make

build:	clean	build-sjcl
	mkdir -p dist
	node_modules/uglify-js/bin/uglifyjs $(LIB_JSBN_SRC) $(LIB_SJCL_SRC) $(LIB_SJCL_EXT_SRC) $(LIB_SRC) -b --output dist/coinative-core.js
	node_modules/uglify-js/bin/uglifyjs $(LIB_JSBN_SRC) $(LIB_SJCL_SRC) $(LIB_SJCL_EXT_SRC) $(LIB_SRC) --output dist/coinative-core.min.js

test-node:	build
	node_modules/.bin/mocha test/setup.js "test/**/*.specs.js" --reporter spec

test-browser:	build
	node_modules/.bin/karma start karma.conf.js

test-int:	
	@echo "add BITCOIND= to specify a path"
	node_modules/.bin/mocha --bitcoind=$(BITCOIND) test-int/setup.js "test-int/**/*.specs.js" --reporter spec

test:	test-node

dev-browser: 
	node_modules/.bin/karma start karma.dev.conf.js

cover:	
	node_modules/.bin/karma start karma.cover.conf.js

.PHONY: test test-int