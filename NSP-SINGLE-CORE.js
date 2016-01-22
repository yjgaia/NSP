// import UJS.
require('./import/UJS-NODE.js');

// import UPPERCASE-TRANSPORT.
require('./import/UPPERCASE-TRANSPORT/NODE.js');

// import UPPERCASE-UTIL.
require('./import/UPPERCASE-UTIL/NODE.js');

// import UPPERCASE-UPLOAD.
require('./import/UPPERCASE-UPLOAD/NODE.js');

INIT_OBJECTS();

var
//IMPORT: path
__path = require('path'),

// shared store
__sharedStore = SHARED_STORE('__NSP_SHARED_STORE'),

// parse func str
__parseFuncStr = function __parse(__requestInfo, __sourcePath, __source, __response, self, __isNotUsingDCBN) {
	
	var
	// html
	__html = '',
	
	// redirect url
	__redirectURL,
	
	// last index
	__lastIndex = 0,
	
	// start code index
	__startCodeIndex = -1,
	
	// start pstr index
	__startPstrIndex = -1,
	
	// start pstr2 index
	__startPstr2Index = -1,
	
	// start conditional index
	__startCondIndex = -1,
	
	// start each index
	__startEachIndex = -1,
	
	// is paused
	__isPaused,
	
	// is ignored
	__isIgnored,
	
	// last cond
	__lastCond,
	
	// is ignore stack
	__isIgnoreStack = [],
	
	// is repeat stack
	__isRepeatStack = [],
	
	// repeat info
	__repeatInfo,
	
	// for repeat
	__repeatSplits,
	__repeatTarget, __repeatTargetName, __repeatTargetNowKey, __repeatTargetBeforeKey, __repeatTargetFirstKey,
	__repeatItemStr, __repeatItemSplits, __repeatItemName, __repeatItemValue,
	
	// cookie info
	__cookieInfo = __requestInfo.cookies,
	
	// ohters
	__i, __ch, __line = 1, __column = 1, __lastLine = 1, __lastColumn = 1;
	
	function print(content) {
		
		if (content !== undefined) {
			if (typeof content === 'string') {
				__html += content;
			} else {
				__html += JSON.stringify(content);
			}
		}
	}
	
	function save(name, value) {
		
		// 변수 삭제
		if (value === undefined) {
			__sharedStore.remove(name);
		}
		
		else {
			__sharedStore.save({
				name : name,
				value : value
			});
		}
	}
	
	function load(name) {
		return __sharedStore.get(name);
	}
	
	function cookie(name, value, expireSeconds, path, domain) {
		
		if (value === undefined) {
			value = __cookieInfo[name];
			
			if (CHECK_IS_DATA(value) === true) {
				return value.value;
			} else {
				return value;
			}
		}
		
		else {
			
			__cookieInfo[name] = {
				value : value,
				expireSeconds : expireSeconds,
				path : path,
				domain : domain
			};
			
			return value;
		}
	}
	
	function upload(uploadPath, callbackOrHandlers) {
		
		var
		// callback
		callback,

		// error handler
		errorHandler,

		// over file size handler
		overFileSizeHandler;

		if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
			callback = callbackOrHandlers;
		} else {
			callback = callbackOrHandlers.success;
			errorHandler = callbackOrHandlers.error;
			overFileSizeHandler = callbackOrHandlers.overFileSize;
		}
		
		UPLOAD_REQUEST({
			requestInfo : __requestInfo,
			uploadPath : __path.dirname(__sourcePath) + '/' + uploadPath
		}, {
			error : errorHandler,
			overFileSize : overFileSizeHandler,
			success : callback
		});
	}
	
	function redirect(url) {
		__redirectURL = url;
	}
	
	function pause() {
		__isPaused = true;
	}
	
	eval(__resumeFuncStr);
	
	resume();
	
}.toString(),

// resume func str
__resumeFuncStr = function resume() {
	
	eval(__parseFuncStr);
	eval(__resumeFuncStr);
	
	__isPaused = false;
	
	function include(__uri, __callback) {
		
		var
		// fullPath
		__fullPath = __path.dirname(__sourcePath) + '/' + __uri,
		
		// saved last index
		savedLastIndex = __lastIndex;
		
		pause();
		
		READ_FILE(__fullPath, {
			
			notExists : function() {
				__responseError(__fullPath, 'File not exists.', __source.substring(savedLastIndex, __i - 1), __lastLine, __lastColumn, __response);
			},
			
			success : function(__buffer) {
				
				var
				// ext
				ext = __path.extname(__uri).toLowerCase();
				
				if (ext === '.nsp') {
					__parse(__requestInfo, __fullPath, __buffer.toString(), function(res) {
						print(res.content);
						if (__callback !== undefined) {
							__callback();
						}
						resume();
					}, self, __isNotUsingDCBN);
				}
				
				else if (ext === '.js') {
					
					try {
						eval(__buffer.toString());
					} catch (e) {
						__responseError(__fullPath, e, __buffer.toString(), 1, 1, __response);
						return;
					}
					
					if (__callback !== undefined) {
						__callback();
					}
					resume();
				}
			}
		});
	}
	
	for (__i = __lastIndex; __i <= __source.length; __i += 1) {
		__ch = __source[__i];
		
		if (__i > 0) {
			
			// Node.js용 코드 시작
			if (__ch === '%' && __source[__i - 1] === '<') {
				
				if (
				__isIgnored !== true &&
				(__repeatInfo === undefined || __repeatInfo.key !== undefined) &&
				__startCodeIndex === -1 &&
				__startPstrIndex === -1 &&
				__startPstr2Index === -1 &&
				__startCondIndex === -1 &&
				__startEachIndex === -1) {
					
					if (__source[__i + 1] === '=') {
						
						if (__i > 2 && __source[__i - 3] === '\\' && __source[__i - 2] === '\\') {
							print(__source.substring(__lastIndex, __i - 2));
							__startPstr2Index = __i + 2;
						} else if (__i > 1 && __source[__i - 2] === '\\') {
							// Node.js용 코드 아님, 무시
							print(__source.substring(__lastIndex, __i - 2));
							print(__source.substring(__i - 1, __i + 2));
						} else {
							print(__source.substring(__lastIndex, __i - 1));
							__startPstr2Index = __i + 2;
						}
						__lastIndex = __i + 2;
						__lastLine = __line;
						__lastColumn = __column - 1;
						
					} else {
				
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
						__lastLine = __line;
						__lastColumn = __column - 1;
					}
				}
			}
			
			// Node.js용 코드 끝
			else if (__ch === '>' && __source[__i - 1] === '%') {
				
				if (
				__isIgnored !== true &&
				(__repeatInfo === undefined || __repeatInfo.key !== undefined) &&
				__startPstrIndex === -1 &&
				__startCondIndex === -1 &&
				__startEachIndex === -1) {
					
					if (
					__startCodeIndex !== -1 &&
					__startPstr2Index === -1) {
						
						try {
							eval(__source.substring(__lastIndex, __i - 1));
						} catch (e) {
							__responseError(__sourcePath, e, __source.substring(__lastIndex, __i - 1), __lastLine, __lastColumn, __response);
							return;
						}
						
						__startCodeIndex = -1;
						__lastIndex = __i + 1;
						
						if (__isPaused === true) {
							__column += 1;
							return;
						}
					}
					
					else if (
					__startCodeIndex === -1 &&
					__startPstr2Index !== -1) {
						
						try {
							print(eval(__source.substring(__lastIndex, __i - 1)));
						} catch (e) {
							__responseError(__sourcePath, e, __source.substring(__lastIndex, __i - 1), __lastLine, __lastColumn, __response);
							return;
						}
						
						__startPstr2Index = -1;
						__lastIndex = __i + 1;
						
						if (__isPaused === true) {
							__column += 1;
							return;
						}
					}
				}
			}
			
			// 출력 코드 시작
			else if (__isNotUsingDCBN !== true && __ch === '{' && __source[__i - 1] === '{') {
				
				if (
				__isIgnored !== true &&
				(__repeatInfo === undefined || __repeatInfo.key !== undefined) &&
				__startCodeIndex === -1 &&
				__startPstrIndex === -1 &&
				__startPstr2Index === -1 &&
				__startCondIndex === -1 &&
				__startEachIndex === -1) {
					
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
					__lastLine = __line;
					__lastColumn = __column - 1;
				}
			}
			
			// 출력 코드 끝
			else if (__ch === '}' && __source[__i - 1] === '}') {
				
				if (
				__isIgnored !== true &&
				(__repeatInfo === undefined || __repeatInfo.key !== undefined) &&
				__startCodeIndex === -1 &&
				__startPstrIndex !== -1 &&
				__startPstr2Index === -1 &&
				__startCondIndex === -1 &&
				__startEachIndex === -1) {
					
					try {
						print(eval(__source.substring(__lastIndex, __i - 1)));
					} catch (e) {
						__responseError(__sourcePath, e, __source.substring(__lastIndex, __i - 1), __lastLine, __lastColumn, __response);
						return;
					}
					
					__startPstrIndex = -1;
					__lastIndex = __i + 1;
					
					if (__isPaused === true) {
						__column += 1;
						return;
					}
				}
			}
			
			// 조건 코드 시작
			else if (__ch === '?' && __source[__i - 1] === '<') {
				
				if (
				__isIgnored !== true &&
				(__repeatInfo === undefined || __repeatInfo.key !== undefined) &&
				__startCodeIndex === -1 &&
				__startPstrIndex === -1 &&
				__startPstr2Index === -1 &&
				__startCondIndex === -1 &&
				__startEachIndex === -1) {
					
					if (__i > 2 && __source[__i - 3] === '\\' && __source[__i - 2] === '\\') {
						print(__source.substring(__lastIndex, __i - 2));
						__startCondIndex = __i + 1;
					} else if (__i > 1 && __source[__i - 2] === '\\') {
						// Node.js용 코드 아님, 무시
						print(__source.substring(__lastIndex, __i - 2));
						print(__source.substring(__i - 1, __i + 1));
					} else {
						print(__source.substring(__lastIndex, __i - 1));
						__startCondIndex = __i + 1;
					}
					__lastIndex = __i + 1;
					__lastLine = __line;
					__lastColumn = __column - 1;
				}
			}
			
			// 조건 코드 끝
			else if (__i > 3 && __ch === '>' && __source[__i - 1] === '?' && __source[__i - 2] === '/' && __source[__i - 3] === '<') {
				
				if (
				(__repeatInfo === undefined || __repeatInfo.key !== undefined) &&
				__startCodeIndex === -1 &&
				__startPstrIndex === -1 &&
				__startPstr2Index === -1 &&
				__startCondIndex === -1 &&
				__startEachIndex === -1) {
					
					if (__i > 5 && __source[__i - 5] === '\\' && __source[__i - 4] === '\\') {
						if (__isIgnored !== true) {
							print(__source.substring(__lastIndex, __i - 4));
						}
						__isIgnoreStack.pop();
						__isIgnored = __isIgnoreStack[__isIgnoreStack.length - 1];
					} else if (__i > 3 && __source[__i - 4] === '\\') {
						// Node.js용 코드 아님, 무시
						print(__source.substring(__lastIndex, __i - 4));
						print(__source.substring(__i - 3, __i + 1));
					} else {
						if (__isIgnored !== true) {
							print(__source.substring(__lastIndex, __i - 3));
						}
						__isIgnoreStack.pop();
						__isIgnored = __isIgnoreStack[__isIgnoreStack.length - 1];
					}
					__lastIndex = __i + 1;
				}
			}
			
			// 반복 코드 시작
			else if (__ch === '~' && __source[__i - 1] === '<') {
				
				if (
				__isIgnored !== true &&
				__startCodeIndex === -1 &&
				__startPstrIndex === -1 &&
				__startPstr2Index === -1 &&
				__startCondIndex === -1 &&
				__startEachIndex === -1) {
					
					if (__i > 2 && __source[__i - 3] === '\\' && __source[__i - 2] === '\\') {
						if (__repeatInfo === undefined || __repeatInfo.key !== undefined) {
							print(__source.substring(__lastIndex, __i - 2));
						}
						__startEachIndex = __i + 1;
					} else if (__i > 1 && __source[__i - 2] === '\\') {
						// Node.js용 코드 아님, 무시
						if (__repeatInfo === undefined || __repeatInfo.key !== undefined) {
							print(__source.substring(__lastIndex, __i - 2));
							print(__source.substring(__i - 1, __i + 1));
						}
					} else {
						if (__repeatInfo === undefined || __repeatInfo.key !== undefined) {
							print(__source.substring(__lastIndex, __i - 1));
						}
						__startEachIndex = __i + 1;
					}
					__lastIndex = __i + 1;
					__lastLine = __line;
					__lastColumn = __column - 1;
				}
			}
			
			// 반복 코드 끝
			else if (__i > 3 && __ch === '>' && __source[__i - 1] === '~' && __source[__i - 2] === '/' && __source[__i - 3] === '<') {
				
				if (
				__isIgnored !== true &&
				__startCodeIndex === -1 &&
				__startPstrIndex === -1 &&
				__startPstr2Index === -1 &&
				__startCondIndex === -1 &&
				__startEachIndex === -1) {
					
					if (__i > 5 && __source[__i - 5] === '\\' && __source[__i - 4] === '\\') {
						
						if (__repeatInfo !== undefined && __repeatInfo.key !== undefined) {
							
							__repeatTarget = __repeatInfo.target;
							__repeatTargetName = __repeatInfo.targetName;
							__repeatTargetFirstKey = __repeatInfo.key;
							__repeatItemName = __repeatInfo.name;
							__repeatItemValue = __repeatInfo.value;
							
							print(__source.substring(__lastIndex, __i - 4));
							
							// find next key
							__repeatTargetBeforeKey = undefined;
							for (__repeatTargetNowKey in __repeatTarget) {
								if (__repeatTarget.hasOwnProperty(__repeatTargetNowKey) === true) {
									if (__repeatTargetBeforeKey === __repeatTargetFirstKey) {
										__repeatInfo.key = __repeatTargetNowKey;
										break;
									}
									__repeatTargetBeforeKey = __repeatTargetNowKey;
								}
							}
							
							if (__repeatTargetFirstKey !== undefined && __repeatTargetNowKey !== __repeatTargetFirstKey) {
								
								__i = __repeatInfo.startIndex - 1;
								__line = __repeatInfo.line;
								__column = __repeatInfo.column;
								
								if (__repeatItemName === undefined) {
									eval('var ' + __repeatItemValue + ' = ' + __repeatTargetName + '[\'' + __repeatTargetNowKey + '\'];');
								} else {
									eval(
										'var ' + __repeatItemName + ' = \'' + __repeatTargetNowKey + '\';' +
										'var ' + __repeatItemValue + ' = ' + __repeatTargetName + '[\'' + __repeatTargetNowKey + '\'];'
									);
								}
							}
							
							else {
								__isRepeatStack.pop();
								__repeatInfo = __isRepeatStack[__isRepeatStack.length - 1];
							}
						}
						
						else {
							__isRepeatStack.pop();
							__repeatInfo = __isRepeatStack[__isRepeatStack.length - 1];
						}
					}
					
					else if (__i > 3 && __source[__i - 4] === '\\') {
						// Node.js용 코드 아님, 무시
						print(__source.substring(__lastIndex, __i - 4));
						print(__source.substring(__i - 3, __i + 1));
					}
					
					else {
						
						if (__repeatInfo !== undefined && __repeatInfo.key !== undefined) {
							
							__repeatTarget = __repeatInfo.target;
							__repeatTargetName = __repeatInfo.targetName;
							__repeatTargetFirstKey = __repeatInfo.key;
							__repeatItemName = __repeatInfo.name;
							__repeatItemValue = __repeatInfo.value;
							
							print(__source.substring(__lastIndex, __i - 3));
							
							// find next key
							__repeatTargetBeforeKey = undefined;
							for (__repeatTargetNowKey in __repeatTarget) {
								if (__repeatTarget.hasOwnProperty(__repeatTargetNowKey) === true) {
									if (__repeatTargetBeforeKey === __repeatTargetFirstKey) {
										__repeatInfo.key = __repeatTargetNowKey;
										break;
									}
									__repeatTargetBeforeKey = __repeatTargetNowKey;
								}
							}
							
							if (__repeatTargetNowKey !== __repeatTargetFirstKey) {
								
								__i = __repeatInfo.startIndex - 1;
								__line = __repeatInfo.line;
								__column = __repeatInfo.column;
								
								if (__repeatItemName === undefined) {
									eval('var ' + __repeatItemValue + ' = ' + __repeatTargetName + '[\'' + __repeatTargetNowKey + '\'];');
								} else {
									eval(
										'var ' + __repeatItemName + ' = \'' + __repeatTargetNowKey + '\';' +
										'var ' + __repeatItemValue + ' = ' + __repeatTargetName + '[\'' + __repeatTargetNowKey + '\'];'
									);
								}
							}
							
							else {
								__isRepeatStack.pop();
								__repeatInfo = __isRepeatStack[__isRepeatStack.length - 1];
							}
						}
						
						else {
							__isRepeatStack.pop();
							__repeatInfo = __isRepeatStack[__isRepeatStack.length - 1];
						}
					}
					
					__lastIndex = __i + 1;
				}
			}
			
			// 조건 코드나 반복 코드 시작의 끝
			else if (__ch === '>') {
				
				if (
				__isIgnored !== true &&
				__startCodeIndex === -1 &&
				__startPstrIndex === -1 &&
				__startPstr2Index === -1) {
					
					if (
					(__repeatInfo === undefined || __repeatInfo.key !== undefined) &&
					__startCondIndex !== -1 &&
					__startEachIndex === -1) {
						
						try {
							if (__source.substring(__lastIndex, __i).trim() === 'else') {
								if (__lastCond === true) {
									__isIgnored = true;
									__isIgnoreStack.push(true);
								} else {
									__isIgnoreStack.push(false);
								}
							} else if (eval(__source.substring(__lastIndex, __i)) === false) {
								__isIgnored = true;
								__isIgnoreStack.push(true);
								__lastCond = false;
							} else {
								__isIgnoreStack.push(false);
								__lastCond = true;
							}
						} catch (e) {
							__responseError(__sourcePath, e, __source.substring(__lastIndex, __i), __lastLine, __lastColumn, __response);
							return;
						}
						
						__startCondIndex = -1;
						__lastIndex = __i + 1;
						
						if (__isPaused === true) {
							__column += 1;
							return;
						}
					}
					
					else if (
					__startCondIndex === -1 &&
					__startEachIndex !== -1 &&
					__source[__i - 1] !== '-') {
						
						try {
							__repeatSplits = __source.substring(__lastIndex, __i).split('->');
							
							if (__repeatInfo === undefined || __repeatInfo.key !== undefined) {
								__repeatTargetName = __repeatSplits[0];
								__repeatTarget = eval(__repeatTargetName);
							} else {
								__repeatTargetName = undefined;
								__repeatTarget = undefined;
							}
							
							__repeatItemStr = __repeatSplits[1];
							
							if (__repeatTarget === undefined) {
								__isRepeatStack.push(__repeatInfo = {
									targetName : __repeatTargetName,
									value : __repeatItemStr,
									startIndex : __i + 1,
									line : __line,
									column : __column
								});
							}
							
							// name이 없을 때
							else if (__repeatItemStr.indexOf(':') === -1) {
								
								// find first key
								__repeatTargetFirstKey = undefined;
								for (__repeatTargetFirstKey in __repeatTarget) {
									if (__repeatTarget.hasOwnProperty(__repeatTargetFirstKey) === true) {
										break;
									}
								}
								
								__isRepeatStack.push(__repeatInfo = {
									target : __repeatTarget,
									targetName : __repeatTargetName,
									key : __repeatTargetFirstKey,
									value : __repeatItemStr,
									startIndex : __i + 1,
									line : __line,
									column : __column
								});
								
								eval('var ' + __repeatItemStr + ' = ' + __repeatTargetName + '[\'' + __repeatTargetFirstKey + '\'];');
							}
							
							// name이 있을 때
							else {
								__repeatItemSplits = __repeatItemStr.split(':');
								__repeatItemName = __repeatItemSplits[0];
								__repeatItemValue = __repeatItemSplits[1];
								
								// find first key
								__repeatTargetFirstKey = undefined;
								for (__repeatTargetFirstKey in __repeatTarget) {
									if (__repeatTarget.hasOwnProperty(__repeatTargetFirstKey) === true) {
										break;
									}
								}
								
								__isRepeatStack.push(__repeatInfo = {
									target : __repeatTarget,
									targetName : __repeatTargetName,
									key : __repeatTargetFirstKey,
									name : __repeatItemName,
									value : __repeatItemValue,
									startIndex : __i + 1,
									line : __line,
									column : __column
								});
								
								eval(
									'var ' + __repeatItemName + ' = \'' + __repeatTargetFirstKey + '\';' +
									'var ' + __repeatItemValue + ' = ' + __repeatTargetName + '[\'' + __repeatTargetFirstKey + '\'];'
								);
							}
						} catch (e) {
							__responseError(__sourcePath, e, __source.substring(__lastIndex, __i), __lastLine, __lastColumn, __response);
							return;
						}
						
						__startEachIndex = -1;
						__lastIndex = __i + 1;
						
						if (__isPaused === true) {
							__column += 1;
							return;
						}
					}
				}
			}
		}
		
		if (__ch === '\n') {
			__line += 1;
			__column = 1;
		} else {
			__column += 1;
		}
	}
	
	if (__startCodeIndex !== -1 || __startPstrIndex !== -1) {
		print(__source.substring(__lastIndex - 2));
	} else {
		print(__source.substring(__lastIndex));
	}
	
	if (__redirectURL !== undefined) {
		__response({
			statusCode : 302,
			headers : {
				'Location' : __redirectURL
			}
		});
	}
	
	else {
		__response({
			headers : {
				'Set-Cookie' : CREATE_COOKIE_STR_ARRAY(__cookieInfo)
			},
			content : __html,
			contentType : 'text/html'
		});
	}
	
}.toString();

function __responseError(path, e, code, line, column, response) {
	
	response({
		statusCode : 500,
		content : 
'<!doctype html><html><head><meta charset="UTF-8"><title>' + e + '</title></head><body>' +
'<p><b>' + e + '</b></p>' +
'<b>path: </b>' + path + ' (' + line + ':' + column + ')' +
(code === undefined ? '' : '<br><b>code: </b>' + code) +
'</body></html>',
		contentType : 'text/html'
	});
}

function __responseNotFound(response) {
	
	response({
		statusCode : 404,
		content : 
'<!doctype html><html><head><meta charset="UTF-8"><title>Page not found.</title></head><body>' +
'<p><b>Page not found.</b></p>' +
'</body></html>',
		contentType : 'text/html'
	});
}

RUN(function() {
	
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
	restURI = config.restURI,
	
	// is not using double curly brace notation
	isNotUsingDCBN = config.isNotUsingDCBN,
	
	// cached file infos
	cachedFileInfos = {};
	
	// dev mode가 true일 때는 리소스 캐싱을 하지 않습니다.
	CONFIG.isDevMode = config.isDevMode;
	
	eval(__parseFuncStr);

	// run web server
	RESOURCE_SERVER({
		port : port,
		rootPath : rootPath,
		version : Date.now(),
		noParsingParamsURI : config.uploadURI
	}, {
		
		notExistsResource : function(resourcePath, requestInfo, response) {
			__responseNotFound(response);
		},
		
		requestListener : function(requestInfo, response, onDisconnected, setRootPath, next) {
			
			var
			// uri
			uri = requestInfo.uri,
			
			// sub uri
			subURI = '',
			
			// path
			path,
			
			// ext
			ext,
			
			// run.
			run = function() {
				
				GET_FILE_INFO(path, {
					
					notExists : function() {
						__responseNotFound(response);
					},
					
					success : function(fileInfo) {
						
						var
						// cached file info
						cachedFileInfo = cachedFileInfos[path],
						
						// self
						self = {
							headers : requestInfo.headers,
							method : requestInfo.method,
							params : requestInfo.params,
							ip : requestInfo.ip,
							subURI : subURI
						};
						
						// 캐시된 파일 제공
						if (cachedFileInfo !== undefined
							&& (
								(fileInfo.lastUpdateTime !== undefined && cachedFileInfo.lastUpdateTime.getTime() === fileInfo.lastUpdateTime.getTime())
								|| (fileInfo.createTime !== undefined && cachedFileInfo.lastUpdateTime.getTime() === fileInfo.createTime.getTime())
							)
						) {
							__parse(requestInfo, path, cachedFileInfo.content, response, self, isNotUsingDCBN);
						}
						
						else {
							
							READ_FILE(path, {
								notExists : function() {
									__responseNotFound(response);
								},
								error : function(e) {
									__responseError(path, e, undefined, 1, 1, response);
								},
								success : function(buffer) {
									
									var
									// content
									content = buffer.toString();
									
									cachedFileInfos[path] = {
										content : content,
										lastUpdateTime : fileInfo.lastUpdateTime === undefined ? fileInfo.createTime : fileInfo.lastUpdateTime
									};
									
									__parse(requestInfo, path, content, response, self, isNotUsingDCBN);
								}
							});
						}
					}
				});
			};
			
			if (restURI !== undefined) {
				
				if (CHECK_IS_ARRAY(restURI) === true) {
					
					if (CHECK_IS_IN({
						array : restURI,
						value : uri
					}) === true) {
						uri = restURI + '.nsp';
					}
					
					else {
						
						EACH(restURI, function(restURI) {
							if (restURI + '/' === uri.substring(0, restURI.length + 1)) {
								subURI = uri.substring(restURI.length + 1);
								uri = restURI + '.nsp';
								return false;
							}
						});
					}
				}
				
				else {
					if (restURI === uri) {
						uri = restURI + '.nsp';
					} else if (restURI + '/' === uri.substring(0, restURI.length + 1)) {
						subURI = uri.substring(restURI.length + 1);
						uri = restURI + '.nsp';
					}
				}
			}
			
			if (uri === '') {
				uri = 'index.nsp';
			}
			
			path = rootPath + '/' + uri;
			
			ext = __path.extname(uri).toLowerCase();
			
			if (ext === '.nsp') {
				run();
				return false;
			}
			
			else if (ext === '') {
				
				CHECK_IS_EXISTS_FILE(path, function(isExists) {
					
					if (isExists === true) {
					
						CHECK_IS_FOLDER(path, function(isFolder) {
							if (isFolder === true) {
								path += '/index.nsp';
								run();
							} else {
								next();
							}
						});
					}
					
					else {
						path += '.nsp';
						run();
					}
				});
				
				return false;
			}
		}
	});

	console.log('NSP server started. - http://localhost:' + port);
});
