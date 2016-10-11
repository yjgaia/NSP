/**
 * load and cache .nsp file.
 */
global.LOAD_NSP = METHOD(function(m) {
	
	var
	// cached file infos
	cachedFileInfos = {};
	
	return {
		
		run : function(params, handlers) {
			//REQUIRED: params
			//REQUIRED: params.requestInfo
			//REQUIRED: params.path
			//REQUIRED: params.self
			//OPTIONAL: params.isNotUsingDCBN
			//OPTIONAL: params.preprocessor
			//REQUIRED: handlers
			//REQUIRED: handlers.notExists
			//REQUIRED: handlers.error
			//REQUIRED: handlers.success
			
			var
			// request info
			requestInfo = params.requestInfo,
			
			// path
			path = params.path,
			
			// self
			self = params.self,
			
			// is not using dcbn
			isNotUsingDCBN = params.isNotUsingDCBN,
			
			// preprocessor
			preprocessor = params.preprocessor,
			
			// not exists handler.
			notExistsHandler = handlers.notExists,
			
			// error handler.
			errorHandler = handlers.error,
			
			// handler.
			handler = handlers.success;
			
			// check file has been updated.
			GET_FILE_INFO(path, {
				notExists : notExistsHandler,
				success : function(fileInfo) {
					
					var
					// cached file info
					cachedFileInfo = cachedFileInfos[path];
					
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
								run = new Function('__requestInfo', 'self', '__errorHandler', '__handler', NSP({
									path : path,
									code : buffer.toString(),
									isNotUsingDCBN : isNotUsingDCBN,
									preprocessor : preprocessor
								}));
								
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
		}
	};
});