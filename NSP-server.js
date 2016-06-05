// import UJS.
require('./import/UJS-NODE.js');

// import UPPERCASE-TRANSPORT.
require('./import/UPPERCASE-TRANSPORT/NODE.js');

// import UPPERCASE-UTIL.
require('./import/UPPERCASE-UTIL/NODE.js');

// import UPPERCASE-UPLOAD.
require('./import/UPPERCASE-UPLOAD/NODE.js');

// import NSP.
require('./NSP.js');
require('./LOAD_NSP.js');
require('./NSP_BRIDGE.js');

INIT_OBJECTS();

var
// config
config = PARSE_STR(READ_FILE({
	path : 'config.json',
	isSync : true
}).toString());

// if dev mode is true, no resource caching.
CONFIG.isDevMode = config.isDevMode;

(config.isNotUsingCPUClustering === true ? RUN : CPU_CLUSTERING)(function() {
	
	// run web server.
	RESOURCE_SERVER({
		port : config.port,
		rootPath : config.rootPath,
		version : Date.now(),
		noParsingParamsURI : config.uploadURI
	}, NSP_BRIDGE(config));

	console.log('NSP Server started! - http://localhost:' + config.port);
});
