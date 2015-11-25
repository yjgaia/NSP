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

function parse(self, __folderPath, __source, __response) {
	
	var
	// html
	__html = '',
	
	// last index
	__lastIndex = 0,
	
	// start code index
	__startCodeIndex = -1,
	
	// start pstr index
	__startPstrIndex = -1,
	
	// is paused
	__isPaused,
	
	// ohters
	__i, __ch;
	
	function print(content) {
		if (typeof content === 'string') {
			__html += content;
		} else {
			__html += JSON.stringify(content);
		}
	}
	
	function include(__uri, __callback) {
		
		pause();
		
		READ_FILE(__folderPath + '/' + __uri, function(__buffer) {
			
			var
			// ext
			ext = path.extname(__uri).toLowerCase();
			
			if (ext === '.nsp') {
				parse(self, path.dirname(__folderPath + '/' + __uri), __buffer.toString(), function(res) {
					print(res.content);
					if (__callback !== undefined) {
						__callback();
					}
					resume();
				});
			}
			
			else if (ext === '.js') {
				eval(__buffer.toString());
				if (__callback !== undefined) {
					__callback();
				}
				resume();
			}
		});
	}
	
	function pause() {
		__isPaused = true;
	}
	
	function resume() {
		__isPaused = false;
		
		for (__i = __lastIndex; __i <= __source.length; __i += 1) {
			__ch = __source[__i];
			
			if (__i > 0) {
				
				// Node.js용 코드 시작
				if (__ch === '%' && __source[__i - 1] === '<') {
					if (__startCodeIndex === -1 && __startPstrIndex === -1) {
						if (__i > 2 && __source[__i - 3] === '\\' && __source[__i - 2] === '\\') {
							print(__source.substring(__lastIndex, __i - 2));
							__startCodeIndex = __i + 1;
						} else if (__i > 1 && __source[__i - 2] === '\\') {
							// Node.js용 코드 아님, 무시
							print(__source.substring(__lastIndex, __i - 2));
							print(__source.substring(__i - 1, __i + 1));
						} else {
							print(__source.substring(__lastIndex, __i - 1));
							__startCodeIndex = __i + 1;
						}
						__lastIndex = __i + 1;
					}
				}
				
				// Node.js용 코드 끝
				else if (__ch === '>' && __source[__i - 1] === '%') {
					if (__startCodeIndex !== -1 && __startPstrIndex === -1) {
						
						eval(__source.substring(__lastIndex, __i - 1));
						
						__startCodeIndex = -1;
						__lastIndex = __i + 1;
						
						if (__isPaused === true) {
							return;
						}
					}
				}
				
				// 출력 코드 시작
				else if (__ch === '{' && __source[__i - 1] === '{') {
					if (__startCodeIndex === -1 && __startPstrIndex === -1) {
						if (__i > 2 && __source[__i - 3] === '\\' && __source[__i - 2] === '\\') {
							print(__source.substring(__lastIndex, __i - 2));
							__startPstrIndex = __i + 1;
						} else if (__i > 1 && __source[__i - 2] === '\\') {
							// Node.js용 코드 아님, 무시
							print(__source.substring(__lastIndex, __i - 2));
							print(__source.substring(__i - 1, __i + 1));
						} else {
							print(__source.substring(__lastIndex, __i - 1));
							__startPstrIndex = __i + 1;
						}
						__lastIndex = __i + 1;
					}
				}
				
				// 출력 코드 끝
				else if (__ch === '}' && __source[__i - 1] === '}') {
					if (__startCodeIndex === -1 && __startPstrIndex !== -1) {
					
						print(eval(__source.substring(__lastIndex, __i - 1)));
						
						__startPstrIndex = -1;
						__lastIndex = __i + 1;
						
						if (__isPaused === true) {
							return;
						}
					}
				}
			}
		}
	
		print(__source.substring(__lastIndex));
		
		__response({
			content : __html,
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
				parse({
					params : requestInfo.params
				}, path.dirname(rootPath + '/' + uri), buffer.toString(), response);
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
