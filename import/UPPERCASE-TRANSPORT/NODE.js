/*

Welcome to UPPERCASE! (http://uppercase.io)

*/

/*
 * create multi protocol socket server.
 */
global.MULTI_PROTOCOL_SOCKET_SERVER = CLASS({

	init : function(inner, self, params, connectionListener) {
		'use strict';
		//REQUIRED: params
		//OPTIONAL: params.socketServerPort
		//OPTIONAL: params.webSocketServerPort
		//OPTIONAL: params.webServer
		//OPTIONAL: params.isCreateWebSocketFixRequestManager
		//REQUIRED: connectionListener

		var
		// socket server port
		socketServerPort = params.socketServerPort,

		// web socket server port
		webSocketServerPort = params.webSocketServerPort,

		// is create web socket fix request manager
		isCreateWebSocketFixRequestManager = params.isCreateWebSocketFixRequestManager,

		// web server
		webServer = params.webServer,

		// web socket fix request manager
		webSocketFixRequestManager,

		// get web socket fix request.
		getWebSocketFixRequest;

		if (socketServerPort !== undefined) {

			// create socket server.
			SOCKET_SERVER(socketServerPort, connectionListener);
		}

		if (webSocketServerPort !== undefined || webServer !== undefined) {

			// create web socket server.
			WEB_SOCKET_SERVER(webSocketServerPort !== undefined ? webSocketServerPort : webServer, connectionListener);

			if (isCreateWebSocketFixRequestManager === true) {
	
				webSocketFixRequestManager = WEB_SOCKET_FIX_REQUEST_MANAGER(connectionListener);
			}
		}

		self.getWebSocketFixRequest = getWebSocketFixRequest = function() {
			return webSocketFixRequestManager === undefined ? undefined : webSocketFixRequestManager.request;
		};
	}
});

/*
 * create web socket fix request handler. (using jsonp long-polling)
 */
global.WEB_SOCKET_FIX_REQUEST_MANAGER = CLASS(function(cls) {
	'use strict';

	var
	// HANDSHAKE_DELAY_TIME
	HANDSHAKE_DELAY_TIME = 5,

	// LIFE_DELAY_TIME
	LIFE_DELAY_TIME = 2;

	return {

		init : function(inner, self, connectionListener) {
			//REQUIRED: connectionListener

			var
			// content map
			contentMap = {},

			// method maps
			methodMaps = {},

			// send key
			sendKey = 0,

			// inner sends
			innerSends = {},

			// waiting param map
			waitingParamMap = {},

			// handshake delays
			handshakeDelays = {},

			// life delays
			lifeDelays = {},

			// add content.
			addContent = function(clientId, requestKey, content, isToBroadcast) {

				if (contentMap[clientId] === undefined) {
					contentMap[clientId] = {};
				}

				if (contentMap[clientId][requestKey] === undefined) {
					contentMap[clientId][requestKey] = content;
				} else {
					contentMap[clientId][requestKey] += content;
				}

				if (isToBroadcast === true && CPU_CLUSTERING.broadcast !== undefined) {
					CPU_CLUSTERING.broadcast({
						methodName : '__WEB_SOCKET_FIX_REQUEST_MANAGER__ADD_CONTENT',
						data : {
							clientId : clientId,
							requestKey : requestKey,
							content : content
						}
					});
				}
			},

			// remove content.
			removeContent = function(clientId, requestKey, isToBroadcast) {

				if (contentMap[clientId] !== undefined) {
					delete contentMap[clientId][requestKey];
				}

				// broadcast.
				if (isToBroadcast === true && CPU_CLUSTERING.broadcast !== undefined) {
					CPU_CLUSTERING.broadcast({
						methodName : '__WEB_SOCKET_FIX_REQUEST_MANAGER__REMOVE_CONTENT',
						data : {
							clientId : clientId,
							requestKey : requestKey
						}
					});
				}
			},

			// send.
			send = function(clientId, params) {

				// inner send.
				if (innerSends[clientId] !== undefined) {
					innerSends[clientId](params);
				}

				// when not exists send
				else {
					addWaitingParams(clientId, params, true);
				}
			},

			// run methods.
			runMethods = function(clientId, methodName, data, sendKey) {

				var
				// methods
				methods;
				
				try {
					
					methods = methodMaps[clientId][methodName];

					if (methods !== undefined) {
	
						EACH(methods, function(method) {
	
							// run method.
							method(data,
	
							// ret.
							function(retData) {
	
								if (sendKey !== undefined) {
	
									send(clientId, {
										methodName : '__CALLBACK_' + sendKey,
										data : retData
									});
								}
							});
						});
					}
				}
				
				// if catch error
				catch(error) {
					console.log(CONSOLE_RED('[UPPERCASE-WEB_SOCKET_FIX_REQUEST_MANAGER] ERROR:'), error.toString());
				}
			},

			// remove send.
			removeSend = function(clientId) {

				// remove handshake delay.
				if (handshakeDelays[clientId] !== undefined) {
					handshakeDelays[clientId].remove();
					delete handshakeDelays[clientId];
				}

				// remove inner send.
				delete innerSends[clientId];
			},

			// add waiting params.
			addWaitingParams = function(clientId, params, isToBroadcast) {

				if (waitingParamMap[clientId] === undefined) {
					waitingParamMap[clientId] = [];
				}

				waitingParamMap[clientId].push(params);

				// broadcast send.
				if (isToBroadcast === true && CPU_CLUSTERING.broadcast !== undefined) {
					CPU_CLUSTERING.broadcast({
						methodName : '__WEB_SOCKET_FIX_REQUEST_MANAGER__SEND',
						data : {
							clientId : clientId,
							params : params
						}
					});
				}
			},

			// remove first waiting params.
			removeFirstWaitingParams = function(clientId, isToBroadcast) {

				REMOVE({
					array : waitingParamMap[clientId],
					key : 0
				});

				if (waitingParamMap[clientId].length === 0) {
					delete waitingParamMap[clientId];
				}

				// broadcast.
				if (isToBroadcast === true && CPU_CLUSTERING.broadcast !== undefined) {
					CPU_CLUSTERING.broadcast({
						methodName : '__WEB_SOCKET_FIX_REQUEST_MANAGER__REMOVE_FIRST_WATING_PARAMS',
						data : clientId
					});
				}
			},

			// remove life delay.
			removeLifeDelay = function(clientId, isToBroadcast) {

				if (lifeDelays[clientId] !== undefined) {
					lifeDelays[clientId].remove();
					delete lifeDelays[clientId];
				}

				// broadcast.
				if (isToBroadcast === true && CPU_CLUSTERING.broadcast !== undefined) {
					CPU_CLUSTERING.broadcast({
						methodName : '__WEB_SOCKET_FIX_REQUEST_MANAGER__REMOVE_LIFE_DELAY',
						data : clientId
					});
				}
			},

			// remove all.
			removeAll = function(clientId, isToBroadcast) {

				removeSend(clientId);

				// remove method map.
				if (methodMaps[clientId] !== undefined) {
					delete methodMaps[clientId];
				}

				// remove waiting params.
				if (waitingParamMap[clientId] !== undefined) {
					delete waitingParamMap[clientId];
				}

				// remove life delay.
				removeLifeDelay(clientId);

				// remove contents.
				if (contentMap[clientId] !== undefined) {
					delete contentMap[clientId];
				}

				// broadcast.
				if (isToBroadcast === true && CPU_CLUSTERING.broadcast !== undefined) {
					CPU_CLUSTERING.broadcast({
						methodName : '__WEB_SOCKET_FIX_REQUEST_MANAGER__REMOVE_ALL',
						data : clientId
					});
				}
			},

			// request.
			request;

			if (CPU_CLUSTERING.on !== undefined) {

				CPU_CLUSTERING.on('__WEB_SOCKET_FIX_REQUEST_MANAGER__RUN_METHODS', function(params) {

					var
					// client id
					clientId = params.clientId;

					if (methodMaps[clientId] !== undefined) {
						runMethods(clientId, params.methodName, params.data, params.sendKey);
					}
				});

				CPU_CLUSTERING.on('__WEB_SOCKET_FIX_REQUEST_MANAGER__REMOVE_FIRST_WATING_PARAMS', function(clientId) {

					if (waitingParamMap[clientId] !== undefined) {
						removeFirstWaitingParams(clientId);
					}
				});

				CPU_CLUSTERING.on('__WEB_SOCKET_FIX_REQUEST_MANAGER__SEND', function(_params) {

					var
					// client id
					clientId = _params.clientId,

					// params
					params = _params.params;

					// inner send.
					if (innerSends[clientId] !== undefined) {

						innerSends[clientId](params);

						// broadcast remove first waiting params.
						if (CPU_CLUSTERING.broadcast !== undefined) {
							CPU_CLUSTERING.broadcast({
								methodName : '__WEB_SOCKET_FIX_REQUEST_MANAGER__REMOVE_FIRST_WATING_PARAMS',
								data : clientId
							});
						}
					}

					// when not exists send
					else {
						addWaitingParams(clientId, params);
					}
				});

				CPU_CLUSTERING.on('__WEB_SOCKET_FIX_REQUEST_MANAGER__REMOVE_LIFE_DELAY', function(clientId) {
					removeLifeDelay(clientId);
				});

				CPU_CLUSTERING.on('__WEB_SOCKET_FIX_REQUEST_MANAGER__REMOVE_ALL', function(clientId) {
					removeAll(clientId);
				});

				CPU_CLUSTERING.on('__WEB_SOCKET_FIX_REQUEST_MANAGER__ADD_CONTENT', function(params) {
					addContent(params.clientId, params.requestKey, params.content);
				});

				CPU_CLUSTERING.on('__WEB_SOCKET_FIX_REQUEST_MANAGER__REMOVE_CONTENT', function(params) {
					removeContent(params.clientId, params.requestKey);
				});
			}

			self.request = request = function(requestInfo, funcs) {
				//REQUIRED: requsetInfo
				//REQUIRED: funcs
				//REQUIRED: funcs.response
				//REQUIRED: funcs.onDisconnected

				var
				// params
				params = requestInfo.params,

				// client id
				clientId = params.clientId,

				// connection key (integer)
				connectionKey = INTEGER(params.connectionKey),

				// request key (integer)
				requestKey = INTEGER(params.requestKey),

				// content
				content = params.content,

				// is end (boolean)
				isEnd = params.isEnd === 'true',

				// response.
				response = funcs.response,

				// on disconnected.
				onDisconnected = funcs.onDisconnected,

				// method map
				methodMap,
				
				// on.
				on,

				// off.
				off,

				// run methods or broadcast.
				runMethodsOrBroadcast = function(methodName, data, sendKey) {

					// when exists methodMap
					if (methodMaps[clientId] !== undefined) {
						runMethods(clientId, methodName, data, sendKey);
					}

					// when not exists methodMap
					else if (CPU_CLUSTERING.broadcast !== undefined) {

						// pass other cpus.
						CPU_CLUSTERING.broadcast({
							methodName : '__WEB_SOCKET_FIX_REQUEST_MANAGER__RUN_METHODS',
							data : {
								clientId : clientId,
								methodName : methodName,
								data : data,
								sendKey : sendKey
							}
						});
					}

					if (methodName === '__DISCONNECTED') {
						removeAll(clientId, true);
					}
				};

				// create connection.
				if (clientId === undefined) {

					// create client id.
					clientId = RANDOM_STR(40);

					// create method map.
					methodMap = methodMaps[clientId] = {};

					// run connection listener.
					connectionListener(

					// client info
					{
						ip : requestInfo.ip,

						headers : requestInfo.headers
					},

					// on.
					on = function(methodName, method) {
						//REQUIRED: methodName
						//REQUIRED: method

						var
						// methods
						methods = methodMap[methodName];

						if (methods === undefined) {
							methods = methodMap[methodName] = [];
						}

						methods.push(method);
					},

					// off.
					off = function(methodName, method) {
						//REQUIRED: methodName
						//OPTIONAL: method

						var
						// methods
						methods = methodMap[methodName];

						if (methods !== undefined) {

							if (method !== undefined) {

								REMOVE({
									array : methods,
									value : method
								});

							} else {
								delete methodMap[methodName];
							}
						}
					},

					// send to client.
					function(params, callback) {
						//REQUIRED: params
						//REQUIRED: params.methodName
						//REQUIRED: params.data
						//OPTIONAL: callback

						var
						// callback name
						callbackName;
						
						send(clientId, {
							methodName : params.methodName,
							data : params.data,
							sendKey : sendKey
						});
		
						if (callback !== undefined) {
							
							callbackName = '__CALLBACK_' + sendKey;
		
							// on callback.
							on(callbackName, function(data) {
		
								// run callback.
								callback(data);
		
								// off callback.
								off(callbackName);
							});
						}
		
						sendKey += 1;
					},

					// disconnect.
					function() {
						runMethodsOrBroadcast('__DISCONNECTED');
					});
					
					// response.
					response({
						contentType : 'text/javascript',
						content : 'CONNECT_TO_WEB_SOCKET_SERVER.response(\'' + encodeURIComponent(STRINGIFY({
							clientId : clientId,
							connectionKey : connectionKey,
							requestKey : requestKey
						})).replace(/'/g, '\\\'') + '\')'
					});
				}

				// done request (content complete).
				else if (isEnd === true) {

					RUN(function() {

						var
						// params
						params = contentMap[clientId] === undefined ? undefined : PARSE_STR(contentMap[clientId][requestKey]),

						// method name
						methodName,

						// data
						data,

						// send key
						sendKey,

						// connection info
						connectionInfo,

						// die.
						die;

						// init params.
						if (params !== undefined) {
							methodName = params.methodName;
							data = params.data;
							sendKey = params.sendKey;
						}

						// run methods or broadcast.
						if (methodName !== undefined) {

							runMethodsOrBroadcast(methodName, data, sendKey);

							// response empty.
							response({
								contentType : 'text/javascript',
								content : 'CONNECT_TO_WEB_SOCKET_SERVER.removeRequestInfo(' + requestKey + ')'
							});
						}

						// when aleady exists inner send, inner send. (and remove inner send)
						else if (innerSends[clientId] !== undefined) {
							innerSends[clientId]();
						}

						// register send.
						else {

							// I'm still alive!
							removeLifeDelay(clientId, true);

							die = function() {
								runMethodsOrBroadcast('__DISCONNECTED');
							};

							innerSends[clientId] = function(params) {

								// response.
								response({
									contentType : 'text/javascript',
									content : 'CONNECT_TO_WEB_SOCKET_SERVER.response(\'' + encodeURIComponent(STRINGIFY({
										connectionKey : connectionKey,
										clientId : clientId,
										params : params,
										requestKey : requestKey
									})).replace(/'/g, '\\\'') + '\')'
								});

								removeSend(clientId);

								// create life delay.
								lifeDelays[clientId] = DELAY(LIFE_DELAY_TIME, die);
							};

							// on disconnected, die!
							onDisconnected(die);

							// create handshake delay.
							handshakeDelays[clientId] = DELAY(HANDSHAKE_DELAY_TIME, function() {
								if (innerSends[clientId] !== undefined) {
									innerSends[clientId]();
								}
							});

							if (waitingParamMap[clientId] !== undefined) {

								// send first waiting params.
								innerSends[clientId](waitingParamMap[clientId][0]);

								removeFirstWaitingParams(clientId, true);
							}
						}
					});

					removeContent(clientId, requestKey, true);
				}

				// continue request.
				else {

					addContent(clientId, requestKey, content, true);

					// response.
					response({
						contentType : 'text/javascript',
						content : 'CONNECT_TO_WEB_SOCKET_SERVER.request(' + requestKey + ')'
					});
				}
			};

			console.log('[UPPERCASE-WEB_SOCKET_FIX_REQUEST_MANAGER] RUNNING WEB SOCKET FIX REQUEST MANAGER...');
		}
	};
});

/*
 * create web socket server.
 */
global.WEB_SOCKET_SERVER = METHOD({

	run : function(portOrWebServer, connectionListener) {
		'use strict';
		//REQUIRED: portOrWebServer
		//REQUIRED: connectionListener

		var
		//IMPORT: WebSocketServer
		WebSocketServer = require('ws').Server,

		// port
		port,

		// web server
		webServer,

		// server
		server;

		if (CHECK_IS_DATA(portOrWebServer) !== true) {
			port = portOrWebServer;
		} else {
			webServer = portOrWebServer;
		}

		server = new WebSocketServer({
			port : port,
			server : webServer === undefined ? undefined : webServer.getNativeHTTPServer()
		});

		server.on('connection', function(conn) {

			var
			// headers
			headers = conn.upgradeReq.headers,

			// method map
			methodMap = {},

			// send key
			sendKey = 0,

			// ip
			ip,
			
			// on.
			on,

			// off.
			off,

			// send.
			send,

			// run methods.
			runMethods = function(methodName, data, sendKey) {

				var
				// methods
				methods;
				
				try {
					
					methods = methodMap[methodName];
	
					if (methods !== undefined) {
	
						EACH(methods, function(method) {
	
							// run method.
							method(data,
	
							// ret.
							function(retData) {
	
								if (sendKey !== undefined) {
	
									send({
										methodName : '__CALLBACK_' + sendKey,
										data : retData
									});
								}
							});
						});
					}
				}
				
				// if catch error
				catch(error) {
					console.log(CONSOLE_RED('[UPPERCASE-WEB_SOCEKT_SERVER] ERROR:'), error.toString());
				}
			};

			// when receive data
			conn.on('message', function(str) {

				var
				// params
				params = PARSE_STR(str);

				if (params !== undefined) {
					runMethods(params.methodName, params.data, params.sendKey);
				}
			});

			// when disconnected
			conn.on('close', function() {

				runMethods('__DISCONNECTED');

				// free method map.
				methodMap = undefined;
			});

			// when error
			conn.on('error', function(error) {

				var
				// error msg
				errorMsg = error.toString();

				console.log(CONSOLE_RED('[UPPERCASE-WEB_SOCEKT_SERVER] ERROR:'), errorMsg);

				runMethods('__ERROR', errorMsg);
			});

			ip = headers['x-forwarded-for'];

			if (ip === undefined) {
				ip = conn.upgradeReq.connection.remoteAddress;
			}

			connectionListener(

			// client info
			{
				ip : ip,

				headers : headers
			},

			// on.
			on = function(methodName, method) {
				//REQUIRED: methodName
				//REQUIRED: method

				var
				// methods
				methods = methodMap[methodName];

				if (methods === undefined) {
					methods = methodMap[methodName] = [];
				}

				methods.push(method);
			},

			// off.
			off = function(methodName, method) {
				//REQUIRED: methodName
				//OPTIONAL: method

				var
				// methods
				methods = methodMap[methodName];

				if (methods !== undefined) {

					if (method !== undefined) {

						REMOVE({
							array : methods,
							value : method
						});

					} else {
						delete methodMap[methodName];
					}
				}
			},

			// send to client.
			send = function(params, callback) {
				//REQUIRED: params
				//REQUIRED: params.methodName
				//OPTIONAL: params.data
				//OPTIONAL: callback
				
				var
				// callback name
				callbackName;
				
				try {
					
					conn.send(STRINGIFY({
						methodName : params.methodName,
						data : params.data,
						sendKey : sendKey
					}));
					
				} catch(error) {
					console.log('[UPPERCASE-WEB_SOCEKT_SERVER] ERROR:', error.toString());
				}

				if (callback !== undefined) {
					
					callbackName = '__CALLBACK_' + sendKey;

					// on callback.
					on(callbackName, function(data) {

						// run callback.
						callback(data);

						// off callback.
						off(callbackName);
					});
				}

				sendKey += 1;
			},

			// disconnect.
			function() {
				conn.close();
			});
		});

		console.log('[UPPERCASE-WEB_SOCKET_SERVER] RUNNING WEB SOCKET SERVER...' + (port === undefined ? '' : ' (PORT:' + port + ')'));
	}
});
