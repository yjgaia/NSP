/*

Welcome to UJS! (http://uppercase.io)

*/

/**
 * when database update, set to delete value.
 *
 * unique value only can be null.
 */
global.TO_DELETE = null;

/**
 * Configuration
 */
global.CONFIG = {
	isDevMode : false
};

/**
 * Create method.
 */
global.METHOD = function(define) {
	'use strict';
	//REQUIRED: define

	var
	// funcs
	funcs,

	// run.
	run,

	// method.
	m = function(params, funcs) {
		//OPTIONAL: params
		//OPTIONAL: funcs

		if (run !== undefined) {
			return run(params, funcs);
		}
	};

	// set type.
	m.type = METHOD;

	// when define is function
	if ( typeof define === 'function') {
		funcs = define(m);
	}

	// when define is function set
	else {
		funcs = define;
	}

	// init funcs.
	if (funcs !== undefined) {
		run = funcs.run;
	};

	return m;
};

/**
 * Create class.
 */
global.CLASS = METHOD(function(m) {
	'use strict';

	var
	// instance count
	instanceCount = 0,

	// get instance id.
	getInstanceId;

	m.getInstanceId = getInstanceId = function() {

		instanceCount += 1;

		return instanceCount - 1;
	};

	return {

		run : function(define) {
			//REQUIRED: define

			var
			// funcs
			funcs,

			// preset.
			preset,

			// init.
			init,

			// params.
			_params,

			// after init.
			afterInit,

			// cls.
			cls = function(params, funcs) {
				//OPTIONAL: params
				//OPTIONAL: funcs

				var
				// inner (like Java's protected.)
				inner = {},

				// self (like Java's public.)
				self = {};

				// set type.
				self.type = cls;

				// check is instance of.
				self.checkIsInstanceOf = function(checkCls) {

					var
					// target cls
					targetCls = cls;

					// check moms.
					while (targetCls !== undefined) {

						if (targetCls === checkCls) {
							return true;
						}

						targetCls = targetCls.mom;
					}

					return false;
				};

				// set id.
				self.id = getInstanceId();

				// run inner init.
				params = innerInit(inner, self, params, funcs);

				// run inner after init.
				innerAfterInit(inner, self, params, funcs);

				return self;
			},

			// inner init.
			innerInit,

			// inner after init.
			innerAfterInit;

			// set type.
			cls.type = CLASS;

			cls.innerInit = innerInit = function(inner, self, params, funcs) {
				//OPTIONAL: params
				//OPTIONAL: funcs

				var
				// mom (parent class)
				mom,

				// temp params
				tempParams,

				// param value
				paramValue,

				// extend.
				extend = function(params, tempParams) {

					EACH(tempParams, function(value, name) {

						if (params[name] === undefined) {
							params[name] = value;
						} else if (CHECK_IS_DATA(params[name]) === true && CHECK_IS_DATA(value) === true) {
							extend(params[name], value);
						}
					});
				};

				// init params.
				if (_params !== undefined) {

					// when params is undefined
					if (params === undefined) {
						params = _params(cls);
					}

					// when params is data
					else if (CHECK_IS_DATA(params) === true) {

						tempParams = _params(cls);

						if (tempParams !== undefined) {
							extend(params, tempParams);
						}
					}

					// when params is value
					else {
						paramValue = params;
						params = _params(cls);
					}
				}

				// preset.
				if (preset !== undefined) {

					mom = preset(params, funcs);

					if (mom !== undefined) {

						cls.mom = mom;

						// when mom's type is CLASS
						if (mom.type === CLASS) {
							mom.innerInit(inner, self, params, funcs);
						}

						// when mon's type is OBJECT
						else {
							mom.type.innerInit(inner, self, params, funcs);
						}
					}
				}

				// init object.
				if (init !== undefined) {
					init(inner, self, paramValue === undefined ? params : paramValue, funcs);
				}

				return params;
			};

			// when define is function
			if ( typeof define === 'function') {
				funcs = define(cls);
			}

			// when define is function set
			else {
				funcs = define;
			}

			// init funcs.
			if (funcs !== undefined) {
				preset = funcs.preset;
				init = funcs.init;
				_params = funcs.params;
				afterInit = funcs.afterInit;
			}

			cls.innerAfterInit = innerAfterInit = function(inner, self, params, funcs) {
				//OPTIONAL: params
				//OPTIONAL: funcs

				var
				// mom
				mom = cls.mom;

				// when mom exists, run mom's after init.
				if (mom !== undefined) {

					// when mom's type is CLASS
					if (mom.type === CLASS) {
						mom.innerAfterInit(inner, self, params, funcs);
					}

					// when mon's type is OBJECT
					else {
						mom.type.innerAfterInit(inner, self, params, funcs);
					}
				}

				// run after init.
				if (afterInit !== undefined) {
					afterInit(inner, self, params, funcs);
				}
			};

			return cls;
		}
	};
});

/**
 * Create object.
 */
global.OBJECT = METHOD(function(m) {
	'use strict';

	var
	// ready objects
	readyObjects = [],

	// is inited
	isInited = false,

	// init object.
	initObject,

	// add ready object.
	addReadyObject,

	// remove ready object.
	removeReadyObject,

	// init objects.
	initObjects;

	initObject = function(object) {

		var
		// cls
		cls = object.type,

		// inner (like Java's protected.)
		inner = {},

		// params
		params = {};

		// set id.
		object.id = CLASS.getInstanceId();

		// run inner init.
		cls.innerInit(inner, object, params);

		// run inner after init.
		cls.innerAfterInit(inner, object, params);
	};

	addReadyObject = function(object) {
		//REQUIRED: object

		// when inited all
		if (isInited === true) {
			initObject(object);
		}

		// when not inited all
		else {
			readyObjects.push(object);
		}
	};

	m.removeReadyObject = removeReadyObject = function(object) {
		REMOVE({
			array : readyObjects,
			value : object
		});
	};

	m.initObjects = initObjects = function() {

		// init all objects.
		EACH(readyObjects, function(object) {
			initObject(object);
		});

		isInited = true;
	};

	return {

		run : function(define) {
			//REQUIRED: define

			var
			// cls
			cls = CLASS(define),

			// self
			self = {};

			// set type.
			self.type = cls;

			// check is instance of.
			self.checkIsInstanceOf = function(checkCls) {

				var
				// target cls
				targetCls = cls;

				// check moms.
				while (targetCls !== undefined) {

					if (targetCls === checkCls) {
						return true;
					}

					targetCls = targetCls.mom;
				}

				return false;
			};

			addReadyObject(self);

			return self;
		}
	};
});

/**
 * init all objects.
 */
global.INIT_OBJECTS = METHOD({

	run : function() {'use strict';

		OBJECT.initObjects();
	}
});

/**
 * create box.
 */
global.BOX = METHOD(function(m) {
	'use strict';

	var
	// boxes
	boxes = {},

	// get boxes.
	getBoxes;

	m.getBoxes = getBoxes = function() {
		return boxes;
	};

	return {

		run : function(boxName) {
			//REQUIRED: boxName

			var
			// box.
			box = function(packName) {
				//REQUIRED: packName

				var
				// packNameSps
				packNameSps = packName.split('.'),

				// pack
				pack;

				EACH(packNameSps, function(packNameSp) {

					if (pack === undefined) {

						if (box[packNameSp] === undefined) {

							//LOADED: PACK
							box[packNameSp] = {};
						}
						pack = box[packNameSp];

					} else {

						if (pack[packNameSp] === undefined) {

							//LOADED: PACK
							pack[packNameSp] = {};
						}
						pack = pack[packNameSp];
					}
				});

				return pack;
			},

			// box name splits
			boxNameSplits = boxName.split('.'),

			// before box split
			beforeBoxSplit = global,

			// before box name splits str
			beforeBoxNameSplitsStr = '';

			box.boxName = boxName;
			box.type = BOX;

			boxes[boxName] = box;

			EACH(boxNameSplits, function(boxNameSplit, i) {

				beforeBoxNameSplitsStr += (beforeBoxNameSplitsStr === '' ? '' : '.') + boxNameSplit;

				if (i < boxNameSplits.length - 1) {

					if (beforeBoxSplit[boxNameSplit] !== undefined) {
						beforeBoxSplit = beforeBoxSplit[boxNameSplit];
					} else {
						beforeBoxSplit = beforeBoxSplit[boxNameSplit] = {};
					}

				} else {

					beforeBoxSplit[boxNameSplit] = box;
				}
			});

			FOR_BOX.inject(box);

			return box;
		}
	};
});

/**
 * inject method or class to box.
 */
global.FOR_BOX = METHOD(function(m) {
	'use strict';

	var
	// funcs
	funcs = [],

	// inject.
	inject;

	m.inject = inject = function(box) {
		EACH(funcs, function(func) {
			func(box);
		});
	};

	return {

		run : function(func) {
			//REQUIRED: func

			EACH(BOX.getBoxes(), function(box) {
				func(box);
			});

			funcs.push(func);
		}
	};
});

/**
 * async control-flow method that makes stepping through logic easy.
 */
global.NEXT = METHOD({

	run : function(countOrArray, funcs) {
		'use strict';
		//OPTIONAL: countOrArray
		//REQUIRED: funcs

		var
		// count
		count,

		// array
		array,

		// f.
		f;

		if (funcs === undefined) {
			funcs = countOrArray;
			countOrArray = undefined;
		}

		if (countOrArray !== undefined) {
			if (CHECK_IS_ARRAY(countOrArray) !== true) {
				count = countOrArray;
			} else {
				array = countOrArray;
			}
		}

		REPEAT({
			start : funcs.length - 1,
			end : 0
		}, function(i) {

			var
			// next.
			next;

			// get last function.
			if (i !== 0 && f === undefined) {
				f = funcs[i]();
			}

			// pass next function.
			else if (i > 0) {

				next = f;

				f = funcs[i](next);

				f.next = next;
			}

			// run first function.
			else {

				next = f;

				// when next not exists, next is empty function.
				if (next === undefined) {
					next = function() {
						// ignore.
					};
				}

				f = funcs[i];

				if (count !== undefined) {

					RUN(function() {

						var
						// i
						i = -1;

						RUN(function(self) {

							i += 1;

							if (i + 1 < count) {
								f(i, self);
							} else {
								f(i, next);
							}
						});
					});

				} else if (array !== undefined) {

					RUN(function() {

						var
						// length
						length = array.length,

						// i
						i = -1;

						if (length === 0) {
							next();
						} else {

							RUN(function(self) {

								i += 1;

								if (i + 1 < length) {

									// if shrink
									if (array.length === length - 1) {
										i -= 1;
										length -= 1;
									}

									f(array[i], self, i);

								} else {
									f(array[i], next, i);
								}
							});
						}
					});

				} else {

					f(next);
				}
			}
		});
	}
});

/**
 * override something.
 */
global.OVERRIDE = METHOD({

	run : function(origin, func) {
		'use strict';
		//REQUIRED: origin
		//REQUIRED: func

		// when origin is OBJECT.
		if (origin.type !== undefined && origin.type.type === CLASS) {

			// remove origin from init ready objects.
			OBJECT.removeReadyObject(origin);
		}

		func(origin);
	}
});

/**
 * run funcs in parallel.
 */
global.PARALLEL = METHOD({

	run : function(countOrArray, funcs) {
		'use strict';
		//OPTIONAL: countOrArray
		//REQUIRED: funcs

		var
		// count
		count,

		// array
		array,

		// done count
		doneCount = 0;

		if (funcs === undefined) {
			funcs = countOrArray;
			countOrArray = undefined;
		}

		if (countOrArray !== undefined) {
			if (CHECK_IS_ARRAY(countOrArray) !== true) {
				count = countOrArray;
			} else {
				array = countOrArray;
			}
		}

		if (count !== undefined) {

			if (count === 0) {
				funcs[1]();
			} else {

				REPEAT(count, function(i) {

					funcs[0](i, function() {

						doneCount += 1;

						if (doneCount === count) {
							funcs[1]();
						}
					});
				});
			}

		} else if (array !== undefined) {

			if (array.length === 0) {
				funcs[1]();
			} else {

				EACH(array, function(value, i) {

					funcs[0](value, function() {

						doneCount += 1;

						if (doneCount === array.length) {
							funcs[1]();
						}
					}, i);
				});
			}

		} else {

			RUN(function() {

				var
				// length
				length = funcs.length - 1;

				EACH(funcs, function(func, i) {

					if (i < length) {

						func(function() {

							doneCount += 1;

							if (doneCount === length) {
								funcs[length]();
							}
						});
					}
				});
			});
		}
	}
});

/**
 * parse stringified value.
 */
global.PARSE_STR = METHOD({

	run : function(stringifiedValue) {
		'use strict';
		//REQUIRED: stringifiedValue

		var
		// value
		value;

		try {

			value = JSON.parse(stringifiedValue);

			return CHECK_IS_DATA(value) === true ? UNPACK_DATA(value) : value;

		} catch(e) {

			// when error, return undefined.
			return undefined;
		}
	}
});

/**
 * generate random string.
 */
global.RANDOM_STR = METHOD({

	run : function(length) {
		'use strict';
		//REQUIRED: length

		var
		// random string
		randomStr = '',

		// characters
		characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',

		// i
		i;

		REPEAT(length, function() {

			// add random character to random string.
			randomStr += characters.charAt(RANDOM({
				limit : characters.length
			}));
		});

		return randomStr;
	}
});

/**
 * stringify.
 */
global.STRINGIFY = METHOD({

	run : function(value) {
		'use strict';
		//REQUIRED: value

		return JSON.stringify(CHECK_IS_DATA(value) === true ? PACK_DATA(value) : value);
	}
});

/**
 * test.
 */
global.TEST = METHOD(function(m) {
	'use strict';

	var
	// error count
	errorCount = 0;

	return {

		run : function(name, test) {
			//REQUIRED: name
			//REQUIRED: test

			test(function(bool) {
				//REQUIRED: bool

				var
				// temp
				temp = {},

				// line
				line,

				// throw error.
				throwError;

				if (bool === true) {
					console.log('[' + name + ' TEST] SUCCESS! ' + errorCount + ' error(s) founded.');
				} else {

					temp.__THROW_ERROR_$$$ = function() {
						try {
							throw Error();
						} catch(error) {
							return error;
						}
					};

					line = temp.__THROW_ERROR_$$$().stack;

					if (line !== undefined) {
						line = line.substring(line.indexOf('__THROW_ERROR_$$$'));
						line = line.split('\n')[2];
						line = line.substring(line.indexOf('at '));
					}

					errorCount += 1;

					console.log('[' + name + ' TEST] ERROR! ' + line + ' ' + errorCount + ' error(s) founded.');
				}
			});
		}
	};
});

/**
 * URI matcher class
 */
global.URI_MATCHER = CLASS({

	init : function(inner, self, format) {
		'use strict';
		//REQUIRED: format

		var
		// Check class
		Check = CLASS({

			init : function(inner, self, uri) {
				//REQUIRED: uri

				var
				// uri parts
				uriParts = uri.split('/'),

				// is matched
				isMatched,

				// uri parmas
				uriParams = {},

				// find.
				find = function(format) {

					var
					// format parts
					formatParts = format.split('/');

					return EACH(uriParts, function(uriPart, i) {

						var
						// format part
						formatPart = formatParts[i];

						if (formatPart === '**') {
							isMatched = true;
							return false;
						}

						if (formatPart === undefined) {
							return false;
						}

						// find params.
						if (uriPart !== '' && formatPart.charAt(0) === '{' && formatPart.charAt(formatPart.length - 1) === '}') {
							uriParams[formatPart.substring(1, formatPart.length - 1)] = uriPart;
						} else if (formatPart !== '*' && formatPart !== uriPart) {
							return false;
						}

						if (i === uriParts.length - 1 && i < formatParts.length - 1 && formatParts[formatParts.length - 1] !== '') {
							return false;
						}

					}) === true || isMatched === true;
				},

				// check is matched.
				checkIsMatched,

				// get uri params.
				getURIParams;

				if (CHECK_IS_ARRAY(format) === true) {
					isMatched = EACH(format, function(format) {
						return find(format) !== true;
					}) !== true;
				} else {
					isMatched = find(format);
				}

				self.checkIsMatched = checkIsMatched = function() {
					return isMatched;
				};

				self.getURIParams = getURIParams = function() {
					return uriParams;
				};
			}
		}),

		// check.
		check;

		self.check = check = function(uri) {
			return Check(uri);
		};
	}
});

/**
 * Data validation class
 */
global.VALID = CLASS(function(cls) {
	'use strict';

	var
	// not empty.
	notEmpty,

	// regex.
	regex,

	// size.
	size,

	// integer.
	integer,

	// real.
	real,

	// bool.
	bool,

	// date.
	date,

	// min.
	min,

	// max.
	max,

	// email.
	email,

	// png.
	png,

	// url.
	url,

	// username.
	username,

	// id.
	id,

	// one.
	one,

	// array.
	array,

	// data.
	data,

	// element.
	element,

	// property.
	property,

	// detail.
	detail,

	// equal.
	equal;

	cls.notEmpty = notEmpty = function(value) {
		//REQUIRED: value

		var
		// string
		str = (value === undefined || value === TO_DELETE) ? '' : String(value);

		return CHECK_IS_ARRAY(value) === true || str.trim() !== '';
	};

	cls.regex = regex = function(params) {
		//REQUIRED: params
		//REQUIRED: params.pattern
		//REQUIRED: params.value

		var
		// pattern
		pattern = params.pattern,

		// string
		str = String(params.value);

		return str === str.match(pattern)[0];
	};

	cls.size = size = function(params) {
		//OPTIONAL: params.min
		//REQUIRED: params.max
		//REQUIRED: params.value

		var
		// min
		min = params.min,

		// max
		max = params.max,

		// string
		str = String(params.value);
		
		if (min === undefined) {
			min = 0;
		}

		return min <= str.trim().length && (max === undefined || str.length <= max);
	};

	cls.integer = integer = function(value) {
		//REQUIRED: value

		var
		// string
		str = String(value);

		return notEmpty(str) === true && str.match(/^(?:-?(?:0|[1-9][0-9]*))$/) !== TO_DELETE;
	};

	cls.real = real = function(value) {
		//REQUIRED: value

		var
		// string
		str = String(value);

		return notEmpty(str) === true && str.match(/^(?:-?(?:0|[1-9][0-9]*))?(?:\.[0-9]*)?$/) !== TO_DELETE;
	};

	cls.bool = bool = function(value) {
		//REQUIRED: value

		var
		// string
		str = String(value);

		return str === 'true' || str === 'false';
	};

	cls.date = date = function(value) {
		//REQUIRED: value

		var
		// string
		str = String(value),

		// date
		date = Date.parse(str);

		return isNaN(date) === false;
	};

	cls.min = min = function(params) {
		//REQUIRED: params
		//REQUIRED: params.min
		//REQUIRED: params.value

		var
		// min
		min = params.min,

		// value
		value = params.value;

		return real(value) === true && min <= value;
	};

	cls.max = max = function(params) {
		//REQUIRED: params
		//REQUIRED: params.max
		//REQUIRED: params.value

		var
		// max
		max = params.max,

		// value
		value = params.value;

		return real(value) === true && max >= value;
	};

	cls.email = email = function(value) {
		//REQUIRED: value

		return typeof value === 'string' && notEmpty(value) === true && value.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/) !== TO_DELETE;
	};

	cls.png = png = function(value) {
		//REQUIRED: value

		return typeof value === 'string' && notEmpty(value) === true && value.match(/^data:image\/png;base64,/) !== TO_DELETE;
	};

	cls.url = url = function(value) {
		//REQUIRED: value

		return typeof value === 'string' && notEmpty(value) === true && value.match(/^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i) !== TO_DELETE && value.length <= 2083;
	};

	cls.username = username = function(value) {
		//REQUIRED: value

		return typeof value === 'string' && notEmpty(value) === true && value.match(/^[_a-zA-Z0-9\-]+$/) !== TO_DELETE;
	};

	// mongodb id check
	cls.id = id = function(value) {
		//REQUIRED: value

		return typeof value === 'string' && notEmpty(value) === true && value.match(/[0-9a-f]{24}/) !== TO_DELETE && value.length === 24;
	};

	cls.one = one = function(params) {
		//REQUIRED: params
		//REQUIRED: params.array
		//REQUIRED: params.value

		var
		// array
		array = params.array,
		
		// value
		value = params.value;

		return EACH(array, function(_value) {
			if (value === _value) {
				return false;
			}
		}) === false;
	};

	cls.array = array = function(value) {
		//REQUIRED: value

		return CHECK_IS_ARRAY(value) === true;
	};

	cls.data = data = function(value) {
		//REQUIRED: value

		return CHECK_IS_DATA(value) === true;
	};

	cls.element = element = function(params) {
		//REQUIRED: params
		//REQUIRED: params.array
		//REQUIRED: params.validData

		var
		// array
		array = params.array,

		// valid
		valid = VALID({
			_ : params.validData
		});

		return EACH(array, function(value) {
			if (valid.check({
				_ : value
			}).checkHasError() === true) {
				return false;
			}
		}) === true;
	};

	cls.property = property = function(params) {
		//REQUIRED: params
		//REQUIRED: params.data
		//REQUIRED: params.validData

		var
		// array
		data = params.data,

		// valid
		valid = VALID({
			_ : params.validData
		});

		return EACH(data, function(value) {
			if (valid.check({
				_ : value
			}).checkHasError() === true) {
				return false;
			}
		}) === true;
	};

	cls.detail = detail = function(params) {
		//REQUIRED: params
		//REQUIRED: params.data
		//REQUIRED: params.validDataSet

		var
		// data
		data = params.data,

		// valid
		valid = VALID(params.validDataSet);

		return valid.check(data).checkHasError() !== true;
	};

	cls.equal = equal = function(params) {
		//REQUIRED: params
		//REQUIRED: params.value
		//REQUIRED: params.validValue

		var
		// value
		value = params.value,

		// string
		str = String(value),

		// valid value
		validValue = params.validValue,

		// valid str
		validStr = String(validValue);

		return str === validStr;
	};

	return {

		init : function(inner, self, validDataSet) {
			//REQUIRED: validDataSet

			var
			// Check class
			Check = CLASS({

				init : function(inner, self, params) {
					//REQUIRED: params
					//REQUIRED: params.data
					//OPTIONAL: params.isForUpdate

					var
					// data
					data = params.data,

					// is for update
					isForUpdate = params.isForUpdate,

					// has error
					hasError = false,

					// errors
					errors = {},

					// check has error.
					checkHasError,

					// get errors.
					getErrors;

					EACH(validDataSet, function(validData, attr) {

						// when valid data is true, pass
						if (validData !== true) {

							EACH(validData, function(validParams, name) {

								var
								// value
								value = data[attr];

								if (isForUpdate === true && value === undefined) {

									// break.
									return false;
								}

								if (name !== 'notEmpty' && notEmpty(value) !== true) {
									
									data[attr] = isForUpdate === true ? TO_DELETE : undefined;
									
									// continue.
									return true;
								}

								// one
								if (name === 'one') {

									if (one({
										array : validParams,
										value : value
									}) === false) {

										hasError = true;
										errors[attr] = {
											type : name,
											array : validParams,
											value : value
										};

										// break.
										return false;
									}
								}

								// element
								else if (name === 'element') {

									if (element({
										validData : validParams,
										array : value
									}) === false) {

										hasError = true;
										errors[attr] = {
											type : name,
											validData : validParams,
											array : value
										};

										// break.
										return false;
									}
								}

								// property
								else if (name === 'property') {

									if (property({
										validData : validParams,
										data : value
									}) === false) {

										hasError = true;
										errors[attr] = {
											type : name,
											validData : validParams,
											data : value
										};

										// break.
										return false;
									}
								}

								// detail
								else if (name === 'detail') {

									if (detail({
										validDataSet : validParams,
										data : value
									}) === false) {

										hasError = true;
										errors[attr] = {
											type : name,
											validDataSet : validParams,
											data : value
										};

										// break.
										return false;
									}
								}

								// need params
								else if (name === 'size') {

									if (cls[name](CHECK_IS_DATA(validParams) === true ? COMBINE([validParams, {
										value : value
									}]) : COMBINE([{
										min : validParams,
										max : validParams
									}, {
										value : value
									}])) === false) {

										hasError = true;
										errors[attr] = {
											type : name,
											validParams : validParams,
											value : value
										};

										// break.
										return false;
									}
								}

								// regex
								else if (name === 'regex') {

									if (cls[name]({
										pattern : validParams,
										value : value
									}) === false) {

										hasError = true;
										errors[attr] = {
											type : name,
											validParam : validParams,
											value : value
										};

										// break.
										return false;
									}
								}

								// min
								else if (name === 'min') {

									if (cls[name]({
										min : validParams,
										value : value
									}) === false) {

										hasError = true;
										errors[attr] = {
											type : name,
											validParam : validParams,
											value : value
										};

										// break.
										return false;
									}
								}

								// max
								else if (name === 'max') {

									if (cls[name]({
										max : validParams,
										value : value
									}) === false) {

										hasError = true;
										errors[attr] = {
											type : name,
											validParam : validParams,
											value : value
										};

										// break.
										return false;
									}
								}

								// equal
								else if (name === 'equal') {

									if (cls[name]({
										value : value,
										validValue : validParams
									}) === false) {

										hasError = true;
										errors[attr] = {
											type : name,
											validParam : validParams,
											value : value
										};

										// break.
										return false;
									}
								}

								// need value
								else if (validParams === true) {

									if (cls[name](value) === false) {

										hasError = true;
										errors[attr] = {
											type : name,
											value : value
										};

										// break.
										return false;
									}
								}

								if (notEmpty(value) === true && typeof value === 'string') {
									if (name === 'integer') {
										data[attr] = INTEGER(value);
									} else if (name === 'real') {
										data[attr] = REAL(value);
									} else if (name === 'bool') {
										data[attr] = value === 'true';
									} else if (name === 'date') {
										data[attr] = new Date(value);
									} else if (name === 'username') {
										data[attr] = value.toLowerCase();
									}
								}
							});
						}
					});

					EACH(data, function(value, attr) {
						if (validDataSet[attr] === undefined) {
							delete data[attr];
						}
					});

					self.checkHasError = checkHasError = function() {
						return hasError;
					};

					self.getErrors = getErrors = function() {
						return errors;
					};
				}
			}),

			// check.
			check,

			// check for update.
			checkForUpdate,
			
			// get valid data set.
			getValidDataSet;

			self.check = check = function(data) {
				return Check({
					data : data
				});
			};

			self.checkForUpdate = checkForUpdate = function(data) {
				return Check({
					data : data,
					isForUpdate : true
				});
			};
			
			self.getValidDataSet = getValidDataSet = function() {
				return validDataSet;
			};
		}
	};
});

/**
 * check it is arguments.
 */
global.CHECK_IS_ARGUMENTS = METHOD({

	run : function(it) {'use strict';
		//OPTIONAL: it

		if (it !== undefined && it !== TO_DELETE && typeof it === 'object' && (Object.prototype.toString.call(it) === '[object Arguments]' || (it.callee !== undefined && typeof it.callee === 'function'))) {
			return true;
		}

		return false;
	}
});

/**
 * check are same all elements in array.
 */
global.CHECK_ARE_SAME = METHOD({

	run : function(array) {
		'use strict';
		//REQUIRED: array

		var
		// are same
		areSame = false,

		// check two same.
		checkTwoSame = function(a, b) {

			// when a, b are date
			if ( a instanceof Date === true && b instanceof Date === true) {
				return a.getTime() === b.getTime();
			}
			
			// when a, b are regex
			else if ( a instanceof RegExp === true && b instanceof RegExp === true) {
				return a.toString() === b.toString();
			}

			// when a, b are data (JS object)
			else if (CHECK_IS_DATA(a) === true && CHECK_IS_DATA(b) === true) {
				return EACH(a, function(value, name) {
					return checkTwoSame(value, b[name]);
				});
			}

			// when a, b are array
			else if (CHECK_IS_ARRAY(a) === true && CHECK_IS_ARRAY(b) === true) {
				return EACH(a, function(value, i) {
					return checkTwoSame(value, b[i]);
				});
			}

			// when a, b are value
			else {
				return a === b;
			}
		};

		if (array.length > 1) {

			areSame = REPEAT(array.length, function(i) {
				if (i < array.length - 1) {
					return checkTwoSame(array[i], array[i + 1]);
				} else {
					return checkTwoSame(array[i], array[0]);
				}
			});
		}

		return areSame;
	}
});

/**
 * check it is array.
 */
global.CHECK_IS_ARRAY = METHOD({

	run : function(it) {
		'use strict';
		//OPTIONAL: it

		if (it !== undefined && it !== TO_DELETE && typeof it === 'object' && Object.prototype.toString.call(it) === '[object Array]') {
			return true;
		}

		return false;
	}
});

/**
 * check it is data.
 */
global.CHECK_IS_DATA = METHOD({

	run : function(it) {
		'use strict';
		//OPTIONAL: it

		if (it !== undefined && it !== TO_DELETE && CHECK_IS_ARGUMENTS(it) !== true && CHECK_IS_ARRAY(it) !== true && it instanceof Date !== true && it instanceof RegExp !== true && typeof it === 'object') {
			return true;
		}

		return false;
	}
});

/**
 * check is empty data.
 */
global.CHECK_IS_EMPTY_DATA = METHOD({

	run : function(data) {
		'use strict';
		//REQUIRED: data

		return CHECK_ARE_SAME([data, {}]);
	}
});

/**
 * count data's properties
 */
global.COUNT_PROPERTIES = METHOD({

	run : function(data) {
		'use strict';
		//OPTIONAL: data

		var
		// count
		count = 0;
		
		EACH(data, function() {
			count += 1;
		});
		
		return count;
	}
});

/**
 * pack data with Date type.
 */
global.PACK_DATA = METHOD({

	run : function(data) {
		'use strict';
		//REQUIRED: data

		var
		// result
		result = COPY(data),

		// date attribute names
		dateAttrNames = [],
		
		// regex attribute names
		regexAttrNames = [];

		EACH(result, function(value, name) {

			// when value is Date type
			if ( value instanceof Date === true) {

				// change to timestamp integer.
				result[name] = INTEGER(value.getTime());
				dateAttrNames.push(name);
			}
			
			// when value is RegExp type
			else if ( value instanceof RegExp === true) {

				// change to string.
				result[name] = value.toString();
				regexAttrNames.push(name);
			}

			// when value is data
			else if (CHECK_IS_DATA(value) === true) {
				result[name] = PACK_DATA(value);
			}

			// when value is array
			else if (CHECK_IS_ARRAY(value) === true) {

				EACH(value, function(v, i) {

					if (CHECK_IS_DATA(v) === true) {
						value[i] = PACK_DATA(v);
					}
				});
			}
		});

		result.__DATE_ATTR_NAMES = dateAttrNames;
		result.__REGEX_ATTR_NAMES = regexAttrNames;

		return result;
	}
});

/**
 * unpack data with Date type.
 */
global.UNPACK_DATA = METHOD({

	run : function(data) {
		'use strict';
		//REQUIRED: data

		var
		// result
		result = COPY(data);

		// when date attribute names exists
		if (result.__DATE_ATTR_NAMES !== undefined) {

			// change timestamp integer to Date type.
			EACH(result.__DATE_ATTR_NAMES, function(dateAttrName, i) {
				result[dateAttrName] = new Date(result[dateAttrName]);
			});
			delete result.__DATE_ATTR_NAMES;
		}
		
		// when regex attribute names exists
		if (result.__REGEX_ATTR_NAMES !== undefined) {

			// change string to RegExp type.
			EACH(result.__REGEX_ATTR_NAMES, function(regexAttrName, i) {
				
				var
				// pattern
				pattern = result[regexAttrName],
				
				// flags
				flags,
				
				// j
				j;
				
				for (j = pattern.length - 1; j >= 0; j -= 1) {
					if (pattern[j] === '/') {
						flags = pattern.substring(j + 1);
						pattern = pattern.substring(1, j);
						break;
					}
				}
				
				result[regexAttrName] = new RegExp(pattern, flags);
			});
			delete result.__REGEX_ATTR_NAMES;
		}

		EACH(result, function(value, name) {

			// when value is data
			if (CHECK_IS_DATA(value) === true) {
				result[name] = UNPACK_DATA(value);
			}

			// when value is array
			else if (CHECK_IS_ARRAY(value) === true) {

				EACH(value, function(v, i) {

					if (CHECK_IS_DATA(v) === true) {
						value[i] = UNPACK_DATA(v);
					}
				});
			}
		});

		return result;
	}
});

/**
 * check is exists value in data or array.
 */
global.CHECK_IS_IN = METHOD({

	run : function(params) {
		'use strict';
		//REQUIRED: params
		//OPTIONAL: params.data
		//OPTIONAL: params.array
		//REQUIRED: params.value

		var
		// data
		data = params.data,

		// array
		array = params.array,

		// value
		value = params.value;

		if (data !== undefined) {
			return EACH(data, function(_value, name) {
				if (CHECK_ARE_SAME([_value, value]) === true) {
					return false;
				}
			}) !== true;
		}

		if (array !== undefined) {
			return EACH(array, function(_value, key) {
				if (CHECK_ARE_SAME([_value, value]) === true) {
					return false;
				}
			}) !== true;
		}
	}
});

/**
 * combine data set or arrays.
 */
global.COMBINE = METHOD({

	run : function(dataSetOrArrays) {
		'use strict';
		//REQUIRED: dataSetOrArrays

		var
		// first
		first,

		// result
		result;

		if (dataSetOrArrays.length > 0) {

			first = dataSetOrArrays[0];

			// when first is data
			if (CHECK_IS_DATA(first) === true) {

				result = {};

				EACH(dataSetOrArrays, function(data) {
					EXTEND({
						origin : result,
						extend : data
					});
				});
			}

			// when first is array
			else if (CHECK_IS_ARRAY(first) === true) {

				result = [];

				EACH(dataSetOrArrays, function(array) {
					EXTEND({
						origin : result,
						extend : array
					});
				});
			}
		}

		return result;
	}
});

/**
 * copy data or array.
 */
global.COPY = METHOD({

	run : function(dataOrArray) {
		'use strict';
		//REQUIRED: dataOrArray

		var
		// copy
		copy;

		// when dataOrArray is data (JS object)
		if (CHECK_IS_DATA(dataOrArray) === true) {

			copy = {};

			EXTEND({
				origin : copy,
				extend : dataOrArray
			});
		}

		// when dataOrArray is array
		else if (CHECK_IS_ARRAY(dataOrArray) === true) {

			copy = [];

			EXTEND({
				origin : copy,
				extend : dataOrArray
			});
		}

		return copy;
	}
});

/**
 * extend data or array.
 */
global.EXTEND = METHOD({

	run : function(params) {
		'use strict';
		//REQUIRED: params
		//REQUIRED: params.origin
		//REQUIRED: params.extend

		var
		// origin
		origin = params.origin,

		// extend
		extend = params.extend;

		// when origin is data
		if (CHECK_IS_DATA(origin) === true) {

			EACH(extend, function(value, name) {
				
				var
				// pattern
				pattern,
				
				// flags
				flags,
				
				// j
				i;
				
				if ( value instanceof Date === true) {
					origin[name] = new Date(value.getTime());
				}
				
				else if ( value instanceof RegExp === true) {
					
					pattern = value.toString();
					
					for (i = pattern.length - 1; i >= 0; i -= 1) {
						if (pattern[i] === '/') {
							flags = pattern.substring(i + 1);
							pattern = pattern.substring(1, i);
							break;
						}
					}
					
					origin[name] = new RegExp(pattern, flags);
				}
				
				else if (CHECK_IS_DATA(value) === true || CHECK_IS_ARRAY(value) === true) {
					origin[name] = COPY(value);
				}
				
				else {
					origin[name] = value;
				}
			});
		}

		// when origin is array
		else if (CHECK_IS_ARRAY(origin) === true) {

			EACH(extend, function(value) {
				
				var
				// pattern
				pattern,
				
				// flags
				flags,
				
				// j
				i;

				if ( value instanceof Date === true) {
					origin.push(new Date(value.getTime()));
				}
				
				else if ( value instanceof RegExp === true) {
					
					pattern = value.toString();
					
					for (i = pattern.length - 1; i >= 0; i -= 1) {
						if (pattern[i] === '/') {
							flags = pattern.substring(i + 1);
							pattern = pattern.substring(1, i);
							break;
						}
					}
					
					origin.push(new RegExp(pattern, flags));
				}
				
				else if (CHECK_IS_DATA(value) === true || CHECK_IS_ARRAY(value) === true) {
					origin.push(COPY(value));
				}
				
				else {
					origin.push(value);
				}
			});
		}

		return origin;
	}
});

/**
 * find name or key in data or array.
 */
global.FIND = METHOD({

	run : function(dataOrArrayOrParams, filter) {
		'use strict';
		//REQUIRED: dataOrArrayOrParams
		//OPTIONAL: dataOrArrayOrParams.data
		//OPTIONAL: dataOrArrayOrParams.array
		//REQUIRED: dataOrArrayOrParams.value
		//OPTIONAL: filter

		var
		// data
		data,

		// array
		array,

		// value
		value,

		// ret
		ret;

		// when filter exists
		if (filter !== undefined) {

			// when dataOrArrayOrParams is data
			if (CHECK_IS_DATA(dataOrArrayOrParams) === true) {

				EACH(dataOrArrayOrParams, function(value, name) {

					// value passed filter.
					if (filter(value) === true) {
						ret = value;
						return false;
					}
				});
			}

			// when dataOrArrayOrParams is array
			else if (CHECK_IS_ARRAY(dataOrArrayOrParams) === true) {

				EACH(dataOrArrayOrParams, function(value, key) {

					// value passed filter.
					if (filter(value) === true) {
						ret = value;
						return false;
					}
				});
			}
		}

		// when filter not exists
		else {

			// init params.
			data = dataOrArrayOrParams.data;
			array = dataOrArrayOrParams.array;
			value = dataOrArrayOrParams.value;

			if (data !== undefined) {

				EACH(data, function(_value, name) {
					if (_value === value) {
						ret = name;
						return false;
					}
				});
			}

			if (array !== undefined) {

				EACH(array, function(_value, key) {
					if (_value === value) {
						ret = key;
						return false;
					}
				});
			}
		}

		return ret;
	}
});

/**
 * remove at name or key or some value in data or array.
 */
global.REMOVE = METHOD({

	run : function(dataOrArrayOrParams, filter) {
		'use strict';
		//REQUIRED: dataOrArrayOrParams
		//OPTIONAL: dataOrArrayOrParams.data
		//OPTIONAL: dataOrArrayOrParams.array
		//OPTIONAL: dataOrArrayOrParams.name
		//OPTIONAL: dataOrArrayOrParams.key
		//OPTIONAL: dataOrArrayOrParams.value
		//OPTIONAL: filter

		var
		// data
		data,

		// array
		array,

		// name
		name,

		// key
		key,

		// value
		value;

		// when filter exists
		if (filter !== undefined) {

			// when dataOrArrayOrParams is data
			if (CHECK_IS_DATA(dataOrArrayOrParams) === true) {

				EACH(dataOrArrayOrParams, function(value, name) {

					// remove value passed filter.
					if (filter(value) === true) {

						REMOVE({
							data : dataOrArrayOrParams,
							name : name
						});
					}
				});
			}

			// when dataOrArrayOrParams is array
			else if (CHECK_IS_ARRAY(dataOrArrayOrParams) === true) {

				EACH(dataOrArrayOrParams, function(value, key) {

					// remove value passed filter.
					if (filter(value) === true) {

						REMOVE({
							array : dataOrArrayOrParams,
							key : key
						});
					}
				});
			}
		}

		// when filter not exists
		else {

			// init params.
			data = dataOrArrayOrParams.data;
			array = dataOrArrayOrParams.array;
			name = dataOrArrayOrParams.name;
			key = dataOrArrayOrParams.key;
			value = dataOrArrayOrParams.value;

			// remove at name.
			if (name !== undefined) {
				delete data[name];
			}

			// remove at key.
			if (key !== undefined) {
				array.splice(key, 1);
			}

			// remove value.
			if (value !== undefined) {

				if (data !== undefined) {

					EACH(data, function(_value, name) {

						if (CHECK_ARE_SAME([_value, value]) === true) {

							REMOVE({
								data : data,
								name : name
							});
						}
					});
				}

				if (array !== undefined) {

					EACH(array, function(_value, key) {

						if (CHECK_ARE_SAME([_value, value]) === true) {

							REMOVE({
								array : array,
								key : key
							});
						}
					});
				}
			}
		}
	}
});

/**
 * Calendar class
 */
global.CALENDAR = CLASS({

	init : function(inner, self, date) {
		'use strict';
		//OPTIONAL: date

		var
		// get year.
		getYear,

		// get month.
		getMonth,

		// get date.
		getDate,

		// get day.
		getDay,

		// get hour.
		getHour,

		// get minute
		getMinute,

		// get second.
		getSecond;

		if (date === undefined) {
			date = new Date();
		}

		self.getYear = getYear = function() {
			return date.getFullYear();
		};

		self.getMonth = getMonth = function(isFormal) {
			//OPTIONAL: isFormal
			
			var
			// month
			month = date.getMonth() + 1;
			
			if (isFormal === true) {
				if (month < 10) {
					return '0' + month;
				} else {
					return '' + month;
				}
			} else {
				return month;
			}
		};

		self.getDate = getDate = function(isFormal) {
			//OPTIONAL: isFormal
			
			var
			// date
			d = date.getDate();
			
			if (isFormal === true) {
				if (d < 10) {
					return '0' + d;
				} else {
					return '' + d;
				}
			} else {
				return d;
			}
		};

		self.getDay = getDay = function() {
			return date.getDay();
		};

		self.getHour = getHour = function(isFormal) {
			//OPTIONAL: isFormal
			
			var
			// hour
			hour = date.getHours();
			
			if (isFormal === true) {
				if (hour < 10) {
					return '0' + hour;
				} else {
					return '' + hour;
				}
			} else {
				return hour;
			}
		};

		self.getMinute = getMinute = function(isFormal) {
			//OPTIONAL: isFormal
			
			var
			// minute
			minute = date.getMinutes();
			
			if (isFormal === true) {
				if (minute < 10) {
					return '0' + minute;
				} else {
					return '' + minute;
				}
			} else {
				return minute;
			}
		};

		self.getSecond = getSecond = function(isFormal) {
			//OPTIONAL: isFormal
			
			var
			// second
			second = date.getSeconds();
			
			if (isFormal === true) {
				if (second < 10) {
					return '0' + second;
				} else {
					return '' + second;
				}
			} else {
				return second;
			}
		};
	}
});

/**
 * create date type.
 */
global.CREATE_DATE = METHOD({

	run : function(params) {
		'use strict';
		//REQUIRED: params
		//OPTIONAL: params.year
		//OPTIONAL: params.month
		//OPTIONAL: params.date
		//OPTIONAL: params.hour
		//OPTIONAL: params.minute
		//OPTIONAL: params.second
		
		var
		// year
		year = params.year,
		
		// month
		month = params.month,
		
		// date
		date = params.date,
		
		// hour
		hour = params.hour,
		
		// minute
		minute = params.minute,
		
		// second
		second = params.second,
		
		// now cal
		nowCal = CALENDAR(new Date());
		
		if (year === undefined) {
			year = nowCal.getYear();
		}
		
		if (month === undefined) {
			month = date === undefined ? 0 : nowCal.getMonth();
		}
		
		if (date === undefined) {
			date = hour === undefined ? 0 : nowCal.getDate();
		}
		
		if (hour === undefined) {
			hour = minute === undefined ? 0 : nowCal.getHour();
		}
		
		if (minute === undefined) {
			minute = second === undefined ? 0 : nowCal.getMinute();
		}
		
		if (second === undefined) {
			second = 0;
		}

		return new Date(year, month - 1, date, hour, minute, second);
	}
});

/**
 * Delay class
 */
global.DELAY = CLASS({

	init : function(inner, self, seconds, func) {
		'use strict';
		//REQUIRED: seconds
		//OPTIONAL: func

		var
		// milliseconds
		milliseconds,
		
		// start time
		startTime = Date.now(),
		
		// remaining
		remaining,
		
		// timeout
		timeout,

		// resume.
		resume,
		
		// pause.
		pause,
		
		// remove.
		remove;

		if (func === undefined) {
			func = seconds;
			seconds = 0;
		}
		
		remaining = milliseconds = seconds * 1000;
		
		self.resume = resume = RAR(function() {
			
			if (timeout === undefined) {
				
				timeout = setTimeout(function() {
					func(self);
				}, remaining);
			}
		});
		
		self.pause = pause = function() {
			
			remaining = milliseconds - (Date.now() - startTime);
			
			clearTimeout(timeout);
			timeout = undefined;
		};
		
		self.remove = remove = function() {
			pause();
		};
	}
});

/**
 * Interval class
 */
global.INTERVAL = CLASS({

	init : function(inner, self, seconds, func) {
		'use strict';
		//REQUIRED: seconds
		//OPTIONAL: func

		var
		// milliseconds
		milliseconds,
		
		// start time
		startTime = Date.now(),
		
		// remaining
		remaining,
		
		// interval
		interval,
		
		// resume.
		resume,
		
		// pause.
		pause,

		// remove.
		remove;

		if (func === undefined) {
			func = seconds;
			seconds = 0;
		}
		
		remaining = milliseconds = seconds === 0 ? 1 : seconds * 1000;
		
		self.resume = resume = RAR(function() {
			
			if (interval === undefined) {
				
				interval = setInterval(function() {
					
					if (func(self) === false) {
						remove();
					}
					
					startTime = Date.now();
					
				}, remaining);
			}
		});
		
		self.pause = pause = function() {
			
			remaining = milliseconds - (Date.now() - startTime);
			
			clearInterval(interval);
			interval = undefined;
		};
		
		self.remove = remove = function() {
			pause();
		};
	}
});

/**
 * Loop class (for game etc.)
 */
global.LOOP = CLASS(function(cls) {
	'use strict';

	var
	// before time
	beforeTime,

	// animation interval
	animationInterval,

	// loop infos
	loopInfos = [],

	// runs
	runs = [],

	// fire.
	fire = function() {

		if (animationInterval === undefined) {

			beforeTime = Date.now();

			animationInterval = INTERVAL(function() {

				var
				// time
				time = Date.now(),

				// times
				times = time - beforeTime,

				// loop info
				loopInfo,

				// count
				count,

				// interval
				interval,

				// i, j
				i, j;

				if (times > 0) {

					for ( i = 0; i < loopInfos.length; i += 1) {

						loopInfo = loopInfos[i];

						if (loopInfo.fps !== undefined && loopInfo.fps > 0) {

							if (loopInfo.timeSigma === undefined) {
								loopInfo.timeSigma = 0;
								loopInfo.countSigma = 0;
							}

							// calculate count.
							count = parseInt(loopInfo.fps / (1000 / times) * (loopInfo.timeSigma / times + 1), 10) - loopInfo.countSigma;

							// start.
							if (loopInfo.start !== undefined) {
								loopInfo.start();
							}

							// run interval.
							interval = loopInfo.interval;
							for ( j = 0; j < count; j += 1) {
								interval(loopInfo.fps);
							}

							// end.
							if (loopInfo.end !== undefined) {
								loopInfo.end(times);
							}

							loopInfo.countSigma += count;

							loopInfo.timeSigma += times;
							if (loopInfo.timeSigma > 1000) {
								loopInfo.timeSigma = undefined;
							}
						}
					}

					// run runs.
					for ( i = 0; i < runs.length; i += 1) {
						runs[i](times);
					}

					beforeTime = time;
				}
			});
		}
	},

	// stop.
	stop = function() {

		if (loopInfos.length <= 0 && runs.length <= 0) {

			animationInterval.remove();
			animationInterval = undefined;
		}
	};

	return {

		init : function(inner, self, fps, intervalOrFuncs) {
			//OPTIONAL: fps
			//OPTIONAL: intervalOrFuncs
			//OPTIONAL: intervalOrFuncs.start
			//REQUIRED: intervalOrFuncs.interval
			//OPTIONAL: intervalOrFuncs.end

			var
			// run.
			run,

			// start.
			start,

			// interval.
			interval,

			// end.
			end,

			// info
			info,
			
			// resume.
			resume,
			
			// pause.
			pause,

			// change fps.
			changeFPS,

			// remove.
			remove;

			// when intervalOrFuncs exists
			if (intervalOrFuncs !== undefined) {

				// init intervalOrFuncs.
				if (CHECK_IS_DATA(intervalOrFuncs) !== true) {
					interval = intervalOrFuncs;
				} else {
					start = intervalOrFuncs.start;
					interval = intervalOrFuncs.interval;
					end = intervalOrFuncs.end;
				}
			
				self.resume = resume = RAR(function() {
					
					loopInfos.push( info = {
						fps : fps,
						start : start,
						interval : interval,
						end : end
					});
					
					fire();
				});

				self.pause = pause = function() {

					REMOVE({
						array : loopInfos,
						value : info
					});

					stop();
				};

				self.changeFPS = changeFPS = function(fps) {
					//REQUIRED: fps

					info.fps = fps;
				};

				self.remove = remove = function() {
					pause();
				};
			}

			// when fps is run
			else {
				
				self.resume = resume = RAR(function() {
					
					runs.push( run = fps);
					
					fire();
				});

				self.pause = pause = function() {

					REMOVE({
						array : runs,
						value : run
					});

					stop();
				};

				self.remove = remove = function() {
					pause();
				};
			}
		}
	};
});

/**
 * run `func` and return it.
 */
global.RAR = METHOD({

	run : function(params, func) {
		'use strict';
		//OPTIONAL: params
		//REQUIRED: func

		// init params and func.
		if (func === undefined) {
			func = params;
			params = undefined;
		}

		func(params);

		return func;
	}
});

/**
 * just run.
 *
 * use this if you need a code block.
 */
global.RUN = METHOD({

	run : function(func) {
		'use strict';
		//REQUIRED: func

		var
		// f.
		f = function() {
			return func(f);
		};

		return f();
	}
});

/**
 * convert integer string to integer number.
 */
global.INTEGER = METHOD({

	run : function(integerString) {
		'use strict';
		//OPTIONAL: integerString

		return integerString === undefined ? undefined : parseInt(integerString, 10);
	}
});

/**
 * generate random integer.
 */
global.RANDOM = METHOD({

	run : function(limitOrParams) {
		'use strict';
		//REQUIRED: limitOrParams
		//OPTIONAL: limitOrParams.min
		//OPTIONAL: limitOrParams.max
		//OPTIONAL: limitOrParams.limit

		var
		// min
		min,

		// max
		max,

		// limit
		limit;

		// init limitOrParams.
		if (CHECK_IS_DATA(limitOrParams) !== true) {
			limit = limitOrParams;
		} else {
			min = limitOrParams.min;
			max = limitOrParams.max;
			limit = limitOrParams.limit;
		}

		if (min === undefined) {
			min = 0;
		}

		if (limit !== undefined) {
			max = limit - 1;
		}

		return Math.floor(Math.random() * (max - min + 1) + min);
	}
});

/**
 * convert real number string to real number.
 */
global.REAL = METHOD({

	run : function(realNumberString) {'use strict';
		//OPTIONAL: realNumberString

		return realNumberString === undefined ? undefined : parseFloat(realNumberString);
	}
});

/**
 * same as `foreach`.
 */
global.EACH = METHOD({

	run : function(dataOrArrayOrString, func) {
		'use strict';
		//OPTIONAL: dataOrArrayOrString
		//REQUIRED: func

		var
		// length
		length,

		// name
		name,

		// extras
		i;

		// when dataOrArrayOrString is undefined
		if (dataOrArrayOrString === undefined) {
			return false;
		}

		// when dataOrArrayOrString is data
		else if (CHECK_IS_DATA(dataOrArrayOrString) === true) {

			for (name in dataOrArrayOrString) {
				if (dataOrArrayOrString.hasOwnProperty(name) === true) {
					if (func(dataOrArrayOrString[name], name) === false) {
						return false;
					}
				}
			}
		}

		// when dataOrArrayOrString is func
		else if (func === undefined) {

			func = dataOrArrayOrString;
			dataOrArrayOrString = undefined;

			return function(dataOrArrayOrString) {
				return EACH(dataOrArrayOrString, func);
			};
		}

		// when dataOrArrayOrString is array or arguments or string
		else {

			length = dataOrArrayOrString.length;

			for ( i = 0; i < length; i += 1) {

				if (func(dataOrArrayOrString[i], i) === false) {
					return false;
				}

				// when shrink
				if (dataOrArrayOrString.length < length) {
					i -= length - dataOrArrayOrString.length;
					length -= length - dataOrArrayOrString.length;
				}

				// when stretch
				else if (dataOrArrayOrString.length > length) {
					length += dataOrArrayOrString.length - length;
				}
			}
		}

		return true;
	}
});

/**
 * run `func` repeat `count` time, or same as `for`.
 */
global.REPEAT = METHOD({

	run : function(countOrParams, func) {
		'use strict';
		//OPTIONAL: countOrParams
		//REQUIRED: countOrParams.start
		//OPTIONAL: countOrParams.end
		//OPTIONAL: countOrParams.limit
		//OPTIONAL: countOrParams.step
		//REQUIRED: func

		var
		// count
		count,

		// start
		start,

		// end
		end,

		// limit
		limit,

		// step
		step,

		// extras
		i;
		
		if (func === undefined) {
			func = countOrParams;
			countOrParams = undefined;
		}

		if (countOrParams !== undefined) {
			if (CHECK_IS_DATA(countOrParams) !== true) {
				count = countOrParams;
			} else {
				start = countOrParams.start;
				end = countOrParams.end;
				limit = countOrParams.limit;
				step = countOrParams.step;
			}
		}

		if (limit === undefined && end !== undefined) {
			limit = end + 1;
		}

		if (step === undefined) {
			step = 1;
		}

		// count mode
		if (count !== undefined) {

			for ( i = 0; i < parseInt(count, 10); i += 1) {
				if (func(i) === false) {
					return false;
				}
			}
		}

		// end mode
		else if (end !== undefined && start > end) {

			for ( i = start; i >= end; i -= step) {
				if (func(i) === false) {
					return false;
				}
			}

		}

		// limit mode
		else if (limit !== undefined) {

			for ( i = start; i < limit; i += step) {
				if (func(i) === false) {
					return false;
				}
			}
		}
		
		// func mode
		else {
			
			return function(countOrParams) {
				return REPEAT(countOrParams, func);
			};
		}

		return true;
	}
});

/**
 * same as `foreach`, but reverse.
 */
global.REVERSE_EACH = METHOD({

	run : function(arrayOrString, func) {
		'use strict';
		//OPTIONAL: arrayOrString
		//REQUIRED: func

		var
		// length
		length,

		// name
		name,

		// extras
		i;

		// when arrayOrString is undefined
		if (arrayOrString === undefined) {
			return false;
		}

		// when arrayOrString is func
		else if (func === undefined) {

			func = arrayOrString;
			arrayOrString = undefined;

			return function(arrayOrString) {
				return REVERSE_EACH(arrayOrString, func);
			};
		}

		// when arrayOrString is array or arguments or string
		else {

			length = arrayOrString.length;

			for ( i = length - 1; i >= 0; i -= 1) {

				if (func(arrayOrString[i], i) === false) {
					return false;
				}
				
				// when shrink
				if (arrayOrString.length < length) {
					i += length - arrayOrString.length;
				}
			}
		}

		return true;
	}
});

/**
 * Node-side Configuration
 */
global.NODE_CONFIG = {};

/*
 * CPU clustering work.
 */
global.CPU_CLUSTERING = METHOD(function(m) {
	'use strict';

	var
	//IMPORT: cluster
	cluster = require('cluster'),

	// worker id
	workerId = 1,

	// get worker id.
	getWorkerId;

	m.getWorkerId = getWorkerId = function() {
		return workerId;
	};

	return {

		run : function(work) {
			//REQUIRED: work

			// when master
			if (cluster.isMaster) {

				RUN(function() {

					var
					// fork.
					fork = function() {

						var
						// new worker
						newWorker = cluster.fork();

						// receive data from new worker.
						newWorker.on('message', function(data) {

							// send data to all workers except new worker.
							EACH(cluster.workers, function(worker) {
								if (worker !== newWorker) {
									worker.send(data);
								}
							});
						});
					};

					// fork workers.
					REPEAT(require('os').cpus().length, function() {
						fork();
					});

					cluster.on('exit', function(worker, code, signal) {
						console.log(CONSOLE_RED('[UJS-CPU_CLUSTERING] WORKER #' + worker.id + ' died. (' + (signal !== undefined ? signal : code) + '). restarting...'));
						fork();
					});
				});
			}

			// when worker
			else {

				RUN(function() {

					var
					// method map
					methodMap = {},

					// run methods.
					runMethods = function(methodName, data) {

						var
						// methods
						methods = methodMap[methodName];

						if (methods !== undefined) {

							EACH(methods, function(method) {

								// run method.
								method(data);
							});
						}
					},

					// on.
					on,

					// off.
					off,

					// broadcast.
					broadcast;

					workerId = cluster.worker.id;

					// receive data.
					process.on('message', function(paramsStr) {

						var
						// params
						params = PARSE_STR(paramsStr);

						if (params !== undefined) {
							runMethods(params.methodName, params.data);
						}
					});

					m.on = on = function(methodName, method) {

						var
						// methods
						methods = methodMap[methodName];

						if (methods === undefined) {
							methods = methodMap[methodName] = [];
						}

						methods.push(method);
					};

					// save shared value.
					on('__SHARED_STORE_SAVE', SHARED_STORE.save);

					// remove shared value.
					on('__SHARED_STORE_REMOVE', SHARED_STORE.remove);

					// clear shared store.
					on('__SHARED_STORE_CLEAR', SHARED_STORE.clear);

					// save cpu shared value.
					on('__CPU_SHARED_STORE_SAVE', CPU_SHARED_STORE.save);

					// remove cpu shared value.
					on('__CPU_SHARED_STORE_REMOVE', CPU_SHARED_STORE.remove);

					// clear cpu shared store.
					on('__CPU_SHARED_STORE_CLEAR', CPU_SHARED_STORE.clear);

					// save shared data.
					on('__SHARED_DB_SAVE', SHARED_DB.save);
					
					// update shared data.
					on('__SHARED_DB_UPDATE', SHARED_DB.update);

					// remove shared data.
					on('__SHARED_DB_REMOVE', SHARED_DB.remove);

					// clear shared db.
					on('__SHARED_DB_CLEAR', SHARED_DB.clear);

					// save cpu shared data.
					on('__CPU_SHARED_DB_SAVE', CPU_SHARED_DB.save);
					
					// update cpu shared data.
					on('__CPU_SHARED_DB_UPDATE', CPU_SHARED_DB.update);

					// remove cpu shared data.
					on('__CPU_SHARED_DB_REMOVE', CPU_SHARED_DB.remove);

					// clear cpu shared db.
					on('__CPU_SHARED_DB_CLEAR', CPU_SHARED_DB.clear);

					m.off = off = function(methodName) {
						delete methodMap[methodName];
					};

					m.broadcast = broadcast = function(params) {
						//REQUIRED: params
						//REQUIRED: params.methodName
						//REQUIRED: params.data

						process.send(STRINGIFY(params));
					};

					work();

					console.log(CONSOLE_GREEN('[UJS-CPU_CLUSTERING] RUNNING WORKER... (ID:' + workerId + ')'));
				});
			}
		}
	};
});

/**
 * CPU clustering shared db class
 */
global.CPU_SHARED_DB = CLASS(function(cls) {
	'use strict';

	var
	// storages
	storages = {},

	// remove delay map
	removeDelayMap = {},

	// save.
	save,
	
	// update.
	update,

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

	cls.save = save = function(params, remove) {
		//REQUIRED: params
		//REQUIRED: params.dbName
		//REQUIRED: params.id
		//REQUIRED: params.data
		//OPTIONAL: params.removeAfterSeconds
		//OPTIONAL: remove

		var
		// db name
		dbName = params.dbName,
		
		// id
		id = params.id,

		// data
		data = params.data,

		// remove after seconds
		removeAfterSeconds = params.removeAfterSeconds,
		
		// storage
		storage = storages[dbName],
		
		// remove delays
		removeDelays = removeDelayMap[dbName];
		
		if (storage === undefined) {
			storage = storages[dbName] = {};
		}

		storage[id] = data;
		
		if (removeDelays === undefined) {
			removeDelays = removeDelayMap[dbName] = {};
		}

		if (removeDelays[id] !== undefined) {
			removeDelays[id].remove();
			delete removeDelays[id];
		}

		if (removeAfterSeconds !== undefined) {
			removeDelays[id] = DELAY(removeAfterSeconds, remove);
		}
	};
	
	cls.update = update = function(params, remove) {
		//REQUIRED: params
		//REQUIRED: params.dbName
		//REQUIRED: params.id
		//REQUIRED: params.data
		//OPTIONAL: params.data.$inc
		//OPTIONAL: params.data.$push
		//OPTIONAL: params.data.$addToSet
		//OPTIONAL: params.data.$pull
		//OPTIONAL: params.removeAfterSeconds
		//OPTIONAL: remove

		var
		// db name
		dbName = params.dbName,
		
		// id
		id = params.id,

		// data
		data = COPY(params.data),
		
		// $inc
		$inc = data.$inc,
		
		// $push
		$push = data.$push,
		
		// $addToSet
		$addToSet = data.$addToSet,
		
		// $pull
		$pull = data.$pull,

		// remove after seconds
		removeAfterSeconds = params.removeAfterSeconds,
		
		// storage
		storage = storages[dbName],
		
		// remove delays
		removeDelays = removeDelayMap[dbName],
		
		// saved data
		savedData;
		
		if (storage === undefined) {
			storage = storages[dbName] = {};
		}
		
		delete data.$inc;
		delete data.$push;
		delete data.$addToSet;
		delete data.$pull;
		
		savedData = storage[id];
		savedData = storage[id] = savedData === undefined ? data : COMBINE([savedData, data]);
		
		if ($inc !== undefined) {
			EACH($inc, function(value, name) {
				savedData[name] += value;
			});
		}
		
		if ($push !== undefined) {
			
			EACH($push, function(value, name) {
				
				if (CHECK_IS_ARRAY(savedData[name]) === true) {
					
					if (CHECK_IS_DATA(value) === true) {
						
						if (value.$each !== undefined) {
							
							EACH(value.$each, function(v, i) {
								if (value.$position !== undefined) {
									savedData[name].splice(value.$position + i, 0, v);
								} else {
									savedData[name].push(v);
								}
							});
							
						} else {
							savedData[name].push(value);
						}
						
					} else {
						savedData[name].push(value);
					}
				}
			});
		}
		
		if ($addToSet !== undefined) {
			
			EACH($addToSet, function(value, name) {
				
				if (CHECK_IS_ARRAY(savedData[name]) === true) {
					
					if (CHECK_IS_DATA(value) === true) {
						
						if (value.$each !== undefined) {
							
							EACH(value.$each, function(value) {
								if (CHECK_IS_IN({
									array : savedData[name],
									value : value
								}) !== true) {
									savedData[name].push(value);
								}
							});
							
						} else if (CHECK_IS_IN({
							array : savedData[name],
							value : value
						}) !== true) {
							savedData[name].push(value);
						}
						
					} else if (CHECK_IS_IN({
						array : savedData[name],
						value : value
					}) !== true) {
						savedData[name].push(value);
					}
				}
			});
		}
		
		if ($pull !== undefined) {
			
			EACH($pull, function(value, name) {
				
				if (CHECK_IS_ARRAY(savedData[name]) === true) {
					
					REMOVE({
						array : savedData[name],
						value : value
					});
				}
			});
		}
		
		if (removeDelays === undefined) {
			removeDelays = removeDelayMap[dbName] = {};
		}

		if (removeDelays[id] !== undefined) {
			removeDelays[id].remove();
			delete removeDelays[id];
		}

		if (removeAfterSeconds !== undefined) {
			removeDelays[id] = DELAY(removeAfterSeconds, remove);
		}
	};

	cls.get = get = function(params) {
		//REQUIRED: params
		//REQUIRED: params.dbName
		//REQUIRED: params.id
		
		var
		// db name
		dbName = params.dbName,
		
		// id
		id = params.id,
		
		// storage
		storage = storages[dbName];
		
		if (storage !== undefined) {
			return storage[id];
		}
	};

	cls.remove = remove = function(params) {
		//REQUIRED: params
		//REQUIRED: params.dbName
		//REQUIRED: params.id
		
		var
		// db name
		dbName = params.dbName,
		
		// id
		id = params.id,
		
		// storage
		storage = storages[dbName],
		
		// remove delays
		removeDelays = removeDelayMap[dbName];
		
		if (storage !== undefined) {
			delete storage[id];
		}

		if (removeDelays !== undefined && removeDelays[id] !== undefined) {
			removeDelays[id].remove();
			delete removeDelays[id];
		}
	};
	
	cls.list = list = function(dbName) {
		//REQUIRED: dbName
		
		var
		// storage
		storage = storages[dbName];
		
		return storage === undefined ? {} : storage;
	};
	
	cls.count = count = function(dbName) {
		//REQUIRED: dbName
		
		return COUNT_PROPERTIES(list(dbName));
	};
	
	cls.clear = clear = function(dbName) {
		//REQUIRED: dbName
		
		delete storages[dbName];
	};

	return {

		init : function(inner, self, dbName) {
			//REQUIRED: dbName

			var
			// save.
			save,
			
			// update.
			update,
			
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

			self.save = save = function(params) {
				//REQUIRED: params
				//REQUIRED: params.id
				//REQUIRED: params.data
				//OPTIONAL: params.removeAfterSeconds

				var
				// id
				id = params.id,

				// data
				data = params.data,

				// remove after seconds
				removeAfterSeconds = params.removeAfterSeconds;

				cls.save({
					dbName : dbName,
					id : id,
					data : data,
					removeAfterSeconds : removeAfterSeconds
				}, function() {
					remove(id);
				});

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__CPU_SHARED_DB_SAVE',
						data : {
							dbName : dbName,
							id : id,
							data : data
						}
					});
				}
			};
			
			self.update = update = function(params) {
				//REQUIRED: params
				//REQUIRED: params.id
				//REQUIRED: params.data
				//OPTIONAL: params.data.$inc
				//OPTIONAL: params.data.$push
				//OPTIONAL: params.data.$addToSet
				//OPTIONAL: params.data.$pull
				//OPTIONAL: params.removeAfterSeconds

				var
				// id
				id = params.id,

				// data
				data = params.data,

				// remove after seconds
				removeAfterSeconds = params.removeAfterSeconds;

				cls.update({
					dbName : dbName,
					id : id,
					data : data,
					removeAfterSeconds : removeAfterSeconds
				}, function() {
					remove(id);
				});

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__CPU_SHARED_DB_UPDATE',
						data : {
							dbName : dbName,
							id : id,
							data : data
						}
					});
				}
			};

			self.get = get = function(id) {
				//REQUIRED: id
				
				return cls.get({
					dbName : dbName,
					id : id
				});
			};

			self.remove = remove = function(id) {
				//REQUIRED: id

				cls.remove({
					dbName : dbName,
					id : id
				});

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__CPU_SHARED_DB_REMOVE',
						data : {
							dbName : dbName,
							id : id
						}
					});
				}
			};
			
			self.list = list = function() {
				return cls.list(dbName);
			};
			
			self.count = count = function() {
				return cls.count(dbName);
			};
			
			self.clear = clear = function() {
				
				cls.clear(dbName);

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__CPU_SHARED_DB_CLEAR',
						data : dbName
					});
				}
			};
		}
	};
});

FOR_BOX(function(box) {
	'use strict';

	box.CPU_SHARED_DB = CLASS({

		init : function(inner, self, name) {
			//REQUIRED: name

			var
			// shared db
			sharedDB = CPU_SHARED_DB(box.boxName + '.' + name),

			// save.
			save,
			
			// update.
			update,

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

			self.save = save = sharedDB.save;

			self.update = update = sharedDB.update;

			self.get = get = sharedDB.get;

			self.remove = remove = sharedDB.remove;
			
			self.list = list = sharedDB.list;

			self.count = count = sharedDB.count;

			self.clear = clear = sharedDB.clear;
		}
	});
});

/**
 * CPU clustering shared store class
 */
global.CPU_SHARED_STORE = CLASS(function(cls) {
	'use strict';

	var
	// storages
	storages = {},

	// remove delay map
	removeDelayMap = {},

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

	cls.save = save = function(params, remove) {
		//REQUIRED: params
		//REQUIRED: params.storeName
		//REQUIRED: params.name
		//REQUIRED: params.value
		//OPTIONAL: params.removeAfterSeconds
		//OPTIONAL: remove

		var
		// store name
		storeName = params.storeName,

		// name
		name = params.name,

		// value
		value = params.value,

		// remove after seconds
		removeAfterSeconds = params.removeAfterSeconds,
		
		// storage
		storage = storages[storeName],
		
		// remove delays
		removeDelays = removeDelayMap[storeName];
		
		if (storage === undefined) {
			storage = storages[storeName] = {};
		}

		storage[name] = value;

		if (removeDelays === undefined) {
			removeDelays = removeDelayMap[storeName] = {};
		}

		if (removeDelays[name] !== undefined) {
			removeDelays[name].remove();
			delete removeDelays[name];
		}

		if (removeAfterSeconds !== undefined) {
			removeDelays[name] = DELAY(removeAfterSeconds, remove);
		}
	};

	cls.get = get = function(params) {
		//REQUIRED: params
		//REQUIRED: params.storeName
		//REQUIRED: params.name
		
		var
		// store name
		storeName = params.storeName,
		
		// name
		name = params.name,
		
		// storage
		storage = storages[storeName];
		
		if (storage !== undefined) {
			return storage[name];
		}
	};

	cls.remove = remove = function(params) {
		//REQUIRED: params
		//REQUIRED: params.storeName
		//REQUIRED: params.name
		
		var
		// store name
		storeName = params.storeName,
		
		// name
		name = params.name,
		
		// storage
		storage = storages[storeName],
		
		// remove delays
		removeDelays = removeDelayMap[storeName];
		
		if (storage !== undefined) {
			delete storage[name];
		}

		if (removeDelays !== undefined && removeDelays[name] !== undefined) {
			removeDelays[name].remove();
			delete removeDelays[name];
		}
	};
	
	cls.list = list = function(storeName) {
		//REQUIRED: storeName
		
		var
		// storage
		storage = storages[storeName];
		
		return storage === undefined ? {} : storage;
	};
	
	cls.count = count = function(dbName) {
		//REQUIRED: dbName
		
		return COUNT_PROPERTIES(list(dbName));
	};
	
	cls.clear = clear = function(storeName) {
		//REQUIRED: storeName
		
		delete storages[storeName];
	};

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

			self.save = save = function(params) {
				//REQUIRED: params
				//REQUIRED: params.name
				//REQUIRED: params.value
				//OPTIONAL: params.removeAfterSeconds

				var
				// name
				name = params.name,

				// value
				value = params.value,

				// remove after seconds
				removeAfterSeconds = params.removeAfterSeconds;

				cls.save({
					storeName : storeName,
					name : name,
					value : value,
					removeAfterSeconds : removeAfterSeconds
				}, function() {
					remove(name);
				});

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__CPU_SHARED_STORE_SAVE',
						data : {
							storeName : storeName,
							name : name,
							value : value
						}
					});
				}
			};

			self.get = get = function(name) {
				//REQUIRED: name
				
				return cls.get({
					storeName : storeName,
					name : name
				});
			};

			self.remove = remove = function(name) {
				//REQUIRED: name

				cls.remove({
					storeName : storeName,
					name : name
				});

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__CPU_SHARED_STORE_REMOVE',
						data : {
							storeName : storeName,
							name : name
						}
					});
				}
			};
			
			self.list = list = function() {
				return cls.list(storeName);
			};
			
			self.count = count = function() {
				return cls.count(storeName);
			};

			self.clear = clear = function() {

				cls.clear(storeName);

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__CPU_SHARED_STORE_CLEAR',
						data : storeName
					});
				}
			};
		}
	};
});

FOR_BOX(function(box) {
	'use strict';

	box.CPU_SHARED_STORE = CLASS({

		init : function(inner, self, name) {
			//REQUIRED: name

			var
			// shared store
			sharedStore = CPU_SHARED_STORE(box.boxName + '.' + name),

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

			self.save = save = sharedStore.save;

			self.get = get = sharedStore.get;

			self.remove = remove = sharedStore.remove;
			
			self.list = list = sharedStore.list;
			
			self.count = count = sharedStore.count;
			
			self.clear = clear = sharedStore.clear;
		}
	});
});

/*
 * server clustering work.
 */
global.SERVER_CLUSTERING = METHOD(function(m) {
	'use strict';

	return {

		run : function(params, work) {
			//REQUIRED: params
			//REQUIRED: params.hosts
			//REQUIRED: params.thisServerName
			//REQUIRED: params.port
			//OPTIONAL: work

			var
			// hosts
			hosts = params.hosts,

			// this server name
			thisServerName = params.thisServerName,

			// port
			port = params.port,

			// method map
			methodMap = {},

			// is connectings
			isConnectings = {},

			// server sends
			serverSends = {},

			// connect to clustering server.
			connectToClusteringServer,

			// socket server ons
			socketServeOns = [],

			// on.
			on,

			// off.
			off,

			// broadcast.
			broadcast;

			connectToClusteringServer = function(serverName) {

				if (isConnectings[serverName] !== true) {
					isConnectings[serverName] = true;

					CONNECT_TO_SOCKET_SERVER({
						host : hosts[serverName],
						port : port
					}, {
						error : function() {
							delete isConnectings[serverName];
						},

						success : function(on, off, send) {

							send({
								methodName : '__BOOTED',
								data : thisServerName
							});

							serverSends[serverName] = function(params) {
								//REQUIRED: params
								//REQUIRED: params.methodName
								//REQUIRED: params.data

								var
								// method name
								methodName = params.methodName,

								// data
								data = params.data;

								send({
									methodName : 'SERVER_CLUSTERING.' + methodName,
									data : data
								});
							};

							on('__DISCONNECTED', function() {
								delete serverSends[serverName];
								delete isConnectings[serverName];
							});

							console.log('[UJS-SERVER_CLUSTERING] CONNECTED CLUSTERING SERVER. (SERVER NAME:' + serverName + ')');

							if (CPU_CLUSTERING.broadcast !== undefined) {

								CPU_CLUSTERING.broadcast({
									methodName : '__SERVER_CLUSTERING__CONNECT_TO_CLUSTERING_SERVER',
									data : serverName
								});
							}
						}
					});
				}
			};

			if (CPU_CLUSTERING.on !== undefined) {
				CPU_CLUSTERING.on('__SERVER_CLUSTERING__CONNECT_TO_CLUSTERING_SERVER', connectToClusteringServer);
			}

			// try connect to all clustering hosts.
			EACH(hosts, function(host, serverName) {
				if (serverName !== thisServerName) {
					connectToClusteringServer(serverName);
				}
			});

			SOCKET_SERVER(port, function(clientInfo, socketServeOn) {

				socketServeOns.push(socketServeOn);

				socketServeOn('__BOOTED', function(serverName) {
					connectToClusteringServer(serverName);
				});

				EACH(methodMap, function(methods, methodName) {
					EACH(methods, function(method) {
						socketServeOn('SERVER_CLUSTERING.' + methodName, method);
					});
				});

				socketServeOn('__DISCONNECTED', function() {
					REMOVE({
						array : socketServeOns,
						value : socketServeOn
					});
				});
			});

			m.on = on = function(methodName, method) {

				var
				// methods
				methods = methodMap[methodName];

				if (methods === undefined) {
					methods = methodMap[methodName] = [];
				}

				methods.push(method);

				EACH(socketServeOns, function(socketServeOn) {
					socketServeOn('SERVER_CLUSTERING.' + methodName, method);
				});
			};

			// save shared value.
			on('__SHARED_STORE_SAVE', function(params) {

				SHARED_STORE.save(params);

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__SHARED_STORE_SAVE',
						data : params
					});
				}
			});

			// remove shared value.
			on('__SHARED_STORE_REMOVE', function(params) {

				SHARED_STORE.remove(params);

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__SHARED_STORE_REMOVE',
						data : params
					});
				}
			});

			// clear shared store.
			on('__SHARED_STORE_CLEAR', function(storeName) {

				SHARED_STORE.clear(storeName);

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__SHARED_STORE_CLEAR',
						data : storeName
					});
				}
			});

			// save shared data.
			on('__SHARED_DB_SAVE', function(params) {

				SHARED_DB.save(params);

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__SHARED_DB_SAVE',
						data : params
					});
				}
			});
			
			// update shared data.
			on('__SHARED_DB_UPDATE', function(params) {

				SHARED_DB.update(params);

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__SHARED_DB_UPDATE',
						data : params
					});
				}
			});

			// remove shared data.
			on('__SHARED_DB_REMOVE', function(params) {

				SHARED_DB.remove(params);

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__SHARED_DB_REMOVE',
						data : params
					});
				}
			});

			// clear shared db.
			on('__SHARED_DB_CLEAR', function(dbName) {

				SHARED_DB.clear(dbName);

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__SHARED_DB_CLEAR',
						data : dbName
					});
				}
			});

			m.off = off = function(methodName) {
				delete methodMap[methodName];
			};

			m.broadcast = broadcast = function(params) {
				//REQUIRED: params
				//REQUIRED: params.methodName
				//REQUIRED: params.data

				EACH(serverSends, function(serverSend) {
					serverSend(params);
				});
			};

			if (work !== undefined) {
				work();
			}

			console.log(CONSOLE_BLUE('[UJS-SERVER_CLUSTERING] RUNNING CLUSTERING SERVER... (THIS SERVER NAME:' + thisServerName + ', PORT:' + port + ')'));
		}
	};
});

/**
 * CPU and server clustering shared db class
 */
global.SHARED_DB = CLASS(function(cls) {
	'use strict';

	var
	// storages
	storages = {},

	// remove delay map
	removeDelayMap = {},

	// save.
	save,
	
	// update.
	update,

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

	cls.save = save = function(params, remove) {
		//REQUIRED: params
		//REQUIRED: params.dbName
		//REQUIRED: params.id
		//REQUIRED: params.data
		//OPTIONAL: params.removeAfterSeconds
		//OPTIONAL: remove

		var
		// db name
		dbName = params.dbName,
		
		// id
		id = params.id,

		// data
		data = params.data,

		// remove after seconds
		removeAfterSeconds = params.removeAfterSeconds,
		
		// storage
		storage = storages[dbName],
		
		// remove delays
		removeDelays = removeDelayMap[dbName];
		
		if (storage === undefined) {
			storage = storages[dbName] = {};
		}

		storage[id] = data;
		
		if (removeDelays === undefined) {
			removeDelays = removeDelayMap[dbName] = {};
		}

		if (removeDelays[id] !== undefined) {
			removeDelays[id].remove();
			delete removeDelays[id];
		}

		if (removeAfterSeconds !== undefined) {
			removeDelays[id] = DELAY(removeAfterSeconds, remove);
		}
	};
	
	cls.update = update = function(params, remove) {
		//REQUIRED: params
		//REQUIRED: params.dbName
		//REQUIRED: params.id
		//REQUIRED: params.data
		//OPTIONAL: params.data.$inc
		//OPTIONAL: params.data.$push
		//OPTIONAL: params.data.$addToSet
		//OPTIONAL: params.data.$pull
		//OPTIONAL: params.removeAfterSeconds
		//OPTIONAL: remove

		var
		// db name
		dbName = params.dbName,
		
		// id
		id = params.id,

		// data
		data = COPY(params.data),
		
		// $inc
		$inc = data.$inc,
		
		// $push
		$push = data.$push,
		
		// $addToSet
		$addToSet = data.$addToSet,
		
		// $pull
		$pull = data.$pull,

		// remove after seconds
		removeAfterSeconds = params.removeAfterSeconds,
		
		// storage
		storage = storages[dbName],
		
		// remove delays
		removeDelays = removeDelayMap[dbName],
		
		// saved data
		savedData;
		
		if (storage === undefined) {
			storage = storages[dbName] = {};
		}
		
		delete data.$inc;
		delete data.$push;
		delete data.$addToSet;
		delete data.$pull;
		
		savedData = storage[id];
		savedData = storage[id] = savedData === undefined ? data : COMBINE([savedData, data]);
		
		if ($inc !== undefined) {
			EACH($inc, function(value, name) {
				savedData[name] += value;
			});
		}
		
		if ($push !== undefined) {
			
			EACH($push, function(value, name) {
				
				if (CHECK_IS_ARRAY(savedData[name]) === true) {
					
					if (CHECK_IS_DATA(value) === true) {
						
						if (value.$each !== undefined) {
							
							EACH(value.$each, function(v, i) {
								if (value.$position !== undefined) {
									savedData[name].splice(value.$position + i, 0, v);
								} else {
									savedData[name].push(v);
								}
							});
							
						} else {
							savedData[name].push(value);
						}
						
					} else {
						savedData[name].push(value);
					}
				}
			});
		}
		
		if ($addToSet !== undefined) {
			
			EACH($addToSet, function(value, name) {
				
				if (CHECK_IS_ARRAY(savedData[name]) === true) {
					
					if (CHECK_IS_DATA(value) === true) {
						
						if (value.$each !== undefined) {
							
							EACH(value.$each, function(value) {
								if (CHECK_IS_IN({
									array : savedData[name],
									value : value
								}) !== true) {
									savedData[name].push(value);
								}
							});
							
						} else if (CHECK_IS_IN({
							array : savedData[name],
							value : value
						}) !== true) {
							savedData[name].push(value);
						}
						
					} else if (CHECK_IS_IN({
						array : savedData[name],
						value : value
					}) !== true) {
						savedData[name].push(value);
					}
				}
			});
		}
		
		if ($pull !== undefined) {
			
			EACH($pull, function(value, name) {
				
				if (CHECK_IS_ARRAY(savedData[name]) === true) {
					
					REMOVE({
						array : savedData[name],
						value : value
					});
				}
			});
		}
		
		if (removeDelays === undefined) {
			removeDelays = removeDelayMap[dbName] = {};
		}

		if (removeDelays[id] !== undefined) {
			removeDelays[id].remove();
			delete removeDelays[id];
		}

		if (removeAfterSeconds !== undefined) {
			removeDelays[id] = DELAY(removeAfterSeconds, remove);
		}
	};

	cls.get = get = function(params) {
		//REQUIRED: params
		//REQUIRED: params.dbName
		//REQUIRED: params.id
		
		var
		// db name
		dbName = params.dbName,
		
		// id
		id = params.id,
		
		// storage
		storage = storages[dbName];
		
		if (storage !== undefined) {
			return storage[id];
		}
	};

	cls.remove = remove = function(params) {
		//REQUIRED: params
		//REQUIRED: params.dbName
		//REQUIRED: params.id
		
		var
		// db name
		dbName = params.dbName,
		
		// id
		id = params.id,
		
		// storage
		storage = storages[dbName],
		
		// remove delays
		removeDelays = removeDelayMap[dbName];
		
		if (storage !== undefined) {
			delete storage[id];
		}

		if (removeDelays !== undefined && removeDelays[id] !== undefined) {
			removeDelays[id].remove();
			delete removeDelays[id];
		}
	};
	
	cls.list = list = function(dbName) {
		//REQUIRED: dbName
		
		var
		// storage
		storage = storages[dbName];
		
		return storage === undefined ? {} : storage;
	};
	
	cls.count = count = function(dbName) {
		//REQUIRED: dbName
		
		return COUNT_PROPERTIES(list(dbName));
	};
	
	cls.clear = clear = function(dbName) {
		//REQUIRED: dbName
		
		delete storages[dbName];
	};

	return {

		init : function(inner, self, dbName) {
			//REQUIRED: dbName

			var
			// save.
			save,
			
			// update.
			update,

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

			self.save = save = function(params) {
				//REQUIRED: params
				//REQUIRED: params.id
				//REQUIRED: params.data
				//OPTIONAL: params.removeAfterSeconds

				var
				// id
				id = params.id,

				// data
				data = params.data,

				// remove after seconds
				removeAfterSeconds = params.removeAfterSeconds;

				cls.save({
					dbName : dbName,
					id : id,
					data : data,
					removeAfterSeconds : removeAfterSeconds
				}, function() {
					remove(id);
				});

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__SHARED_DB_SAVE',
						data : {
							dbName : dbName,
							id : id,
							data : data
						}
					});
				}

				if (SERVER_CLUSTERING.broadcast !== undefined) {

					SERVER_CLUSTERING.broadcast({
						methodName : '__SHARED_DB_SAVE',
						data : {
							dbName : dbName,
							id : id,
							data : data
						}
					});
				}
			};
			
			self.update = update = function(params) {
				//REQUIRED: params
				//REQUIRED: params.id
				//REQUIRED: params.data
				//OPTIONAL: params.data.$inc
				//OPTIONAL: params.data.$push
				//OPTIONAL: params.data.$addToSet
				//OPTIONAL: params.data.$pull
				//OPTIONAL: params.removeAfterSeconds

				var
				// id
				id = params.id,

				// data
				data = params.data,

				// remove after seconds
				removeAfterSeconds = params.removeAfterSeconds;

				cls.update({
					dbName : dbName,
					id : id,
					data : data,
					removeAfterSeconds : removeAfterSeconds
				}, function() {
					remove(id);
				});

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__SHARED_DB_UPDATE',
						data : {
							dbName : dbName,
							id : id,
							data : data
						}
					});
				}

				if (SERVER_CLUSTERING.broadcast !== undefined) {

					SERVER_CLUSTERING.broadcast({
						methodName : '__SHARED_DB_UPDATE',
						data : {
							dbName : dbName,
							id : id,
							data : data
						}
					});
				}
			};

			self.get = get = function(id) {
				//REQUIRED: id
				
				return cls.get({
					dbName : dbName,
					id : id
				});
			};

			self.remove = remove = function(id) {
				//REQUIRED: id

				cls.remove({
					dbName : dbName,
					id : id
				});

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__SHARED_DB_REMOVE',
						data : {
							dbName : dbName,
							id : id
						}
					});
				}

				if (SERVER_CLUSTERING.broadcast !== undefined) {

					SERVER_CLUSTERING.broadcast({
						methodName : '__SHARED_DB_REMOVE',
						data : {
							dbName : dbName,
							id : id
						}
					});
				}
			};
			
			self.list = list = function() {
				return cls.list(dbName);
			};
			
			self.count = count = function() {
				return cls.count(dbName);
			};
			
			self.clear = clear = function() {
				
				cls.clear(dbName);

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__SHARED_DB_CLEAR',
						data : dbName
					});
				}

				if (SERVER_CLUSTERING.broadcast !== undefined) {

					SERVER_CLUSTERING.broadcast({
						methodName : '__SHARED_DB_CLEAR',
						data : dbName
					});
				}
			};
		}
	};
});

FOR_BOX(function(box) {
	'use strict';

	box.SHARED_DB = CLASS({

		init : function(inner, self, name) {
			//REQUIRED: name

			var
			// shared db
			sharedDB = SHARED_DB(box.boxName + '.' + name),

			// save.
			save,
			
			// update.
			update,

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

			self.save = save = sharedDB.save;

			self.update = update = sharedDB.update;

			self.get = get = sharedDB.get;

			self.remove = remove = sharedDB.remove;
			
			self.list = list = sharedDB.list;

			self.count = count = sharedDB.count;

			self.clear = clear = sharedDB.clear;
		}
	});
});

/**
 * CPU and server clustering shared store class
 */
global.SHARED_STORE = CLASS(function(cls) {
	'use strict';

	var
	// storages
	storages = {},

	// remove delay map
	removeDelayMap = {},

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

	cls.save = save = function(params, remove) {
		//REQUIRED: params
		//REQUIRED: params.storeName
		//REQUIRED: params.name
		//REQUIRED: params.value
		//OPTIONAL: params.removeAfterSeconds
		//OPTIONAL: remove

		var
		// store name
		storeName = params.storeName,

		// name
		name = params.name,

		// value
		value = params.value,

		// remove after seconds
		removeAfterSeconds = params.removeAfterSeconds,
		
		// storage
		storage = storages[storeName],
		
		// remove delays
		removeDelays = removeDelayMap[storeName];
		
		if (storage === undefined) {
			storage = storages[storeName] = {};
		}

		storage[name] = value;

		if (removeDelays === undefined) {
			removeDelays = removeDelayMap[storeName] = {};
		}

		if (removeDelays[name] !== undefined) {
			removeDelays[name].remove();
			delete removeDelays[name];
		}

		if (removeAfterSeconds !== undefined) {
			removeDelays[name] = DELAY(removeAfterSeconds, remove);
		}
	};

	cls.get = get = function(params) {
		//REQUIRED: params
		//REQUIRED: params.storeName
		//REQUIRED: params.name
		
		var
		// store name
		storeName = params.storeName,
		
		// name
		name = params.name,
		
		// storage
		storage = storages[storeName];
		
		if (storage !== undefined) {
			return storage[name];
		}
	};

	cls.remove = remove = function(params) {
		//REQUIRED: params
		//REQUIRED: params.storeName
		//REQUIRED: params.name
		
		var
		// store name
		storeName = params.storeName,
		
		// name
		name = params.name,
		
		// storage
		storage = storages[storeName],
		
		// remove delays
		removeDelays = removeDelayMap[storeName];
		
		if (storage !== undefined) {
			delete storage[name];
		}

		if (removeDelays !== undefined && removeDelays[name] !== undefined) {
			removeDelays[name].remove();
			delete removeDelays[name];
		}
	};
	
	cls.list = list = function(storeName) {
		//REQUIRED: storeName
		
		var
		// storage
		storage = storages[storeName];
		
		return storage === undefined ? {} : storage;
	};
	
	cls.count = count = function(dbName) {
		//REQUIRED: dbName
		
		return COUNT_PROPERTIES(list(dbName));
	};
	
	cls.clear = clear = function(storeName) {
		//REQUIRED: storeName
		
		delete storages[storeName];
	};

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

			self.save = save = function(params) {
				//REQUIRED: params
				//REQUIRED: params.name
				//REQUIRED: params.value
				//OPTIONAL: params.removeAfterSeconds

				var
				// name
				name = params.name,

				// value
				value = params.value,

				// remove after seconds
				removeAfterSeconds = params.removeAfterSeconds;

				cls.save({
					storeName : storeName,
					name : name,
					value : value,
					removeAfterSeconds : removeAfterSeconds
				}, function() {
					remove(name);
				});

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__SHARED_STORE_SAVE',
						data : {
							storeName : storeName,
							name : name,
							value : value
						}
					});
				}

				if (SERVER_CLUSTERING.broadcast !== undefined) {

					SERVER_CLUSTERING.broadcast({
						methodName : '__SHARED_STORE_SAVE',
						data : {
							storeName : storeName,
							name : name,
							value : value
						}
					});
				}
			};
			
			self.get = get = function(name) {
				//REQUIRED: name
				
				return cls.get({
					storeName : storeName,
					name : name
				});
			};

			self.remove = remove = function(name) {
				//REQUIRED: name
				
				cls.remove({
					storeName : storeName,
					name : name
				});

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__SHARED_STORE_REMOVE',
						data : {
							storeName : storeName,
							name : name
						}
					});
				}

				if (SERVER_CLUSTERING.broadcast !== undefined) {

					SERVER_CLUSTERING.broadcast({
						methodName : '__SHARED_STORE_REMOVE',
						data : {
							storeName : storeName,
							name : name
						}
					});
				}
			};
			
			self.list = list = function() {
				return cls.list(storeName);
			};
			
			self.count = count = function() {
				return cls.count(storeName);
			};

			self.clear = clear = function() {
				
				cls.clear(storeName);

				if (CPU_CLUSTERING.broadcast !== undefined) {

					CPU_CLUSTERING.broadcast({
						methodName : '__SHARED_STORE_CLEAR',
						data : storeName
					});
				}

				if (SERVER_CLUSTERING.broadcast !== undefined) {

					SERVER_CLUSTERING.broadcast({
						methodName : '__SHARED_STORE_CLEAR',
						data : storeName
					});
				}
			};
		}
	};
});

FOR_BOX(function(box) {
	'use strict';

	box.SHARED_STORE = CLASS({

		init : function(inner, self, name) {
			//REQUIRED: name

			var
			// shared store
			sharedStore = SHARED_STORE(box.boxName + '.' + name),

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

			self.save = save = sharedStore.save;

			self.get = get = sharedStore.get;

			self.remove = remove = sharedStore.remove;
			
			self.list = list = sharedStore.list;
			
			self.count = count = sharedStore.count;
			
			self.clear = clear = sharedStore.clear;
		}
	});
});

/*
 * connect to socket server.
 */
global.CONNECT_TO_SOCKET_SERVER = METHOD({

	run : function(params, connectionListenerOrListeners) {
		'use strict';
		//REQUIRED: params
		//REQUIRED: params.host
		//REQUIRED: params.port
		//REQUIRED: connectionListenerOrListeners
		//REQUIRED: connectionListenerOrListeners.success
		//OPTIONAL: connectionListenerOrListeners.error

		var
		// host
		host = params.host,

		// port
		port = params.port,

		// connection listener
		connectionListener,

		// error listener
		errorListener,

		// net
		net = require('net'),

		// connection
		conn,

		// is connected
		isConnected,

		// method map
		methodMap = {},

		// send key
		sendKey = 0,

		// received string
		receivedStr = '',

		// on.
		on,

		// off.
		off,

		// send.
		send,

		// run methods.
		runMethods;

		if (CHECK_IS_DATA(connectionListenerOrListeners) !== true) {
			connectionListener = connectionListenerOrListeners;
		} else {
			connectionListener = connectionListenerOrListeners.success;
			errorListener = connectionListenerOrListeners.error;
		}

		runMethods = function(methodName, data, sendKey) {

			var
			// methods
			methods = methodMap[methodName];

			if (methods !== undefined) {

				EACH(methods, function(method) {

					// run method.
					method(data,

					// ret.
					function(retData) {

						if (send !== undefined && sendKey !== undefined) {

							send({
								methodName : '__CALLBACK_' + sendKey,
								data : retData
							});
						}
					});
				});
			}
		};

		conn = net.connect({
			host : host,
			port : port
		}, function() {

			isConnected = true;

			connectionListener(

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

			// send to server.
			send = function(params, callback) {
				//REQUIRED: params
				//REQUIRED: params.methodName
				//OPTIONAL: params.data
				//OPTIONAL: callback
				
				var
				// callback name
				callbackName;

				conn.write(STRINGIFY({
					methodName : params.methodName,
					data : params.data,
					sendKey : sendKey
				}) + '\r\n');

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
				conn.end();
			});
		});

		// when receive data
		conn.on('data', function(content) {

			var
			// str
			str,

			// index
			index,

			// params
			params;

			receivedStr += content.toString();

			while (( index = receivedStr.indexOf('\r\n')) !== -1) {

				str = receivedStr.substring(0, index);

				params = PARSE_STR(str);

				if (params !== undefined) {
					runMethods(params.methodName, params.data, params.sendKey);
				}

				receivedStr = receivedStr.substring(index + 1);
			}
		});

		// when disconnected
		conn.on('close', function() {
			runMethods('__DISCONNECTED');
		});

		// when error
		conn.on('error', function(error) {

			var
			// error msg
			errorMsg = error.toString();

			if (isConnected !== true) {

				if (errorListener !== undefined) {
					errorListener(errorMsg);
				} else {
					console.log(CONSOLE_RED('[UJS-CONNECT_TO_SOCKET_SERVER] CONNECT TO SOCKET SERVER FAILED: ' + errorMsg));
				}

			} else {
				runMethods('__ERROR', errorMsg);
			}
		});
	}
});

/*
 * console blue
 */
global.CONSOLE_BLUE = METHOD({

	run : function(text) {
		'use strict';
		//REQUIRED: text

		return '[36m' + text + '[0m';
	}
});

/*
 * console green
 */
global.CONSOLE_GREEN = METHOD({

	run : function(text) {
		'use strict';
		//REQUIRED: text

		return '[32m' + text + '[0m';
	}
});

/*
 * console red
 */
global.CONSOLE_RED = METHOD({

	run : function(text) {
		'use strict';
		//REQUIRED: text

		return '[31m' + text + '[0m';
	}
});

/*
 * console yellow
 */
global.CONSOLE_YELLOW = METHOD({

	run : function(text) {
		'use strict';
		//REQUIRED: text

		return '[33m' + text + '[0m';
	}
});

/**
 * HMAC SHA1 encrypt.
 */
global.SHA1 = METHOD({

	run : function(params) {
		'use strict';
		//REQUIRED: params
		//REQUIRED: params.password
		//REQUIRED: params.key

		var
		// password
		password = params.password,

		// key
		key = params.key,

		// crypto
		crypto = require('crypto');

		return crypto.createHmac('sha1', key).update(password).digest('hex');
	}
});

/**
 * HMAC SHA256 encrypt.
 */
global.SHA256 = METHOD({

	run : function(params) {
		'use strict';
		//REQUIRED: params
		//REQUIRED: params.password
		//REQUIRED: params.key

		var
		// password
		password = params.password,

		// key
		key = params.key,

		// crypto
		crypto = require('crypto');

		return crypto.createHmac('sha256', key).update(password).digest('hex');
	}
});

/**
 * HMAC SHA512 encrypt.
 */
global.SHA512 = METHOD({

	run : function(params) {
		'use strict';
		//REQUIRED: params
		//REQUIRED: params.password
		//REQUIRED: params.key

		var
		// password
		password = params.password,

		// key
		key = params.key,

		// crypto
		crypto = require('crypto');

		return crypto.createHmac('sha512', key).update(password).digest('hex');
	}
});

/*
 * check is exists file.
 */
global.CHECK_IS_EXISTS_FILE = METHOD(function() {
	'use strict';

	var
	//IMPORT: fs
	fs = require('fs');

	return {

		run : function(pathOrParams, callback) {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path
			//OPTIONAL: pathOrParams.isSync
			//OPTIONAL: callback

			var
			// path
			path,

			// is sync
			isSync;

			// init params.
			if (CHECK_IS_DATA(pathOrParams) !== true) {
				path = pathOrParams;
			} else {
				path = pathOrParams.path;
				isSync = pathOrParams.isSync;
			}

			// when normal mode
			if (isSync !== true) {
				fs.exists(path, callback);
			}

			// when sync mode
			else {
				return fs.existsSync(path);
			}
		}
	};
});

/*
 * check is folder.
 */
global.CHECK_IS_FOLDER = METHOD(function() {
	'use strict';

	var
	//IMPORT: fs
	fs = require('fs');

	return {

		run : function(pathOrParams, callbackOrHandlers) {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path
			//OPTIONAL: pathOrParams.isSync
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.success
			//OPTIONAL: callbackOrHandlers.error

			var
			// path
			path,

			// is sync
			isSync,
			
			// callback.
			callback,

			// error handler.
			errorHandler;

			// init params.
			if (CHECK_IS_DATA(pathOrParams) !== true) {
				path = pathOrParams;
			} else {
				path = pathOrParams.path;
				isSync = pathOrParams.isSync;
			}
			
			if (callbackOrHandlers !== undefined) {
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					callback = callbackOrHandlers.success;
					errorHandler = callbackOrHandlers.error;
				}
			}

			// when normal mode
			if (isSync !== true) {
				
				fs.stat(path, function(error, stat) {
					
					var
					// error msg
					errorMsg;

					if (error !== TO_DELETE) {

						errorMsg = error.toString();

						if (errorHandler !== undefined) {
							errorHandler(errorMsg);
						} else {
							console.log(CONSOLE_RED('[UJS-CHECK_IS_FOLDER] ERROR: ' + errorMsg));
						}

					} else if (callback !== undefined) {
						callback(stat.isDirectory());
					}
				});
			}

			// when sync mode
			else {
				return fs.statSync(path).isDirectory();
			}
		}
	};
});

/*
 * copy file.
 */
global.COPY_FILE = METHOD(function() {
	'use strict';

	var
	//IMPORT: fs
	fs = require('fs'),

	//IMPORT: path
	_path = require('path');

	return {

		run : function(params, callbackOrHandlers) {
			//REQUIRED: params
			//REQUIRED: params.from
			//REQUIRED: params.to
			//OPTIONAL: params.isSync
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.success
			//OPTIONAL: callbackOrHandlers.notExistsHandler
			//OPTIONAL: callbackOrHandlers.error

			var
			// from
			from = params.from,

			// to
			to = params.to,

			// is sync
			isSync = params.isSync,

			// callback.
			callback,

			// not exists handler.
			notExistsHandler,

			// error handler.
			errorHandler;

			if (callbackOrHandlers !== undefined) {
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					callback = callbackOrHandlers.success;
					notExistsHandler = callbackOrHandlers.notExists;
					errorHandler = callbackOrHandlers.error;
				}
			}

			CREATE_FOLDER({
				path : _path.dirname(to),
				isSync : isSync
			}, {

				error : errorHandler,

				success : function() {

					// when normal mode
					if (isSync !== true) {

						CHECK_IS_EXISTS_FILE(from, function(isExists) {

							var
							// reader
							reader;

							if (isExists === true) {

								reader = fs.createReadStream(from);

								reader.pipe(fs.createWriteStream(to));

								reader.on('error', function(error) {

									var
									// error msg
									errorMsg = error.toString();

									if (errorHandler !== undefined) {
										errorHandler(errorMsg);
									} else {
										console.log(CONSOLE_RED('[UJS-COPY_FILE] ERROR:' + errorMsg));
									}
								});

								reader.on('end', function() {
									if (callback !== undefined) {
										callback();
									}
								});

							} else {

								if (notExistsHandler !== undefined) {
									notExistsHandler(from);
								} else {
									console.log(CONSOLE_YELLOW('[UJS-COPY_FILE] NOT EXISTS! <' + from + '>'));
								}
							}
						});
					}

					// when sync mode
					else {

						RUN(function() {

							var
							// error msg
							errorMsg;

							try {

								if (CHECK_IS_EXISTS_FILE({
									path : from,
									isSync : true
								}) === true) {

									fs.writeFileSync(to, fs.readFileSync(from));

								} else {

									if (notExistsHandler !== undefined) {
										notExistsHandler(from);
									} else {
										console.log(CONSOLE_YELLOW('[UJS-COPY_FILE] NOT EXISTS! <' + from + '>'));
									}

									// do not run callback.
									return;
								}

							} catch(error) {

								if (error !== TO_DELETE) {

									errorMsg = error.toString();

									if (errorHandler !== undefined) {
										errorHandler(errorMsg);
									} else {
										console.log(CONSOLE_RED('[UJS-COPY_FILE] ERROR: ' + errorMsg));
									}
								}
							}

							if (callback !== undefined) {
								callback();
							}
						});
					}
				}
			});
		}
	};
});

/*
 * create folder.
 */
global.CREATE_FOLDER = METHOD(function() {
	'use strict';

	var
	//IMPORT: fs
	fs = require('fs'),

	//IMPORT: path
	_path = require('path');

	return {

		run : function(pathOrParams, callbackOrHandlers) {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path
			//OPTIONAL: pathOrParams.isSync
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.success
			//OPTIONAL: callbackOrHandlers.error

			var
			// path
			path,

			// is sync
			isSync,

			// folder path
			folderPath,

			// callback.
			callback,

			// error handler.
			errorHandler;

			// init params.
			if (CHECK_IS_DATA(pathOrParams) !== true) {
				path = pathOrParams;
			} else {
				path = pathOrParams.path;
				isSync = pathOrParams.isSync;
			}

			if (callbackOrHandlers !== undefined) {
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					callback = callbackOrHandlers.success;
					errorHandler = callbackOrHandlers.error;
				}
			}

			// when normal mode
			if (isSync !== true) {

				CHECK_IS_EXISTS_FILE(path, function(isExists) {

					if (isExists === true) {

						if (callback !== undefined) {
							callback();
						}

					} else {

						folderPath = _path.dirname(path);

						CHECK_IS_EXISTS_FILE(folderPath, function(isExists) {

							if (isExists === true) {

								fs.mkdir(path, function(error) {

									var
									// error msg
									errorMsg;

									if (error !== TO_DELETE) {

										errorMsg = error.toString();

										if (errorHandler !== undefined) {
											errorHandler(errorMsg);
										} else {
											console.log(CONSOLE_RED('[UJS-CREATE_FOLDER] ERROR: ' + errorMsg));
										}

									} else {
										callback();
									}
								});

							} else {

								CREATE_FOLDER(folderPath, function() {

									// retry.
									CREATE_FOLDER(path, callback);
								});
							}
						});
					}
				});
			}

			// when sync mode
			else {

				RUN(function() {

					var
					// error msg
					errorMsg;

					try {

						if (CHECK_IS_EXISTS_FILE({
							path : path,
							isSync : true
						}) !== true) {

							folderPath = _path.dirname(path);

							if (CHECK_IS_EXISTS_FILE({
								path : folderPath,
								isSync : true
							}) === true) {
								fs.mkdirSync(path);
							} else {

								CREATE_FOLDER({
									path : folderPath,
									isSync : true
								});

								// retry.
								CREATE_FOLDER({
									path : path,
									isSync : true
								});
							}
						}

					} catch(error) {

						if (error !== TO_DELETE) {

							errorMsg = error.toString();

							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								console.log(CONSOLE_RED('[UJS-CREATE_FOLDER] ERROR: ' + errorMsg));
							}
						}
					}

					if (callback !== undefined) {
						callback();
					}
				});
			}
		}
	};
});

/*
 * find file names.
 */
global.FIND_FILE_NAMES = METHOD(function() {
	'use strict';

	var
	//IMPORT: fs
	fs = require('fs'),

	//IMPORT: path
	_path = require('path');

	return {

		run : function(pathOrParams, callbackOrHandlers) {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path
			//OPTIONAL: pathOrParams.isSync
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.success
			//OPTIONAL: callbackOrHandlers.notExistsHandler
			//OPTIONAL: callbackOrHandlers.error

			var
			// path
			path,

			// is sync
			isSync,

			// callback.
			callback,

			// not exists handler.
			notExistsHandler,

			// error handler.
			errorHandler,

			// file names
			fileNames = [];

			// init params.
			if (CHECK_IS_DATA(pathOrParams) !== true) {
				path = pathOrParams;
			} else {
				path = pathOrParams.path;
				isSync = pathOrParams.isSync;
			}

			if (callbackOrHandlers !== undefined) {
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					callback = callbackOrHandlers.success;
					notExistsHandler = callbackOrHandlers.notExists;
					errorHandler = callbackOrHandlers.error;
				}
			}

			// when normal mode
			if (isSync !== true) {

				CHECK_IS_EXISTS_FILE(path, function(isExists) {

					if (isExists === true) {

						fs.readdir(path, function(error, names) {

							var
							// error msg
							errorMsg;

							if (error !== TO_DELETE) {

								errorMsg = error.toString();

								if (errorHandler !== undefined) {
									errorHandler(errorMsg);
								} else {
									console.log(CONSOLE_RED('[UJS-FIND_FILE_NAMES] ERROR:' + errorMsg));
								}

							} else if (callback !== undefined) {

								PARALLEL(names, [
								function(name, done) {

									if (name[0] !== '.') {

										fs.stat(path + '/' + name, function(error, stats) {

											var
											// error msg
											errorMsg;

											if (error !== TO_DELETE) {

												errorMsg = error.toString();

												if (errorHandler !== undefined) {
													errorHandler(errorMsg);
												} else {
													console.log(CONSOLE_RED('[UJS-FIND_FILE_NAMES] ERROR:' + errorMsg));
												}

											} else {

												if (stats.isDirectory() !== true) {
													fileNames.push(name);
												}

												done();
											}
										});

									} else {
										done();
									}
								},

								function() {
									if (callback !== undefined) {
										callback(fileNames);
									}
								}]);
							}
						});

					} else {

						if (notExistsHandler !== undefined) {
							notExistsHandler(path);
						} else {
							console.log(CONSOLE_YELLOW('[UJS-FIND_FOLDER_NAMES] NOT EXISTS! <' + path + '>'));
						}
					}
				});
			}

			// when sync mode
			else {

				return RUN(function() {

					var
					// names
					names,

					// error msg
					errorMsg;

					try {

						if (CHECK_IS_EXISTS_FILE({
							path : path,
							isSync : true
						}) === true) {

							names = fs.readdirSync(path);

							EACH(names, function(name) {
								if (name[0] !== '.' && fs.statSync(path + '/' + name).isDirectory() !== true) {
									fileNames.push(name);
								}
							});

						} else {

							if (notExistsHandler !== undefined) {
								notExistsHandler(path);
							} else {
								console.log(CONSOLE_YELLOW('[UJS-FIND_FILE_NAMES] NOT EXISTS! <' + path + '>'));
							}

							// do not run callback.
							return;
						}

					} catch(error) {

						if (error !== TO_DELETE) {

							errorMsg = error.toString();

							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								console.log(CONSOLE_RED('[UJS-FIND_FILE_NAMES] ERROR: ' + errorMsg));
							}
						}
					}

					if (callback !== undefined) {
						callback(fileNames);
					}

					return fileNames;
				});
			}
		}
	};
});

/*
 * find folder names.
 */
global.FIND_FOLDER_NAMES = METHOD(function() {
	'use strict';

	var
	//IMPORT: fs
	fs = require('fs'),

	//IMPORT: path
	_path = require('path');

	return {

		run : function(pathOrParams, callbackOrHandlers) {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path
			//OPTIONAL: pathOrParams.isSync
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.success
			//OPTIONAL: callbackOrHandlers.notExistsHandler
			//OPTIONAL: callbackOrHandlers.error

			var
			// path
			path,

			// is sync
			isSync,

			// callback.
			callback,

			// not exists handler.
			notExistsHandler,

			// error handler.
			errorHandler,

			// file names
			folderNames = [];

			// init params.
			if (CHECK_IS_DATA(pathOrParams) !== true) {
				path = pathOrParams;
			} else {
				path = pathOrParams.path;
				isSync = pathOrParams.isSync;
			}

			if (callbackOrHandlers !== undefined) {
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					callback = callbackOrHandlers.success;
					notExistsHandler = callbackOrHandlers.notExists;
					errorHandler = callbackOrHandlers.error;
				}
			}

			// when normal mode
			if (isSync !== true) {

				CHECK_IS_EXISTS_FILE(path, function(isExists) {

					if (isExists === true) {

						fs.readdir(path, function(error, names) {

							var
							// error msg
							errorMsg;

							if (error !== TO_DELETE) {

								errorMsg = error.toString();

								if (errorHandler !== undefined) {
									errorHandler(errorMsg);
								} else {
									console.log(CONSOLE_RED('[UJS-FIND_FOLDER_NAMES] ERROR:' + errorMsg));
								}

							} else if (callback !== undefined) {

								PARALLEL(names, [
								function(name, done) {

									if (name[0] !== '.') {

										fs.stat(path + '/' + name, function(error, stats) {

											var
											// error msg
											errorMsg;

											if (error !== TO_DELETE) {

												errorMsg = error.toString();

												if (errorHandler !== undefined) {
													errorHandler(errorMsg);
												} else {
													console.log(CONSOLE_RED('[UJS-FIND_FOLDER_NAMES] ERROR:' + errorMsg));
												}

											} else {

												if (stats.isDirectory() === true) {
													folderNames.push(name);
												}

												done();
											}
										});

									} else {
										done();
									}
								},

								function() {
									if (callback !== undefined) {
										callback(folderNames);
									}
								}]);
							}
						});

					} else {

						if (notExistsHandler !== undefined) {
							notExistsHandler(path);
						} else {
							console.log(CONSOLE_YELLOW('[UJS-FIND_FOLDER_NAMES] NOT EXISTS! <' + path + '>'));
						}
					}
				});
			}

			// when sync mode
			else {

				return RUN(function() {

					var
					// names
					names,

					// error msg
					errorMsg;

					try {

						if (CHECK_IS_EXISTS_FILE({
							path : path,
							isSync : true
						}) === true) {

							names = fs.readdirSync(path);

							EACH(names, function(name) {
								if (name[0] !== '.' && fs.statSync(path + '/' + name).isDirectory() === true) {
									folderNames.push(name);
								}
							});

						} else {

							if (notExistsHandler !== undefined) {
								notExistsHandler(path);
							} else {
								console.log(CONSOLE_YELLOW('[UJS-FIND_FOLDER_NAMES] NOT EXISTS! <' + path + '>'));
							}

							// do not run callback.
							return;
						}

					} catch(error) {

						if (error !== TO_DELETE) {

							errorMsg = error.toString();

							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								console.log(CONSOLE_RED('[UJS-FIND_FOLDER_NAMES] ERROR: ' + errorMsg));
							}
						}
					}

					if (callback !== undefined) {
						callback(folderNames);
					}

					return folderNames;
				});
			}
		}
	};
});

/*
 * get file info.
 */
global.GET_FILE_INFO = METHOD(function() {
	'use strict';

	var
	//IMPORT: fs
	fs = require('fs');

	return {

		run : function(pathOrParams, callbackOrHandlers) {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path
			//OPTIONAL: pathOrParams.isSync
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.success
			//OPTIONAL: callbackOrHandlers.notExists
			//OPTIONAL: callbackOrHandlers.error

			var
			// path
			path,

			// is sync
			isSync,

			// callback.
			callback,

			// not eixsts handler.
			notExistsHandler,

			// error handler.
			errorHandler;

			// init params.
			if (CHECK_IS_DATA(pathOrParams) !== true) {
				path = pathOrParams;
			} else {
				path = pathOrParams.path;
				isSync = pathOrParams.isSync;
			}

			if (callbackOrHandlers !== undefined) {
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					callback = callbackOrHandlers.success;
					notExistsHandler = callbackOrHandlers.notExists;
					errorHandler = callbackOrHandlers.error;
				}
			}

			// when normal mode
			if (isSync !== true) {

				CHECK_IS_EXISTS_FILE(path, function(isExists) {

					if (isExists === true) {

						fs.stat(path, function(error, stat) {

							var
							// error msg
							errorMsg;

							if (error !== TO_DELETE) {

								errorMsg = error.toString();

								if (errorHandler !== undefined) {
									errorHandler(errorMsg);
								} else {
									console.log(CONSOLE_RED('[UJS-GET_FILE_INFO] ERROR: ' + errorMsg));
								}

							} else if (stat.isDirectory() === true) {

								if (notExistsHandler !== undefined) {
									notExistsHandler(path);
								} else {
									console.log(CONSOLE_YELLOW('[UJS-GET_FILE_INFO] NOT EXISTS! <' + path + '>'));
								}

							} else if (callback !== undefined) {
								callback({
									size : stat.size,
									createTime : stat.birthtime,
									lastUpdateTime : stat.mtime
								});
							}
						});

					} else {

						if (notExistsHandler !== undefined) {
							notExistsHandler(path);
						} else {
							console.log(CONSOLE_YELLOW('[UJS-GET_FILE_INFO] NOT EXISTS! <' + path + '>'));
						}
					}
				});
			}

			// when sync mode
			else {

				return RUN(function() {

					var
					// error msg
					errorMsg,

					// stat
					stat;

					try {

						if (CHECK_IS_EXISTS_FILE({
							path : path,
							isSync : true
						}) === true) {
							
							stat = fs.statSync(path);

							if (stat.isDirectory() === true) {

								if (notExistsHandler !== undefined) {
									notExistsHandler(path);
								} else {
									console.log(CONSOLE_YELLOW('[UJS-GET_FILE_INFO] NOT EXISTS! <' + path + '>'));
								}
								
							} else {
								
								if (callback !== undefined) {
									callback({
										size : stat.size,
										createTime : stat.birthtime,
										lastUpdateTime : stat.mtime
									});
								}
								
								return {
									size : stat.size,
									createTime : stat.birthtime,
									lastUpdateTime : stat.mtime
								};
							}

						} else {

							if (notExistsHandler !== undefined) {
								notExistsHandler(path);
							} else {
								console.log(CONSOLE_YELLOW('[UJS-GET_FILE_INFO] NOT EXISTS! <' + path + '>'));
							}
						}

					} catch(error) {

						if (error !== TO_DELETE) {

							errorMsg = error.toString();

							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								console.log(CONSOLE_RED('[UJS-GET_FILE_INFO] ERROR: ' + errorMsg));
							}
						}
					}

					// do not run callback.
					return;
				});
			}
		}
	};
});

/*
 * move file.
 */
global.MOVE_FILE = METHOD({

	run : function(params, callbackOrHandlers) {
		'use strict';
		//REQUIRED: params
		//REQUIRED: params.from
		//REQUIRED: params.to
		//OPTIONAL: params.isSync
		//REQUIRED: callbackOrHandlers
		//REQUIRED: callbackOrHandlers.success
		//OPTIONAL: callbackOrHandlers.notExistsHandler
		//OPTIONAL: callbackOrHandlers.error

		var
		// from
		from = params.from,

		// is sync
		isSync = params.isSync,

		// callback.
		callback,

		// not exists handler.
		notExistsHandler,

		// error handler.
		errorHandler;

		if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
			callback = callbackOrHandlers;
		} else {
			callback = callbackOrHandlers.success;
			notExistsHandler = callbackOrHandlers.notExists;
			errorHandler = callbackOrHandlers.error;
		}

		COPY_FILE(params, {
			error : errorHandler,
			notExists : notExistsHandler,
			success : function() {

				REMOVE_FILE({
					path : from,
					isSync : isSync
				}, {
					error : errorHandler,
					notExists : notExistsHandler,
					success : callback
				});
			}
		});
	}
});

/*
 * read file.
 */
global.READ_FILE = METHOD(function() {
	'use strict';

	var
	//IMPORT: fs
	fs = require('fs');

	return {

		run : function(pathOrParams, callbackOrHandlers) {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path
			//OPTIONAL: pathOrParams.isSync
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.success
			//OPTIONAL: callbackOrHandlers.notExists
			//OPTIONAL: callbackOrHandlers.error

			var
			// path
			path,

			// is sync
			isSync,

			// callback.
			callback,

			// not eixsts handler.
			notExistsHandler,

			// error handler.
			errorHandler;

			// init params.
			if (CHECK_IS_DATA(pathOrParams) !== true) {
				path = pathOrParams;
			} else {
				path = pathOrParams.path;
				isSync = pathOrParams.isSync;
			}

			if (callbackOrHandlers !== undefined) {
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					callback = callbackOrHandlers.success;
					notExistsHandler = callbackOrHandlers.notExists;
					errorHandler = callbackOrHandlers.error;
				}
			}

			// when normal mode
			if (isSync !== true) {

				CHECK_IS_EXISTS_FILE(path, function(isExists) {

					if (isExists === true) {

						fs.stat(path, function(error, stat) {

							var
							// error msg
							errorMsg;

							if (error !== TO_DELETE) {

								errorMsg = error.toString();

								if (errorHandler !== undefined) {
									errorHandler(errorMsg);
								} else {
									console.log(CONSOLE_RED('[UJS-READ_FILE] ERROR: ' + errorMsg));
								}

							} else if (stat.isDirectory() === true) {

								if (notExistsHandler !== undefined) {
									notExistsHandler(path);
								} else {
									console.log(CONSOLE_YELLOW('[UJS-READ_FILE] NOT EXISTS! <' + path + '>'));
								}

							} else {

								fs.readFile(path, function(error, buffer) {

									var
									// error msg
									errorMsg;

									if (error !== TO_DELETE) {

										errorMsg = error.toString();

										if (errorHandler !== undefined) {
											errorHandler(errorMsg);
										} else {
											console.log(CONSOLE_RED('[UJS-READ_FILE] ERROR: ' + errorMsg));
										}

									} else if (callback !== undefined) {
										callback(buffer);
									}
								});
							}
						});

					} else {

						if (notExistsHandler !== undefined) {
							notExistsHandler(path);
						} else {
							console.log(CONSOLE_YELLOW('[UJS-READ_FILE] NOT EXISTS! <' + path + '>'));
						}
					}
				});
			}

			// when sync mode
			else {

				return RUN(function() {

					var
					// error msg
					errorMsg,

					// buffer
					buffer;

					try {

						if (CHECK_IS_EXISTS_FILE({
							path : path,
							isSync : true
						}) === true) {

							if (fs.statSync(path).isDirectory() === true) {

								if (notExistsHandler !== undefined) {
									notExistsHandler(path);
								} else {
									console.log(CONSOLE_YELLOW('[UJS-READ_FILE] NOT EXISTS! <' + path + '>'));
								}
								
							} else {
								
								buffer = fs.readFileSync(path);
			
								if (callback !== undefined) {
									callback(buffer);
								}
			
								return buffer;
							}

						} else {

							if (notExistsHandler !== undefined) {
								notExistsHandler(path);
							} else {
								console.log(CONSOLE_YELLOW('[UJS-READ_FILE] NOT EXISTS! <' + path + '>'));
							}
						}

					} catch(error) {

						if (error !== TO_DELETE) {

							errorMsg = error.toString();

							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								console.log(CONSOLE_RED('[UJS-READ_FILE] ERROR: ' + errorMsg));
							}
						}
					}

					// do not run callback.
					return;
				});
			}
		}
	};
});

/*
 * remove file.
 */
global.REMOVE_FILE = METHOD(function() {
	'use strict';

	var
	//IMPORT: fs
	fs = require('fs');

	return {

		run : function(pathOrParams, callbackOrHandlers) {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path
			//OPTIONAL: pathOrParams.isSync
			//REQUIRED: callbackOrHandlers
			//REQUIRED: callbackOrHandlers.success
			//OPTIONAL: callbackOrHandlers.notExists
			//OPTIONAL: callbackOrHandlers.error

			var
			// path
			path,

			// is sync
			isSync,

			// callback.
			callback,

			// not eixsts handler.
			notExistsHandler,

			// error handler.
			errorHandler;

			// init params.
			if (CHECK_IS_DATA(pathOrParams) !== true) {
				path = pathOrParams;
			} else {
				path = pathOrParams.path;
				isSync = pathOrParams.isSync;
			}

			if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
				callback = callbackOrHandlers;
			} else {
				callback = callbackOrHandlers.success;
				notExistsHandler = callbackOrHandlers.notExists;
				errorHandler = callbackOrHandlers.error;
			}

			// when normal mode
			if (isSync !== true) {

				CHECK_IS_EXISTS_FILE(path, function(isExists) {

					if (isExists === true) {

						fs.unlink(path, function(error) {

							var
							// error msg
							errorMsg;

							if (error !== TO_DELETE) {

								errorMsg = error.toString();

								if (errorHandler !== undefined) {
									errorHandler(errorMsg);
								} else {
									console.log(CONSOLE_RED('[UJS-REMOVE_FILE] ERROR: ' + errorMsg));
								}

							} else {

								if (callback !== undefined) {
									callback();
								}
							}
						});

					} else {

						if (notExistsHandler !== undefined) {
							notExistsHandler(path);
						} else {
							console.log(CONSOLE_YELLOW('[UJS-REMOVE_FILE] NOT EXISTS! <' + path + '>'));
						}
					}
				});
			}

			// when sync mode
			else {

				RUN(function() {

					var
					// error msg
					errorMsg;

					try {

						if (CHECK_IS_EXISTS_FILE({
							path : path,
							isSync : true
						}) === true) {

							fs.unlinkSync(path);

						} else {

							if (notExistsHandler !== undefined) {
								notExistsHandler(path);
							} else {
								console.log(CONSOLE_YELLOW('[UJS-REMOVE_FILE] NOT EXISTS! <' + path + '>'));
							}

							// do not run callback.
							return;
						}

					} catch(error) {

						if (error !== TO_DELETE) {

							errorMsg = error.toString();

							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								console.log(CONSOLE_RED('[UJS-REMOVE_FILE] ERROR: ' + errorMsg));
							}
						}
					}

					if (callback !== undefined) {
						callback();
					}
				});
			}
		}
	};
});

/*
 * remove folder.
 */
global.REMOVE_FOLDER = METHOD(function() {
	'use strict';

	var
	//IMPORT: fs
	fs = require('fs');

	return {

		run : function(pathOrParams, callbackOrHandlers) {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path
			//OPTIONAL: pathOrParams.isSync
			//REQUIRED: callbackOrHandlers
			//REQUIRED: callbackOrHandlers.success
			//OPTIONAL: callbackOrHandlers.notExists
			//OPTIONAL: callbackOrHandlers.error

			var
			// path
			path,

			// is sync
			isSync,

			// callback.
			callback,

			// not eixsts handler.
			notExistsHandler,

			// error handler.
			errorHandler;

			// init params.
			if (CHECK_IS_DATA(pathOrParams) !== true) {
				path = pathOrParams;
			} else {
				path = pathOrParams.path;
				isSync = pathOrParams.isSync;
			}

			if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
				callback = callbackOrHandlers;
			} else {
				callback = callbackOrHandlers.success;
				notExistsHandler = callbackOrHandlers.notExists;
				errorHandler = callbackOrHandlers.error;
			}

			// when normal mode
			if (isSync !== true) {

				CHECK_IS_EXISTS_FILE(path, function(isExists) {

					if (isExists === true) {
						
						NEXT([
						function(next) {
							
							FIND_FILE_NAMES(path, function(fileNames) {
								
								PARALLEL(fileNames, [
								function(fileName, done) {
									REMOVE_FILE(path + '/' + fileName, done);
								},
								
								function() {
									next();
								}]);
							});
						},
						
						function(next) {
							return function() {
								
								FIND_FOLDER_NAMES(path, function(folderNames) {
									
									PARALLEL(folderNames, [
									function(folderName, done) {
										REMOVE_FOLDER(path + '/' + folderName, done);
									},
									
									function() {
										next();
									}]);
								});
							};
						},
						
						function(next) {
							return function() {
								
								fs.rmdir(path, function(error) {
		
									var
									// error msg
									errorMsg;
		
									if (error !== TO_DELETE) {
		
										errorMsg = error.toString();
		
										if (errorHandler !== undefined) {
											errorHandler(errorMsg);
										} else {
											console.log(CONSOLE_RED('[UJS-REMOVE_FOLDER] ERROR: ' + errorMsg));
										}
		
									} else {
		
										if (callback !== undefined) {
											callback();
										}
									}
								});
							};
						}]);

					} else {

						if (notExistsHandler !== undefined) {
							notExistsHandler(path);
						} else {
							console.log(CONSOLE_YELLOW('[UJS-REMOVE_FOLDER] NOT EXISTS! <' + path + '>'));
						}
					}
				});
			}

			// when sync mode
			else {

				RUN(function() {

					var
					// error msg
					errorMsg;

					try {

						if (CHECK_IS_EXISTS_FILE({
							path : path,
							isSync : true
						}) === true) {
							
							FIND_FILE_NAMES({
								path : path,
								isSync : true
							}, EACH(function(fileName) {
								
								REMOVE_FILE({
									path : path + '/' + fileName,
									isSync : true
								});
							}));
							
							FIND_FOLDER_NAMES({
								path : path,
								isSync : true
							}, EACH(function(folderName) {
								
								REMOVE_FOLDER({
									path : path + '/' + folderName,
									isSync : true
								});
							}));
							
							fs.rmdirSync(path);

						} else {

							if (notExistsHandler !== undefined) {
								notExistsHandler(path);
							} else {
								console.log(CONSOLE_YELLOW('[UJS-REMOVE_FOLDER] NOT EXISTS! <' + path + '>'));
							}

							// do not run callback.
							return;
						}

					} catch(error) {

						if (error !== TO_DELETE) {

							errorMsg = error.toString();

							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								console.log(CONSOLE_RED('[UJS-REMOVE_FOLDER] ERROR: ' + errorMsg));
							}
						}
					}

					if (callback !== undefined) {
						callback();
					}
				});
			}
		}
	};
});

/*
 * write file.
 */
global.WRITE_FILE = METHOD(function() {
	'use strict';

	var
	//IMPORT: fs
	fs = require('fs'),

	//IMPORT: path
	_path = require('path');

	return {

		run : function(params, callbackOrHandlers) {
			//REQUIRED: params
			//REQUIRED: params.path
			//OPTIONAL: params.content
			//OPTIONAL: params.buffer
			//OPTIONAL: params.isSync
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.success
			//OPTIONAL: callbackOrHandlers.error

			var
			// path
			path = params.path,

			// content
			content = params.content,

			// buffer
			buffer = params.buffer,

			// is sync
			isSync = params.isSync,

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

			CREATE_FOLDER({
				path : _path.dirname(path),
				isSync : isSync
			}, function() {

				// when normal mode
				if (isSync !== true) {

					fs.writeFile(path, buffer !== undefined ? buffer : content, function(error) {

						var
						// error msg
						errorMsg;

						if (error !== TO_DELETE) {

							errorMsg = error.toString();

							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								console.log(CONSOLE_RED('[UJS-WRITE_FILE] ERROR:' + errorMsg));
							}

						} else if (callback !== undefined) {
							callback();
						}
					});
				}

				// when sync mode
				else {

					RUN(function() {

						var
						// error msg
						errorMsg;

						try {

							fs.writeFileSync(path, buffer !== undefined ? buffer : content);

						} catch(error) {

							if (error !== TO_DELETE) {

								errorMsg = error.toString();

								if (errorHandler !== undefined) {
									errorHandler(errorMsg);
								} else {
									console.log(CONSOLE_RED('[UJS-WRITE_FILE] ERROR: ' + errorMsg));
								}
							}
						}

						if (callback !== undefined) {
							callback();
						}
					});
				}
			});
		}
	};
});

/**
 * HTTP DELETE request.
 */
global.DELETE = METHOD({

	run : function(params, responseListenerOrListeners) {
		'use strict';
		//REQUIRED: params
		//REQUIRED: params.host
		//OPTIONAL: params.port
		//OPTIONAL: params.isSecure
		//OPTIONAL: params.uri
		//OPTIONAL: params.paramStr
		//OPTIONAL: params.data
		//REQUIRED: responseListenerOrListeners

		REQUEST(COMBINE([params, {
			method : 'DELETE'
		}]), responseListenerOrListeners);
	}
});

/**
 * download HTTP resource.
 */
global.DOWNLOAD = METHOD(function() {
	'use strict';

	var
	//IMPORT: http
	http = require('http'),

	//IMPORT: https
	https = require('https'),
	
	//IMPORT: url
	url = require('url');

	return {

		run : function(params, callbackOrHandlers) {
			//REQUIRED: params
			//OPTIONAL: params.host
			//OPTIONAL: params.port
			//OPTIONAL: params.isSecure
			//OPTIONAL: params.uri
			//OPTIONAL: params.paramStr
			//OPTIONAL: params.data
			//OPTIONAL: params.url
			//REQUIRED: params.path
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.success
			//OPTIONAL: callbackOrHandlers.error

			var
			// host
			host = params.host,

			// is secure
			isSecure = params.isSecure,

			// port
			port = params.port === undefined ? (isSecure !== true ? 80 : 443) : params.port,

			// uri
			uri = params.uri,

			// param str
			paramStr = params.paramStr,

			// data
			data = params.data,
			
			// _url
			_url = params.url,
			
			// path
			path = params.path,
			
			// url data
			urlData,

			// callback.
			callback,

			// error handler.
			errorHandler,

			// http request
			req;
			
			if (_url !== undefined) {
				
				urlData = url.parse(_url);
				
				host = urlData.hostname === TO_DELETE ? undefined : urlData.hostname;
				port = urlData.port === TO_DELETE ? undefined : INTEGER(urlData.port);
				isSecure = urlData.protocol === 'https:';
				uri = urlData.pathname === TO_DELETE ? undefined : urlData.pathname.substring(1);
				paramStr = urlData.query === TO_DELETE ? undefined : urlData.query;
				
			} else {
	
				if (uri !== undefined && uri.indexOf('?') !== -1) {
					paramStr = uri.substring(uri.indexOf('?') + 1) + (paramStr === undefined ? '' : '&' + paramStr);
					uri = uri.substring(0, uri.indexOf('?'));
				}
	
				if (data !== undefined) {
					paramStr = (paramStr === undefined ? '' : paramStr + '&') + '__DATA=' + encodeURIComponent(STRINGIFY(data));
				}
	
				paramStr = (paramStr === undefined ? '' : paramStr + '&') + Date.now();
			}

			if (callbackOrHandlers !== undefined) {
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					callback = callbackOrHandlers.success;
					errorHandler = callbackOrHandlers.error;
				}
			}

			req = (isSecure !== true ? http : https).get({
				hostname : host,
				port : port,
				path : '/' + (uri === undefined ? '' : uri) + '?' + paramStr
			}, function(httpResponse) {
				
				var
				// data
				data;
				
				// redirect.
				if (httpResponse.statusCode === 301 || httpResponse.statusCode === 302) {
					
					DOWNLOAD({
						url : httpResponse.headers.location,
						path : path
					}, {
						success : callback,
						error : errorHandler
					});
					
					httpResponse.destroy();
					
				} else {
				
					data = [];
	
					httpResponse.on('data', function(chunk) {
						data.push(chunk);
					});
					httpResponse.on('end', function() {
						
						WRITE_FILE({
							path : path,
							buffer : Buffer.concat(data)
						}, {
							success : callback,
							error : errorHandler
						});
					});
				}
			});

			req.on('error', function(error) {

				var
				// error msg
				errorMsg = error.toString();

				if (errorHandler !== undefined) {
					errorHandler(errorMsg);
				} else {
					console.log(CONSOLE_RED('[UJS-NODE] DOWNLOAD FAILED: ' + errorMsg), params);
				}
			});
		}
	};
});

/**
 * HTTP GET request.
 */
global.GET = METHOD(function(m) {
	'use strict';
	
	var
	//IMPORT: url
	url = require('url');
	
	return {

		run : function(urlOrParams, responseListenerOrListeners) {
			//REQUIRED: urlOrParams
			//REQUIRED: urlOrParams.host
			//OPTIONAL: urlOrParams.port
			//OPTIONAL: urlOrParams.isSecure
			//REQUIRED: urlOrParams.uri
			//OPTIONAL: urlOrParams.paramStr
			//OPTIONAL: urlOrParams.data
			//REQUIRED: responseListenerOrListeners
			
			var
			// url data
			urlData,
			
			// params
			params;
			
			if (CHECK_IS_DATA(urlOrParams) !== true) {
				
				urlData = url.parse(urlOrParams);
				
				params = {
					host : urlData.hostname === TO_DELETE ? undefined : urlData.hostname,
					port : urlData.port === TO_DELETE ? undefined : INTEGER(urlData.port),
					isSecure : urlData.protocol === 'https:',
					uri : urlData.pathname === TO_DELETE ? undefined : urlData.pathname.substring(1),
					paramStr : urlData.query === TO_DELETE ? undefined : urlData.query
				};
					
			} else {
				params = urlOrParams;
			}
	
			REQUEST(COMBINE([params, {
				method : 'GET'
			}]), responseListenerOrListeners);
		}
		};
	});

/**
 * HTTP POST request.
 */
global.POST = METHOD({

	run : function(params, responseListenerOrListeners) {
		'use strict';
		//REQUIRED: params
		//REQUIRED: params.host
		//OPTIONAL: params.port
		//OPTIONAL: params.isSecure
		//OPTIONAL: params.uri
		//OPTIONAL: params.paramStr
		//OPTIONAL: params.data
		//REQUIRED: responseListenerOrListeners

		REQUEST(COMBINE([params, {
			method : 'POST'
		}]), responseListenerOrListeners);
	}
});

/**
 * HTTP PUT request.
 */
global.PUT = METHOD({

	run : function(params, responseListenerOrListeners) {
		'use strict';
		//REQUIRED: params
		//REQUIRED: params.host
		//OPTIONAL: params.port
		//OPTIONAL: params.isSecure
		//OPTIONAL: params.uri
		//OPTIONAL: params.paramStr
		//OPTIONAL: params.data
		//REQUIRED: responseListenerOrListeners

		REQUEST(COMBINE([params, {
			method : 'PUT'
		}]), responseListenerOrListeners);
	}
});

/**
 * HTTP request.
 */
global.REQUEST = METHOD(function() {
	'use strict';

	var
	//IMPORT: http
	http = require('http'),

	//IMPORT: https
	https = require('https');

	return {

		run : function(params, responseListenerOrListeners) {
			//REQUIRED: params
			//REQUIRED: params.host
			//OPTIONAL: params.port
			//OPTIONAL: params.isSecure
			//REQUIRED: params.method
			//OPTIONAL: params.uri
			//OPTIONAL: params.paramStr
			//OPTIONAL: params.data
			//REQUIRED: responseListenerOrListeners

			var
			// host
			host = params.host,

			// is secure
			isSecure = params.isSecure,

			// port
			port = params.port === undefined ? (isSecure !== true ? 80 : 443) : params.port,

			// method
			method = params.method,

			// uri
			uri = params.uri,

			// param str
			paramStr = params.paramStr,

			// data
			data = params.data,

			// response listener
			responseListener,

			// error listener
			errorListener,

			// http request
			req;

			method = method.toUpperCase();

			if (uri !== undefined && uri.indexOf('?') !== -1) {
				paramStr = uri.substring(uri.indexOf('?') + 1) + (paramStr === undefined ? '' : '&' + paramStr);
				uri = uri.substring(0, uri.indexOf('?'));
			}

			if (data !== undefined) {
				paramStr = (paramStr === undefined ? '' : paramStr + '&') + '__DATA=' + encodeURIComponent(STRINGIFY(data));
			}

			paramStr = (paramStr === undefined ? '' : paramStr + '&') + Date.now();

			if (CHECK_IS_DATA(responseListenerOrListeners) !== true) {
				responseListener = responseListenerOrListeners;
			} else {
				responseListener = responseListenerOrListeners.success;
				errorListener = responseListenerOrListeners.error;
			}

			// GET request.
			if (method === 'GET') {

				req = (isSecure !== true ? http : https).get({
					hostname : host,
					port : port,
					path : '/' + (uri === undefined ? '' : uri) + '?' + paramStr
				}, function(httpResponse) {

					var
					// content
					content;
					
					// redirect.
					if (httpResponse.statusCode === 301 || httpResponse.statusCode === 302) {
						
						GET(httpResponse.headers.location, {
							success : responseListener,
							error : errorListener
						});
						
						httpResponse.destroy();
						
					} else {
						
						content = '';

						httpResponse.setEncoding('utf-8');
						httpResponse.on('data', function(str) {
							content += str;
						});
						httpResponse.on('end', function() {
							responseListener(content, httpResponse.headers);
						});
					}
				});
			}

			// other request.
			else {

				req = (isSecure !== true ? http : https).request({
					hostname : host,
					port : port,
					path : '/' + (uri === undefined ? '' : uri),
					method : method
				}, function(httpResponse) {

					var
					// content
					content = '';

					httpResponse.setEncoding('utf-8');
					httpResponse.on('data', function(str) {
						content += str;
					});
					httpResponse.on('end', function() {
						responseListener(content, httpResponse.headers);
					});
				});

				req.write(paramStr);
				req.end();
			}

			req.on('error', function(error) {

				var
				// error msg
				errorMsg = error.toString();

				if (errorListener !== undefined) {
					errorListener(errorMsg);
				} else {
					console.log(CONSOLE_RED('[UJS-NODE] REQUEST FAILED: ' + errorMsg), params);
				}
			});
		}
	};
});

/*
 * create resourec server.
 */
global.RESOURCE_SERVER = CLASS(function(cls) {
	'use strict';

	var
	//IMPORT: fs
	fs = require('fs'),
	
	//IMPORT: path
	path = require('path'),

	//IMPORT: querystring
	querystring = require('querystring'),
	
	// preprocessors
	preprocessors = {},

	// get content type from extension.
	getContentTypeFromExtension,
	
	// add preprocessor.
	addPreprocessor;

	cls.getContentTypeFromExtension = getContentTypeFromExtension = function(extension) {
		//REQUIRED: ext
		
		// png image
		if (extension === 'png') {
			return 'image/png';
		}

		// jpeg image
		if (extension === 'jpeg' || extension === 'jpg') {
			return 'image/jpeg';
		}

		// gif image
		if (extension === 'gif') {
			return 'image/gif';
		}

		// svg
		if (extension === 'svg') {
			return 'image/svg+xml';
		}

		// javascript
		if (extension === 'js') {
			return 'application/javascript';
		}

		// json document
		if (extension === 'json') {
			return 'application/json';
		}

		// css
		if (extension === 'css') {
			return 'text/css';
		}

		// text
		if (extension === 'text' || extension === 'txt') {
			return 'text/plain';
		}

		// markdown
		if (extension === 'markdown' || extension === 'md') {
			return 'text/x-markdown';
		}

		// html document
		if (extension === 'html') {
			return 'text/html';
		}

		// swf
		if (extension === 'swf') {
			return 'application/x-shockwave-flash';
		}

		// mp3
		if (extension === 'mp3') {
			return 'audio/mpeg';
		}

		// ogg
		if (extension === 'ogg') {
			return 'audio/ogg';
		}

		// mp4
		if (extension === 'mp4') {
			return 'video/mp4';
		}

		return 'application/octet-stream';
	};
	
	cls.addPreprocessor = addPreprocessor = function(params) {
		//REQUIRED: params
		//REQUIRED: params.extension
		//REQUIRED: params.preprocessor
		
		var
		// extension
		extension = params.extension,
		
		// preprocessor
		preprocessor = params.preprocessor;
		
		preprocessors[extension] = preprocessor;
	};

	return {

		init : function(inner, self, portOrParams, requestListenerOrHandlers) {
			//REQUIRED: portOrParams
			//OPTIONAL: portOrParams.port
			//OPTIONAL: portOrParams.securedPort
			//OPTIONAL: portOrParams.securedKeyFilePath
			//OPTIONAL: portOrParams.securedCertFilePath
			//OPTIONAL: portOrParams.noParsingParamsURI
			//OPTIONAL: portOrParams.rootPath
			//OPTIONAL: portOrParams.version
			//OPTIONAL: requestListenerOrHandlers
			//OPTIONAL: requestListenerOrHandlers.requestListener
			//OPTIONAL: requestListenerOrHandlers.error
			//OPTIONAL: requestListenerOrHandlers.notExistsResource
			//OPTIONAL: requestListenerOrHandlers.preprocessor

			var
			//IMPORT: path
			path = require('path'),

			// port
			port,

			// secured port
			securedPort,

			// origin root path
			originRootPath,

			// version
			version,

			// request listener.
			requestListener,

			// error handler.
			errorHandler,

			// not exists resource handler.
			notExistsResourceHandler,
			
			// preprocessor.
			preprocessor,

			// resource caches
			resourceCaches = {},

			// web server
			webServer,
			
			// get native http server.
			getNativeHTTPServer,
			
			// get native https server.
			getNativeHTTPSServer;

			// init params.
			if (CHECK_IS_DATA(portOrParams) !== true) {
				port = portOrParams;
			} else {
				port = portOrParams.port;
				securedPort = portOrParams.securedPort;
				originRootPath = portOrParams.rootPath;
				version = String(portOrParams.version);
			}

			if (requestListenerOrHandlers !== undefined) {
				if (CHECK_IS_DATA(requestListenerOrHandlers) !== true) {
					requestListener = requestListenerOrHandlers;
				} else {
					requestListener = requestListenerOrHandlers.requestListener;
					errorHandler = requestListenerOrHandlers.error;
					notExistsResourceHandler = requestListenerOrHandlers.notExistsResource;
					preprocessor = requestListenerOrHandlers.preprocessor;
				}
			}

			webServer = WEB_SERVER(portOrParams, function(requestInfo, response, onDisconnected) {

				var
				// root path
				rootPath = originRootPath,

				// is going on
				isGoingOn,

				// original uri
				originalURI = requestInfo.uri,

				// uri
				uri = requestInfo.uri,

				// method
				method = requestInfo.method,

				// params
				params = requestInfo.params,

				// headers
				headers = requestInfo.headers,

				// overriding response info
				overrideResponseInfo = {},

				// response not found.
				responseNotFound,

				// response error.
				responseError;

				NEXT([
				function(next) {

					if (requestListener !== undefined) {

						isGoingOn = requestListener(requestInfo, response, onDisconnected, function(newRootPath) {
							rootPath = newRootPath;
						}, function(_overrideResponseInfo) {

							if (_overrideResponseInfo !== undefined) {
								overrideResponseInfo = _overrideResponseInfo;
							}

							DELAY(next);
						});

						// init properties again.
						uri = requestInfo.uri;
						method = requestInfo.method;
						params = requestInfo.params;
						headers = requestInfo.headers;
					}

					if (isGoingOn !== false && requestInfo.isResponsed !== true) {
						next();
					}
				},

				function() {
					return function() {
						
						// stream video.
						if (headers.range !== undefined) {
							
							GET_FILE_INFO(rootPath + '/' + uri, function(fileInfo) {

								var
								// positions
								positions = headers.range.replace(/bytes=/, '').split('-'),
								
								// total size
								totalSize = fileInfo.size,
								
								// start position
								startPosition = INTEGER(positions[0]),
								
								// end position
								endPosition = positions[1] === undefined || positions[1] === '' ? totalSize - 1 : INTEGER(positions[1]),
								
								// stream
								stream = fs.createReadStream(rootPath + '/' + uri, {
									start : startPosition,
									end : endPosition
								}).on('open', function() {
									
									response(EXTEND({
										origin : {
											contentType : getContentTypeFromExtension(path.extname(uri).substring(1)),
											totalSize : totalSize,
											startPosition : startPosition,
											endPosition : endPosition,
											stream : stream
										},
										extend : overrideResponseInfo
									}));
									
								}).on('error', function(error) {
									
									response(EXTEND({
										origin : {
											contentType : getContentTypeFromExtension(path.extname(uri).substring(1)),
											totalSize : totalSize,
											startPosition : startPosition,
											endPosition : endPosition,
											content : error.toString()
										},
										extend : overrideResponseInfo
									}));
								});
							});
						}
						
						// check ETag.
						else if (CONFIG.isDevMode !== true && (overrideResponseInfo.isFinal !== true ?

						// check version.
						(version !== undefined && headers['if-none-match'] === version) :

						// check exists.
						headers['if-none-match'] !== undefined)) {

							// response cached.
							response(EXTEND({
								origin : {
									statusCode : 304
								},
								extend : overrideResponseInfo
							}));
						}

						// redirect correct version uri.
						else if (CONFIG.isDevMode !== true && overrideResponseInfo.isFinal !== true && version !== undefined && originalURI !== '' && params.version !== version) {

							response(EXTEND({
								origin : {
									statusCode : 302,
									headers : {
										'Location' : '/' + originalURI + '?' + querystring.stringify(COMBINE([params, {
											version : version
										}]))
									}
								},
								extend : overrideResponseInfo
							}));
						}

						// response resource file.
						else if (rootPath !== undefined && method === 'GET') {

							responseNotFound = function(resourcePath) {

								if (notExistsResourceHandler !== undefined) {
									isGoingOn = notExistsResourceHandler(resourcePath, requestInfo, response);
								}

								if (isGoingOn !== false && requestInfo.isResponsed !== true) {

									response(EXTEND({
										origin : {
											statusCode : 404
										},
										extend : overrideResponseInfo
									}));
								}
							};

							responseError = function(errorMsg) {

								if (errorHandler !== undefined) {
									isGoingOn = errorHandler(errorMsg, requestInfo, response);
								} else {
									console.log(CONSOLE_RED('[UJS-RESOURCE_SERVER] ERROR: ' + errorMsg));
								}

								if (isGoingOn !== false && requestInfo.isResponsed !== true) {

									response(EXTEND({
										origin : {
											statusCode : 500
										},
										extend : overrideResponseInfo
									}));
								}
							};

							NEXT([
							function(next) {

								var
								// resource cache
								resourceCache = resourceCaches[originalURI];

								if (resourceCache !== undefined) {
									next(resourceCache.buffer, resourceCache.contentType);
								} else {

									// serve file.
									READ_FILE(rootPath + '/' + uri, {

										notExists : function() {

											// not found file, so serve index.
											READ_FILE(rootPath + (uri === '' ? '' : ('/' + uri)) + '/index.html', {

												notExists : function() {
													responseNotFound(rootPath + '/' + uri);
												},
												error : responseError,

												success : function(buffer) {
													next(buffer, 'text/html');
												}
											});
										},

										error : responseError,
										success : next
									});
								}
							},

							function() {
								return function(buffer, contentType) {
									
									var
									// extension
									extension = path.extname(uri).substring(1);
									
									if (preprocessors[extension] !== undefined) {
										preprocessors[extension](buffer.toString(), response);
									} else {
										
										if (contentType === undefined) {
											contentType = getContentTypeFromExtension(extension);
										}
	
										if (CONFIG.isDevMode !== true && overrideResponseInfo.isFinal !== true && resourceCaches[originalURI] === undefined) {
											resourceCaches[originalURI] = {
												buffer : buffer,
												contentType : contentType
											};
										}
	
										response(EXTEND({
											origin : {
												buffer : buffer,
												contentType : contentType,
												version : version
											},
											extend : overrideResponseInfo
										}));
									}
								};
							}]);

						} else {
							response(EXTEND({
								origin : {
									statusCode : 404
								},
								extend : overrideResponseInfo
							}));
						}
					};
				}]);
			});

			console.log('[UJS-RESOURCE_SERVER] RUNNING RESOURCE SERVER...' + (port === undefined ? '' : (' (PORT:' + port + ')')) + (securedPort === undefined ? '' : (' (SECURED PORT:' + securedPort + ')')));

			self.getNativeHTTPServer = getNativeHTTPServer = function() {
				return webServer.getNativeHTTPServer();
			};
			
			self.getNativeHTTPSServer = getNativeHTTPSServer = function() {
				return webServer.getNativeHTTPSServer();
			};
		}
	};
});

/*
 * create socket server.
 */
global.SOCKET_SERVER = METHOD({

	run : function(port, connectionListener) {
		'use strict';
		//REQUIRED: port
		//REQUIRED: connectionListener

		var
		// net
		net = require('net'),

		// server
		server = net.createServer(function(conn) {

			var
			// method map
			methodMap = {},

			// send key
			sendKey = 0,

			// received string
			receivedStr = '',
			
			// client info
			clientInfo,

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
					console.log(CONSOLE_RED('[UJS-SOCEKT_SERVER] ERROR:'), error.toString());
				}
			};

			// when receive data
			conn.on('data', function(content) {

				var
				// str
				str,

				// index
				index,

				// params
				params;

				receivedStr += content.toString();

				while (( index = receivedStr.indexOf('\r\n')) !== -1) {

					str = receivedStr.substring(0, index);

					params = PARSE_STR(str);

					if (params !== undefined) {
						runMethods(params.methodName, params.data, params.sendKey);
					}

					receivedStr = receivedStr.substring(index + 1);
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

				console.log(CONSOLE_RED('[UJS-SOCEKT_SERVER] ERROR:'), errorMsg);

				runMethods('__ERROR', errorMsg);
			});

			connectionListener(

			// client info
			clientInfo = {
				
				ip : conn.remoteAddress,
				
				connectTime : new Date()
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
				
				conn.write(STRINGIFY({
					methodName : params.methodName,
					data : params.data,
					sendKey : sendKey
				}) + '\r\n');

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
				
				clientInfo.lastReceiveTime = new Date();
			},

			// disconnect.
			function() {
				conn.end();
			});
		});

		// listen.
		server.listen(port);

		console.log('[UJS-SOCKET_SERVER] RUNNING SOCKET SERVER... (PORT:' + port + ')');
	}
});

/*
 * create UDP server.
 */
global.UDP_SERVER = METHOD({

	run : function(portOrParams, requestListener) {
		'use strict';
		//REQUIRED: portOrParams
		//REQUIRED: portOrParams.port
		//OPTIONAL: portOrParams.ipVersion
		//REQUIRED: requestListener

		var
		//IMPORT: dgram
		dgram = require('dgram'),
		
		// port
		port,
		
		// ip version
		ipVersion = 4,
		
		// server
		server;
		
		// init params.
		if (CHECK_IS_DATA(portOrParams) !== true) {
			port = portOrParams;
		} else {
			port = portOrParams.port;
			ipVersion = portOrParams.ipVersion;
		}
		
		server = dgram.createSocket('udp' + ipVersion);
		
		server.on('message', function(message, nativeRequestInfo) {
			
			var
			// ip
			ip = nativeRequestInfo.address,
			
			// port
			port = nativeRequestInfo.port;
			
			requestListener(
			
			// request info	
			{
				ip : ip,
				
				port : port,
				
				content : message.toString()
			},
			
			// response.
			function(content) {
				
				var
				// message
				message = new Buffer(content);
				
				server.send(message, 0, message.length, port, ip);
			});
		});
		
		server.on('listening', function() {
			console.log('[UJS-UDP_SERVER] RUNNING UDP SERVER... (PORT:' + port + ')');
		});
		
		server.bind(port);
	}
});

/*
 * create web server.
 */
global.WEB_SERVER = CLASS(function(cls) {
	'use strict';

	var
	//IMPORT: http
	http = require('http'),
	
	//IMPORT: https
	https = require('https'),
	
	//IMPORT: fs
	fs = require('fs'),

	//IMPORT: querystring
	querystring = require('querystring'),

	//IMPORT: zlib
	zlib = require('zlib'),

	// get encoding from content type.
	getEncodingFromContentType;

	cls.getEncodingFromContentType = getEncodingFromContentType = function(contentType) {
		//REQUIRED: contentType

		if (contentType === 'application/javascript') {
			return 'utf-8';
		}

		if (contentType === 'application/json') {
			return 'utf-8';
		}

		if (contentType === 'text/css') {
			return 'utf-8';
		}

		if (contentType === 'text/plain') {
			return 'utf-8';
		}
		
		if (contentType === 'text/x-markdown') {
			return 'utf-8';
		}

		if (contentType === 'text/html') {
			return 'utf-8';
		}

		if (contentType === 'image/png') {
			return 'binary';
		}

		if (contentType === 'image/jpeg') {
			return 'binary';
		}

		if (contentType === 'image/gif') {
			return 'binary';
		}

		if (contentType === 'image/svg+xml') {
			return 'utf-8';
		}

		if (contentType === 'application/x-shockwave-flash') {
			return 'binary';
		}

		if (contentType === 'audio/mpeg') {
			return 'binary';
		}

		return 'binary';
	};

	return {

		init : function(inner, self, portOrParams, requestListener) {
			//REQUIRED: portOrParams
			//OPTIONAL: portOrParams.port
			//OPTIONAL: portOrParams.securedPort
			//OPTIONAL: portOrParams.securedKeyFilePath
			//OPTIONAL: portOrParams.securedCertFilePath
			//OPTIONAL: portOrParams.noParsingParamsURI
			//REQUIRED: requestListener

			var
			// port
			port,

			// secured port
			securedPort,

			// secured key file path
			securedKeyFilePath,

			// secured cert file path
			securedCertFilePath,

			// no parsing params uri
			noParsingParamsURI,

			// native http server
			nativeHTTPServer,

			// native https server
			nativeHTTPSServer,

			// serve.
			serve,

			// get native http server.
			getNativeHTTPServer,

			// get native https server.
			getNativeHTTPSServer;

			// init params.
			if (CHECK_IS_DATA(portOrParams) !== true) {
				port = portOrParams;
			} else {
				port = portOrParams.port;
				securedPort = portOrParams.securedPort;
				securedKeyFilePath = portOrParams.securedKeyFilePath;
				securedCertFilePath = portOrParams.securedCertFilePath;
				noParsingParamsURI = portOrParams.noParsingParamsURI;
			}

			serve = function(nativeReq, nativeRes, isSecure) {

				var
				// headers
				headers = nativeReq.headers,

				// uri
				uri = nativeReq.url,

				// method
				method = nativeReq.method.toUpperCase(),

				// ip
				ip = headers['x-forwarded-for'],

				// accept encoding
				acceptEncoding = headers['accept-encoding'],

				// disconnected methods
				disconnectedMethods = [],

				// param str
				paramStr,

				// request info
				requestInfo;

				if (ip === undefined) {
					ip = nativeReq.connection.remoteAddress;
				}

				if (acceptEncoding === undefined) {
					acceptEncoding = '';
				}

				if (uri.indexOf('?') != -1) {
					paramStr = uri.substring(uri.indexOf('?') + 1);
					uri = uri.substring(0, uri.indexOf('?'));
				}

				uri = uri.substring(1);

				NEXT([
				function(next) {

					if (method === 'GET' || noParsingParamsURI === uri || CHECK_IS_IN({
						array : noParsingParamsURI,
						value : uri
					}) === true) {
						next();
					} else {

						nativeReq.on('data', function(data) {
							if (paramStr === undefined) {
								paramStr = '';
							} else {
								paramStr += '&';
							}
							paramStr += data;
						});

						nativeReq.on('end', function() {
							next();
						});
					}
				},

				function() {
					return function() {
						
						var
						// params
						params = querystring.parse(paramStr),
						
						// data
						data;
						
						EACH(params, function(param, name) {
							
							if (CHECK_IS_ARRAY(param) === true) {
								params[name] = param[param.length - 1];
							}
						});
						
						data = params.__DATA;
						
						if (data !== undefined) {
							
							data = PARSE_STR(data);
							
							delete params.__DATA;
						}

						requestListener( requestInfo = {

							headers : headers,
							
							isSecure : isSecure,

							uri : uri,

							method : method,

							params : params,
							
							data : data,

							ip : ip,

							cookies : PARSE_COOKIE_STR(headers.cookie),

							nativeReq : nativeReq
						},

						// response.
						function(contentOrParams) {
							//REQUIRED: contentOrParams
							//OPTIONAL: contentOrParams.statusCode
							//OPTIONAL: contentOrParams.headers
							//OPTIONAL: contentOrParams.contentType
							//OPTIONAL: contentOrParams.content
							//OPTIONAL: contentOrParams.buffer
							//OPTIONAL: contentOrParams.totalSize
							//OPTIONAL: contentOrParams.startPosition
							//OPTIONAL: contentOrParams.endPosition
							//OPTIONAL: contentOrParams.stream
							//OPTIONAL: contentOrParams.encoding
							//OPTIONAL: contentOrParams.version
							//OPTIONAL: contentOrParams.isFinal

							var
							// status code
							statusCode,

							// headers
							headers,

							// content type
							contentType,

							// content
							content,

							// buffer
							buffer,
							
							// total size
							totalSize,
							
							// start position
							startPosition,
							
							// end position
							endPosition,
							
							// stream
							stream,

							// encoding
							encoding,

							// version
							version,

							// is final
							isFinal;

							if (requestInfo.isResponsed !== true) {

								if (CHECK_IS_DATA(contentOrParams) !== true) {
									content = contentOrParams;
								} else {
									
									statusCode = contentOrParams.statusCode;
									headers = contentOrParams.headers;
									contentType = contentOrParams.contentType;
									content = contentOrParams.content;
									buffer = contentOrParams.buffer;
									
									totalSize = contentOrParams.totalSize;
									startPosition = contentOrParams.startPosition;
									endPosition = contentOrParams.endPosition;
									stream = contentOrParams.stream;
									
									encoding = contentOrParams.encoding;
									version = contentOrParams.version;
									isFinal = contentOrParams.isFinal;
								}

								if (headers === undefined) {
									headers = {};
								}

								if (contentType !== undefined) {

									if (encoding === undefined) {
										encoding = getEncodingFromContentType(contentType);
									}

									headers['Content-Type'] = contentType + '; charset=' + encoding;
								}

								if (stream !== undefined) {
									
									headers['Content-Range'] = 'bytes ' + startPosition + '-' + endPosition + '/' + totalSize;
									headers['Accept-Ranges'] = 'bytes';
									headers['Content-Length'] = endPosition - startPosition + 1;
									
									nativeRes.writeHead(206, headers);
									
									stream.pipe(nativeRes);
								}
								
								else {
									
									if (content === undefined) {
										content = '';
									}
									
									if (statusCode === undefined) {
										statusCode = 200;
									}
									
									if (CONFIG.isDevMode !== true) {
										if (isFinal === true) {
											headers['ETag'] = 'FINAL';
										} else if (version !== undefined) {
											headers['ETag'] = version;
										}
									}
									
									// when gzip encoding
									if (acceptEncoding.match(/\bgzip\b/) !== TO_DELETE) {
	
										headers['Content-Encoding'] = 'gzip';
	
										zlib.gzip(buffer !== undefined ? buffer : String(content), function(error, buffer) {
											nativeRes.writeHead(statusCode, headers);
											nativeRes.end(buffer, encoding);
										});
									}
	
									// when not encoding
									else {
										nativeRes.writeHead(statusCode, headers);
										nativeRes.end(buffer !== undefined ? buffer : String(content), encoding);
									}
								}

								requestInfo.isResponsed = true;
							}
						},

						// on disconnected.
						function(method) {
							disconnectedMethods.push(method);
						});
					};
				}]);

				if (noParsingParamsURI !== uri && CHECK_IS_IN({
					array : noParsingParamsURI,
					value : uri
				}) !== true) {

					nativeReq.on('close', function() {
						EACH(disconnectedMethods, function(method) {
							method();
						});
					});
				}
			};

			// init sever.
			if (port !== undefined) {
				nativeHTTPServer = http.createServer(function(nativeReq, nativeRes) {
					serve(nativeReq, nativeRes, false)
				}).listen(port);
			}

			// init secured sever.
			if (securedPort !== undefined) {

				nativeHTTPSServer = https.createServer({
					key : fs.readFileSync(securedKeyFilePath),
					cert : fs.readFileSync(securedCertFilePath)
				}, function(nativeReq, nativeRes) {
					serve(nativeReq, nativeRes, true)
				}).listen(securedPort);
			}

			console.log('[UJS-WEB_SERVER] RUNNING WEB SERVER...' + (port === undefined ? '' : (' (PORT:' + port + ')')) + (securedPort === undefined ? '' : (' (SECURED PORT:' + securedPort + ')')));

			self.getNativeHTTPServer = getNativeHTTPServer = function() {
				return nativeHTTPServer;
			};
			
			self.getNativeHTTPSServer = getNativeHTTPSServer = function() {
				return nativeHTTPSServer;
			};
		}
	};
});

/**
 * parse cookie str.
 */
global.PARSE_COOKIE_STR = PARSE_COOKIE_STR = METHOD({

	run : function(str) {
		'use strict';
		//OPTIONAL: str

		var
		// splits
		splits,

		// data
		data = {};

		if (str !== undefined) {

			splits = str.split(';');

			EACH(splits, function(cookie) {

				var
				// parts
				parts = cookie.split('=');

				data[parts[0].trim()] = decodeURIComponent(parts[1]);
			});
		}

		return data;
	}
});

/**
 * create cookie str array.
 */
global.CREATE_COOKIE_STR_ARRAY = CREATE_COOKIE_STR_ARRAY = METHOD({

	run : function(data) {
		'use strict';
		//REQUIRED: data

		var
		// strs
		strs = [];

		EACH(data, function(value, name) {
			if (CHECK_IS_DATA(value) === true) {
				strs.push(name + '=' + encodeURIComponent(value.value)
					+ (value.expireSeconds === undefined ? '' : '; expires=' + new Date(Date.now() + value.expireSeconds * 1000).toGMTString())
					+ (value.path === undefined ? '' : '; path=' + value.path)
					+ (value.domain === undefined ? '' : '; domain=' + value.domain));
			} else {
				strs.push(name + '=' + encodeURIComponent(value));
			}
		});

		return strs;
	}
});

/**
 * get cpu usages.
 */
global.CPU_USAGES = METHOD(function(m) {
	
	var
	//IMPORT: os
	os = require('os');
	
	return {
		
		run : function() {
			'use strict';
			
			var
			// cpu infos
			cpuInfos = os.cpus(),
			
			// usages
			usages = [];
			
			EACH(cpuInfos, function(cpuInfo) {
				
				var
				// total
				total = 0,
				
				// idle time
				idleTime;
				
				EACH(cpuInfo.times, function(time, type) {
					total += time;
					if (type === 'idle') {
						idleTime = time;
					}
				});
				
				usages.push((1 - idleTime / total) * 100);
			});
			
			return usages;
		}
	};
});

/**
 * get memory usage.
 */
global.MEMORY_USAGE = METHOD(function(m) {
	
	var
	//IMPORT: os
	os = require('os'),
	
	// total memory
	totalMemory = os.totalmem();
	
	return {
		
		run : function() {
			'use strict';
			
			var
			// free memory
			freeMemory = os.freemem();
			
			return (1 - freeMemory / totalMemory) * 100;
		}
	};
});
