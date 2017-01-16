// import UPPERCASE-CORE.
require('./import/UPPERCASE-CORE/NODE.js');

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
	WEB_SERVER({
		port : config.port,
		rootPath : config.rootPath,
		version : Date.now(),
		uploadURI : config.uploadURI,
		maxUploadFileMB : config.maxUploadFileMB,
		uploadPath : config.uploadPath
	}, NSP_BRIDGE(config));

	console.log('NSP Server started! - http://localhost:' + config.port);
});
