// import UPPERCASE.JS.
require('./import/UPPERCASE.JS-COMMON.js');
require('./import/UPPERCASE.JS-NODE.js');
INIT_OBJECTS();

var
//IMPORT: path
__path = require('path');

function __responseError(path, e, response) {
	
	var
	// first error line
	firstErrorLine = e.stack.split('\n')[1];
	
	response({
		statusCode : 500,
		content : 
'<!doctype html><html><head><meta charset="UTF-8"></head><body>' +
'<p>오류가 발생했습니다.</p>' +
'<b>경로: </b>' + path + '<br>' +
'<b>내용: </b>' + e +
'</body></html>',
		contentType : 'text/html'
	});
}

function __responseNotFound(path, response) {
	
	response({
		statusCode : 404,
		content : 
'<!doctype html><html><head><meta charset="UTF-8"></head><body>' +
'<p>페이지가 존재하지 않습니다.</p>' +
'<b>경로: </b>' + path +
'</body></html>',
		contentType : 'text/html'
	});
}

function parse(self, __sourcePath, __source, __response) {
	
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
		
		var
		// fullPath
		__fullPath = __path.dirname(__sourcePath) + '/' + __uri;
		
		pause();
		
		READ_FILE(__fullPath, function(__buffer) {
			
			var
			// ext
			ext = __path.extname(__uri).toLowerCase();
			
			if (ext === '.nsp') {
				parse(self, __path.dirname(__fullPath), __buffer.toString(), function(res) {
					print(res.content);
					if (__callback !== undefined) {
						__callback();
					}
					resume();
				});
			}
			
			else if (ext === '.js') {
				
				try {
					eval(__buffer.toString());
				} catch (e) {
					__responseError(__fullPath, e, __response);
					return;
				}
				
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
						
						try {
							eval(__source.substring(__lastIndex, __i - 1));
						} catch (e) {
							__responseError(__sourcePath, e, __response);
							return;
						}
						
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
						
						try {
							print(eval(__source.substring(__lastIndex, __i - 1)));
						} catch (e) {
							__responseError(__sourcePath, e, __response);
							return;
						}
						
						__startPstrIndex = -1;
						__lastIndex = __i + 1;
						
						if (__isPaused === true) {
							return;
						}
					}
				}
			}
		}
		
		if (__startCodeIndex !== -1 || __startPstrIndex !== -1) {
			print(__source.substring(__lastIndex - 2));
		} else {
			print(__source.substring(__lastIndex));
		}
		
		__response({
			content : __html,
			contentType : 'text/html'
		});
	}
	
	resume();
}

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
	
	// cached file infos
	cachedFileInfos = {};
	
	// dev mode가 true일 때는 리소스 캐싱을 하지 않습니다.
	CONFIG.isDevMode = config.isDevMode;

	// run web server
	RESOURCE_SERVER({
		port : port,
		rootPath : rootPath,
		version : Date.now()
	}, {
		
		notExistsResource : function(resourcePath, requestInfo, response) {
			__responseNotFound(resourcePath, response);
		},
		
		requestListener : function(requestInfo, response, onDisconnected) {
		
			var
			// uri
			uri = requestInfo.uri,
			
			// path
			path = rootPath + '/' + uri;
			
			if (uri === '') {
				uri = 'index.nsp';
			}
		
			if (__path.extname(uri).toLowerCase() === '.nsp') {
				
				GET_FILE_INFO(path, function(fileInfo) {
					
					var
					// cached file info
					cachedFileInfo = cachedFileInfos[path];
					
					// 캐시된 파일 제공
					if (cachedFileInfo !== undefined
						&& (
							(fileInfo.lastUpdateTime !== undefined && cachedFileInfo.lastUpdateTime.getTime() === fileInfo.lastUpdateTime.getTime())
							|| (fileInfo.createTime !== undefined && cachedFileInfo.lastUpdateTime.getTime() === fileInfo.createTime.getTime())
						)
					) {
						
						parse({
							params : requestInfo.params
						}, path, cachedFileInfo.content, response);
					}
					
					else {
						
						READ_FILE(path, {
							notExists : function() {
								__responseNotFound(path, response);
							},
							error : function(e) {
								__responseError(path, e, response);
							},
							success : function(buffer) {
								
								var
								// content
								content = buffer.toString();
								
								cachedFileInfos[path] = {
									content : content,
									lastUpdateTime : fileInfo.lastUpdateTime === undefined ? fileInfo.createTime : fileInfo.lastUpdateTime
								};
								
								parse({
									params : requestInfo.params
								}, path, content, response);
							}
						});
					}
				});
		
				return false;
			}
		}
	});

	console.log('NSP 서버가 실행되었습니다. http://localhost:' + port + '로 접속해보세요.');
});
