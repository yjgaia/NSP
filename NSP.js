// import UJS.
require('./import/UJS-NODE.js');

// import UPPERCASE-TRANSPORT.
require('./import/UPPERCASE-TRANSPORT/NODE.js');

// import UPPERCASE-UTIL.
require('./import/UPPERCASE-UTIL/NODE.js');

// import UPPERCASE-UPLOAD.
require('./import/UPPERCASE-UPLOAD/NODE.js');

INIT_OBJECTS();

// import NSP-EMBED.
require('./NSP-EMBED.js');

// 멀티코어 CPU 지원
CPU_CLUSTERING(function() {
	var
	// config
	config = PARSE_STR(READ_FILE({
		path : 'config.json',
		isSync : true
	}).toString()),
	
	// port
	port = config.port,
	
	// root path
	rootPath = config.rootPath,
	
	// rest uri
	restURI = config.restURI;
	
	// dev mode가 true일 때는 리소스 캐싱을 하지 않습니다.
	CONFIG.isDevMode = config.isDevMode;
	
	// run web server
	RESOURCE_SERVER({
		port : port,
		rootPath : rootPath,
		version : Date.now(),
		noParsingParamsURI : config.uploadURI
	}, NSP(config));

	console.log('NSP server started. - http://localhost:' + port);
});
