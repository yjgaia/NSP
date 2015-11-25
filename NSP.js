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

function parse(self, folderPath, source, response) {
	
	var
	// html
	html = '',
	
	// last index
	lastIndex = 0,
	
	// start code index
	startCodeIndex = -1,
	
	// start pstr index
	startPstrIndex = -1,
	
	// is paused
	isPaused,
	
	// ohters
	i, ch;
	
	function print(content) {
		if (typeof content === 'string') {
			html += content;
		} else {
			html += JSON.stringify(content);
		}
	}
	
	function include(uri) {
		
		pause();
		
		READ_FILE(folderPath + '/' + uri, function(buffer) {
			parse(self, path.dirname(folderPath + '/' + uri), buffer.toString(), function(res) {
				print(res.content);
				resume();
			});
		});
	}
	
	function pause() {
		isPaused = true;
	}
	
	function resume() {
		isPaused = false;
		
		for (i = lastIndex; i <= source.length; i += 1) {
			ch = source[i];
			
			if (i > 0) {
				
				// Node.js용 코드 시작
				if (ch === '%' && source[i - 1] === '<') {
					if (startCodeIndex === -1 && startPstrIndex === -1) {
						if (i > 2 && source[i - 3] === '\\' && source[i - 2] === '\\') {
							print(source.substring(lastIndex, i - 2));
							startCodeIndex = i + 1;
							lastIndex = i + 1;
						} else if (i > 1 && source[i - 2] === '\\') {
							// Node.js용 코드 아님, 무시
						} else {
							print(source.substring(lastIndex, i - 1));
							startCodeIndex = i + 1;
							lastIndex = i + 1;
						}
					}
				}
				
				// Node.js용 코드 끝
				else if (ch === '>' && source[i - 1] === '%') {
					if (startCodeIndex !== -1 && startPstrIndex === -1) {
						
						eval(source.substring(lastIndex, i - 1));
						
						startCodeIndex = -1;
						lastIndex = i + 1;
						
						if (isPaused === true) {
							return;
						}
					}
				}
				
				// 출력 코드 시작
				else if (ch === '{' && source[i - 1] === '{') {
					if (startCodeIndex === -1 && startPstrIndex === -1) {
						if (i > 2 && source[i - 3] === '\\' && source[i - 2] === '\\') {
							print(source.substring(lastIndex, i - 2));
							startPstrIndex = i + 1;
							lastIndex = i + 1;
						} else if (i > 1 && source[i - 2] === '\\') {
							// Node.js용 코드 아님, 무시
						} else {
							print(source.substring(lastIndex, i - 1));
							startPstrIndex = i + 1;
							lastIndex = i + 1;
						}
					}
				}
				
				// 출력 코드 끝
				else if (ch === '}' && source[i - 1] === '}') {
					if (startCodeIndex === -1 && startPstrIndex !== -1) {
					
						print(eval(source.substring(lastIndex, i - 1)));
						
						startPstrIndex = -1;
						lastIndex = i + 1;
						
						if (isPaused === true) {
							return;
						}
					}
				}
			}
		}
	
		print(source.substring(lastIndex));
		
		response({
			content : html,
			contentType : 'text/html'
		});
	}
	
	resume();
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
				parse({}, path.dirname(rootPath + '/' + uri), buffer.toString(), response);
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

	console.log('NSP 서버가 실행되었습니다. http://localhost:' + port + '로 접속해보세요.');
});
