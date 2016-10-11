// load UJS.
require(process.env.UPPERCASE_PATH + '/UJS-NODE.js');

// load UPPERCASE-UTIL.
require(process.env.UPPERCASE_PATH + '/UPPERCASE-UTIL/NODE.js');

/*
 * pack UPPERCASE BOX.
 */
RUN(function() {
	'use strict';

	var
	//IMPORT: fs
	fs = require('fs'),

	//IMPORT: path
	path = require('path'),

	// root path
	rootPath = __dirname,
	
	// box name
	boxName = 'NSP',
	
	// node script
	nodeScript = '',

	// log.
	log = function(msg) {
		console.log('PACK: ' + msg);
	},
	
	// load for node.
	loadForNode = function(relativePath) {
		//REQUIRED: relativePath

		if (path.extname(relativePath) === '.js') {

			// add to node script.
			nodeScript += READ_FILE({
				path : rootPath + '/' + relativePath,
				isSync : true
			}) + '\n';
		}
	},
	
	// minify
	minify = function() {
		
		// minify node script.
		nodeScript = MINIFY_JS(nodeScript);
	};

	// pack box.
	log('PACKING BOX [' + boxName + ']...');

	// load box.
	log('LOADING BOX...');
	
	// load for node.
	log('LOADING FOR NODE...');
	loadForNode('NSP.js', loadForNode);
	loadForNode('LOAD_NSP.js', loadForNode);
	loadForNode('NSP_BRIDGE.js', loadForNode);
	log('LOADED FOR NODE!');

	log('LOADED BOX!');

	// minify.
	log('MINIFYING...');
	minify();
	log('MINIFYED!');

	// save box.
	log('SAVING BOX...');
	
	// save node script.
	if (nodeScript !== '') {

		log('SAVING NODE SCRIPT...');

		WRITE_FILE({
			path : '__PACK/' + boxName + '/NODE.js',
			content : nodeScript,
			isSync : true
		});

		log('SAVED NODE SCRIPT!');
	}

	log('SAVED BOX!');

	// done!
	log('PACKED BOX [' + boxName + ']!');
});
