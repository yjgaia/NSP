/*
 * load and cache .nsp file.
 */
NSP.Load = METHOD((m) => {
	
	let cachedFileInfos = {};
	
	return {
		
		run : (params, handlers) => {
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
			
			let requestInfo = params.requestInfo;
			let path = params.path;
			let self = params.self;
			let isNotUsingDCBN = params.isNotUsingDCBN;
			let preprocessor = params.preprocessor;
			
			let notExistsHandler = handlers.notExists;
			let errorHandler = handlers.error;
			let handler = handlers.success;
			
			// check file has been updated.
			GET_FILE_INFO(path, {
				notExists : notExistsHandler,
				success : (fileInfo) => {
					
					let cachedFileInfo = cachedFileInfos[path];
					
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
							success : (buffer) => {
								
								let run = new Function('__requestInfo', 'self', '__errorHandler', '__handler', NSP.Compile({
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