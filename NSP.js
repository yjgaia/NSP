/**
 * Node Server Pages
 * 
 * transpile NSP code to JavaScript code .
 */
global.NSP = METHOD(function(m) {
	
	var
	//IMPORT: Path
	Path = require('path'),
	
	// saved codes
	savedCodes = {},
	
	// shared store
	sharedStore = SHARED_STORE('__NSP_SHARED_STORE'),
	
	// get saved codes.
	getSavedCodes,
	
	// get shared store.
	getSharedStore,
	
	// generate error display.
	generateErrorDisplay;
	
	m.getSavedCodes = getSavedCodes = function() {
		return savedCodes;
	};
	
	m.getSharedStore = getSharedStore = function() {
		return sharedStore;
	};
	
	m.generateErrorDisplay = generateErrorDisplay = function(params) {
		//REQUIRED: params
		//REQUIRED: params.path
		//REQUIRED: params.startIndex
		//REQUIRED: params.endIndex
		//REQUIRED: params.startLine
		//REQUIRED: params.startColumn
		//REQUIRED: params.endLine
		//REQUIRED: params.endColumn
		//REQUIRED: params.error
		
		var
		// error display
		errorDisplay = '';
		
		errorDisplay += '<p><b>' + params.error + '</b></p>';
		errorDisplay += '<p><b>path: </b>' + params.path + ' (' + params.startLine + ':' + params.startColumn + '~' + params.endLine + ':' + params.endColumn + ')</p>';
		errorDisplay += '<pre>' + savedCodes[params.path].substring(params.startIndex, params.endIndex) + '</pre>';
		
		return errorDisplay;
	};
	
	// require.
	m.require = require;
	
	return {
		
		run : function(params) {
			//REQUIRED: params
			//REQUIRED: params.path
			//REQUIRED: params.code
			//OPTIONAL: params.isNotUsingDCBN
			//OPTIONAL: params.preprocessor
			
			var
			// path
			path = params.path,
			
			// code
			code = params.code,
			
			// is not using dcbn
			isNotUsingDCBN = params.isNotUsingDCBN,
			
			// preprocessor
			preprocessor = params.preprocessor,
			
			// compiled code
			compiledCode = '',
			
			// index
			i = 0, savedIndex = 0, firstBlockStartIndex, firstBlockEndIndex, j,
			
			// character
			ch, cch,
			
			// line
			line = 1, savedLine = 1, firstBlockStartLine, firstBlockEndLine,
			
			// line
			column = 0, savedColumn = 0, firstBlockStartColumn, firstBlockEndColumn,
			
			// resume count stack
			resumeCountStack = [0],
			
			// <%...%>
			isCodeMode = false, isCodePrintMode = false,
			
			// <?...>
			isQuestionMode = false,
			
			// <~...>
			isRepeatMode = false,
			
			// {{...}}
			isPrintMode = false,
			
			// '...'
			isString1Mode = false,
			
			// "..."
			isString2Mode = false,
			
			// //...
			isComment1Mode = false,
			
			// /*...*/
			isComment2Mode = false,
			
			// check is in code.
			checkIsInCode = function() {
				return isCodeMode === true ||
					isQuestionMode === true ||
					isRepeatMode === true ||
					isPrintMode === true;
			},
			
			// check is in string.
			checkIsInString = function() {
				return isString1Mode === true ||
					isString2Mode === true ||
					isComment1Mode === true ||
					isComment2Mode === true;
			},
			
			// add resume start.
			addResumeStart = function() {
				
				resumeCountStack[resumeCountStack.length - 1] += 1;
				
				compiledCode += '__pauseCount += 1;';
				compiledCode += '__store.resume = resume = function() { __pauseCount -= 1; if (__pauseCount === 0 && __store.doneResumeIndexes[' + i + '] !== true) { __store.doneResumeIndexes[' + i + '] = true;';
			},
			
			// add block start.
			addBlockStart = function(isFirst) {
				
				// init vars for block.
				compiledCode += 'var __pauseCount = 0;';
				compiledCode += 'var __lastCondition;';
				compiledCode += 'var __store = { doneResumeIndexes: {} };';
				compiledCode += 'var resume;';
				
				// pause func
				compiledCode += 'var pause = ' + function() {
					
					__pauseCount += 1;
					
				}.toString() + ';';
				
				// include func
				compiledCode += 'var include = ' + function(path) {
					
					LOAD_NSP({
						requestInfo : __requestInfo,
						path : __basePath + '/' + path,
						self : self
					}, {
						notExists : function() {
							print(path + ': File not exists.');
							resume();
						},
						error : function(error, path, startLine, startColumn, endLine, endColumn, startIndex, endIndex) {
							
							print(NSP.generateErrorDisplay({
								path : path,
								startIndex : startIndex,
								endIndex : endIndex,
								startLine : startLine,
								startColumn : startColumn,
								endLine : endLine,
								endColumn : endColumn,
								error : error
							}));
						},
						success : function(result) {
							print(result.html);
							resume();
						}
					});
					
					pause();
					
				}.toString() + ';';
				
				if (isFirst === true) {
					compiledCode += '__store.resume = resume = function() { __pauseCount -= 1; };';
				} else {
					addResumeStart();
				}
			};
			
			// save origin code.
			savedCodes[path] = code;
			
			// init compiled code.
			RUN(function() {
				
				// init vars.
				compiledCode += 'var __html = \'\';';
				compiledCode += 'var __redirectURL;';
				compiledCode += 'var __cookieInfo = __requestInfo.cookies;';
				compiledCode += 'var __newCookieInfo = {};';
				compiledCode += 'var __basePath = \'' + Path.dirname(path) + '\';';
				
				// print func
				compiledCode += 'var print = ' + function(content) {
					
					if (content !== undefined) {
						if (typeof content === 'string') {
							__html += content;
						} else {
							__html += JSON.stringify(content);
						}
					}
					
				}.toString() + ';';
				
				// save func
				compiledCode += 'var save = ' + function(name, value) {
					
					if (value === undefined) {
						NSP.getSharedStore().remove(name);
					}
					
					else {
						NSP.getSharedStore().save({
							name : name,
							value : value
						});
					}
					
				}.toString() + ';';
				
				// load func
				compiledCode += 'var load = ' + function(name) {
					
					return NSP.getSharedStore().get(name);
					
				}.toString() + ';';
				
				// cookie func
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
				
				// upload func
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
				
				// redirect func
				compiledCode += 'var redirect = ' + function(url) {
					
					__redirectURL = url;
					
					__handler({
						cookies : __newCookieInfo,
						redirectURL : __redirectURL
					});
					
				}.toString() + ';';
				
				// __each func
				compiledCode += 'var __each = ' + function(target, func) {
					
					if (isNaN(target) === true) {
						EACH(target, function(value, name) {
							func(name, value);
						});
					} else {
						REPEAT(target, function(i) {
							func(undefined, i);
						});
					}
					
				}.toString() + ';';
				
				addBlockStart(true);
				
				compiledCode += 'print(\'';
			});
			
			// parse code.
			for (; i < code.length; i += 1) {
				
				column += 1;
				
				ch = code[i];
				cch = ch + code[i + 1];
				
				// start code mode.
				if (cch === '<%' && checkIsInCode() !== true) {
					isCodeMode = true;
					
					savedLine = line;
					savedColumn = column;
					savedIndex = i;
					
					if (firstBlockStartIndex === undefined) {
						firstBlockStartIndex = i;
						firstBlockStartLine = line;
						firstBlockStartColumn = column;
						
						compiledCode += '\');';
					} else {
						compiledCode += '\'); try {';
					}
					
					if (code[i + 2] === '=') {
						isCodePrintMode = true;
						
						compiledCode += 'print(';
						
						i += 2;
						column += 2;
					}
					
					else {
						i += 1;
						column += 1;
					}
					continue;
				}
				
				// end code mode.
				if (cch === '%>' && checkIsInString() !== true && isCodeMode === true) {
					isCodeMode = false;
					
					if (isCodePrintMode === true) {
						isCodePrintMode = false;
						
						compiledCode += ');';
					}
					
					if (firstBlockEndIndex === undefined) {
						firstBlockEndIndex = i + 2;
						firstBlockEndLine = line;
						firstBlockEndColumn = column + 1;
					} else {
						compiledCode += '} catch(e) { __errorHandler(e, __path, ' + savedLine + ', ' + savedColumn + ', ' + line + ', ' + (column + 1) + ', ' + savedIndex + ', ' + (i + 2) + '); }';
					}
					
					addResumeStart();
					
					compiledCode += 'print(\'';
					
					i += 1;
					column += 1;
					continue;
				}
					
				// start question mode.
				if (cch === '<?' && checkIsInCode() !== true) {
					isQuestionMode = true;
					
					compiledCode += '\'); try { if (__lastCondition = (';
					
					savedLine = line;
					savedColumn = column;
					savedIndex = i;
					
					i += 1;
					column += 1;
					continue;
				}
					
				// start repeat mode.
				if (cch === '<~' && checkIsInCode() !== true) {
					isRepeatMode = true;
					
					compiledCode += '\'); try { __each(';
					
					savedLine = line;
					savedColumn = column;
					savedIndex = i;
					
					i += 1;
					j = -1;
					column += 1;
					continue;
				}
				
				// split repeat.
				if (cch === '->' && checkIsInString() !== true && isRepeatMode === true) {
					
					compiledCode += ', function(';
					
					i += 1;
					column += 1;
					
					for (j = i + 1; j < code.length; j += 1) {
						if (code[j] === '>') {
							compiledCode += '__name, ';
							break;
						}
						if (code[j] === ':') {
							break;
						}
					}
					
					continue;
				}
				
				// split repeat.
				if (ch === ':' && checkIsInString() !== true && isRepeatMode === true) {
					
					compiledCode += ', ';
					
					continue;
				}
				
				// else
				if (cch === 'el' && code[i + 2] === 's' && code[i + 3] === 'e' && (code[i + 4] === ' ' || code[i + 4] === '\t' || code[i + 4] === '>' || code[i + 4] === '\r' || code[i + 4] === '\n') && checkIsInString() !== true && isQuestionMode === true) {
					
					compiledCode += '__lastCondition !== true';
					
					i += 3;
					column += 3;
					continue;
				}
				
				if (ch === '>' && checkIsInString() !== true) {
					
					// end question mode.
					if (isQuestionMode === true) {
						isQuestionMode = false;
						
						resumeCountStack.push(0);
						
						compiledCode += ') === true) { (function(__parentPause, __parentStore) {';
						
						addBlockStart();
						
						compiledCode += 'print(\'';
						
						continue;
					}
					
					// end repeat mode.
					if (isRepeatMode === true) {
						isRepeatMode = false;
						
						resumeCountStack.push(0);
						
						if (j === -1) {
							compiledCode += ', function(__name, __value';
						}
						
						compiledCode += ') { (function(__parentPause, __parentStore) {';
						
						addBlockStart();
						
						compiledCode += 'print(\'';
						
						continue;
					}
				}
				
				// end block.
				if (cch === '</' && code[i + 3] === '>' && checkIsInCode() !== true) {
					
					// end question block.
					if (code[i + 2] === '?') {
						
						compiledCode += '\');';
						
						REPEAT(resumeCountStack[resumeCountStack.length - 1], function(i) {
							if (i === 0) {
								compiledCode += '__parentStore.resume();'
							}
							compiledCode += '} }; resume();';
						});
						resumeCountStack.pop();
						
						compiledCode += '__parentPause(); } )(pause, __store); } } catch(e) { __errorHandler(e, __path, ' + savedLine + ', ' + savedColumn + ', ' + line + ', ' + (column + 3) + ', ' + savedIndex + ', ' + (i + 4) + '); }';
						
						addResumeStart();
						
						compiledCode += 'print(\'';
						
						i += 3;
						column += 3;
						continue;
					}
					
					// end repeat block.
					if (code[i + 2] === '~') {
						
						compiledCode += '\');';
						
						REPEAT(resumeCountStack[resumeCountStack.length - 1], function(i) {
							if (i === 0) {
								compiledCode += '__parentStore.resume();'
							}
							compiledCode += '} }; resume();';
						});
						resumeCountStack.pop();
						
						compiledCode += '__parentPause(); } )(pause, __store); } ); } catch(e) { __errorHandler(e, __path, ' + savedLine + ', ' + savedColumn + ', ' + line + ', ' + (column + 3) + ', ' + savedIndex + ', ' + (i + 4) + '); }';
						
						addResumeStart();
						
						compiledCode += 'print(\'';
						
						i += 3;
						column += 3;
						continue;
					}
				}
				
				// start print mode.
				if (isNotUsingDCBN !== true && cch === '{{' && checkIsInCode() !== true) {
					isPrintMode = true;
					
					compiledCode += '\'); try { print(';
					
					savedLine = line;
					savedColumn = column;
					savedIndex = i;
					
					i += 1;
					column += 1;
					continue;
				}
				
				// end print mode.
				if (isNotUsingDCBN !== true && cch === '}}' && checkIsInString() !== true && isPrintMode === true) {
					isPrintMode = false;
					
					compiledCode += '); } catch(e) { __errorHandler(e, __path, ' + savedLine + ', ' + savedColumn + ', ' + line + ', ' + (column + 1) + ', ' + savedIndex + ', ' + (i + 2) + '); }';
					
					addResumeStart();
					
					compiledCode += 'print(\'';
					
					i += 1;
					column += 1;
					continue;
				}
				
				if (ch === '\'') {
					
					if (checkIsInCode() === true) {
						
						// start string1 mode.
						if (checkIsInString() !== true) {
							isString1Mode = true;
							
							compiledCode += '\'';
							
							continue;
						}
						
						// end string1 mode.
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
					
					// start string2 mode.
					if (checkIsInString() !== true) {
						isString2Mode = true;
						
						compiledCode += '\'';
						
						continue;
					}
					
					// end string2 mode.
					if (isString2Mode === true) {
						isString2Mode = false;
						
						compiledCode += '\'';
						
						continue;
					}
				}
				
				// start comment1 mode.
				if (cch === '//' && checkIsInCode() === true && checkIsInString() !== true) {
					isComment1Mode = true;
					
					compiledCode += '//';
					
					i += 1;
					column += 1;
					continue;
				}
				
				// start comment2 mode.
				if (cch === '/*' && checkIsInCode() === true && checkIsInString() !== true) {
					isComment2Mode = true;
					
					compiledCode += '/*';
					
					i += 1;
					column += 1;
					continue;
				}
				
				// end comment2 mode.
				if (cch === '*/' && checkIsInCode() === true && isComment2Mode === true) {
					isComment2Mode = false;
					
					compiledCode += '*/';
					
					i += 1;
					column += 1;
					continue;
				}
				
				if (ch === '\n') {
					
					line += 1;
					column = 0;
					
					// end comment1 mode.
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
				
				// ignore return character.
				if (ch !== '\r') {
					compiledCode += ch;
				}
			}
			
			compiledCode += '\'); __handler({ html: __html, cookies: __newCookieInfo });';
			
			REPEAT(resumeCountStack[0], function() {
				compiledCode += '} }; resume();';
			});
			
			if (preprocessor !== undefined) {
				compiledCode = preprocessor(compiledCode);
			}
			
			if (firstBlockStartIndex !== undefined) {
				compiledCode = 'try {' + compiledCode + '} catch(e) { __errorHandler(e, __path, ' + firstBlockStartLine + ', ' + firstBlockStartColumn + ', ' + firstBlockEndLine + ', ' + firstBlockEndColumn + ', ' + firstBlockStartIndex + ', ' + firstBlockEndIndex + '); }';
			}
			
			compiledCode = 'var __path = \'' + path + '\';' + compiledCode;
			compiledCode = 'var require = NSP.require;' + compiledCode;
			
			return compiledCode;
		}
	}
});