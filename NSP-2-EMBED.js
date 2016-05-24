// import UJS.
require('./import/UJS-NODE.js');

var __cachedFileInfos = {};

global.LOAD_NSP = function(path, notExistsHandler, errorHandler) {
	//REQUIRED: path
	
	GET_FILE_INFO(path, {
		notExists : notExistsHandler,
		success : function(fileInfo) {
			
			var cachedFileInfo = __cachedFileInfos[path];
			
			if (cachedFileInfo !== undefined
				&& (
					(fileInfo.lastUpdateTime !== undefined && cachedFileInfo.lastUpdateTime.getTime() === fileInfo.lastUpdateTime.getTime())
					|| (fileInfo.createTime !== undefined && cachedFileInfo.lastUpdateTime.getTime() === fileInfo.createTime.getTime())
				)
			) {
				console.log(cachedFileInfo.compiledCode);
			}
			
			else {
				
				READ_FILE(path, {
					notExists : notExistsHandler,
					error : errorHandler,
					success : function(buffer) {
						
						var
						// code
						code = buffer.toString();
						
						__cachedFileInfos[path] = {
							code : code,
							lastUpdateTime : fileInfo.lastUpdateTime === undefined ? fileInfo.createTime : fileInfo.lastUpdateTime
						};
						
						console.log(NSP(code));//, new Function(NSP(code)).toString());
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
			
			compiledCode += '\');\nif (';
			
			i += 1;
			continue;
		}
			
		// start repeat mode
		if (cch === '<~' && checkIsInCode() !== true) {
			isRepeatMode = true;
			
			compiledCode += '\');\n';
			
			i += 1;
			continue;
		}
		
		if (ch === '>' && checkIsInString() !== true) {
			
			// end question mode
			if (isQuestionMode === true) {
				isQuestionMode = false;
				
				compiledCode += ') {\n';
				
				continue;
			}
			
			// end repeat mode
			if (isRepeatMode === true) {
				isRepeatMode = false;
				
				compiledCode += '\n\tprint(\'';
				
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
		
		if (ch === '\'' && checkIsInCode() === true) {
			
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
			if (checkIsInCode() === true && checkIsInString() !== true && isComment1Mode === true) {
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
	
	addCompiledCode('return __html;');
	return compiledCode;
};

LOAD_NSP('./www/examples/each.nsp');
