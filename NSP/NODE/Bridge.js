/*
 * NSP bridge for WEB_SERVER.
 */
NSP.Bridge = METHOD((m) => {
	
	let Path = require('path');

	let responseError = (response, error, path, startLine, startColumn, endLine, endColumn, startIndex, endIndex) => {
		
		response({
			statusCode : 500,
			content : 
				'<!doctype html><html><head><meta charset="UTF-8"><title>' + error + '</title></head><body>' +
				NSP.GenerateErrorDisplay({
					path : path,
					startIndex : startIndex,
					endIndex : endIndex,
					startLine : startLine,
					startColumn : startColumn,
					endLine : endLine,
					endColumn : endColumn,
					error : error
				}) +
				'</body></html>',
			contentType : 'text/html'
		});
	};
	
	let responseNotFound = (response) => {
		
		response({
			statusCode : 404,
			content : 
				'<!doctype html><html><head><meta charset="UTF-8"><title>Page not found.</title></head><body>' +
				'<p><b>Page not found.</b></p>' +
				'</body></html>',
			contentType : 'text/html'
		});
	};
	
	return {
		
		run : (config) => {
			//REQUIRED: config
			//REQUIRED: config.rootPath
			//OPTIONAL: config.restURI
			//OPTIONAL: config.isNotUsingDCBN
			//OPTIONAL: config.preprocessor
			//OPTIONAL: config.templateEngine
			
			let rootPath = config.rootPath;
			let restURI = config.restURI;
			let isNotUsingDCBN = config.isNotUsingDCBN;
			let preprocessor = config.preprocessor;
			let templateEngine = config.templateEngine;
			
			let listener = (requestInfo, fileDataSet, response, next) => {
				
				let uri = requestInfo.uri;
				let subURI = '';
				let path;
				let ext;
				
				let run = () => {
					
					NSP.Load({
						requestInfo : requestInfo,
						path : path,
						self : {
							headers : requestInfo.headers,
							method : requestInfo.method,
							params : requestInfo.params,
							data : requestInfo.data,
							ip : requestInfo.ip,
							subURI : subURI,
							fileDataSet : fileDataSet
						},
						isNotUsingDCBN : isNotUsingDCBN,
						preprocessor : preprocessor
					}, {
						notExists : () => {
							responseNotFound(response);
						},
						error : (e, path, startLine, startColumn, endLine, endColumn, startIndex, endIndex) => {
							responseError(response, e, path, startLine, startColumn, endLine, endColumn, startIndex, endIndex);
						},
						success : (result) => {
							
							// redirect.
							if (result.redirectURL !== undefined) {
								response({
									statusCode : 302,
									cookies : result.cookies,
									headers : {
										'Location' : result.redirectURL
									}
								});
							}
							
							else {
								response({
									cookies : result.cookies,
									content : templateEngine === undefined ? result.html : templateEngine(result.html),
									contentType : 'text/html'
								});
							}
						}
					});
				};
				
				NEXT([
				(next) => {
					
					// server root path. (index)
					if (uri === '') {
						
						CHECK_FILE_EXISTS(rootPath + '/index.nsp', (isExists) => {
							if (isExists === true) {
								uri = 'index.nsp';
							} else {
								uri = 'index.html';
							}
							next();
						});
						
					} else {
						next();
					}
				},
				
				() => {
					return () => {
						
						path = rootPath + '/' + uri;
				
						ext = Path.extname(uri).toLowerCase();
						
						// serve .nsp file.
						if (ext === '.nsp') {
							run();
						}
						
						else if (ext === '') {
							
							NEXT([
							(next) => {
								
								// serve .nsp file.
								CHECK_FILE_EXISTS(path + '.nsp', (isExists) => {
									
									if (isExists === true) {
										
										CHECK_IS_FOLDER(path + '.nsp', (isFolder) => {
											
											if (isFolder === true) {
												next();
											} else {
												path += '.nsp';
												run();
											}
										});
									}
									
									else {
										next();
									}
								});
							},
							
							(next) => {
								return () => {
									
									// server rest uri.
									if (restURI !== undefined) {
										
										if (CHECK_IS_ARRAY(restURI) === true) {
											
											if (CHECK_IS_IN({
												array : restURI,
												value : uri
											}) === true) {
												uri = restURI + '.nsp';
											}
											
											else {
												
												EACH(restURI, (restURI) => {
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
										
										CHECK_FILE_EXISTS(rootPath + '/' + uri, (isExists) => {
											
											if (isExists === true) {
												path = rootPath + '/' + uri;
												run();
											}
											
											else {
												next();
											}
										});
									}
									
									else {
										next();
									}
								};
							},
							
							() => {
								return () => {
									
									// serve static file.
									CHECK_FILE_EXISTS(path, (isExists) => {
										
										if (isExists === true) {
										
											// but when path is folder, run NSP.
											CHECK_IS_FOLDER(path, (isFolder) => {
												
												if (isFolder === true) {
													path += '/index.nsp';
													run();
												} else {
													next();
												}
											});
										}
										
										else {
											next();
										}
									});
								};
							}]);
						}
						
						else {
							next();
						}
					};
				}]);
			};
			
			return {
				
				uploadOverFileSize : (params, maxUploadFileMB, requestInfo, response) => {
					listener(requestInfo, undefined, response, () => {
						// ignore.
					});
				},
				
				uploadSuccess : (params, fileDataSet, requestInfo, response) => {
					listener(requestInfo, fileDataSet, response, () => {
						// ignore.
					});
				},
				
				notExistsHandler : (resourcePath, requestInfo, response) => {
					responseNotFound(response);
				},
				
				requestListener : (requestInfo, response, setRootPath, next) => {
					listener(requestInfo, undefined, response, next);
					return false;
				}
			};
		}
	};
});