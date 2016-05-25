// import UJS.
require('./import/UJS-NODE.js');

var cachedFileInfos = {};

global.__NSP_SHARED_STORE = SHARED_STORE('__NSP_SHARED_STORE');

global.LOAD_NSP = function(__requestInfo, path, self, notExistsHandler, errorHandler, handler) {
	//REQUIRED: path
	
	GET_FILE_INFO(path, {
		notExists : notExistsHandler,
		success : function(fileInfo) {
			
			var cachedFileInfo = cachedFileInfos[path];
			
			if (cachedFileInfo !== undefined
				&& (
					(fileInfo.lastUpdateTime !== undefined && cachedFileInfo.lastUpdateTime.getTime() === fileInfo.lastUpdateTime.getTime())
					|| (fileInfo.createTime !== undefined && cachedFileInfo.lastUpdateTime.getTime() === fileInfo.createTime.getTime())
				)
			) {
				try {
					handler(cachedFileInfo.run(__requestInfo, self));
				} catch(e) {
					errorHandler(e);
				}
			}
			
			else {
				
				READ_FILE(path, {
					notExists : notExistsHandler,
					error : errorHandler,
					success : function(buffer) {
						
						var
						// run.
						run = new Function('__requestInfo', 'self', NSP(buffer.toString()));
						
						cachedFileInfos[path] = {
							lastUpdateTime : fileInfo.lastUpdateTime === undefined ? fileInfo.createTime : fileInfo.lastUpdateTime,
							run : run
						};
						
						try {
							handler(run(__requestInfo, self));
						} catch(e) {
							errorHandler(e);
						}
					}
				});
			}
		}
	});
};

global.NSP = function(code) {
	//REQUIRED: code
	
	// init
	var compiledCode = '';
	
	function addCompiledCode(subCode) {
		compiledCode += '\t' + subCode + '\n';
	}
	
	addCompiledCode('var __html = \'\';');
	addCompiledCode('var __pauseCount = 1;');
	addCompiledCode('var __redirectURL;');
	addCompiledCode('var __cookieInfo = __requestInfo.cookies;');
	addCompiledCode('var __newCookieInfo = {};');
	
	// print
	addCompiledCode(function print(content) {
		
		if (content !== undefined) {
			if (typeof content === 'string') {
				__html += content;
			} else {
				__html += JSON.stringify(content);
			}
		}
		
	}.toString());
	
	// save
	addCompiledCode(function save(name, value) {
		
		if (value === undefined) {
			__NSP_SHARED_STORE.remove(name);
		}
		
		else {
			__NSP_SHARED_STORE.save({
				name : name,
				value : value
			});
		}
		
	}.toString());
	
	// load
	addCompiledCode(function load(name) {
		
		return __NSP_SHARED_STORE.get(name);
		
	}.toString());
	
	// cookie
	addCompiledCode(function cookie(name, value, expireSeconds, path, domain) {
		
		if (value === undefined) {
			value = __cookieInfo[name];
			
			if (CHECK_IS_DATA(value) === true) {
				return value.value;
			} else {
				return value;
			}
		}
		
		else {
			
			__newCookieInfo[name] = __cookieInfo[name] = {
				value : value,
				expireSeconds : expireSeconds,
				path : path,
				domain : domain
			};
			
			return value;
		}
		
	}.toString());
	
	// upload
	addCompiledCode(function upload(uploadPath, callbackOrHandlers) {
		
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
		
	}.toString());
	
	// redirect
	addCompiledCode(function redirect(url) {
		
		__redirectURL = url;
		
	}.toString());
	
	// pause
	addCompiledCode(function pause() {
		
		__pauseCount += 1;
		
	}.toString());
	
	// <%...%>
	var isCodeMode = false;
	var isCodePrintMode = false;
	
	// <?...>
	var isQuestionMode = false;
	
	// <~...>
	var isRepeatMode = false;
	
	// {{...}}
	var isPrintMode = false;
	
	// '...'
	var isString1Mode = false;
	
	// "..."
	var isString2Mode = false;
	
	// //...
	var isComment1Mode = false;
	
	// /*...*/
	var isComment2Mode = false;
	
	// /.../
	var isRegexMode = false;
	
	function checkIsInCode() {
		return isCodeMode === true ||
			isQuestionMode === true ||
			isRepeatMode === true ||
			isPrintMode === true;
	};
	
	function checkIsInString() {
		return isString1Mode === true ||
			isString2Mode === true ||
			isComment1Mode === true ||
			isComment2Mode === true ||
			isRegexMode === true;
	};
	
	compiledCode += '\tprint(\'';
	
	for (var i = 0; i < code.length; i += 1) {
		
		var ch = code[i];
		var cch = ch + code[i + 1];
		
		// start code mode
		if (cch === '<%' && checkIsInCode() !== true) {
			isCodeMode = true;
			
			compiledCode += '\');\n';
			
			if (code[i + 2] === '=') {
				isCodePrintMode = true;
				
				compiledCode += '\tprint(';
				
				i += 2;
			}
			
			else {
				i += 1;
			}
			continue;
		}
		
		// end code mode
		if (cch === '%>' && checkIsInString() !== true && isCodeMode === true) {
			isCodeMode = false;
			
			if (isCodePrintMode === true) {
				isCodePrintMode = false;
				
				compiledCode += ');';
			}
			
			compiledCode += '\n\tprint(\'';
			
			i += 1;
			continue;
		}
			
		// start question mode
		if (cch === '<?' && checkIsInCode() !== true) {
			isQuestionMode = true;
			
			compiledCode += '\');\n\tif (';
			
			i += 1;
			continue;
		}
			
		// start repeat mode
		if (cch === '<~' && checkIsInCode() !== true) {
			isRepeatMode = true;
			
			compiledCode += '\');\n\tEACH(';
			
			i += 1;
			continue;
		}
		
		// split repeat
		if (cch === '->' && checkIsInString() !== true && isRepeatMode === true) {
			
			compiledCode += ', function(';
			
			i += 1;
			continue;
		}
		
		// split repeat
		if (ch === ':' && checkIsInString() !== true && isRepeatMode === true) {
			
			compiledCode += ',';
			
			continue;
		}
		
		if (ch === '>' && checkIsInString() !== true) {
			
			// end question mode
			if (isQuestionMode === true) {
				isQuestionMode = false;
				
				compiledCode += ') {\n\tprint(\'';
				
				continue;
			}
			
			// end repeat mode
			if (isRepeatMode === true) {
				isRepeatMode = false;
				
				compiledCode += ') {\n\tprint(\'';
				
				continue;
			}
		}
		
		// end block
		if (cch === '</' && code[i + 3] === '>' && checkIsInCode() !== true) {
			
			// end question block
			if (code[i + 2] === '?') {
				
				compiledCode += '\');\n\t}\n\tprint(\'';
				
				i += 3;
				continue;
			}
			
			// end repeat block
			if (code[i + 2] === '~') {
				
				compiledCode += '\');\n\t});\n\tprint(\'';
				
				i += 3;
				continue;
			}
		}
		
		// start print mode
		if (cch === '{{' && checkIsInCode() !== true) {
			isPrintMode = true;
			
			compiledCode += '\');\n\tprint(';
			
			i += 1;
			continue;
		}
		
		// end print mode
		if (cch === '}}' && checkIsInString() !== true && isPrintMode === true) {
			isPrintMode = false;
			
			compiledCode += ');\n\tprint(\'';
			
			i += 1;
			continue;
		}
		
		if (ch === '\'') {
			
			if (checkIsInCode() === true) {
				
				// start string1 mode
				if (checkIsInString() !== true) {
					isString1Mode = true;
					
					compiledCode += '\'';
					
					continue;
				}
				
				// end strting1 mode
				if (isString1Mode === true) {
					isString1Mode = false;
					
					compiledCode += '\'';
					
					continue;
				}
			}
			
			else {
				compiledCode += '\\\'';
				
				continue;
			}
		}
		
		if (ch === '"' && checkIsInCode() === true) {
			
			// start string2 mode
			if (checkIsInString() !== true) {
				isString2Mode = true;
				
				compiledCode += '\'';
				
				continue;
			}
			
			// end strting2 mode
			if (isString2Mode === true) {
				isString2Mode = false;
				
				compiledCode += '\'';
				
				continue;
			}
		}
		
		// start comment1 mode
		if (cch === '//' && checkIsInCode() === true && checkIsInString() !== true) {
			isComment1Mode = true;
			
			compiledCode += '//';
			
			i += 1;
			continue;
		}
		
		// start comment2 mode
		if (cch === '/*' && checkIsInCode() === true && checkIsInString() !== true) {
			isComment2Mode = true;
			
			compiledCode += '/*';
			
			i += 1;
			continue;
		}
		
		// end comment2 mode
		if (cch === '*/' && checkIsInCode() === true && isComment2Mode === true) {
			isComment2Mode = false;
			
			compiledCode += '*/';
			
			i += 1;
			continue;
		}
			
		if (ch === '/' && checkIsInCode() === true) {
			
			// start regex mode
			if (checkIsInString() !== true) {
				isRegexMode = true;
				
				compiledCode += '/';
				
				continue;
			}
			
			// end regex mode
			if (isRegexMode === true) {
				isRegexMode = false;
				
				compiledCode += '/';
				
				continue;
			}
		}
		
		if (ch === '\n') {
			
			// end comment1 mode
			if (checkIsInCode() === true && isComment1Mode === true) {
				isComment1Mode = false;
				
				compiledCode += '\n';
				
				continue;
			}
			
			if (checkIsInCode() !== true) {
				
				compiledCode += '\\n';
				
				continue;
			}
		}
		
		if (ch !== '\r') {
			compiledCode += ch;
		}
	}
	
	compiledCode += '\');\n';
	
	addCompiledCode('return {\n\t\thtml : __html,\n\t\tcookies : __newCookieInfo,\n\t\tredirectURL : __redirectURL\n\t};');
	return compiledCode;
};