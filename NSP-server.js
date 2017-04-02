let NSP = require('./index.js');

INIT_OBJECTS();

let config = PARSE_STR(READ_FILE({
	path : 'config.json',
	isSync : true
}).toString());

// if dev mode is true, no resource caching.
CONFIG.isDevMode = config.isDevMode;

(config.isNotUsingCPUClustering === true ? RUN : CPU_CLUSTERING)(() => {
	
	// run web server.
	WEB_SERVER({
		port : config.port,
		rootPath : config.rootPath,
		version : Date.now(),
		uploadURI : config.uploadURI,
		maxUploadFileMB : config.maxUploadFileMB,
		uploadPath : config.uploadPath
	}, NSP.Bridge(config));

	console.log('NSP Server started! - http://localhost:' + config.port);
});
