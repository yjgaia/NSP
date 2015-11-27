/*

Welcome to UPPERCASE! (http://uppercase.io)

*/

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
						console.log(CONSOLE_RED('[UPPERCASE-IMAGEMAGICK_CONVERT] ERROR: ' + errorMsg));
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
						console.log(CONSOLE_RED('[UPPERCASE-IMAGEMAGICK_IDENTIFY] ERROR: ' + errorMsg));
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
						console.log(CONSOLE_RED('[UPPERCASE-IMAGEMAGICK_READ_METADATA] ERROR: ' + errorMsg));
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
