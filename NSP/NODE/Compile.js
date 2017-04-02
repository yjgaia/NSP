/*
 * Node Server Pages
 * 
 * compile NSP code to JavaScript code.
 */
NSP.Compile = METHOD((m) => {
	
	let Path = require('path');
	
	let savedCodes = {};
	
	let getSavedCodes = m.getSavedCodes = () => {
		return savedCodes;
	};
	
	m.require = require;
	
	return {
		
		run : (params) => {
			//REQUIRED: params
			//REQUIRED: params.path
			//REQUIRED: params.code
			//OPTIONAL: params.isNotUsingDCBN
			//OPTIONAL: params.preprocessor
			
			let path = params.path;
			let code = params.code;
			let isNotUsingDCBN = params.isNotUsingDCBN;
			let preprocessor = params.preprocessor;
			
			let compiledCode = '';
			
			// indexes
			let i = 0, j, savedIndex = 0, firstBlockStartIndex, firstBlockEndIndex;
			
			// characters
			let ch, cch;
			
			// lines and columns
			let line = 1, savedLine = 1, firstBlockStartLine, firstBlockEndLine;
			let column = 0, savedColumn = 0, firstBlockStartColumn, firstBlockEndColumn;
			
			let resumeCountStack = [0];
			
			// <%...%>
			let isCodeMode = false;
			let isCodePrintMode = false;
			
			// <?...>
			let isQuestionMode = false;
			
			// <~...>
			let isRepeatMode = false;
			
			// {{...}}
			let isPrintMode = false;
			
			// '...'
			let isString1Mode = false;
			
			// "..."
			let isString2Mode = false;
			
			// //...
			let isComment1Mode = false;
			
			// /*...*/
			let isComment2Mode = false;
			
			checkIsInCode = () => {
				return isCodeMode === true ||
					isQuestionMode === true ||
					isRepeatMode === true ||
					isPrintMode === true;
			};
			
			checkIsInString = () => {
				return isString1Mode === true ||
					isString2Mode === true ||
					isComment1Mode === true ||
					isComment2Mode === true;
			};
			
			addResumeStart = () => {
				
				resumeCountStack[resumeCountStack.length - 1] += 1;
				
				compiledCode += '__pauseCount += 1;';
				compiledCode += '__store.resume = resume = () => { __pauseCount -= 1; if (__pauseCount === 0 && __store.doneResumeIndexes[' + i + '] !== true) { __store.doneResumeIndexes[' + i + '] = true;';
			};
			
			addBlockStart = (isFirst) => {
				
				// init vars for block.
				compiledCode += 'let __pauseCount = 0;';
				compiledCode += 'let __lastCondition;';
				compiledCode += 'let __store = { doneResumeIndexes: {} };';
				compiledCode += 'let resume;';
				
				// pause func
				compiledCode += `let pause = () => {
					
					__pauseCount += 1;
					
				};`;
				
				// include func
				compiledCode += `let include = (path) => {
					
					NSP.Load({
						requestInfo : __requestInfo,
						path : __basePath + '/' + path,
						self : self
					}, {
						notExists : () => {
							print(path + ': File not exists.');
							resume();
						},
						error : (error, path, startLine, startColumn, endLine, endColumn, startIndex, endIndex) => {
							
							print(NSP.GenerateErrorDisplay({
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
						success : (result) => {
							print(result.html);
							resume();
						}
					});
					
					pause();
					
				};`;
				
				if (isFirst === true) {
					compiledCode += '__store.resume = resume = () => { __pauseCount -= 1; };';
				} else {
					addResumeStart();
				}
			};
			
			// save origin code.
			savedCodes[path] = code;
			
			// init compiled code.
			
			// init vars.
			compiledCode += 'let __html = \'\';';
			compiledCode += 'let __redirectURL;';
			compiledCode += 'let __cookieInfo = __requestInfo.cookies;';
			compiledCode += 'let __newCookieInfo = {};';
			compiledCode += 'let __basePath = \'' + Path.dirname(path) + '\';';
			
			// print func
			compiledCode += `let print = (content) => {
				
				if (content !== undefined) {
					if (typeof content === 'string') {
						__html += content;
					} else {
						__html += JSON.stringify(content);
					}
				}
				
			};`;
			
			// cookie func
			compiledCode += `let cookie = (name, value, expireSeconds, path, domain) => {
				
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
				
			};`;
			
			// redirect func
			compiledCode += `let redirect = (url) => {
				
				__redirectURL = url;
				
				__handler({
					cookies : __newCookieInfo,
					redirectURL : __redirectURL
				});
				
			};`;
			
			// __each func
			compiledCode += `let __each = (target, func) => {
				
				if (isNaN(target) === true) {
					EACH(target, (value, name) => {
						func(name, value);
					});
				} else {
					REPEAT(target, (i) => {
						func(undefined, i);
					});
				}
				
			};`;
			
			addBlockStart(true);
			
			compiledCode += 'print(\'';
			
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
					
					compiledCode += ', (';
					
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
						
						compiledCode += ') === true) { ((__parentPause, __parentStore) => {';
						
						addBlockStart();
						
						compiledCode += 'print(\'';
						
						continue;
					}
					
					// end repeat mode.
					if (isRepeatMode === true) {
						isRepeatMode = false;
						
						resumeCountStack.push(0);
						
						if (j === -1) {
							compiledCode += ', (__name, __value';
						}
						
						compiledCode += ') => { ((__parentPause, __parentStore) => {';
						
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
						
						REPEAT(resumeCountStack[resumeCountStack.length - 1], (i) => {
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
						
						REPEAT(resumeCountStack[resumeCountStack.length - 1], (i) => {
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
						
						compiledCode += '"';
						
						continue;
					}
					
					// end string2 mode.
					if (isString2Mode === true) {
						isString2Mode = false;
						
						compiledCode += '"';
						
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
			
			REPEAT(resumeCountStack[0], () => {
				compiledCode += '} }; resume();';
			});
			
			if (preprocessor !== undefined) {
				compiledCode = preprocessor(compiledCode);
			}
			
			if (firstBlockStartIndex !== undefined) {
				compiledCode = 'try {' + compiledCode + '} catch(e) { __errorHandler(e, __path, ' + firstBlockStartLine + ', ' + firstBlockStartColumn + ', ' + firstBlockEndLine + ', ' + firstBlockEndColumn + ', ' + firstBlockStartIndex + ', ' + firstBlockEndIndex + '); }';
			}
			
			compiledCode = 'let __path = \'' + path + '\';' + compiledCode;
			compiledCode = 'let require = NSP.Compile.require;' + compiledCode;
			
			return compiledCode;
		}
	};
});
