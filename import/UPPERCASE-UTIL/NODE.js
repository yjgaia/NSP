/*

Welcome to UPPERCASE! (http://uppercase.io)

*/

/**
 * get disk usage.
 */
global.DISK_USAGE = METHOD(function() {
	'use strict';

	var
	//IMPORT: diskspace
	diskspace = require('diskspace'),
	
	// os type
	osType = require('os').type();

	return {

		run : function(drive, callbackOrHandlers) {
			//OPTIONAL: drive
			//REQUIRED: callbackOrHandlers

			var
			// callback.
			callback,

			// error handler.
			errorHandler;

			if (callbackOrHandlers === undefined) {
				callbackOrHandlers = drive;
				drive = undefined;
			}
			
			if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
				callback = callbackOrHandlers;
			} else {
				callback = callbackOrHandlers.success;
				errorHandler = callbackOrHandlers.error;
			}
			
			if (drive === undefined) {
				if (osType === 'Windows_NT') {
					drive = 'C';
				} else if (osType === 'Darwin' || osType === 'Linux') {
					drive = '/';
				}
			}
			
			diskspace.check(drive, function(err, total, free, status) {
				if (status === 'READY') {
					callback((1 - free / total) * 100);
				} else if (errorHandler !== undefined) {
					errorHandler(status);
				} else {
					SHOW_ERROR('[UPPERCASE-DISK_USAGE] ERROR: ' + status);
				}
			});
		}
	};
});

/**
 * ImageMagick® convert.
 */
global.IMAGEMAGICK_CONVERT = METHOD(function() {
	'use strict';

	var
	//IMPORT: imagemagick
	imagemagick = require('imagemagick');

	return {

		run : function(params, callbackOrHandlers) {
			//REQUIRED: params
			//OPTIONAL: callbackOrHandlers

			var
			// callback.
			callback,

			// error handler.
			errorHandler;

			if (callbackOrHandlers !== undefined) {
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					callback = callbackOrHandlers.success;
					errorHandler = callbackOrHandlers.error;
				}
			}

			imagemagick.convert(params, function(error) {

				var
				// error msg
				errorMsg;

				if (error !== TO_DELETE) {

					errorMsg = error.toString();

					if (errorHandler !== undefined) {
						errorHandler(errorMsg);
					} else {
						SHOW_ERROR('[UPPERCASE-IMAGEMAGICK_CONVERT] ERROR: ' + errorMsg);
					}

				} else {

					if (callback !== undefined) {
						callback();
					}
				}
			});
		}
	};
});

/**
 * ImageMagick® identify.
 */
global.IMAGEMAGICK_IDENTIFY = METHOD(function() {
	'use strict';

	var
	//IMPORT: imagemagick
	imagemagick = require('imagemagick');

	return {

		run : function(path, callbackOrHandlers) {
			//REQUIRED: path
			//REQUIRED: callbackOrHandlers

			var
			// callback.
			callback,

			// error handler.
			errorHandler;

			if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
				callback = callbackOrHandlers;
			} else {
				callback = callbackOrHandlers.success;
				errorHandler = callbackOrHandlers.error;
			}

			imagemagick.identify(path, function(error, features) {

				var
				// error msg
				errorMsg;

				if (error !== TO_DELETE) {

					errorMsg = error.toString();

					if (errorHandler !== undefined) {
						errorHandler(errorMsg);
					} else {
						SHOW_ERROR('[UPPERCASE-IMAGEMAGICK_IDENTIFY] ERROR: ' + errorMsg);
					}

				} else {
					callback(features);
				}
			});
		}
	};
});

/**
 * ImageMagick® read metadata.
 */
global.IMAGEMAGICK_READ_METADATA = METHOD(function() {
	'use strict';

	var
	//IMPORT: imagemagick
	imagemagick = require('imagemagick');

	return {

		run : function(path, callbackOrHandlers) {
			//REQUIRED: path
			//REQUIRED: callbackOrHandlers

			var
			// callback.
			callback,

			// error handler.
			errorHandler;

			if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
				callback = callbackOrHandlers;
			} else {
				callback = callbackOrHandlers.success;
				errorHandler = callbackOrHandlers.error;
			}

			imagemagick.readMetadata(path, function(error, metadata) {

				var
				// error msg
				errorMsg;

				if (error !== TO_DELETE) {

					errorMsg = error.toString();

					if (errorHandler !== undefined) {
						errorHandler(errorMsg);
					} else {
						SHOW_ERROR('[UPPERCASE-IMAGEMAGICK_READ_METADATA] ERROR: ' + errorMsg);
					}

				} else {
					callback(metadata);
				}
			});
		}
	};
});

/**
 * ImageMagick® resize.
 */
global.IMAGEMAGICK_RESIZE = METHOD(function() {
	'use strict';

	var
	//IMPORT: path
	_path = require('path');

	return {

		run : function(params, callbackOrHandlers) {
			//REQUIRED: params.srcPath
			//REQUIRED: params.distPath
			//OPTIONAL: params.width
			//OPTIONAL: params.height
			//OPTIONAL: callbackOrHandlers

			var
			// src path
			srcPath = params.srcPath,

			// dist path
			distPath = params.distPath,

			// width
			width = params.width,

			// height
			height = params.height,

			// callback.
			callback,

			// error handler.
			errorHandler;

			if (callbackOrHandlers !== undefined) {
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					callback = callbackOrHandlers.success;
					errorHandler = callbackOrHandlers.error;
				}
			}

			CREATE_FOLDER(_path.dirname(distPath), {
				error : errorHandler,
				success : function() {

					IMAGEMAGICK_IDENTIFY(srcPath, {
						error : errorHandler,
						success : function(features) {

							if (width === undefined) {
								width = height / features.height * features.width;
							}

							if (height === undefined) {
								height = width / features.width * features.height;
							}

							IMAGEMAGICK_CONVERT([srcPath, '-resize', width + 'x' + height + '\!', distPath], callbackOrHandlers);
						}
					});
				}
			});
		}
	};
});

/**
 * minify css.
 */
global.MINIFY_CSS = METHOD(function() {
	'use strict';

	var
	// sqwish
	sqwish = require('sqwish');

	return {

		run : function(code) {
			//REQUIRED: code

			return sqwish.minify(code.toString());
		}
	};
});

/**
 * minify js.
 */
global.MINIFY_JS = METHOD(function() {
	'use strict';

	var
	// uglify-js
	uglifyJS = require('uglify-js');

	return {

		run : function(code) {
			//REQUIRED: code

			return uglifyJS.minify(code.toString(), {
				fromString : true,
				mangle : true,
				output : {
					comments : /@license|@preserve|^!/
				}
			}).code;
		}
	};
});

/**
 * Redis store class
 */
global.REDIS_STORE = CLASS(function(cls) {
	'use strict';

	var
	// RedisClustr
	RedisClustr,
	
	// Redis
	Redis,
	
	// client
	client;
	
	return {

		init : function(inner, self, storeName) {
			//REQUIRED: storeName

			var
			// save.
			save,

			// get.
			get,

			// remove.
			remove,
			
			// list.
			list,
			
			// count.
			count,
			
			// clear.
			clear;
			
			if (client === undefined) {
				
				if (NODE_CONFIG.redisPorts !== undefined) {
					
					RedisClustr = require('redis-clustr');
					
					client = new RedisClustr({
						
						servers : RUN(function() {
							
							var ret = [];
							
							if (CHECK_IS_ARRAY(NODE_CONFIG.redisPorts) === true) {
								EACH(NODE_CONFIG.redisPorts, function(port) {
									ret.push({
										host : '127.0.0.1',
										port : port
									});
								});
							}
							
							else {
								EACH(NODE_CONFIG.redisPorts, function(ports, host) {
									EACH(ports, function(port) {
										ret.push({
											host : host,
											port : port
										});
									});
								});
							}
							
							return ret;
						})
					});
				}
				
				else {
					
					Redis = require('redis');
					
					client = Redis.createClient({
						host : NODE_CONFIG.redisHost,
						port : NODE_CONFIG.redisPort
					});
				}
			}
			
			self.save = save = function(params, callbackOrHandlers) {
				//REQUIRED: params
				//REQUIRED: params.name
				//REQUIRED: params.value
				//OPTIONAL: callbackOrHandlers
				//OPTIONAL: callbackOrHandlers.success
				//OPTIONAL: callbackOrHandlers.error
				
				var
				// name
				name = params.name,

				// value
				value = params.value,
				
				// callback
				callback,

				// error handler
				errorHandler;
				
				if (callbackOrHandlers !== undefined) {
					if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
						callback = callbackOrHandlers;
					} else {
						callback = callbackOrHandlers.success;
						errorHandler = callbackOrHandlers.error;
					}
				}
				
				client.hset(storeName, name, STRINGIFY(value), function(errorInfo) {
					
					if (errorInfo !== TO_DELETE) {
						if (errorHandler !== undefined) {
							errorHandler(errorInfo.toString());
						} else {
							SHOW_ERROR('[UPPERCASE-UTIL] REDIS_STORE `' + storeName + '` ERROR:', errorInfo);
						}
					} else if (callback !== undefined) {
						callback();
					}
				});
			};

			self.get = get = function(name, callbackOrHandlers) {
				//REQUIRED: name
				//REQUIRED: callbackOrHandlers
				//REQUIRED: callbackOrHandlers.success
				//OPTIONAL: callbackOrHandlers.error
				
				var
				// callback
				callback,

				// error handler
				errorHandler;
			
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					callback = callbackOrHandlers.success;
					errorHandler = callbackOrHandlers.error;
				}

				client.hget(storeName, name, function(errorInfo, value) {
					
					if (errorInfo !== TO_DELETE) {
						if (errorHandler !== undefined) {
							errorHandler(errorInfo.toString());
						} else {
							SHOW_ERROR('[UPPERCASE-UTIL] REDIS_STORE `' + storeName + '` ERROR:', errorInfo);
						}
					} else if (value === TO_DELETE) {
						callback();
					} else {
						callback(PARSE_STR(value));
					}
				});
			};

			self.remove = remove = function(name, callbackOrHandlers) {
				//OPTIONAL: callbackOrHandlers
				//OPTIONAL: callbackOrHandlers.success
				//OPTIONAL: callbackOrHandlers.error
				
				var
				// callback
				callback,

				// error handler
				errorHandler;
				
				if (callbackOrHandlers !== undefined) {
					if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
						callback = callbackOrHandlers;
					} else {
						callback = callbackOrHandlers.success;
						errorHandler = callbackOrHandlers.error;
					}
				}

				client.hdel(storeName, name, function(errorInfo) {
					
					if (errorInfo !== TO_DELETE) {
						if (errorHandler !== undefined) {
							errorHandler(errorInfo.toString());
						} else {
							SHOW_ERROR('[UPPERCASE-UTIL] REDIS_STORE `' + storeName + '` ERROR:', errorInfo);
						}
					} else if (callback !== undefined) {
						callback();
					}
				});
			};
			
			self.list = list = function(callbackOrHandlers) {
				//REQUIRED: callbackOrHandlers
				//REQUIRED: callbackOrHandlers.success
				//OPTIONAL: callbackOrHandlers.error
				
				var
				// callback
				callback,

				// error handler
				errorHandler;
				
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					callback = callbackOrHandlers.success;
					errorHandler = callbackOrHandlers.error;
				}
				
				client.hgetall(storeName, function(errorInfo, all) {
					
					if (errorInfo !== TO_DELETE) {
						if (errorHandler !== undefined) {
							errorHandler(errorInfo.toString());
						} else {
							SHOW_ERROR('[UPPERCASE-UTIL] REDIS_STORE `' + storeName + '` ERROR:', errorInfo);
						}
					} else if (all === TO_DELETE) {
						callback({});
					} else {
						
						EACH(all, function(data, key) {
							all[key] = PARSE_STR(data);
						});
						
						callback(all);
					}
				});
			};
			
			self.count = count = function(callbackOrHandlers) {
				//REQUIRED: callbackOrHandlers
				//REQUIRED: callbackOrHandlers.success
				//OPTIONAL: callbackOrHandlers.error
				
				var
				// callback
				callback,

				// error handler
				errorHandler;
				
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					callback = callbackOrHandlers.success;
					errorHandler = callbackOrHandlers.error;
				}

				client.hlen(storeName, function(errorInfo, count) {
					
					if (errorInfo !== TO_DELETE) {
						if (errorHandler !== undefined) {
							errorHandler(errorInfo.toString());
						} else {
							SHOW_ERROR('[UPPERCASE-UTIL] REDIS_STORE `' + storeName + '` ERROR:', errorInfo);
						}
					} else {
						callback(count);
					}
				});
			};

			self.clear = clear = function(callbackOrHandlers) {
				//OPTIONAL: callbackOrHandlers
				//OPTIONAL: callbackOrHandlers.success
				//OPTIONAL: callbackOrHandlers.error
				
				var
				// callback
				callback,

				// error handler
				errorHandler;
				
				if (callbackOrHandlers !== undefined) {
					if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
						callback = callbackOrHandlers;
					} else {
						callback = callbackOrHandlers.success;
						errorHandler = callbackOrHandlers.error;
					}
				}

				client.del(storeName, function(errorInfo) {
					
					if (errorInfo !== TO_DELETE) {
						if (errorHandler !== undefined) {
							errorHandler(errorInfo.toString());
						} else {
							SHOW_ERROR('[UPPERCASE-UTIL] REDIS_STORE `' + storeName + '` ERROR:', errorInfo);
						}
					} else if (callback !== undefined) {
						callback();
					}
				});
			};
		}
	};
});

FOR_BOX(function(box) {
	'use strict';

	box.REDIS_STORE = CLASS({

		init : function(inner, self, name) {
			//REQUIRED: name

			var
			// redis store
			redisStore = REDIS_STORE(box.boxName + '.' + name),

			// save.
			save,

			// get.
			get,

			// remove.
			remove,
			
			// list.
			list,
			
			// count.
			count,
			
			// clear.
			clear;

			self.save = save = redisStore.save;

			self.get = get = redisStore.get;

			self.remove = remove = redisStore.remove;
			
			self.list = list = redisStore.list;

			self.count = count = redisStore.count;
			
			self.clear = clear = redisStore.clear;
		}
	});
});
