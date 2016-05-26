var cachedFileInfos = {};

var
//IMPORT: Path
Path = require('path');

global.__NSP_SHARED_STORE = SHARED_STORE('__NSP_SHARED_STORE');

global.LOAD_NSP = function(requestInfo, path, self, notExistsHandler, errorHandler, handler) {
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
				cachedFileInfo.run(requestInfo, self, errorHandler, handler);
			}
			
			else {
				
				READ_FILE(path, {
					notExists : notExistsHandler,
					error : errorHandler,
					success : function(buffer) {
						
						var
						// run.
						run = new Function('__requestInfo', 'self', '__errorHandler', '__handler', NSP(path, buffer.toString()));
						
						cachedFileInfos[path] = {
							lastUpdateTime : fileInfo.lastUpdateTime === undefined ? fileInfo.createTime : fileInfo.lastUpdateTime,
							run : run
						};
						
						run(requestInfo, self, errorHandler, handler);
					}
				});
			}
		}
	});
};

global.NSP = function(path, code) {
	//REQUIRED: code
	
	// init
	var compiledCode = '';
	
	compiledCode += 'var __html = \'\';';
	compiledCode += 'var __redirectURL;';
	compiledCode += 'var __cookieInfo = __requestInfo.cookies;';
	compiledCode += 'var __newCookieInfo = {};';
	compiledCode += 'var __basePath = \'' + Path.dirname(path) + '\';';
	
	// print
	compiledCode += 'var print = ' + function(content) {
		
		if (content !== undefined) {
			if (typeof content === 'string') {
				__html += content;
			} else {
				__html += JSON.stringify(content);
			}
		}
		
	}.toString() + ';';
	
	// save
	compiledCode += 'var save = ' + function(name, value) {
		
		if (value === undefined) {
			__NSP_SHARED_STORE.remove(name);
		}
		
		else {
			__NSP_SHARED_STORE.save({
				name : name,
				value : value
			});
		}
		
	}.toString() + ';';
	
	// load
	compiledCode += 'var load = ' + function(name) {
		
		return __NSP_SHARED_STORE.get(name);
		
	}.toString() + ';';
	
	// cookie
	compiledCode += 'var cookie = ' + function(name, value, expireSeconds, path, domain) {
		
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
		
	}.toString() + ';';
	
	// upload
	compiledCode += 'var upload = ' + function(uploadPath, callbackOrHandlers) {
		
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
			uploadPath : __basePath + '/' + uploadPath
		}, {
			error : errorHandler,
			overFileSize : overFileSizeHandler,
			success : callback
		});
		
	}.toString() + ';';
	
	// redirect
	compiledCode += 'var redirect = ' + function(url) {
		
		__redirectURL = url;
		
	}.toString() + ';';
	
	var i = 0;
	
	var resumeCountStack = [0];
	
	var addResumeStart = function() {
		
		resumeCountStack[resumeCountStack.length - 1] += 1;
		
		compiledCode += '__pauseCount += 1;';
		compiledCode += '__store.resume = resume = function() { __pauseCount -= 1; if (__pauseCount === 0 && __store.doneResumeIndexes[' + i + '] !== true) { __store.doneResumeIndexes[' + i + '] = true;';
	};
	
	var addBlockStart = RAR(function() {
		compiledCode += 'var __pauseCount = 0;';
		compiledCode += 'var __lastCondition;';
		compiledCode += 'var __store = { doneResumeIndexes: {} };';
		compiledCode += 'var resume;';
		
		// pause
		compiledCode += 'var pause = ' + function() {
			
			__pauseCount += 1;
			
		}.toString() + ';';
		
		// include
		compiledCode += 'var include = ' + function(path) {
			
			LOAD_NSP(__requestInfo, __basePath + '/' + path, self, function() {
				print(path + ': File not exists.');
				resume();
			}, __errorHandler, function(result) {
				print(result.html);
				resume();
			});
			
			pause();
			
		}.toString() + ';';
		
		addResumeStart();
	});
	
	compiledCode += 'print(\'';
	
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
			isComment2Mode === true;
	};
	
	var line = 1, savedLine = 1;
	var column = 0, savedColumn = 0;
	
	for (; i < code.length; i += 1) {
		
		column += 1;
		
		var ch = code[i];
		var cch = ch + code[i + 1];
		
		// start code mode
		if (cch === '<%' && checkIsInCode() !== true) {
			isCodeMode = true;
			
			compiledCode += '\'); try {';
			
			savedLine = line;
			savedColumn = column;
			
			if (code[i + 2] === '=') {
				isCodePrintMode = true;
				
				compiledCode += 'print(';
				
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
			
			compiledCode += '} catch(e) { __errorHandler(e, ' + savedLine + ',' + savedColumn + '); }';
			
			addResumeStart();
			
			compiledCode += 'print(\'';
			
			i += 1;
			continue;
		}
			
		// start question mode
		if (cch === '<?' && checkIsInCode() !== true) {
			isQuestionMode = true;
			
			compiledCode += '\'); try { if (__lastCondition = (';
			
			savedLine = line;
			savedColumn = column;
			
			i += 1;
			continue;
		}
			
		// start repeat mode
		if (cch === '<~' && checkIsInCode() !== true) {
			isRepeatMode = true;
			
			compiledCode += '\'); try { EACH(';
			
			savedLine = line;
			savedColumn = column;
			
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
			
			compiledCode += ', ';
			
			continue;
		}
		
		// else
		if (cch === 'el' && code[i + 2] === 's' && code[i + 3] === 'e' && (code[i + 4] === ' ' || code[i + 4] === '\t' || code[i + 4] === '>' || code[i + 4] === '\r' || code[i + 4] === '\n') && checkIsInString() !== true && isQuestionMode === true) {
			
			compiledCode += '__lastCondition !== true';
			
			i += 3;
			continue;
		}
		
		if (ch === '>' && checkIsInString() !== true) {
			
			// end question mode
			if (isQuestionMode === true) {
				isQuestionMode = false;
				
				resumeCountStack.push(0);
				
				compiledCode += ') === true) { (function(__parentPause, __parentStore) {';
				
				addBlockStart();
				
				compiledCode += 'print(\'';
				
				continue;
			}
			
			// end repeat mode
			if (isRepeatMode === true) {
				isRepeatMode = false;
				
				resumeCountStack.push(0);
				
				compiledCode += ') { (function(__parentPause, __parentStore) {';
				
				addBlockStart();
				
				compiledCode += 'print(\'';
				
				continue;
			}
		}
		
		// end block
		if (cch === '</' && code[i + 3] === '>' && checkIsInCode() !== true) {
			
			// end question block
			if (code[i + 2] === '?') {
				
				compiledCode += '\');';
				
				REPEAT(resumeCountStack[resumeCountStack.length - 1], function(i) {
					if (i === 0) {
						compiledCode += '__parentStore.resume();'
					}
					compiledCode += '} }; resume();';
				});
				resumeCountStack.pop();
				
				compiledCode += '__parentPause(); } )(pause, __store); } } catch(e) { __errorHandler(e, ' + savedLine + ', ' + savedColumn + '); }';
				
				addResumeStart();
				
				compiledCode += 'print(\'';
				
				i += 3;
				continue;
			}
			
			// end repeat block
			if (code[i + 2] === '~') {
				
				compiledCode += '\');';
				
				REPEAT(resumeCountStack[resumeCountStack.length - 1], function(i) {
					if (i === 0) {
						compiledCode += '__parentStore.resume();'
					}
					compiledCode += '} }; resume();';
				});
				resumeCountStack.pop();
				
				compiledCode += '__parentPause(); } )(pause, __store); } ); } catch(e) { __errorHandler(e, ' + savedLine + ', ' + savedColumn + '); }';
				
				addResumeStart();
				
				compiledCode += 'print(\'';
				
				i += 3;
				continue;
			}
		}
		
		// start print mode
		if (cch === '{{' && checkIsInCode() !== true) {
			isPrintMode = true;
			
			compiledCode += '\'); try { print(';
			
			savedLine = line;
			savedColumn = column;
			
			i += 1;
			continue;
		}
		
		// end print mode
		if (cch === '}}' && checkIsInString() !== true && isPrintMode === true) {
			isPrintMode = false;
			
			compiledCode += '); } catch(e) { __errorHandler(e, ' + savedLine + ', ' + savedColumn + '); }';
			
			addResumeStart();
			
			compiledCode += 'print(\'';
			
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
		
		if (ch === '\n') {
			
			line += 1;
			column = 0;
			
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
		
		if (ch === '\\' && checkIsInCode() !== true) {
			
			compiledCode += '\\\\';
			
			continue;
		}
		
		if (ch !== '\r') {
			compiledCode += ch;
		}
	}
	
	compiledCode += '\'); __handler({ html: __html, cookies: __newCookieInfo, redirectURL: __redirectURL });';
	
	REPEAT(resumeCountStack[0], function() {
		compiledCode += '} }; resume();';
	});
	
	return compiledCode;
};