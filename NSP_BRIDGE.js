/**
 * NSP bridge for RESOURCE_SERVER.
 */
global.NSP_BRIDGE = METHOD(function(m) {
	
	var
	//IMPORT: Path
	Path = require('path'),

	// response error.
	responseError = function(response, error, path, startLine, startColumn, endLine, endColumn, startIndex, endIndex) {
		
		response({
			statusCode : 500,
			content : 
				'<!doctype html><html><head><meta charset="UTF-8"><title>' + error + '</title></head><body>' +
				NSP.generateErrorDisplay({
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
	},
	
	// response not found.
	responseNotFound = function(response) {
		
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
		
		run : function(config) {
			
			var
			// root path
			rootPath = config.rootPath,
			
			// rest uri
			restURI = config.restURI,
			
			// is not using dcbn
			isNotUsingDCBN = config.isNotUsingDCBN,
			
			// preprocessor
			preprocessor = config.preprocessor,
			
			// template engine
			templateEngine = config.templateEngine;
			
			return {
				
				notExistsHandler : function(resourcePath, requestInfo, response) {
					responseNotFound(response);
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
						
						LOAD_NSP({
							requestInfo : requestInfo,
							path : path,
							self : {
								headers : requestInfo.headers,
								method : requestInfo.method,
								params : requestInfo.params,
								ip : requestInfo.ip,
								subURI : subURI
							},
							isNotUsingDCBN : isNotUsingDCBN,
							preprocessor : preprocessor
						}, {
							notExists : function() {
								responseNotFound(response);
							},
							error : function(e, path, startLine, startColumn, endLine, endColumn, startIndex, endIndex) {
								responseError(response, e, path, startLine, startColumn, endLine, endColumn, startIndex, endIndex);
							},
							success : function(result) {
								
								// redirect.
								if (result.redirectURL !== undefined) {
									response({
										statusCode : 302,
										headers : {
											'Set-Cookie' : CREATE_COOKIE_STR_ARRAY(result.cookies),
											'Location' : result.redirectURL
										}
									});
								}
								
								else {
									response({
										headers : {
											'Set-Cookie' : CREATE_COOKIE_STR_ARRAY(result.cookies)
										},
										content : templateEngine === undefined ? result.html : templateEngine(result.html),
										contentType : 'text/html'
									});
								}
							}
						});
					};
					
					NEXT([
					function(next) {
						
						// server root path. (index)
						if (uri === '') {
							
							CHECK_IS_EXISTS_FILE(rootPath + '/index.nsp', function(isExists) {
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
					
					function() {
						return function() {
							
							path = rootPath + '/' + uri;
					
							ext = Path.extname(uri).toLowerCase();
							
							// serve .nsp file.
							if (ext === '.nsp') {
								run();
							}
							
							else if (ext === '') {
								
								NEXT([
								function(next) {
									
									// serve .nsp file.
									CHECK_IS_EXISTS_FILE(path + '.nsp', function(isExists) {
										
										if (isExists === true) {
											
											CHECK_IS_FOLDER(path + '.nsp', function(isFolder) {
												
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
								
								function(next) {
									return function() {
										
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
											
											CHECK_IS_EXISTS_FILE(rootPath + '/' + uri, function(isExists) {
												
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
								
								function() {
									return function() {
										
										// serve static file.
										CHECK_IS_EXISTS_FILE(path, function(isExists) {
											
											if (isExists === true) {
											
												// but when path is folder, run NSP.
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
					
					return false;
				}
			};
		}
	};
});