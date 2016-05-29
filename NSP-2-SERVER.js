// import UJS.
require('./import/UJS-NODE.js');

// import UPPERCASE-TRANSPORT.
require('./import/UPPERCASE-TRANSPORT/NODE.js');

// import UPPERCASE-UTIL.
require('./import/UPPERCASE-UTIL/NODE.js');

// import UPPERCASE-UPLOAD.
require('./import/UPPERCASE-UPLOAD/NODE.js');

INIT_OBJECTS();

// import NSP-EMBED.
require('./NSP-2-EMBED.js');

/* var beautify = require('js-beautify').js_beautify;

var NSP_ORIGIN = NSP
global.NSP = function(path, code) {
	var c = beautify(NSP_ORIGIN(path, code), {
		indent_size : 1,
		indent_char : '\t'
	});
	//console.log(c);
	return c;
}; */

var
//IMPORT: Path
Path = require('path'),

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
restURI = config.restURI;

// if dev mode is true, no resource caching.
CONFIG.isDevMode = config.isDevMode;

(CONFIG.isNotUsingCPUClustering === true ? RUN : CPU_CLUSTERING)(function() {
	
	function responseError(response, e, path, startLine, startColumn, endLine, endColumn, startIndex, endIndex) {
		
		response({
			statusCode : 500,
			content : 
	'<!doctype html><html><head><meta charset="UTF-8"><title>' + e + '</title></head><body>' +
	'<p><b>' + e + '</b></p><p><b>path: </b>' + path + ' (' + startLine + ':' + startColumn + '~' + endLine + ':' + endColumn + ')</p><pre>' + __NSP_SAVED_CODES[path].substring(startIndex, endIndex) + '</pre>' +
	'</body></html>',
			contentType : 'text/html'
		});
	}
	
	function responseNotFound(response) {
		
		response({
			statusCode : 404,
			content : 
	'<!doctype html><html><head><meta charset="UTF-8"><title>Page not found.</title></head><body>' +
	'<p><b>Page not found.</b></p>' +
	'</body></html>',
			contentType : 'text/html'
		});
	}
	
	// run web server
	RESOURCE_SERVER({
		port : port,
		rootPath : rootPath,
		version : Date.now(),
		noParsingParamsURI : config.uploadURI
	}, {
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
				
				LOAD_NSP(requestInfo, path, {
					headers : requestInfo.headers,
					method : requestInfo.method,
					params : requestInfo.params,
					ip : requestInfo.ip,
					subURI : subURI
				}, function() {
					responseNotFound(response);
				}, function(e, path, startLine, startColumn, endLine, endColumn, startIndex, endIndex) {
					responseError(response, e, path, startLine, startColumn, endLine, endColumn, startIndex, endIndex);
				}, function(result) {
					
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
							content : result.html,
							contentType : 'text/html'
						});
					}
				});
			};
			
			NEXT([
			function(next) {
				
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
					
					if (ext === '.nsp') {
						run();
					}
					
					else if (ext === '') {
						
						NEXT([
						function(next) {
							
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
	});

	console.log('NSP server started. - http://localhost:' + port);
});
