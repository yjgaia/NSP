// import UPPERCASE.JS.
require('./import/UPPERCASE.JS-COMMON.js');
require('./import/UPPERCASE.JS-NODE.js');
INIT_OBJECTS();

var
//IMPORT: path
path = require('path'),

// config
config = PARSE_STR(READ_FILE({
	path : 'config.json',
	isSync : true
}).toString()),

// port
port = config.port,

// root path
rootPath = config.rootPath;

// dev mode가 true일 때는 리소스 캐싱을 하지 않습니다.
CONFIG.isDevMode = config.isDevMode;

function parse(source) {
	
	var
	// html
	html = '',
	
	// last index
	lastIndex = 0,
	
	// start code index
	startCodeIndex;
	
	function print(content) {
		html += content;
	}
	
	EACH(source, function(ch, i) {
		if (i > 0) {
			// 코드 시작
			if (ch === '%' && source[i - 1] === '<') {
				print(source.substring(lastIndex, i - 1));
				startCodeIndex = i + 1;
				lastIndex = i + 1;
			}
			// 코드 끝
			else if (ch === '>' && source[i - 1] === '%') {
				eval(source.substring(lastIndex, i - 1));
				startCodeIndex = i + 1;
				lastIndex = i + 1;
			}
		}
	});
	
	return html;
}

function requestListener(requestInfo, response, onDisconnected) {

	var
	// uri
	uri = requestInfo.uri;
	
	if (uri === '') {
		uri = 'index.nsp';
	}

	if (path.extname(uri).toLowerCase() === '.nsp') {

		READ_FILE(rootPath + '/' + uri, {
			notExists : function() {
				response(404);
			},
			error : function() {
				response(500);
			},
			success : function(buffer) {
				response({
					content : parse(buffer.toString()),
					contentType : 'text/html'
				});
			}
		});

		return false;
	}
}

// 멀티코어 CPU 지원
CPU_CLUSTERING(function() {

	// run web server
	RESOURCE_SERVER({
		port : port,
		rootPath : rootPath
	}, {
		
		notExistsResource : function(resourcePath, requestInfo, response) {
			response(404);
		},
		
		requestListener : requestListener
	});

	console.log('NSP 서버가 실행되었습니다. http://localhost:' + port + ' 로 접속해보세요.');
});
