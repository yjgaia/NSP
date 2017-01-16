/*

Welcome to UPPERCASE-CORE! (http://uppercase.io)

*/

// 웹 브라우저 환경에서는 window가 global 객체 입니다.
global = window;

/**
 * 기본 설정
 */
global.CONFIG = {
	
	// 개발 모드 설정
	isDevMode : false
};

/**
 * 메소드를 생성합니다.
 */
global.METHOD = function(define) {
	'use strict';
	//REQUIRED: define		메소드 정의 구문
	//REQUIRED: define.run	메소드 실행 구문

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
	if (typeof define === 'function') {
		funcs = define(m);
	}

	// when define is function set
	else {
		funcs = define;
	}

	// init funcs.
	if (funcs !== undefined) {
		run = funcs.run;
	}

	return m;
};

/**
 * DB의 update 기능을 사용할 때, 데이터의 특정 값에 TO_DELETE를 지정하게 되면 해당 값이 삭제됩니다.
 * 자세한 것은 DB의 update 예제를 살펴보시기 바랍니다.
 *
 * 참고로 UPPERCASE 기반 프로젝트에서 이 TO_DELETE만이 null이 될 수 있는 유일한 변수입니다.
 * 다른 변수에서는 null을 사용하지 않고 undefined를 사용해 주시기 바랍니다.
 */
global.TO_DELETE = null;

/**
 * BOX를 생성합니다.
 */
global.BOX = METHOD(function(m) {
	'use strict';

	var
	// boxes
	boxes = {},

	// get all boxes.
	getAllBoxes;

	m.getAllBoxes = getAllBoxes = function() {
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
							box[packNameSp] = {};
						}
						
						pack = box[packNameSp];
					}
					
					else {

						if (pack[packNameSp] === undefined) {
							pack[packNameSp] = {};
						}
						
						pack = pack[packNameSp];
					}
				});

				return pack;
			};

			box.type = BOX;
			box.boxName = boxName;

			global[boxName] = boxes[boxName] = box;
			
			if (CONFIG[boxName] === undefined) {
				CONFIG[boxName] = {};
			}

			FOR_BOX.inject(box);

			return box;
		}
	};
});

/**
 * 모든 박스를 대상으로 하는 메소드와 클래스, 싱글톤 객체를 선언할 때 사용합니다.
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

			EACH(BOX.getAllBoxes(), function(box) {
				func(box);
			});

			funcs.push(func);
		}
	};
});

/*
 * 콘솔에 오류 메시지를 출력합니다.
 */
global.SHOW_ERROR = function(tag, errorMsg, params) {
	//REQUIRED: tag
	//REQUIRED: errorMsg
	//OPTIONAL: params
		
	console.error('[' + tag + '] 오류가 발생했습니다. 오류 메시지: ' + errorMsg);
	
	if (params !== undefined) {
		console.error('다음은 오류를 발생시킨 파라미터입니다.');
		console.error(JSON.stringify(params, TO_DELETE, 4));
	}
};
/*
 * 콘솔에 경고 메시지를 출력합니다.
 */
global.SHOW_WARNING = function(tag, warningMsg, params) {
	//REQUIRED: tag
	//REQUIRED: warningMsg
	//OPTIONAL: params
	
	console.warn('[' + tag + '] 경고가 발생했습니다. 경고 메시지: ' + warningMsg);
	
	if (params !== undefined) {
		console.warn('다음은 경고를 발생시킨 파라미터입니다.');
		console.warn(JSON.stringify(params, TO_DELETE, 4));
	}
};
/**
 * 클래스를 생성합니다.
 */
global.CLASS = METHOD(function(m) {
	'use strict';

	var
	// instance count
	instanceCount = 0,

	// get next instance id.
	getNextInstanceId;

	m.getNextInstanceId = getNextInstanceId = function() {

		instanceCount += 1;

		return instanceCount - 1;
	};

	return {

		run : function(define) {
			//REQUIRED: define	클래스 정의 구문

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
			cls,

			// inner init.
			innerInit,

			// inner after init.
			innerAfterInit;
			
			cls = function(params, funcs) {
				//OPTIONAL: params
				//OPTIONAL: funcs

				var
				// inner (protected)
				inner = {},

				// self (public)
				self = {
					
					type : cls,
					
					id : getNextInstanceId(),
					
					checkIsInstanceOf : function(checkCls) {
	
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
					}
				};
				
				params = innerInit(inner, self, params, funcs);

				innerAfterInit(inner, self, params, funcs);

				return self;
			};
			
			if ( typeof define === 'function') {
				funcs = define(cls);
			} else {
				funcs = define;
			}

			if (funcs !== undefined) {
				preset = funcs.preset;
				init = funcs.init;
				_params = funcs.params;
				afterInit = funcs.afterInit;
			}

			cls.type = CLASS;
			cls.id = getNextInstanceId();

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

					if (params === undefined) {
						params = _params(cls);
					}
					
					else if (CHECK_IS_DATA(params) === true) {

						tempParams = _params(cls);

						if (tempParams !== undefined) {
							extend(params, tempParams);
						}
					}
					
					else {
						paramValue = params;
						params = _params(cls);
					}
				}

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

				if (init !== undefined) {
					init(inner, self, paramValue === undefined ? params : paramValue, funcs);
				}

				return params;
			};

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

				if (afterInit !== undefined) {
					afterInit(inner, self, params, funcs);
				}
			};

			return cls;
		}
	};
});

/**
 * 모든 정의된 싱글톤 객체의 초기화를 수행합니다.
 */
global.INIT_OBJECTS = METHOD({

	run : function() {
		'use strict';

		OBJECT.initObjects();
	}
});

/**
 * 실글톤 객체를 생성합니다.
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
		//REQUIRED: object	초기화 할 싱글톤 객체

		var
		// cls
		cls = object.type,

		// inner (protected)
		inner = {},

		// params
		params = {};

		// set id.
		object.id = CLASS.getNextInstanceId();

		cls.innerInit(inner, object, params);
		cls.innerAfterInit(inner, object, params);
	};

	addReadyObject = function(object) {
		//REQUIRED: object	초기화를 대기시킬 싱글톤 객체

		if (isInited === true) {
			initObject(object);
		} else {
			readyObjects.push(object);
		}
	};

	m.removeReadyObject = removeReadyObject = function(object) {
		//REQUIRED: object	대기열에서 삭제할 싱글톤 객체
		
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
			//REQUIRED: define	클래스 정의 구문

			var
			// cls
			cls = CLASS(define),

			// self
			self = {
				
				type : cls,
				
				checkIsInstanceOf : function(checkCls) {

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
				}
			};
			
			addReadyObject(self);

			return self;
		}
	};
});

/**
 * target이 JavaScript arguments인지 확인합니다.
 */
global.CHECK_IS_ARGUMENTS = METHOD({

	run : function(target) {'use strict';
		//OPTIONAL: target

		if (
		target !== undefined &&
		target !== TO_DELETE &&
		typeof target === 'object' &&
		(
			Object.prototype.toString.call(target) === '[object Arguments]' ||
			(
				target.callee !== undefined &&
				typeof target.callee === 'function'
			)
		)) {
			return true;
		}

		return false;
	}
});

/**
 * 주어진 비동기 함수들을 순서대로 실행합니다.
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
 * 오버라이딩을 수행합니다.
 */
global.OVERRIDE = METHOD({

	run : function(origin, func) {
		'use strict';
		//REQUIRED: origin	오버라이드 할 대상
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
 * 주어진 비동기 함수들을 병렬로 실행합니다.
 */
global.PARALLEL = METHOD({

	run : function(dataOrArrayOrCount, funcs) {
		'use strict';
		//OPTIONAL: dataOrArrayOrCount
		//REQUIRED: funcs

		var
		// property count
		propertyCount,
		
		// done count
		doneCount = 0;

		// only funcs
		if (funcs === undefined) {
			funcs = dataOrArrayOrCount;
			
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
		
		else if (dataOrArrayOrCount === undefined) {
			funcs[1]();
		}
		
		else if (CHECK_IS_DATA(dataOrArrayOrCount) === true) {
			
			propertyCount = COUNT_PROPERTIES(dataOrArrayOrCount);

			if (propertyCount === 0) {
				funcs[1]();
			} else {

				EACH(dataOrArrayOrCount, function(value, name) {

					funcs[0](value, function() {

						doneCount += 1;

						if (doneCount === propertyCount) {
							funcs[1]();
						}
					}, name);
				});
			}
		}
		
		else if (CHECK_IS_ARRAY(dataOrArrayOrCount) === true) {
	
			if (dataOrArrayOrCount.length === 0) {
				funcs[1]();
			} else {

				EACH(dataOrArrayOrCount, function(value, i) {

					funcs[0](value, function() {

						doneCount += 1;

						if (doneCount === dataOrArrayOrCount.length) {
							funcs[1]();
						}
					}, i);
				});
			}
		}
		
		// when dataOrArrayOrCount is count
		else {
	
			if (dataOrArrayOrCount === 0) {
				funcs[1]();
			} else {

				REPEAT(dataOrArrayOrCount, function(i) {

					funcs[0](i, function() {

						doneCount += 1;

						if (doneCount === dataOrArrayOrCount) {
							funcs[1]();
						}
					});
				});
			}
		}
	}
});

/**
 * JSON 문자열을 원래 데이터나 배열, 값으로 변환합니다.
 */
global.PARSE_STR = METHOD({

	run : function(dataStr) {
		'use strict';
		//REQUIRED: dataStr

		var
		// data
		data,
		
		// array
		array;

		try {

			data = JSON.parse(dataStr);
			
			if (CHECK_IS_DATA(data) === true) {
				return UNPACK_DATA(data);
			}
			
			else if (CHECK_IS_ARRAY(data) === true) {
				
				array = [];
				
				EACH(data, function(data) {
					array.push(UNPACK_DATA(data));
				});
				
				return array;
			}
			
			else {
				return data;
			}

		} catch(e) {

			// when error, return undefined.
			return undefined;
		}
	}
});

/**
 * 알파벳 대, 소문자와 숫자로 이루어진 임의의 문자열을 생성합니다.
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
 * 데이터나 배열, 값을 JSON 문자열로 변환합니다.
 */
global.STRINGIFY = METHOD({

	run : function(data) {
		'use strict';
		//REQUIRED: data
		
		var
		// array
		array;
		
		if (CHECK_IS_DATA(data) === true) {
			return JSON.stringify(PACK_DATA(data));
		}
		
		else if (CHECK_IS_ARRAY(data) === true) {
			
			array = [];
			
			EACH(data, function(data) {
				array.push(PACK_DATA(data));
			});
			
			return JSON.stringify(array);
		}
		
		else {
			return JSON.stringify(data);
		}
	}
});

/**
 * 테스트용 메소드입니다.
 * 
 * 테스트에 성공하거나 실패하면 콘솔에 메시지를 출력합니다.
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
					console.log('[' + name + ' 테스트] 테스트를 통과하였습니다. 총 ' + errorCount + '개의 오류가 있습니다.');
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

					console.log('[' + name + ' 테스트] ' + line + '에서 오류가 발견되었습니다. 총 ' + errorCount + '개의 오류가 있습니다.');
				}
			});
		}
	};
});

/**
 * URI가 주어진 포맷에 맞는지 확인하는 URI_MATCHER 클래스
 * 
 * 포맷에 파라미터 구간을 지정할 수 있어 URI로부터 파라미터 값을 가져올 수 있습니다.
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
 * 데이터를 검증하고, 어떤 부분이 잘못되었는지 오류를 확인할 수 있는 VALID 클래스
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

	// mongoId.
	mongoId,

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
		//REQUIRED: params.value
		//REQUIRED: params.pattern

		var
		// string
		str = String(params.value),
		
		// pattern
		pattern = params.pattern;

		return str === str.match(pattern)[0];
	};

	cls.size = size = function(params) {
		//REQUIRED: params
		//REQUIRED: params.value
		//OPTIONAL: params.min
		//REQUIRED: params.max

		var
		// string
		str = String(params.value),
		
		// min
		min = params.min,

		// max
		max = params.max;
		
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
		//REQUIRED: params.value
		//REQUIRED: params.min

		var
		// value
		value = params.value,
		
		// min
		min = params.min;

		return real(value) === true && min <= value;
	};

	cls.max = max = function(params) {
		//REQUIRED: params
		//REQUIRED: params.value
		//REQUIRED: params.max

		var
		// value
		value = params.value,
		
		// max
		max = params.max;

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
	cls.mongoId = mongoId = function(value) {
		//REQUIRED: value

		return typeof value === 'string' && notEmpty(value) === true && value.match(/[0-9a-f]{24}/) !== TO_DELETE && value.length === 24;
	};

	cls.one = one = function(params) {
		//REQUIRED: params
		//REQUIRED: params.value
		//REQUIRED: params.array

		var
		// value
		value = params.value,
		
		// array
		array = params.array;

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
		//OPTIONAL: params.isToWash

		var
		// array
		array = params.array,

		// valid
		valid = VALID({
			_ : params.validData
		}),
		
		// is to wash
		isToWash = params.isToWash;
		
		return EACH(array, function(value) {
			if ((isToWash === true ? valid.checkAndWash : valid.check)({
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
		//OPTIONAL: params.isToWash

		var
		// array
		data = params.data,

		// valid
		valid = VALID({
			_ : params.validData
		}),
		
		// is to wash
		isToWash = params.isToWash;
		
		return EACH(data, function(value) {
			if ((isToWash === true ? valid.checkAndWash : valid.check)({
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
		//OPTIONAL: params.isToWash

		var
		// data
		data = params.data,

		// valid
		valid = VALID(params.validDataSet),
		
		// is to wash
		isToWash = params.isToWash;
		
		return (isToWash === true ? valid.checkAndWash : valid.check)(data).checkHasError() !== true;
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
					//OPTIONAL: params.isToWash
					//OPTIONAL: params.isForUpdate

					var
					// data
					data = params.data,

					// is to wash
					isToWash = params.isToWash,
					
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

								if (isToWash === true && name !== 'notEmpty' && notEmpty(value) !== true) {
									
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
										array : value,
										isToWash : isToWash
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
										data : value,
										isToWash : isToWash
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
										data : value,
										isToWash : isToWash
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

									if (cls[name === 'id' ? 'mongoId' : name](value) === false) {

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

					if (isToWash === true) {
						
						EACH(data, function(value, attr) {
							if (validDataSet[attr] === undefined) {
								delete data[attr];
							}
						});
					}

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

			// check and wash.
			checkAndWash,
			
			// check for update.
			checkForUpdate,
			
			// get valid data set.
			getValidDataSet;

			self.check = check = function(data) {
				return Check({
					data : data
				});
			};

			self.checkAndWash = checkAndWash = function(data) {
				return Check({
					data : data,
					isToWash : true
				});
			};

			self.checkForUpdate = checkForUpdate = function(data) {
				return Check({
					data : data,
					isToWash : true,
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
 * 배열 안의 모든 요소들이 동일한지 확인합니다.
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
 * target이 배열인지 확인합니다.
 */
global.CHECK_IS_ARRAY = METHOD({

	run : function(target) {
		'use strict';
		//OPTIONAL: target

		if (
		target !== undefined &&
		target !== TO_DELETE &&
		typeof target === 'object' &&
		Object.prototype.toString.call(target) === '[object Array]') {
			return true;
		}

		return false;
	}
});

/**
 * target이 데이터인지 확인합니다.
 */
global.CHECK_IS_DATA = METHOD({

	run : function(target) {
		'use strict';
		//OPTIONAL: target

		if (
		target !== undefined &&
		target !== TO_DELETE &&
		CHECK_IS_ARGUMENTS(target) !== true &&
		CHECK_IS_ARRAY(target) !== true &&
		target instanceof Date !== true &&
		target instanceof RegExp !== true &&
		typeof target === 'object') {
			return true;
		}

		return false;
	}
});

/**
 * 데이터가 아무런 값이 없는 빈 데이터({})인지 확인합니다.
 */
global.CHECK_IS_EMPTY_DATA = METHOD({

	run : function(data) {
		'use strict';
		//REQUIRED: data

		return CHECK_ARE_SAME([data, {}]);
	}
});

/**
 * 데이터 내 값들의 개수를 반환합니다.
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
 * 주어진 데이터의 값들 중 Date형은 정수형태로, RegExp형은 문자열 형태로 변환한 데이터를 반환합니다.
 */
global.PACK_DATA = METHOD({

	run : function(data) {
		'use strict';
		//REQUIRED: data

		var
		// result
		result = COPY(data),

		// date property names
		dateNames = [],
		
		// regex property names
		regexNames = [];

		EACH(result, function(value, name) {

			if (value instanceof Date === true) {

				// change to timestamp integer.
				result[name] = INTEGER(value.getTime());
				dateNames.push(name);
			}
			
			else if (value instanceof RegExp === true) {

				// change to string.
				result[name] = value.toString();
				regexNames.push(name);
			}

			else if (CHECK_IS_DATA(value) === true) {
				result[name] = PACK_DATA(value);
			}

			else if (CHECK_IS_ARRAY(value) === true) {

				EACH(value, function(v, i) {

					if (CHECK_IS_DATA(v) === true) {
						value[i] = PACK_DATA(v);
					}
				});
			}
		});

		result.__D = dateNames;
		result.__R = regexNames;

		return result;
	}
});

/**
 * PACK_DATA가 적용된 데이터의 값들 중 정수형태로 변환된 Date형과 문자열 형태로 변환된 RegExp형을 원래대로 되돌린 데이터를 반환합니다.
 */
global.UNPACK_DATA = METHOD({

	run : function(packedData) {
		'use strict';
		//REQUIRED: packedData	PACK_DATA가 적용된 데이터

		var
		// result
		result = COPY(packedData);

		// when date property names exists
		if (result.__D !== undefined) {

			// change timestamp integer to Date type.
			EACH(result.__D, function(dateName, i) {
				result[dateName] = new Date(result[dateName]);
			});
			
			delete result.__D;
		}
		
		// when regex property names exists
		if (result.__R !== undefined) {

			// change string to RegExp type.
			EACH(result.__R, function(regexName, i) {
				
				var
				// pattern
				pattern = result[regexName],
				
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
				
				result[regexName] = new RegExp(pattern, flags);
			});
			
			delete result.__R;
		}

		EACH(result, function(value, name) {

			if (CHECK_IS_DATA(value) === true) {
				result[name] = UNPACK_DATA(value);
			}

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
 * 특정 값이 데이터나 배열에 존재하는지 확인합니다.
 */
global.CHECK_IS_IN = METHOD({

	run : function(params) {
		'use strict';
		//REQUIRED: params
		//OPTIONAL: params.data
		//OPTIONAL: params.array
		//REQUIRED: params.value	존재하는지 확인 할 값

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
 * 데이터들이나 배열들을 하나의 데이터나 배열로 합칩니다.
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

			if (CHECK_IS_DATA(first) === true) {

				result = {};

				EACH(dataSetOrArrays, function(data) {
					EXTEND({
						origin : result,
						extend : data
					});
				});
			}

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
 * 데이터나 배열을 복제합니다.
 */
global.COPY = METHOD({

	run : function(dataOrArray) {
		'use strict';
		//REQUIRED: dataOrArray

		var
		// copy
		copy;

		if (CHECK_IS_DATA(dataOrArray) === true) {

			copy = {};

			EXTEND({
				origin : copy,
				extend : dataOrArray
			});
		}

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
 * 데이터나 배열을 덧붙혀 확장합니다.
 */
global.EXTEND = METHOD({

	run : function(params) {
		'use strict';
		//REQUIRED: params
		//REQUIRED: params.origin	기존 데이터나 배열
		//REQUIRED: params.extend	덧붙힐 데이터나 배열

		var
		// origin
		origin = params.origin,

		// extend
		extend = params.extend;

		if (CHECK_IS_DATA(origin) === true) {

			EACH(extend, function(value, name) {
				
				var
				// pattern
				pattern,
				
				// flags
				flags,
				
				// i
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

		else if (CHECK_IS_ARRAY(origin) === true) {

			EACH(extend, function(value) {
				
				var
				// pattern
				pattern,
				
				// flags
				flags,
				
				// i
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
 * 데이터나 배열의 특정 값을 찾아, 데이터인 경우 그 값에 해당하는 이름을, 배열인 경우 그 값에 해당하는 키(index)를 반환합니다.
 */
global.FIND = METHOD({

	run : function(dataOrArrayOrParams, filter) {
		'use strict';
		//REQUIRED: dataOrArrayOrParams
		//OPTIONAL: dataOrArrayOrParams.data
		//OPTIONAL: dataOrArrayOrParams.array
		//REQUIRED: dataOrArrayOrParams.value	찾을 값
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

		if (filter !== undefined) {

			if (CHECK_IS_DATA(dataOrArrayOrParams) === true) {

				EACH(dataOrArrayOrParams, function(value, name) {

					// value passed filter.
					if (filter(value, name) === true) {
						ret = value;
						return false;
					}
				});
			}

			else if (CHECK_IS_ARRAY(dataOrArrayOrParams) === true) {

				EACH(dataOrArrayOrParams, function(value, key) {

					// value passed filter.
					if (filter(value, key) === true) {
						ret = value;
						return false;
					}
				});
			}
		}

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
 * 데이터나 배열의 특정 값을 삭제합니다.
 */
global.REMOVE = METHOD({

	run : function(dataOrArrayOrParams, filter) {
		'use strict';
		//REQUIRED: dataOrArrayOrParams
		//OPTIONAL: dataOrArrayOrParams.data
		//OPTIONAL: dataOrArrayOrParams.array
		//OPTIONAL: dataOrArrayOrParams.name	데이터에서 삭제할 값의 이름
		//OPTIONAL: dataOrArrayOrParams.key		배열에서 삭제할 값의 키 (index)
		//OPTIONAL: dataOrArrayOrParams.value	삭제할 값, 이 값을 찾아 삭제합니다.
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
		
		if (filter !== undefined) {

			if (CHECK_IS_DATA(dataOrArrayOrParams) === true) {

				EACH(dataOrArrayOrParams, function(value, name) {

					// remove value passed filter.
					if (filter(value, name) === true) {

						REMOVE({
							data : dataOrArrayOrParams,
							name : name
						});
					}
				});
			}

			else if (CHECK_IS_ARRAY(dataOrArrayOrParams) === true) {

				EACH(dataOrArrayOrParams, function(value, key) {

					// remove value passed filter.
					if (filter(value, key) === true) {

						REMOVE({
							array : dataOrArrayOrParams,
							key : key
						});
					}
				});
			}
		}

		else {

			// init params.
			data = dataOrArrayOrParams.data;
			array = dataOrArrayOrParams.array;
			name = dataOrArrayOrParams.name;
			key = dataOrArrayOrParams.key;
			value = dataOrArrayOrParams.value;

			if (name !== undefined) {
				delete data[name];
			}

			if (key !== undefined) {
				array.splice(key, 1);
			}

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
 * 날짜를 처리할 때 Date형을 좀 더 쓰기 편하도록 개선한 CALENDAR 클래스
 */
global.CALENDAR = CLASS({

	init : function(inner, self, date) {
		'use strict';
		//OPTIONAL: date	입력하지 않으면 현재 시각을 기준으로 생성합니다.

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
			//OPTIONAL: isFormal	true로 설정하면 10보다 작은 수일 경우 앞에 0을 붙힌 문자열을 반환합니다. ex) 01, 04, 09
			
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
			//OPTIONAL: isFormal	true로 설정하면 10보다 작은 수일 경우 앞에 0을 붙힌 문자열을 반환합니다. ex) 01, 04, 09
			
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
			//OPTIONAL: isFormal	true로 설정하면 10보다 작은 수일 경우 앞에 0을 붙힌 문자열을 반환합니다. ex) 01, 04, 09
			
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
			//OPTIONAL: isFormal	true로 설정하면 10보다 작은 수일 경우 앞에 0을 붙힌 문자열을 반환합니다. ex) 01, 04, 09
			
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
			//OPTIONAL: isFormal	true로 설정하면 10보다 작은 수일 경우 앞에 0을 붙힌 문자열을 반환합니다. ex) 01, 04, 09
			
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
 * Date형 값을 생성합니다.
 */
global.CREATE_DATE = METHOD({

	run : function(params) {
		'use strict';
		//REQUIRED: params
		//OPTIONAL: params.year		년
		//OPTIONAL: params.month	월
		//OPTIONAL: params.date		일
		//OPTIONAL: params.hour		시
		//OPTIONAL: params.minute	분
		//OPTIONAL: params.second	초
		
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
 * 주어진 초가 흐른 뒤에 함수를 실행하는 DELAY 클래스
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
					func();
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
 * 주어진 초 마다 함수를 반복해서 실행하는 INTERVAL 클래스
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
 * 아주 짧은 시간동안 반복해서 실행하는 로직을 작성할때 사용하는 LOOP 클래스
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

				// delta time
				deltaTime = time - beforeTime,

				// loop info
				loopInfo,

				// count
				count,

				// interval
				interval,

				// i, j
				i, j;

				if (deltaTime > 0) {

					for (i = 0; i < loopInfos.length; i += 1) {

						loopInfo = loopInfos[i];

						if (loopInfo.fps !== undefined && loopInfo.fps > 0) {

							if (loopInfo.timeSigma === undefined) {
								loopInfo.timeSigma = 0;
								loopInfo.countSigma = 0;
							}

							// calculate count.
							count = parseInt(loopInfo.fps / (1000 / deltaTime) * (loopInfo.timeSigma / deltaTime + 1), 10) - loopInfo.countSigma;

							// start.
							if (loopInfo.start !== undefined) {
								loopInfo.start();
							}

							// run interval.
							interval = loopInfo.interval;
							for (j = 0; j < count; j += 1) {
								interval(loopInfo.fps);
							}

							// end.
							if (loopInfo.end !== undefined) {
								loopInfo.end(deltaTime);
							}

							loopInfo.countSigma += count;

							loopInfo.timeSigma += deltaTime;
							if (loopInfo.timeSigma > 1000) {
								loopInfo.timeSigma = undefined;
							}
						}
					}

					// run runs.
					for (i = 0; i < runs.length; i += 1) {
						runs[i](deltaTime);
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

		init : function(inner, self, fpsOrRun, intervalOrFuncs) {
			//OPTIONAL: fpsOrRun
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
						fps : fpsOrRun,
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

			// when fpsOrRun is run
			else {
				
				self.resume = resume = RAR(function() {
					
					runs.push(run = fpsOrRun);
					
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
 * 주어진 함수를 즉시 실행하고, 함수를 반환합니다.
 * 
 * 선언과 동시에 실행되어야 하는 함수를 선언할 때 유용합니다.
 */
global.RAR = METHOD({

	run : function(params, func) {
		'use strict';
		//OPTIONAL: params
		//REQUIRED: func

		// if func is undefined, func is params.
		if (func === undefined) {
			func = params;
			params = undefined;
		}

		func(params);

		return func;
	}
});

/**
 * 주어진 함수를 즉시 실행합니다.
 * 
 * 새로운 코드 블록이 필요할 때 사용합니다.
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
 * 정수 문자열을 정수 값으로 변환합니다.
 */
global.INTEGER = METHOD({

	run : function(integerString) {
		'use strict';
		//OPTIONAL: integerString

		return integerString === undefined ? undefined : parseInt(integerString, 10);
	}
});

/**
 * 임의의 정수를 생성합니다.
 */
global.RANDOM = METHOD({

	run : function(limitOrParams) {
		'use strict';
		//REQUIRED: limitOrParams
		//OPTIONAL: limitOrParams.min	생성할 정수 범위 최소값, 이 값 이상인 값만 생성합니다.
		//OPTIONAL: limitOrParams.max	생성할 정수 범위 최대값, 이 값 이하인 값만 생성합니다.
		//OPTIONAL: limitOrParams.limit	생성할 정수 범위 제한값, 이 값 미만인 값만 생성합니다.

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
 * 실수 문자열을 실수 값으로 변환합니다.
 */
global.REAL = METHOD({

	run : function(realNumberString) {
		'use strict';
		//OPTIONAL: realNumberString

		return realNumberString === undefined ? undefined : parseFloat(realNumberString);
	}
});

/**
 * 데이터나 배열, 문자열의 각 요소를 순서대로 대입하여 주어진 함수를 실행합니다.
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

		if (dataOrArrayOrString === undefined) {
			return false;
		}

		else if (CHECK_IS_DATA(dataOrArrayOrString) === true) {

			for (name in dataOrArrayOrString) {
				if (dataOrArrayOrString.hasOwnProperty === undefined || dataOrArrayOrString.hasOwnProperty(name) === true) {
					if (func(dataOrArrayOrString[name], name) === false) {
						return false;
					}
				}
			}
		}

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
 * 주어진 함수를 주어진 횟수만큼 반복해서 실행합니다.
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
 * 데이터나 배열, 문자열의 각 요소를 역순으로 대입하여 주어진 함수를 실행합니다.
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

global.ADD_FOND = METHOD({

	run : function() {
		'use strict';
		
		//TODO:
	}
});


OVERRIDE(BOX, function(origin) {
	
	/**
	 * BOX를 생성합니다.
	 */
	global.BOX = METHOD(function(m) {
		'use strict';
		
		m.getAllBoxes = origin.getAllBoxes;
		
		return {
			
			run : function(boxName) {
				//REQUIRED: boxName
				'use strict';
				
				if (BROWSER_CONFIG[boxName] === undefined) {
					BROWSER_CONFIG[boxName] = {};
				}
		
				return origin(boxName);
			}
		};
	});
});

/**
 * 웹 브라우저 환경에서의 기본 설정
 */
global.BROWSER_CONFIG = {
	
	isSecure : location.protocol === 'https:',
	
	host : location.hostname,
	
	port : location.port === '' ? (location.protocol === 'https:' ? 443 : 80) : INTEGER(location.port)
};

/*
 * WEB_SOCKET_SERVER로 생성한 웹 소켓 서버에 연결합니다.
 */
global.CONNECT_TO_WEB_SOCKET_SERVER = METHOD({

	run : function(portOrParams, connectionListenerOrListeners) {
		'use strict';
		//REQUIRED: portOrParams
		//OPTIONAL: portOrParams.isSecure
		//OPTIONAL: portOrParams.host
		//REQUIRED: portOrParams.port
		//REQUIRED: connectionListenerOrListeners
		//REQUIRED: connectionListenerOrListeners.success
		//OPTIONAL: connectionListenerOrListeners.error

		var
		// is secure
		isSecure,
		
		// host
		host,

		// port
		port,

		// connection listener
		connectionListener,

		// error listener
		errorListener,

		// connection
		conn,

		// is connected
		isConnected,

		// method map
		methodMap = {},

		// send key
		sendKey = 0,

		// on.
		on,

		// off.
		off,

		// send.
		send,

		// run methods.
		runMethods;

		if (CHECK_IS_DATA(portOrParams) !== true) {
			port = portOrParams;
		} else {
			isSecure = portOrParams.isSecure;
			host = portOrParams.host;
			port = portOrParams.port;
		}
		
		if (isSecure === undefined) {
			isSecure = BROWSER_CONFIG.isSecure;
		}
		
		if (host === undefined) {
			host = BROWSER_CONFIG.host;
		}

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

		conn = new WebSocket((isSecure === true ? 'wss://': 'ws://') + host + ':' + port);

		conn.onopen = function() {

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
			send = function(methodNameOrParams, callback) {
				//REQUIRED: methodNameOrParams
				//REQUIRED: methodNameOrParams.methodName
				//OPTIONAL: methodNameOrParams.data
				//OPTIONAL: callback
				
				var
				// method name
				methodName,
				
				// data
				data,
				
				// callback name
				callbackName;
				
				if (CHECK_IS_DATA(methodNameOrParams) !== true) {
					methodName = methodNameOrParams;
				} else {
					methodName = methodNameOrParams.methodName;
					data = methodNameOrParams.data;
				}
				
				if (conn !== undefined) {
					
					conn.send(STRINGIFY({
						methodName : methodName,
						data : data,
						sendKey : sendKey
					}));
	
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
				}
			},

			// disconnect.
			function() {
				if (conn !== undefined) {
					conn.close();
					conn = undefined;
				}
			});
		};

		// receive data.
		conn.onmessage = function(e) {

			var
			// params
			params = PARSE_STR(e.data);

			if (params !== undefined) {
				runMethods(params.methodName, params.data, params.sendKey);
			}
		};

		// when disconnected
		conn.onclose = function() {
			runMethods('__DISCONNECTED');
		};

		// when error
		conn.onerror = function(error) {

			var
			// error msg
			errorMsg = error.toString();

			if (isConnected !== true) {

				if (errorListener !== undefined) {
					errorListener(errorMsg);
				} else {
					SHOW_ERROR('CONNECT_TO_WEB_SOCKET_SERVER', errorMsg);
				}

			} else {
				runMethods('__ERROR', errorMsg);
			}
		};
	}
});

/**
 * 웹 브라우저 정보를 담고 있는 객체
 */
global.INFO = OBJECT({

	init : function(inner, self) {
		'use strict';

		var
		// is touch mode
		isTouchMode = global.ontouchstart !== undefined,
		
		// is touching
		isTouching,
		
		// browser info
		browserInfo,

		// get lang.
		getLang,

		// change lang.
		changeLang,

		// check is touch mode.
		checkIsTouchMode,

		// get browser info.
		getBrowserInfo;

		self.getLang = getLang = function() {

			var
			// language
			lang = STORE('__INFO').get('lang');

			if (lang === undefined) {

				lang = navigator.language;

				if (lang.length > 2) {
					lang = lang.substring(0, 2);
				}

				lang = lang.toLowerCase();
			}

			return lang;
		};

		self.changeLang = changeLang = function(lang) {
			//REQUIRED: lang

			STORE('__INFO').save({
				name : 'lang',
				value : lang
			});

			location.reload();
		};

		self.checkIsTouchMode = checkIsTouchMode = function() {
			return isTouchMode;
		};

		self.getBrowserInfo = getBrowserInfo = function() {
			// using bowser. (https://github.com/ded/bowser)
			return {
				name : bowser.name,
				version : REAL(bowser.version)
			};
		};
		
		EVENT_LOW('mousemove', function() {
			if (isTouching !== true) {
				isTouchMode = false;
			}
		});
		
		EVENT_LOW('touchstart', function() {
			isTouchMode = true;
			isTouching = true;
		});
		
		EVENT_LOW('touchend', function() {
			DELAY(function() {
				isTouching = false;
			});
		});
	}
});

OVERRIDE(LOOP, function(origin) {
	
	/**
	 * 아주 짧은 시간동안 반복해서 실행하는 로직을 작성할때 사용하는 LOOP 클래스
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
			
			var
			// step.
			step;
	
			if (animationInterval === undefined) {
	
				beforeTime = Date.now();
	
				animationInterval = requestAnimationFrame(step = function() {
	
					var
					// time
					time = Date.now(),
	
					// delta time
					deltaTime = time - beforeTime,
	
					// loop info
					loopInfo,
	
					// count
					count,
	
					// interval
					interval,
	
					// i, j
					i, j;
	
					if (deltaTime > 0) {
	
						for (i = 0; i < loopInfos.length; i += 1) {
	
							loopInfo = loopInfos[i];
	
							if (loopInfo.fps !== undefined && loopInfo.fps > 0) {
	
								if (loopInfo.timeSigma === undefined) {
									loopInfo.timeSigma = 0;
									loopInfo.countSigma = 0;
								}
	
								// calculate count.
								count = parseInt(loopInfo.fps / (1000 / deltaTime) * (loopInfo.timeSigma / deltaTime + 1), 10) - loopInfo.countSigma;
	
								// start.
								if (loopInfo.start !== undefined) {
									loopInfo.start();
								}
	
								// run interval.
								interval = loopInfo.interval;
								for (j = 0; j < count; j += 1) {
									interval(loopInfo.fps);
								}
	
								// end.
								if (loopInfo.end !== undefined) {
									loopInfo.end(deltaTime);
								}
	
								loopInfo.countSigma += count;
	
								loopInfo.timeSigma += deltaTime;
								if (loopInfo.timeSigma > 1000) {
									loopInfo.timeSigma = undefined;
								}
							}
						}
	
						// run runs.
						for (i = 0; i < runs.length; i += 1) {
							runs[i](deltaTime);
						}
	
						beforeTime = time;
					}
					
					animationInterval = requestAnimationFrame(step);
				});
			}
		},
	
		// stop.
		stop = function() {
	
			if (loopInfos.length <= 0 && runs.length <= 0) {
	
				cancelAnimationFrame(animationInterval);
				animationInterval = undefined;
			}
		};
	
		return {
	
			init : function(inner, self, fpsOrRun, intervalOrFuncs) {
				//OPTIONAL: fpsOrRun
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
							fps : fpsOrRun,
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
	
				// when fpsOrRun is run
				else {
					
					self.resume = resume = RAR(function() {
						
						runs.push(run = fpsOrRun);
						
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
});

/**
 * INFO의 웹 애플리케이션 언어 설정 코드에 해당하는 문자열을 반환합니다.
 * 
 * 만약 알 수 없는 언어 설정 코드라면, 첫 문자열을 반환합니다.
 */
global.MSG = METHOD({

	run : function(msgs) {
		'use strict';
		//REQUIRED: msgs

		var
		// msg
		msg = msgs[INFO.getLang()];

		if (msg === undefined) {

			// get first msg.
			EACH(msgs, function(_msg) {
				msg = _msg;
				return false;
			});
		}

		return msg;
	}
});


/**
 * 사운드 파일을 재생하는 SOUND 클래스
 */
global.SOUND = CLASS(function(cls) {
	'use strict';

	var
	// audio context
	audioContext;

	return {

		init : function(inner, self, params) {
			//REQUIRED: params
			//OPTIONAL: params.ogg
			//OPTIONAL: params.mp3
			//OPTIONAL: params.isLoop

			var
			// ogg
			ogg = params.ogg,
			
			// mp3
			mp3 = params.mp3,

			// is loop
			isLoop = params.isLoop,

			// request
			request,

			// buffer
			buffer,

			// source
			source,
			
			// started at
			startedAt = 0,
			
			// paused at
			pausedAt = 0,

			// delayed.
			delayed,

			// play.
			play,

			// pause.
			pause,

			// stop.
			stop;
			
			// init audioContext.
			if (audioContext === undefined) {
				audioContext = new AudioContext();
			}
			
			request = new XMLHttpRequest();
			request.open('GET', new Audio().canPlayType('audio/ogg') !== '' ? ogg : mp3, true);
			request.responseType = 'arraybuffer';

			request.onload = function() {

				audioContext.decodeAudioData(request.response, function(_buffer) {

					var
					// gain
					gain = audioContext.createGain ? audioContext.createGain() : audioContext.createGainNode();

					buffer = _buffer;

					// default volume
					// support both webkitAudioContext or standard AudioContext
					gain.connect(audioContext.destination);
					gain.gain.value = 0.5;

					if (delayed !== undefined) {
						delayed();
					}
				});
			};
			request.send();

			self.play = play = function() {

				delayed = function() {

					source = audioContext.createBufferSource();
					// creates a sound source
					source.buffer = buffer;
					// tell the source which sound to play
					source.connect(audioContext.destination);
					// connect the source to the context's destination (the speakers)
					// support both webkitAudioContext or standard AudioContext

					source.loop = isLoop;
					
					startedAt = Date.now() - pausedAt;
					source.start(0, pausedAt / 1000);
					
					delayed = undefined;
				};

				if (buffer !== undefined) {
					delayed();
				}

				return self;
			};
			
			self.pause = pause = function() {
				if (source !== undefined) {
					source.stop(0);
					pausedAt = Date.now() - startedAt;
				}
			};

			self.stop = stop = function() {
				if (source !== undefined) {
					source.stop(0);
					pausedAt = 0;
				}
			};
		}
	};
});

/**
 * 저장소 클래스
 * 
 * 웹 브라우저가 종료되어도 저장된 값들이 보존됩니다.
 */
global.STORE = CLASS({

	init : function(inner, self, storeName) {
		'use strict';
		//REQUIRED: storeName

		var
		// save.
		save,

		// get.
		get,
		
		// all.
		all,

		// remove.
		remove,
		
		// gen full name.
		genFullName = function(name) {
			//REQUIRED: name

			return storeName + '.' + name;
		};

		self.save = save = function(params) {
			//REQUIRED: params
			//REQUIRED: params.name
			//REQUIRED: params.value

			var
			// name
			name = params.name,
			
			// value
			value = params.value;

			localStorage.setItem(genFullName(name), STRINGIFY(value));
		};

		self.get = get = function(name) {
			//REQUIRED: name

			var
			// value
			value = PARSE_STR(localStorage.getItem(genFullName(name)));

			if (value === TO_DELETE) {
				value = undefined;
			}

			return value;
		};

		self.remove = remove = function(name) {
			//REQUIRED: name
			
			localStorage.removeItem(genFullName(name));
		};
	}
});

FOR_BOX(function(box) {
	'use strict';

	box.STORE = CLASS({

		init : function(inner, self, storeName) {
			//REQUIRED: storeName

			var
			// store
			store = STORE(box.boxName + '.' + storeName),

			// save.
			save,

			// get.
			get,
			
			// remove.
			remove;

			self.save = save = store.save;

			self.get = get = store.get;
			
			self.remove = remove = store.remove;
		}
	});
});

/**
 * 노드에 스타일을 지정합니다.
 */
global.ADD_STYLE = METHOD({
	
	run : function(params) {
		'use strict';
		//REQUIRED: params
		//REQUIRED: params.node		스타일을 지정할 노드
		//REQUIRED: params.style	스타일 데이터

		var
		// node
		node = params.node,

		// style
		style = params.style,

		// el
		el = node.getWrapperEl();

		EACH(style, function(value, name) {

			var
			// resize event
			resizeEvent;
			
			if (value !== undefined) {

				// on display resize
				if (name === 'onDisplayResize') {

					resizeEvent = EVENT({
						name : 'resize'
					}, RAR(function() {

						// when this, value is function.
						ADD_STYLE({
							node : node,
							style : value(WIN_WIDTH(), WIN_HEIGHT())
						});
					}));

					// remove resize event when remove node.
					node.on('remove', function() {
						resizeEvent.remove();
					});

				} else {
					
					// flt -> float
					if (name === 'flt') {
						el.style.cssFloat = value;
					}

					// assume number value is px value.
					else if (typeof value === 'number' && name !== 'zIndex' && name !== 'opacity') {
						el.style[name] = value + 'px';
					}
					
					// set background image. (not need url prefix.)
					else if (name === 'backgroundImage' && value !== 'none') {
						el.style[name] = 'url(' + value + ')';
					}

					// set normal style.
					else {
						el.style[name] = value;
					}
				}
			}
		});
	}
});

/**
 * 노드에 애니메이션을 지정합니다.
 */
global.ANIMATE = METHOD(function(m) {
	'use strict';
	
	var
	// keyframes count
	keyframesCount = 0;
	
	return {
		
		run : function(params, animationEndHandler) {
			//REQUIRED: params
			//REQUIRED: params.node				애니메이션을 지정할 노드
			//REQUIRED: params.keyframes		애니메이션 키 프레임
			//OPTIONAL: params.duration			애니메이션 지속 시간 (입력하지 않으면 0.5)
			//OPTIONAL: params.timingFunction	애니메이션 작동 방식, 점점 빨라지거나, 점점 느려지거나, 점점 빨라졌다 끝에서 점점 느려지는 등의 처리 (입력하지 않으면 'ease', 'linear', 'ease', 'ease-in', 'ease-out' 사용 가능)
			//OPTIONAL: params.delay			애니메이션이 발동하기 전 지연 시간 (입력하지 않으면 0)
			//OPTIONAL: params.iterationCount	애니메이션을 몇번 발동시킬지 (입력하지 않으면 1, 계속 애니메이션이 발동되도록 하려면 'infinite' 지정)
			//OPTIONAL: params.direction		애니메이션의 방향 (입력하지 않으면 'normal', 'reverse', 'alternate', 'alternate-reverse' 사용 가능)
			//OPTIONAL: animationEndHandler		애니메이션이 끝날 때 호출될 핸들러
			
			var
			// node
			node = params.node,
	
			// keyframes
			keyframes = params.keyframes,
			
			// duration
			duration = params.duration === undefined ? 0.5 : params.duration,
			
			// timing function
			timingFunction = params.timingFunction === undefined ? 'ease' : params.timingFunction,
			
			// delay
			delay = params.delay === undefined ? 0 : params.delay,
			
			// iteration count
			iterationCount = params.iterationCount === undefined ? 1 : params.iterationCount,
			
			// direction
			direction = params.direction === undefined ? 'normal' : params.direction,
			
			// keyframes name
			keyframesName = '__KEYFRAMES_' + keyframesCount,
			
			// keyframes str
			keyframesStr = '',
			
			// keyframes start style
			keyframesStartStyle,
			
			// keyframes final style
			keyframesFinalStyle,
			
			// keyframes style el
			keyframesStyleEl;
			
			keyframesCount += 1;
			
			EACH(keyframes, function(style, key) {
				
				keyframesStr += key + '{';
	
				EACH(style, function(value, name) {
	
					if (typeof value === 'number' && name !== 'zIndex' && name !== 'opacity') {
						value = value + 'px';
					}
	
					keyframesStr += name.replace(/([A-Z])/g, '-$1').toLowerCase() + ':' + value + ';';
				});
	
				keyframesStr += '}';
	
				if (key === 'from' || key === '0%') {
					keyframesStartStyle = style;
				} else if (key === 'to' || key === '100%') {
					keyframesFinalStyle = style;
				}
			});
			
			// create keyframes style element.
			keyframesStyleEl = document.createElement('style');
			keyframesStyleEl.type = 'text/css';
			keyframesStyleEl.appendChild(document.createTextNode('@keyframes ' + keyframesName + '{' + keyframesStr + '}'));
			document.getElementsByTagName('head')[0].appendChild(keyframesStyleEl);
			
			node.addStyle(keyframesStartStyle);
			
			node.addStyle({
				animation : keyframesName + ' ' + duration + 's ' + timingFunction + ' ' + delay + 's ' + iterationCount + ' ' + direction
			});
			
			node.addStyle(keyframesFinalStyle);
	
			if (animationEndHandler !== undefined && iterationCount === 1) {
	
				DELAY(duration, function() {
					animationEndHandler(node);
				});
			}
		}
	};
});


/**
 * clear : 'both' 스타일이 지정된 div를 생성합니다.
 */
global.CLEAR_BOTH = METHOD({

	run : function() {
		'use strict';

		return DIV({
			style : {
				clear : 'both'
			}
		});
	}
});

/**
 * DOM 객체를 생성하고 다루는 클래스
 */
global.DOM = CLASS({

	preset : function() {
		'use strict';

		return NODE;
	},

	init : function(inner, self, params) {
		'use strict';
		//REQUIRED: params
		//OPTIONAL: params.tag		생설할 DOM 객체에 해당하는 태그 지정
		//OPTIONAL: params.el		태그를 지정하지 않고 HTML element를 직접 지정
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트
		//OPTIONAL: params.__TEXT	UPPERCASE가 문자열 DOM 객체를 생성하기 위해 내부적으로 사용하는 파라미터

		var
		// tag
		tag = params.tag,

		// HTML Element
		el = params.el,
		
		// id
		id = params.id,
		
		// cls
		cls = params.cls,

		// __TEXT
		__TEXT = params.__TEXT,

		// get el.
		getEl,

		// set el.
		setEl,

		// set attr.
		setAttr;

		// when tag is not undefined
		if (tag !== undefined) {

			if (tag === 'body') {
				el = document.body;
			} else if (tag === '__STRING') {
				el = document.createTextNode(__TEXT);
			} else {
				el = document.createElement(tag);
			}
		}

		// when tag is undefined, el is not undefined
		else if (el !== document.body && el.parentNode !== TO_DELETE) {

			self.setParent(DOM({
				el : el.parentNode
			}));
		}

		self.getEl = getEl = function() {
			return el;
		};

		inner.setEl = setEl = function(_el) {
			//REQUIRED: _el

			el = _el;

			inner.setDom(self);
		};

		setEl(el);

		inner.setAttr = setAttr = function(params) {
			//REQUIRED: params
			//REQUIRED: params.name
			//REQUIRED: params.value

			var
			// name
			name = params.name,

			// value
			value = params.value;

			el.setAttribute(name, value);
		};
		
		if (id !== undefined) {
			setAttr({
				name : 'id',
				value : id
			});
		}
		
		if (cls !== undefined) {
			setAttr({
				name : 'class',
				value : cls
			});
		}
	}
});

/**
 * DOM 트리 구조를 정의하기 위한 NODE 클래스
 */
global.NODE = CLASS({

	init : function(inner, self, params) {
		'use strict';
		//OPTIONAL: params
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		var
		// wrapper dom
		wrapperDom,

		// content dom
		contentDom,

		// wrapper el
		wrapperEl,

		// content el
		contentEl,

		// waiting after nodes
		waitingAfterNodes,

		// waiting before nodes
		waitingBeforeNodes,

		// parent node
		parentNode,

		// child nodes
		childNodes = [],

		// origin display
		originDisplay,
		
		// data
		data,

		// set wrapper dom.
		setWrapperDom,

		// set content dom.
		setContentDom,

		// set dom.
		setDom,

		// get wrapper dom.
		getWrapperDom,

		// get content dom.
		getContentDom,

		// get wrapper el.
		getWrapperEl,

		// get content el.
		getContentEl,

		// attach.
		attach,

		// append.
		append,

		// append to.
		appendTo,

		// prepend.
		prepend,

		// prepend to.
		prependTo,

		// after.
		after,

		// insert after.
		insertAfter,

		// before.
		before,

		// insert before.
		insertBefore,

		// get children.
		getChildren,

		// set parent.
		setParent,

		// get parent.
		getParent,

		// empty.
		empty,

		// remove.
		remove,

		// on.
		on,

		// off.
		off,

		// add style.
		addStyle,

		// get style.
		getStyle,

		// get width.
		getWidth,

		// get inner width.
		getInnerWidth,

		// get height.
		getHeight,

		// get inner height.
		getInnerHeight,

		// get left.
		getLeft,

		// get top.
		getTop,

		// hide.
		hide,

		// show.
		show,

		// check is showing.
		checkIsShowing,
		
		// scroll to.
		scrollTo,
		
		// get scroll left.
		getScrollLeft,
		
		// get scroll top.
		getScrollTop,
		
		// get scroll width.
		getScrollWidth,
		
		// get scroll height.
		getScrollHeight,
		
		// set data.
		setData,
		
		// get data.
		getData;

		inner.setWrapperDom = setWrapperDom = function(dom) {
			//REQUIRED: dom

			wrapperDom = dom;
			wrapperEl = dom.getEl();

			originDisplay = getStyle('display');

			on('show', function() {

				EACH(childNodes, function(childNode) {

					if (childNode.checkIsShowing() === true) {

						EVENT.fireAll({
							node : childNode,
							name : 'show'
						});

						EVENT.removeAll({
							node : childNode,
							name : 'show'
						});
					}
				});
			});
		};

		inner.setContentDom = setContentDom = function(dom) {
			//REQUIRED: dom

			contentDom = dom;
			contentEl = dom.getEl();
		};

		inner.setDom = setDom = function(dom) {
			//REQUIRED: dom

			setWrapperDom(dom);
			setContentDom(dom);
		};

		self.getWrapperDom = getWrapperDom = function() {
			return wrapperDom;
		};

		self.getContentDom = getContentDom = function() {
			return contentDom;
		};

		self.getWrapperEl = getWrapperEl = function() {
			return wrapperEl;
		};

		self.getContentEl = getContentEl = function() {
			return contentEl;
		};

		attach = function(node, index) {
			//REQUIRED: node
			//OPTIOANL: index

			setParent(node);

			if (index === undefined) {
				parentNode.getChildren().push(self);
			} else {
				parentNode.getChildren().splice(index, 0, self);
			}
			
			EVENT.fireAll({
				node : self,
				name : 'attach'
			});

			if (checkIsShowing() === true) {

				EVENT.fireAll({
					node : self,
					name : 'show'
				});

				EVENT.removeAll({
					node : self,
					name : 'show'
				});
			}

			// run after wating after nodes.
			if (waitingAfterNodes !== undefined) {
				EACH(waitingAfterNodes, function(node) {
					after(node);
				});
			}

			// run before wating before nodes.
			if (waitingBeforeNodes !== undefined) {
				EACH(waitingBeforeNodes, function(node) {
					before(node);
				});
			}
		};

		self.append = append = function(node) {
			//REQUIRED: node

			var
			// splits
			splits;

			// append child.
			if (CHECK_IS_DATA(node) === true) {
				node.appendTo(self);
			}

			// append textarea content.
			else if (self.type === TEXTAREA) {

				append(DOM({
					tag : '__STRING',
					__TEXT : String(node === undefined ? '' : node)
				}));
			}

			// append string.
			else {

				splits = String(node === undefined ? '' : node).split('\n');

				EACH(splits, function(text, i) {

					append(DOM({
						tag : '__STRING',
						__TEXT : text
					}));

					if (i < splits.length - 1) {
						append(BR());
					}
				});
			}
		};

		self.appendTo = appendTo = function(node) {
			//REQUIRED: node
			
			var
			// parent el
			parentEl = node.getContentEl();

			if (parentEl !== undefined) {
				
				parentEl.appendChild(wrapperEl);

				attach(node);
			}

			return self;
		};

		self.prepend = prepend = function(node) {
			//REQUIRED: node

			var
			// splits
			splits;

			// prepend child.
			if (CHECK_IS_DATA(node) === true) {
				node.prependTo(self);
			}

			// prepend textarea content.
			else if (self.type === TEXTAREA) {

				prepend(DOM({
					tag : '__STRING',
					__TEXT : String(node === undefined ? '' : node)
				}));
			}

			// prepend string.
			else {

				splits = String(node === undefined ? '' : node).split('\n');

				REPEAT({
					start : splits.length - 1,
					end : 0
				}, function(i) {

					prepend(DOM({
						tag : '__STRING',
						__TEXT : splits[i]
					}));

					if (i < splits.length - 1) {
						prepend(BR());
					}
				});
			}
		};

		self.prependTo = prependTo = function(node) {
			//REQUIRED: node

			var
			// parent el
			parentEl = node.getContentEl();

			if (parentEl !== undefined) {
				
				if (parentEl.childNodes[0] === undefined) {
					parentEl.appendChild(wrapperEl);
				} else {
					parentEl.insertBefore(wrapperEl, parentEl.childNodes[0]);
				}

				attach(node, 0);
			}

			return self;
		};

		self.after = after = function(node) {
			//REQUIRED: node

			var
			// splits
			splits;
			
			if (wrapperEl !== undefined) {
	
				// wait after node.
				if (wrapperEl.parentNode === TO_DELETE) {
	
					if (waitingAfterNodes === undefined) {
						waitingAfterNodes = [];
					}
	
					waitingAfterNodes.push(node);
				}
	
				// after node.
				else {
	
					// after child.
					if (CHECK_IS_DATA(node) === true) {
						node.insertAfter(self);
					}
	
					// after string.
					else {
	
						splits = String(node === undefined ? '' : node).split('\n');
	
						REPEAT({
							start : splits.length - 1,
							end : 0
						}, function(i) {
	
							after(DOM({
								tag : '__STRING',
								__TEXT : splits[i]
							}));
	
							if (i < splits.length - 1) {
								after(BR());
							}
						});
					}
				}
			}
		};

		self.insertAfter = insertAfter = function(node) {
			//REQUIRED: node

			var
			// before el
			beforeEl = node.getWrapperEl(),
			
			// now index
			nowIndex,
			
			// to index
			toIndex;
			
			if (beforeEl !== undefined) {
				
				beforeEl.parentNode.insertBefore(wrapperEl, beforeEl.nextSibling);
				
				nowIndex = FIND({
					array : node.getParent().getChildren(),
					value : self
				});
				
				toIndex = FIND({
					array : node.getParent().getChildren(),
					value : node
				}) + 1;

				attach(node.getParent(), nowIndex < toIndex ? toIndex - 1 : toIndex);
			}

			return self;
		};

		self.before = before = function(node) {
			//REQUIRED: node

			var
			// splits
			splits;
			
			if (wrapperEl !== undefined) {
	
				// wait before node.
				if (wrapperEl.parentNode === TO_DELETE) {
	
					if (waitingBeforeNodes === undefined) {
						waitingBeforeNodes = [];
					}
	
					waitingBeforeNodes.push(node);
				}
	
				// before node.
				else {
	
					// before child.
					if (CHECK_IS_DATA(node) === true) {
						node.insertBefore(self);
					}
	
					// before string.
					else {
	
						splits = String(node === undefined ? '' : node).split('\n');
	
						EACH(splits, function(text, i) {
	
							before(DOM({
								tag : '__STRING',
								__TEXT : text
							}));
	
							if (i < splits.length - 1) {
								before(BR());
							}
						});
					}
				}
			}
		};

		self.insertBefore = insertBefore = function(node) {
			//REQUIRED: node

			var
			// after el
			afterEl = node.getWrapperEl();

			if (afterEl !== undefined) {
				
				afterEl.parentNode.insertBefore(wrapperEl, afterEl);

				attach(node.getParent(), FIND({
					array : node.getParent().getChildren(),
					value : node
				}));
			}

			return self;
		};

		self.getChildren = getChildren = function() {
			return childNodes;
		};

		setParent = function(node) {
			//OPTIONAL: node
			
			if (parentNode !== undefined) {
				REMOVE({
					array : parentNode.getChildren(),
					value : self
				});
			}

			parentNode = node;
		};
		
		self.getParent = getParent = function() {
			return parentNode;
		};

		self.empty = empty = function() {
			EACH(childNodes, function(child) {
				child.remove();
			});
		};

		self.remove = remove = function() {

			if (wrapperEl !== undefined && wrapperEl.parentNode !== TO_DELETE) {

				// empty children.
				empty();

				// remove from parent node.
				wrapperEl.parentNode.removeChild(wrapperEl);

				setParent(undefined);

				// fire remove event.
				EVENT.fireAll({
					node : self,
					name : 'remove'
				});

				EVENT.removeAll({
					node : self
				});

				// free memory.
				wrapperEl = undefined;
				contentEl = undefined;
			}
			
			// free memory.
			data = undefined;
		};

		self.on = on = function(eventName, eventHandler) {
			//REQUIRED: eventName
			//REQUIRED: eventHandler

			EVENT({
				node : self,
				name : eventName
			}, eventHandler);
		};

		self.off = off = function(eventName, eventHandler) {
			//REQUIRED: eventName
			//OPTIONAL: eventHandler

			if (eventHandler !== undefined) {

				EVENT.remove({
					node : self,
					name : eventName
				}, eventHandler);

			} else {

				EVENT.removeAll({
					node : self,
					name : eventName
				});
			}
		};

		self.addStyle = addStyle = function(style) {
			//REQUIRED: style

			ADD_STYLE({
				node : self,
				style : style
			});
		};

		self.getStyle = getStyle = function(name) {
			//REQUIRED: name

			var
			// styles
			styles,

			// style
			style;

			if (wrapperEl !== undefined) {

				styles = wrapperEl.style;

				if (styles !== undefined) {

					style = styles[name];

					return style === '' ? undefined : (style.substring(style.length - 2) === 'px' ? REAL(style) : style);
				}
			}
		};

		self.getWidth = getWidth = function() {
			return wrapperEl.offsetWidth;
		};

		self.getInnerWidth = getInnerWidth = function() {
			return wrapperEl.clientWidth;
		};

		self.getHeight = getHeight = function() {
			return wrapperEl.offsetHeight;
		};

		self.getInnerHeight = getInnerHeight = function() {
			return wrapperEl.clientHeight;
		};

		self.getLeft = getLeft = function() {

			var
			// left
			left = 0,

			// parent el
			parentEl = wrapperEl;

			do {
				left += parentEl.offsetLeft - (parentEl === document.body ? 0 : parentEl.scrollLeft);
				parentEl = parentEl.offsetParent;
			} while (parentEl !== TO_DELETE);

			return left;
		};

		self.getTop = getTop = function() {

			var
			// top
			top = 0,

			// parent el
			parentEl = wrapperEl;

			do {
				top += parentEl.offsetTop - (parentEl === document.body ? 0 : parentEl.scrollTop);
				parentEl = parentEl.offsetParent;
			} while (parentEl !== TO_DELETE);

			return top;
		};

		self.hide = hide = function() {

			addStyle({
				display : 'none'
			});
		};

		self.show = show = function() {

			addStyle({
				display : originDisplay === undefined ? '' : originDisplay
			});

			if (checkIsShowing() === true) {

				EVENT.fireAll({
					node : self,
					name : 'show'
				});

				EVENT.removeAll({
					node : self,
					name : 'show'
				});
			}
		};

		self.checkIsShowing = checkIsShowing = function() {

			if (wrapperEl === document.body) {
				return true;
			} else {
				return parentNode !== undefined && parentNode.checkIsShowing() === true && getStyle('display') !== 'none';
			}
		};
		
		self.scrollTo = scrollTo = function(params) {
			//REQUIRED: params
			//OPTIONAL: params.left
			//OPTIONAL: params.top
			
			var
			// left
			left = params.left,
			
			// top
			top = params.top;
			
			if (contentEl !== undefined) {
			
				if (left !== undefined) {
					contentEl.scrollLeft = left;
				}
				
				if (top !== undefined) {
					contentEl.scrollTop = top;
				}
			}
		};
		
		self.scrollTo = scrollTo = function(params) {
			//REQUIRED: params
			//OPTIONAL: params.left
			//OPTIONAL: params.top
			
			var
			// left
			left = params.left,
			
			// top
			top = params.top;
			
			if (contentEl !== undefined) {
			
				if (left !== undefined) {
					contentEl.scrollLeft = left;
				}
				
				if (top !== undefined) {
					contentEl.scrollTop = top;
				}
			}
		};
		
		self.getScrollLeft = getScrollLeft = function() {
			if (contentEl !== undefined) {
				return contentEl.scrollLeft;
			} else {
				return 0;
			}
		};
		
		self.getScrollTop = getScrollTop = function() {
			if (contentEl !== undefined) {
				return contentEl.scrollTop;
			} else {
				return 0;
			}
		};
		
		self.getScrollWidth = getScrollWidth = function() {
			if (contentEl !== undefined) {
				return contentEl.scrollWidth;
			} else {
				return 0;
			}
		};
		
		self.getScrollHeight = getScrollHeight = function() {
			if (contentEl !== undefined) {
				return contentEl.scrollHeight;
			} else {
				return 0;
			}
		};
		
		self.setData = setData = function(_data) {
			//REQUIRED: _data
			
			data = _data;
		};
		
		self.getData = getData = function() {
			return data;
		};
	},

	afterInit : function(inner, self, params) {
		'use strict';
		//OPTIONAL: params
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		var
		// style
		style,

		// children
		children,

		// on
		on;

		// init params.
		if (params !== undefined) {
			style = params.style;
			children = params.c === undefined || CHECK_IS_ARRAY(params.c) === true ? params.c : [params.c];
			on = params.on;
		}

		if (style !== undefined) {
			self.addStyle(style);
		}

		if (on !== undefined) {
			EACH(on, function(handler, name) {
				self.on(name, handler);
			});
		}

		if (children !== undefined) {
			EACH(children, function(child, i) {
				self.append(child);
			});
		}
	}
});

/**
 * 이벤트 정보를 제공하는 객체를 생성하는 E 클래스
 */
global.E = CLASS({

	init : function(inner, self, params) {
		'use strict';
		//REQUIRED: params
		//REQUIRED: params.e
		//REQUIRED: params.el

		var
		// e
		e = params.e,

		// el
		el = params.el,

		// check is descendant.
		checkIsDescendant,

		// stop default.
		stopDefault,

		// stop bubbling.
		stopBubbling,

		// stop default and bubbling.
		stop,

		// get left.
		getLeft,

		// get top.
		getTop,

		// get key.
		getKey,
		
		// get wheel delta.
		getWheelDelta;

		checkIsDescendant = function(parent, child) {

			var
			// node
			node = child.parentNode;

			while (node !== TO_DELETE) {

				if (node === parent) {
					return true;
				}

				node = node.parentNode;
			}

			return false;
		};

		self.stopDefault = stopDefault = function() {
			e.preventDefault();
		};

		self.stopBubbling = stopBubbling = function() {
			e.stopPropagation();
		};

		self.stop = stop = function() {
			stopDefault();
			stopBubbling();
		};

		self.getLeft = getLeft = function() {

			var
			// touch page x
			touchPageX;

			// if is touch mode
			if (INFO.checkIsTouchMode() === true) {

				if (e.touches !== undefined && e.touches[0] !== undefined) {

					// first touch position.

					EACH(e.touches, function(touch) {
						if (touch.target !== undefined && checkIsDescendant(el, touch.target) === true) {
							touchPageX = touch.pageX;
							return false;
						}
					});

					if (touchPageX === undefined) {
						touchPageX = e.touches[0].pageX;
					}

					if (touchPageX !== undefined) {
						return touchPageX;
					}
				}

				if (e.changedTouches !== undefined && e.changedTouches[0] !== undefined) {

					// first touch position.

					EACH(e.changedTouches, function(touch) {
						if (touch.target !== undefined && checkIsDescendant(el, touch.target) === true) {
							touchPageX = touch.pageX;
							return false;
						}
					});

					if (touchPageX === undefined) {
						touchPageX = e.changedTouches[0].pageX;
					}

					if (touchPageX !== undefined) {
						return touchPageX;
					}
				}
			}

			return e.pageX;
		};

		self.getTop = getTop = function() {

			var
			// touch page y
			touchPageY;

			// if is touch mode
			if (INFO.checkIsTouchMode() === true) {

				if (e.touches !== undefined && e.touches[0] !== undefined) {

					// first touch position.

					EACH(e.touches, function(touch) {
						if (touch.target !== undefined && checkIsDescendant(el, touch.target) === true) {
							touchPageY = touch.pageY;
							return false;
						}
					});

					if (touchPageY === undefined) {
						touchPageY = e.touches[0].pageY;
					}

					if (touchPageY !== undefined) {
						return touchPageY;
					}
				}

				if (e.changedTouches !== undefined && e.changedTouches[0] !== undefined) {

					// first touch position.

					EACH(e.changedTouches, function(touch) {
						if (touch.target !== undefined && checkIsDescendant(el, touch.target) === true) {
							touchPageY = touch.pageY;
							return false;
						}
					});

					if (touchPageY === undefined) {
						touchPageY = e.changedTouches[0].pageY;
					}

					if (touchPageY !== undefined) {
						return touchPageY;
					}
				}
			}

			return e.pageY;
		};

		self.getKey = getKey = function() {
			return e.key;
		};
		
		self.getWheelDelta = getWheelDelta = function() {
			return e.deltaY;
		};
	}
});

/**
 * 빈 이벤트 정보를 제공하는 객체를 생성하는 EMPTY_E 클래스
 */
global.EMPTY_E = CLASS({

	init : function(inner, self) {
		'use strict';

		var
		// stop default.
		stopDefault,

		// stop bubbling.
		stopBubbling,

		// stop default and bubbling.
		stop,

		// get left.
		getLeft,

		// get top.
		getTop,

		// get key.
		getKey,
		
		// get detail.
		getWheelDelta;

		self.stopDefault = stopDefault = function() {
			// ignore.
		};

		self.stopBubbling = stopBubbling = function() {
			// ignore.
		};

		self.stop = stop = function() {
			// ignore.
		};

		self.getLeft = getLeft = function() {
			
			// on heaven!
			return -999999;
		};

		self.getTop = getTop = function() {
			
			// on heaven!
			return -999999;
		};

		self.getKey = function() {
			return '';
		};
		
		self.getWheelDelta = getWheelDelta = function() {
			return 0;
		};
	}
});

/**
 * 노드의 이벤트 처리를 담당하는 EVENT 클래스
 */
global.EVENT = CLASS(function(cls) {
	'use strict';

	var
	// event map
	eventMaps = {},
	
	// fire all.
	fireAll,

	// remove all.
	removeAll,

	// remove.
	remove;
	
	cls.fireAll = fireAll = function(nameOrParams) {
		//REQUIRED: nameOrParams
		//OPTIONAL: nameOrParams.node	이벤트가 등록된 노드
		//REQUIRED: nameOrParams.name	이벤트 이름

		var
		// node
		node,

		// name
		name,

		// node id
		nodeId,

		// event map
		eventMap,

		// events
		events,

		// ret
		ret;

		// init params.
		if (CHECK_IS_DATA(nameOrParams) !== true) {
			name = nameOrParams;
		} else {
			node = nameOrParams.node;
			name = nameOrParams.name;
		}

		if (node === undefined) {
			nodeId = 'body';
		} else {
			nodeId = node.id;
		}

		eventMap = eventMaps[nodeId];

		if (eventMap !== undefined) {

			events = eventMap[name];

			if (events !== undefined) {

				EACH(events, function(evt) {

					if (evt.fire() === false) {
						
						ret = false;
					}
				});
			}
		}

		return ret;
	};

	cls.removeAll = removeAll = function(nameOrParams) {
		//OPTIONAL: nameOrParams
		//OPTIONAL: nameOrParams.node	이벤트가 등록된 노드
		//OPTIONAL: nameOrParams.name	이벤트 이름

		var
		// node
		node,

		// name
		name,

		// node id
		nodeId,

		// event map
		eventMap,

		// events
		events;

		// init params.
		if (CHECK_IS_DATA(nameOrParams) !== true) {
			name = nameOrParams;
		} else {
			node = nameOrParams.node;
			name = nameOrParams.name;
		}

		if (node === undefined) {
			nodeId = 'body';
		} else {
			nodeId = node.id;
		}

		eventMap = eventMaps[nodeId];

		if (eventMap !== undefined) {

			if (name !== undefined) {

				events = eventMap[name];

				if (events !== undefined) {

					EACH(events, function(evt) {
						evt.remove();
					});
				}

			} else {

				EACH(eventMap, function(events) {
					EACH(events, function(evt) {
						evt.remove();
					});
				});
			}
		}
	};

	cls.remove = remove = function(nameOrParams, eventHandler) {
		//REQUIRED: nameOrParams
		//OPTIONAL: nameOrParams.node	이벤트가 등록된 노드
		//REQUIRED: nameOrParams.name	이벤트 이름
		//REQUIRED: eventHandler

		var
		// node
		node,

		// name
		name,

		// node id
		nodeId,

		// event map
		eventMap,

		// events
		events;
		
		// init params.
		if (CHECK_IS_DATA(nameOrParams) !== true) {
			name = nameOrParams;
		} else {
			node = nameOrParams.node;
			name = nameOrParams.name;
		}

		if (node === undefined) {
			nodeId = 'body';
		} else {
			nodeId = node.id;
		}

		eventMap = eventMaps[nodeId];

		if (eventMap !== undefined) {

			events = eventMap[name];

			if (events !== undefined) {

				EACH(events, function(evt) {
					if (evt.getEventHandler() === eventHandler) {
						evt.remove();
					}
				});
			}
		}
	};

	return {

		init : function(inner, self, nameOrParams, eventHandler) {
			//REQUIRED: nameOrParams
			//OPTIONAL: nameOrParams.node		이벤트를 등록 및 적용할 노드
			//OPTIONAL: nameOrParams.lowNode	이벤트 '등록'은 node 파라미터에 지정된 노드에 하지만, 실제 이벤트의 동작을 '적용'할 노드는 다른 경우 해당 노드
			//REQUIRED: nameOrParams.name		이벤트 이름
			//REQUIRED: eventHandler

			var
			// node
			node,

			// low node
			lowNode,

			// name
			name,

			// node id
			nodeId,

			// event lows
			eventLows = [],

			// sub event
			subEvent,

			// last tap time
			lastTapTime,

			// remove from map.
			removeFromMap,

			// remove.
			remove,

			// fire.
			fire,
			
			// get event handler.
			getEventHandler;

			// init params.
			if (CHECK_IS_DATA(nameOrParams) !== true) {
				name = nameOrParams;
			} else {
				node = nameOrParams.node;
				lowNode = nameOrParams.lowNode;
				name = nameOrParams.name;

				if (lowNode === undefined) {
					lowNode = node;
				}
			}

			if (node === undefined) {
				nodeId = 'body';
			} else {
				nodeId = node.id;
			}

			// push event to map.

			if (eventMaps[nodeId] === undefined) {
				eventMaps[nodeId] = {};
			}

			if (eventMaps[nodeId][name] === undefined) {
				eventMaps[nodeId][name] = [];
			}

			eventMaps[nodeId][name].push(self);

			removeFromMap = function() {

				REMOVE({
					array : eventMaps[nodeId][name],
					value : self
				});

				if (eventMaps[nodeId][name].length <= 0) {
					delete eventMaps[nodeId][name];
				}

				if (CHECK_IS_EMPTY_DATA(eventMaps[nodeId]) === true) {
					delete eventMaps[nodeId];
				}
			};

			// tap event (simulate click event.)
			if (name === 'tap') {
				
				eventLows.push(EVENT_LOW({
					node : node,
					lowNode : lowNode,
					name : 'click'
				}, eventHandler));
			}

			// double tap event (not exists, simulate.)
			else if (name === 'doubletap') {

				subEvent = EVENT({
					node : node,
					name : 'tap'
				}, function(e) {

					if (lastTapTime === undefined) {
						lastTapTime = Date.now();
					} else {

						if (Date.now() - lastTapTime < 600) {
							eventHandler(e, node);
						}

						lastTapTime = undefined;

						// clear text selections.
						getSelection().removeAllRanges();
					}
				});
			}

			// when is not touch mode, touchmove link to mousedown event
			else if (name === 'touchstart') {
				
				// by touch
				eventLows.push(EVENT_LOW({
					node : node,
					lowNode : lowNode,
					name : 'touchstart'
				}, function(e, node) {
					if (INFO.checkIsTouchMode() === true) {
						eventHandler(e, node);
					}
				}));
				
				// by mouse
				eventLows.push(EVENT_LOW({
					node : node,
					lowNode : lowNode,
					name : 'mousedown'
				}, function(e, node) {
					if (INFO.checkIsTouchMode() !== true) {
						eventHandler(e, node);
					}
				}));
			}

			// when is not touch mode, touchmove link to mousemove event
			else if (name === 'touchmove') {

				// by touch
				eventLows.push(EVENT_LOW({
					node : node,
					lowNode : lowNode,
					name : 'touchmove'
				}, function(e, node) {
					if (INFO.checkIsTouchMode() === true) {
						eventHandler(e, node);
					}
				}));
				
				// by mouse
				eventLows.push(EVENT_LOW({
					node : node,
					lowNode : lowNode,
					name : 'mousemove'
				}, function(e, node) {
					if (INFO.checkIsTouchMode() !== true) {
						eventHandler(e, node);
					}
				}));
			}

			// when is not touch mode, touchend link to mouseup event
			else if (name === 'touchend') {

				// by touch
				eventLows.push(EVENT_LOW({
					node : node,
					lowNode : lowNode,
					name : 'touchend'
				}, function(e, node) {
					if (INFO.checkIsTouchMode() === true) {
						eventHandler(e, node);
					}
				}));
				
				// by mouse
				eventLows.push(EVENT_LOW({
					node : node,
					lowNode : lowNode,
					name : 'mouseup'
				}, function(e, node) {
					if (INFO.checkIsTouchMode() !== true) {
						eventHandler(e, node);
					}
				}));
			}

			// mouse over event (when is touch mode, link to touchstart event.)
			else if (name === 'mouseover') {

				// by touch
				eventLows.push(EVENT_LOW({
					node : node,
					lowNode : lowNode,
					name : 'touchstart'
				}, function(e, node) {
					if (INFO.checkIsTouchMode() === true) {
						eventHandler(e, node);
					}
				}));

				// by mouse
				eventLows.push(EVENT_LOW({
					node : node,
					lowNode : lowNode,
					name : 'mouseover'
				}, function(e, node) {
					if (INFO.checkIsTouchMode() !== true) {
						eventHandler(e, node);
					}
				}));
			}

			// other events
			else if (name !== 'attach' && name !== 'show' && name !== 'remove') {
				eventLows.push(EVENT_LOW(nameOrParams, eventHandler));
			}
			
			self.remove = remove = function() {

				EACH(eventLows, function(eventLow) {
					eventLow.remove();
				});
					
				if (subEvent !== undefined) {
					subEvent.remove();
				}

				removeFromMap();
			};

			self.fire = fire = function() {

				// pass empty e object.
				return eventHandler(EMPTY_E(), node);
			};

			self.getEventHandler = getEventHandler = function() {
				return eventHandler;
			};
		}
	};
});
/**
 * 내부적으로 이벤트를 처리하기 위해 사용되는 EVENT_LOW 클래스
 */
global.EVENT_LOW = CLASS({

	init : function(inner, self, nameOrParams, eventHandler) {
		'use strict';
		//REQUIRED: nameOrParams
		//OPTIONAL: nameOrParams.node		이벤트를 등록 및 적용할 노드
		//OPTIONAL: nameOrParams.lowNode	이벤트 '등록'은 node 파라미터에 지정된 노드에 하지만, 실제 이벤트의 동작을 '적용'할 노드는 다른 경우 해당 노드
		//REQUIRED: nameOrParams.name		이벤트 이름
		//REQUIRED: eventHandler

		var
		// node
		node,

		// low node
		lowNode,

		// name
		name,

		// el
		el,

		// inner handler.
		innerHandler,

		// remove.
		remove;

		// init params.
		if (CHECK_IS_DATA(nameOrParams) !== true) {
			name = nameOrParams;
		} else {
			node = nameOrParams.node;
			lowNode = nameOrParams.lowNode;
			name = nameOrParams.name;

			if (lowNode === undefined) {
				lowNode = node;
			}
		}

		if (lowNode !== undefined) {
			el = lowNode.getWrapperEl();
		} else if (global['on' + name] === undefined) {
			el = document;
		} else {
			el = global;
		}
		
		el.addEventListener(name, innerHandler = function(e) {
			
			var
			// result
			result = eventHandler(E({
				e : e,
				el : el
			}), node);
			
			if (name === 'beforeunload' && result !== undefined) {
				e.returnValue = result;
			}

			return result;
			
		}, false);

		self.remove = remove = function() {
			el.removeEventListener(name, innerHandler, false);
		};
	}
});

/**
 * 이벤트가 한번 발생하면 자동으로 제거되는 EVENT_ONCE 클래스
 */
global.EVENT_ONCE = CLASS({

	init : function(inner, self, nameOrParams, eventHandler) {
		'use strict';
		//REQUIRED: nameOrParams
		//OPTIONAL: nameOrParams.node		이벤트를 등록 및 적용할 노드
		//OPTIONAL: nameOrParams.lowNode	이벤트 '등록'은 node 파라미터에 지정된 노드에 하지만, 실제 이벤트의 동작을 '적용'할 노드는 다른 경우 해당 노드
		//REQUIRED: nameOrParams.name		이벤트 이름
		//REQUIRED: eventHandler

		var
		// evt
		evt = EVENT(nameOrParams, function(e, node) {
			eventHandler(e, node);
			evt.remove();
		}),

		// remove.
		remove,

		// fire.
		fire;

		self.remove = remove = function() {
			evt.remove();
		};

		self.fire = fire = function() {
			evt.fire();
		};
	}
});

/**
 * A class
 */
global.A = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'a'
		};
	},

	init : function(inner, self, params) {
		'use strict';
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.href		이동할 경로
		//OPTIONAL: params.target	이동할 타겟
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		var
		// style
		style,
		
		// href
		href,
		
		// target
		target,
		
		// set href.
		setHref, 

		// tap.
		tap;

		// init params.
		if (params !== undefined) {
			style = params.style;
			href = params.href;
			target = params.target;
		}

		self.setHref = setHref = function(href) {
			inner.setAttr({
				name : 'href',
				value : href
			});
		};

		if (href !== undefined) {
			setHref(href);
		}

		if (target !== undefined) {
			inner.setAttr({
				name : 'target',
				value : target
			});
		}
		
		self.tap = tap = function() {

			EVENT.fireAll({
				node : self,
				name : 'tap'
			});
		};
	},

	afterInit : function(inner, self, params) {
		'use strict';
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.href		이동할 경로
		//OPTIONAL: params.target	이동할 타겟
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		var
		// children
		children,
		
		// href
		href,
		
		// is href content
		isHrefContent = false,
		
		// append.
		append,
		
		// prepend.
		prepend;

		// init params.
		if (params !== undefined) {
			children = params.c;
			href = params.href;
		}

		// 아무런 내용이 없으면 이동할 경로를 그대로 표시합니다.
		if (children === undefined && href !== undefined) {
			
			self.append(href);
			
			isHrefContent = true;
			
			OVERRIDE(self.append, function(origin) {
				self.append = append = function(node) {
					//REQUIRED: node
					
					if (isHrefContent === true) {
						self.empty();
						isHrefContent = false;
					}
					
					origin(node);
				};
			});
			
			OVERRIDE(self.prepend, function(origin) {
				self.prepend = prepend = function(node) {
					//REQUIRED: node
					
					if (isHrefContent === true) {
						self.empty();
						isHrefContent = false;
					}
					
					origin(node);
				};
			});
		}
	}
});

/**
 * HTML audio 태그와 대응되는 클래스
 */
global.AUDIO = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'audio'
		};
	},

	init : function(inner, self, params) {
		'use strict';
		//REQUIRED: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.ogg		OGG 사운드 파일 경로
		//OPTIONAL: params.mp3		MP3 사운드 파일 경로
		//OPTIONAL: params.isLoop	반복 재생할지 여부
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		var
		// mp3
		mp3 = params.mp3,

		// ogg
		ogg = params.ogg,
		
		// is loop
		isLoop = params.isLoop,
		
		// play.
		play,
		
		// pause.
		pause,
		
		// stop.
		stop;
		
		if (ogg !== undefined && self.getEl().canPlayType('audio/ogg') !== '') {
			self.getEl().src = ogg;
		} else if (mp3 !== undefined) {
			self.getEl().src = mp3;
		}
		
		inner.setAttr({
			name : 'controls',
			value : 'controls'
		});
		
		if (isLoop === true) {
			inner.setAttr({
				name : 'loop',
				value : 'loop'
			});
		}
		
		self.play = play = function() {
			self.getEl().play();
		};
		
		self.pause = pause = function() {
			self.getEl().pause();
		};
		
		self.stop = stop = function() {
			self.getEl().pause();
			self.getEl().currentTime = 0;
		};
	}
});

/**
 * HTML body 태그와 대응되는 객체
 */
global.BODY = OBJECT({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'body'
		};
	}
});

/**
 * HTML br 태그와 대응되는 클래스
 */
global.BR = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'br'
		};
	}
});

/**
 * HTML canvas 태그와 대응되는 클래스
 */
global.CANVAS = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'canvas'
		};
	},

	init : function(inner, self, params) {
		'use strict';
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.width
		//OPTIONAL: params.height
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		var
		// wdith
		width,

		// height
		height,

		// get context.
		getContext,

		// set size.
		setSize,

		// get width.
		getWidth,

		// get height.
		getHeight,

		// get data url.
		getDataURL;

		// init params.
		if (params !== undefined) {
			width = params.width;
			height = params.height;
		}

		self.getContext = getContext = function(contextType) {
			//REQUIRED: contextType
			
			return self.getEl().getContext(contextType);
		};

		self.setSize = setSize = function(size) {
			//REQUIRED: size
			//OPTIONAL: size.width
			//OPTIONAL: size.height

			var
			// el
			el = self.getEl();

			if (size.width !== undefined) {
				width = size.width;
			}

			if (size.height !== undefined) {
				height = size.height;
			}

			if (width !== undefined) {
				el.width = width;
			}

			if (height !== undefined) {
				el.height = height;
			}
		};

		setSize({
			width : width,
			height : height
		});

		self.getWidth = getWidth = function() {
			return width;
		};

		self.getHeight = getHeight = function() {
			return height;
		};

		self.getDataURL = getDataURL = function() {
			return self.getEl().toDataURL();
		};
	}
});

/**
 * HTML div 태그와 대응되는 클래스
 */
global.DIV = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'div'
		};
	}
});

/**
 * Form class
 */
global.FORM = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'form'
		};
	},

	init : function(inner, self, params) {
		'use strict';
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.action	폼 정보를 전송할 경로
		//OPTIONAL: params.target	경로가 이동될 타겟. 지정하지 않으면 현재 창에서 이동됩니다.
		//OPTIONAL: params.method	요청 메소드. `GET`, `POST`를 설정할 수 있습니다.
		//OPTIONAL: params.enctype	폼을 전송할때 사용할 인코딩 방법. 업로드 기능 구현에 사용됩니다.
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		var
		// action
		action,

		// target
		target,

		// method
		method,

		// enctype
		enctype,

		// get data.
		getData,

		// set data.
		setData,

		// submit.
		submit;

		// init params.
		if (params !== undefined) {
			action = params.action;
			target = params.target;
			method = params.method;
			enctype = params.enctype;
		}

		if (action !== undefined) {
			
			inner.setAttr({
				name : 'action',
				value : action
			});
			
		} else {
			
			EVENT({
				node : self,
				name : 'submit'
			}, function(e) {
				e.stop();
			});
		}

		if (target !== undefined) {
			inner.setAttr({
				name : 'target',
				value : target
			});
		}

		if (method !== undefined) {
			inner.setAttr({
				name : 'method',
				value : method
			});
		}

		if (enctype !== undefined) {
			inner.setAttr({
				name : 'enctype',
				value : enctype
			});
		}

		OVERRIDE(self.setData, function(origin) {
			
			self.getData = getData = function() {
	
				var
				// data
				data = origin(),
	
				// f.
				f = function(node) {
					//REQUIRED: node
	
					EACH(node.getChildren(), function(child) {
	
						if (child.getValue !== undefined && child.getName !== undefined && child.getName() !== undefined) {
							data[child.getName()] = child.getValue();
						}
	
						f(child);
					});
				};
				
				if (data === undefined) {
					data = {};
				}
	
				f(self);
	
				return data;
			};
		});

		OVERRIDE(self.setData, function(origin) {
			
			self.setData = setData = function(data) {
				//REQUIRED: data
				
				var
				// f.
				f = function(node) {
					//REQUIRED: node
	
					EACH(node.getChildren(), function(child) {
	
						var
						// value
						value;
	
						if (child.setValue !== undefined && child.getName !== undefined && child.getName() !== undefined) {
							value = data[child.getName()];
							child.setValue(value === undefined ? '' : value);
						}
	
						f(child);
					});
				};
	
				f(self);
				
				origin(data);
			};
		});

		self.submit = submit = function() {
			
			EVENT.fireAll({
				node : self,
				name : 'submit'
			});
			
			if (action !== undefined) {
				self.getEl().submit();
			}
		};
	}
});

/**
 * HTML h1 태그와 대응되는 클래스
 */
global.H1 = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'h1'
		};
	}
});

/**
 * HTML h2 태그와 대응되는 클래스
 */
global.H2 = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'h2'
		};
	}
});

/**
 * HTML h3 태그와 대응되는 클래스
 */
global.H3 = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'h3'
		};
	}
});

/**
 * HTML h4 태그와 대응되는 클래스
 */
global.H4 = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'h4'
		};
	}
});

/**
 * HTML h5 태그와 대응되는 클래스
 */
global.H5 = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'h5'
		};
	}
});

/**
 * HTML h6 태그와 대응되는 클래스
 */
global.H6 = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'h6'
		};
	}
});

/**
 * HTML iframe 태그와 대응되는 클래스
 */
global.IFRAME = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'iframe',
			style : {
				border : 'none'
			}
		};
	},

	init : function(inner, self, params) {
		'use strict';
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.name
		//OPTIONAL: params.src
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		var
		// name
		name,

		// src
		src,

		// set src.
		setSrc,

		// get src.
		getSrc;

		// init params.
		if (params !== undefined) {
			name = params.name;
			src = params.src;
		}

		if (name !== undefined) {
			inner.setAttr({
				name : 'name',
				value : name
			});
		}

		self.setSrc = setSrc = function(_src) {
			//REQUIRED: _src

			src = _src;

			inner.setAttr({
				name : 'src',
				value : src
			});
		};

		if (src !== undefined) {
			setSrc(src);
		}

		self.getSrc = getSrc = function() {
			return src;
		};
	}
});

/**
 * HTML img 태그와 대응되는 클래스
 */
global.IMG = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'img'
		};
	},

	init : function(inner, self, params) {
		'use strict';
		//REQUIRED: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//REQUIRED: params.src		이미지 경로
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		var
		// src
		src = params.src,

		// el
		el = self.getEl(),

		// get width.
		getWidth,

		// get height.
		getHeight,

		// set size.
		setSize,

		// get src.
		getSrc,

		// set src.
		setSrc;

		//OVERRIDE: self.getWidth
		self.getWidth = getWidth = function() {
			return el.width;
		};

		//OVERRIDE: self.getHeight
		self.getHeight = getHeight = function() {
			return el.height;
		};

		self.setSize = setSize = function(size) {
			//REQUIRED: size
			//OPTIONAL: size.width
			//OPTIONAL: size.height

			var
			// width
			width = size.width,

			// height
			height = size.height;

			if (width !== undefined) {
				el.width = width;
			}

			if (height !== undefined) {
				el.height = height;
			}
		};

		self.getSrc = getSrc = function() {
			return src;
		};

		self.setSrc = setSrc = function(_src) {
			//REQUIRED: _src

			src = _src;

			inner.setAttr({
				name : 'src',
				value : src
			});
		};

		if (src !== undefined) {
			setSrc(src);
		}
	}
});

/**
 * HTML input 태그와 대응되는 클래스
 */
global.INPUT = CLASS(function(cls) {
	'use strict';

	var
	// focusing input ids
	focusingInputIds = [],

	// get focusing input ids.
	getFocusingInputIds;

	cls.getFocusingInputIds = getFocusingInputIds = function(id) {
		return focusingInputIds;
	};

	return {

		preset : function() {
			return DOM;
		},

		params : function() {
			return {
				tag : 'input'
			};
		},

		init : function(inner, self, params) {
			//OPTIONAL: params
			//OPTIONAL: params.id		id 속성
			//OPTIONAL: params.cls		class 속성
			//OPTIONAL: params.style	스타일
			//OPTIONAL: params.name
			//OPTIONAL: params.type
			//OPTIONAL: params.placeholder
			//OPTIONAL: params.value
			//OPTIONAL: params.accept
			//OPTIONAL: params.isMultiple
			//OPTIONAL: params.isOffAutocomplete
			//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
			//OPTIONAL: params.on		이벤트

			var
			// name
			name,

			// type
			type,

			// placeholder
			placeholder,
			
			// accept
			accept,

			// is multiple
			isMultiple,
			
			// is off autocomplete
			isOffAutocomplete,

			// get name.
			getName,

			// get value.
			getValue,

			// set value.
			setValue,

			// select.
			select,

			// focus.
			focus,

			// blur.
			blur,

			// toggle check.
			toggleCheck,

			// check is checked.
			checkIsChecked;

			// init params.
			if (params !== undefined) {
				name = params.name;
				type = params.type;
				placeholder = params.placeholder;
				accept = params.accept;
				isMultiple = params.isMultiple;
				isOffAutocomplete = params.isOffAutocomplete;
			}

			if (type !== undefined) {
				inner.setAttr({
					name : 'type',
					value : type
				});
			}

			if (type !== 'submit' && type !== 'reset') {

				if (name !== undefined) {
					inner.setAttr({
						name : 'name',
						value : name
					});
				}

				if (placeholder !== undefined) {
					inner.setAttr({
						name : 'placeholder',
						value : placeholder
					});
				}
				
				if (accept !== undefined) {
					inner.setAttr({
						name : 'accept',
						value : accept
					});
				}

				if (isMultiple === true) {
					inner.setAttr({
						name : 'multiple',
						value : isMultiple
					});
				}

				if (isOffAutocomplete === true) {
					inner.setAttr({
						name : 'autocomplete',
						value : 'off'
					});
				}
				
				self.getName = getName = function() {
					return name;
				};

				self.getValue = getValue = function() {
					if (type === 'checkbox' || type === 'radio') {
						return self.getEl().checked;
					}
					return self.getEl().value;
				};

				self.select = select = function() {
					if (type === 'file') {
						self.getEl().click();
					} else {
						self.getEl().select();
					}
				};

				self.focus = focus = function() {
					self.getEl().focus();
				};

				self.blur = blur = function() {
					self.getEl().blur();
				};

				if (type === 'checkbox' || type === 'radio') {

					self.toggleCheck = toggleCheck = function(e) {

						if (self.getEl().checked === true) {
							self.getEl().checked = false;
						} else {
							self.getEl().checked = true;
						}

						EVENT.fireAll({
							node : self,
							name : 'change'
						});

						return self.getEl().checked;
					};

					self.checkIsChecked = checkIsChecked = function() {
						return self.getEl().checked;
					};

					EVENT({
						node : self,
						name : 'keyup'
					}, function(e) {
						if (e !== undefined && e.getKey() === 'Enter') {
							DELAY(function() {
								EVENT.fireAll({
									node : self,
									name : 'change'
								});
							});
						}
					});
				}
			}

			self.setValue = setValue = function(value) {
				//REQUIRED: value

				if (type === 'checkbox' || type === 'radio') {

					if (value === true) {

						if (self.getEl().checked !== true) {

							self.getEl().checked = true;

							EVENT.fireAll({
								node : self,
								name : 'change'
							});

						} else {
							self.getEl().checked = true;
						}

					} else {

						if (self.getEl().checked === true) {

							self.getEl().checked = false;

							EVENT.fireAll({
								node : self,
								name : 'change'
							});

						} else {
							self.getEl().checked = false;
						}
					}

				} else {

					if (self.getEl().value !== value) {

						self.getEl().value = value;

						EVENT.fireAll({
							node : self,
							name : 'change'
						});

					} else {
						self.getEl().value = value;
					}
				}
			};

			EVENT({
				node : self,
				name : 'focus'
			}, function() {
				getFocusingInputIds().push(self.id);
			});

			EVENT({
				node : self,
				name : 'blur'
			}, function() {

				REMOVE({
					array : getFocusingInputIds(),
					value : self.id
				});
			});

			self.on('remove', function() {

				REMOVE({
					array : getFocusingInputIds(),
					value : self.id
				});
			});
			
			// can radio be false
			if (type === 'radio') {
				
				EVENT({
					node : self,
					name : 'touchstart'
				}, function() {
					
					if (checkIsChecked() === true) {
						
						EVENT_ONCE({
							node : self,
							name : 'touchend'
						}, function() {
							DELAY(function() {
								setValue(false);
							});
						});
					}
				});
			}
		},

		afterInit : function(inner, self, params) {
			//OPTIONAL: params
			//OPTIONAL: params.id		id 속성
			//OPTIONAL: params.cls		class 속성
			//OPTIONAL: params.style	스타일
			//OPTIONAL: params.name
			//OPTIONAL: params.type
			//OPTIONAL: params.placeholder
			//OPTIONAL: params.value
			//OPTIONAL: params.accept
			//OPTIONAL: params.isMultiple
			//OPTIONAL: params.isOffAutocomplete
			//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
			//OPTIONAL: params.on		이벤트

			var
			// type
			type,

			// value
			value;

			// init params.
			if (params !== undefined) {
				type = params.type;
				value = params.value;
			}

			if (value !== undefined) {

				if (type === 'checkbox' || type === 'radio') {

					if (value === true) {

						if (self.getEl().checked !== true) {
							self.getEl().checked = true;
						} else {
							self.getEl().checked = true;
						}

					} else {

						if (self.getEl().checked === true) {
							self.getEl().checked = false;
						} else {
							self.getEl().checked = false;
						}
					}

				} else {

					if (self.getEl().value !== value) {
						self.getEl().value = value;
					} else {
						self.getEl().value = value;
					}
				}
			}
		}
	};
});

/**
 * HTML li 태그와 대응되는 클래스
 */
global.LI = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'li'
		};
	}
});

/**
 * HTML optgroup 태그와 대응되는 클래스
 */
global.OPTGROUP = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'optgroup'
		};
	},

	init : function(inner, self, params) {
		'use strict';
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.label
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		var
		// label
		label = params.label;

		inner.setAttr({
			name : 'label',
			value : label
		});
	}
});

/**
 * HTML option 태그와 대응되는 클래스
 */
global.OPTION = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'option'
		};
	},

	init : function(inner, self, params) {
		'use strict';
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.value
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		var
		// get value.
		getValue,

		// set value.
		setValue;

		self.getValue = getValue = function() {
			return self.getEl().value;
		};

		self.setValue = setValue = function(value) {
			//REQUIRED: value

			self.getEl().value = value;
		};
	},

	afterInit : function(inner, self, params) {
		'use strict';
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.value
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		var
		// value
		value,
		
		// children
		children;

		// init params.
		if (params !== undefined) {
			value = params.value;
			children = params.c;
		}

		if (value === undefined) {
			self.setValue('');
		} else {
			self.setValue(value);
			
			if (children === undefined) {
				self.append(value);
			}
		}
	}
});

/**
 * HTML p 태그와 대응되는 클래스
 */
global.P = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'p'
		};
	}
});

/**
 * HTML select 태그와 대응되는 클래스
 */
global.SELECT = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'select'
		};
	},

	init : function(inner, self, params) {
		'use strict';
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.name
		//OPTIONAL: params.placeholder
		//OPTIONAL: params.value
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		var
		// name
		name,

		// is ctrl down
		isCtrlDown = false,

		// get name.
		getName,

		// get value.
		getValue,

		// set value.
		setValue,

		// select.
		select,

		// focus.
		focus,

		// blur.
		blur;

		// init params.
		if (params !== undefined) {
			name = params.name;
		}

		if (name !== undefined) {
			inner.setAttr({
				name : 'name',
				value : name
			});
		}

		self.getName = getName = function() {
			return name;
		};

		self.getValue = getValue = function() {
			return self.getEl().value;
		};

		self.setValue = setValue = function(value) {
			//REQUIRED: value

			if (self.getEl().value !== value) {

				self.getEl().value = value;

				EVENT.fireAll({
					node : self,
					name : 'change'
				});

			} else {
				self.getEl().value = value;
			}
		};

		self.select = select = function() {
			self.getEl().select();
		};

		self.focus = focus = function() {
			self.getEl().focus();
		};

		self.blur = blur = function() {
			self.getEl().blur();
		};

		EVENT({
			node : self,
			name : 'keydown'
		}, function(e) {
			
			if (e.getKey() === 'Control') {
				isCtrlDown = true;
			} else if (isCtrlDown !== true) {
				e.stopBubbling();
			}
		});

		EVENT({
			node : self,
			name : 'keyup'
		}, function(e) {

			if (e.getKey() === 'Control') {
				isCtrlDown = false;
			}
		});

		EVENT({
			node : self,
			name : 'focus'
		}, function() {
			INPUT.getFocusingInputIds().push(self.id);
		});

		EVENT({
			node : self,
			name : 'blur'
		}, function() {

			REMOVE({
				array : INPUT.getFocusingInputIds(),
				value : self.id
			});
		});

		self.on('remove', function() {

			REMOVE({
				array : INPUT.getFocusingInputIds(),
				value : self.id
			});
		});
	},

	afterInit : function(inner, self, params) {
		'use strict';
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일을 지정합니다.
		//OPTIONAL: params.name
		//OPTIONAL: params.placeholder
		//OPTIONAL: params.value
		//OPTIONAL: params.c		자식 노드를 지정합니다. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트를 지정합니다.

		var
		// value
		value;

		// init params.
		if (params !== undefined) {
			value = params.value;
		}

		if (value !== undefined) {
			self.setValue(value);
		}
	}
});

/**
 * HTML span 태그와 대응되는 클래스
 */
global.SPAN = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'span'
		};
	}
});

/**
 * HTML table 태그와 대응되는 클래스
 */
global.TABLE = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'table'
		};
	}
});

/**
 * HTML td 태그와 대응되는 클래스
 */
global.TD = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'td'
		};
	},

	init : function(inner, self, params) {
		'use strict';
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.rowspan
		//OPTIONAL: params.colspan
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트
		
		var
		// rowspan
		rowspan,

		// colspan
		colspan;

		// init params.
		if (params !== undefined) {
			rowspan = params.rowspan;
			colspan = params.colspan;
		}

		if (rowspan !== undefined) {
			inner.setAttr({
				name : 'rowspan',
				value : rowspan
			});
		}

		if (colspan !== undefined) {
			inner.setAttr({
				name : 'colspan',
				value : colspan
			});
		}
	}
});

/**
 * Textarea class
 */
global.TEXTAREA = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'textarea'
		};
	},

	init : function(inner, self, params) {
		'use strict';
		//OPTIONAL: params
		//OPTIONAL: params.id			id 속성
		//OPTIONAL: params.cls			class 속성
		//OPTIONAL: params.style		스타일
		//OPTIONAL: params.name
		//OPTIONAL: params.placeholder	값이 없는 경우 표시되는 짧은 설명
		//OPTIONAL: params.value
		//OPTIONAL: params.c			자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on			이벤트

		var
		// name
		name,

		// placeholder
		placeholder,

		// is ctrl down
		isCtrlDown = false,

		// get name.
		getName,

		// get value.
		getValue,

		// set value.
		setValue,

		// select.
		select,

		// focus.
		focus,

		// blur.
		blur;

		// init params.
		if (params !== undefined) {
			name = params.name;
			placeholder = params.placeholder;
		}

		if (name !== undefined) {
			inner.setAttr({
				name : 'name',
				value : name
			});
		}

		if (placeholder !== undefined) {
			inner.setAttr({
				name : 'placeholder',
				value : placeholder
			});
		}

		self.getName = getName = function() {
			return name;
		};

		self.getValue = getValue = function() {
			return self.getEl().value;
		};

		self.setValue = setValue = function(value) {
			//REQUIRED: value

			if (self.getEl().value !== value) {

				self.getEl().value = value;

				EVENT.fireAll({
					node : self,
					name : 'change'
				});

			} else {
				self.getEl().value = value;
			}
		};

		self.select = select = function() {
			self.getEl().select();
		};

		self.focus = focus = function() {
			self.getEl().focus();
		};

		self.blur = blur = function() {
			self.getEl().blur();
		};

		EVENT({
			node : self,
			name : 'keydown'
		}, function(e) {

			if (e.getKey() === 'Control') {
				isCtrlDown = true;
			} else if (isCtrlDown !== true) {
				e.stopBubbling();
			}
		});

		EVENT({
			node : self,
			name : 'keyup'
		}, function(e) {

			if (e.getKey() === 'Control') {
				isCtrlDown = false;
			}
		});

		EVENT({
			node : self,
			name : 'focus'
		}, function() {
			INPUT.getFocusingInputIds().push(self.id);
		});

		EVENT({
			node : self,
			name : 'blur'
		}, function() {

			REMOVE({
				array : INPUT.getFocusingInputIds(),
				value : self.id
			});
		});

		self.on('remove', function() {

			REMOVE({
				array : INPUT.getFocusingInputIds(),
				value : self.id
			});
		});
	},

	afterInit : function(inner, self, params) {
		'use strict';
		//OPTIONAL: params
		//OPTIONAL: params.id			id 속성
		//OPTIONAL: params.cls			class 속성
		//OPTIONAL: params.style		스타일
		//OPTIONAL: params.name
		//OPTIONAL: params.placeholder	값이 없는 경우 표시되는 짧은 설명
		//OPTIONAL: params.value
		//OPTIONAL: params.c			자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on			이벤트

		var
		// value
		value;

		// init params.
		if (params !== undefined) {
			value = params.value;
		}

		if (value !== undefined) {
			self.setValue(value);
		}
	}
});

/**
 * HTML th 태그와 대응되는 클래스
 */
global.TH = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'th'
		};
	},

	init : function(inner, self, params) {
		'use strict';
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.rowspan
		//OPTIONAL: params.colspan
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		var
		// rowspan
		rowspan,

		// colspan
		colspan;

		// init params.
		if (params !== undefined) {
			rowspan = params.rowspan;
			colspan = params.colspan;
		}

		if (rowspan !== undefined) {
			inner.setAttr({
				name : 'rowspan',
				value : rowspan
			});
		}

		if (colspan !== undefined) {
			inner.setAttr({
				name : 'colspan',
				value : colspan
			});
		}
	}
});

/**
 * HTML tr 태그와 대응되는 클래스
 */
global.TR = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'tr'
		};
	}
});

/**
 * HTML ul 태그와 대응되는 클래스
 */
global.UL = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'ul'
		};
	}
});

/**
 * HTML video 태그와 대응되는 클래스
 */
global.VIDEO = CLASS({

	preset : function() {
		'use strict';

		return DOM;
	},

	params : function() {
		'use strict';

		return {
			tag : 'video'
		};
	},

	init : function(inner, self, params) {
		'use strict';
		//REQUIRED: params
		//OPTIONAL: params.id			id 속성
		//OPTIONAL: params.cls			class 속성
		//OPTIONAL: params.style		스타일
		//OPTIONAL: params.webm			WebM 동영상 파일 경로
		//OPTIONAL: params.ogg			OGG 동영상 파일 경로
		//OPTIONAL: params.mp4			MP4 동영상 파일 경로
		//OPTIONAL: params.poster		동영상이 로딩 중일 때 표시할 이미지 파일 경로
		//OPTIONAL: params.isNoControls	조작 메뉴를 숨길지 여부
		//OPTIONAL: params.isLoop		반복 재생할지 여부
		//OPTIONAL: params.isMuted		음소거로 재생할지 여부
		//OPTIONAL: params.c			자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on			이벤트

		var
		// webm
		webm = params.webm,

		// ogg
		ogg = params.ogg,
		
		// mp4
		mp4 = params.mp4,
		
		// poster
		poster = params.poster,
		
		// isNoControls
		isNoControls = params.isNoControls,
		
		// is loop
		isLoop = params.isLoop,
		
		// is muted
		isMuted = params.isMuted,
		
		// play.
		play,
		
		// pause.
		pause,
		
		// stop.
		stop;
		
		if (webm !== undefined && self.getEl().canPlayType('video/webm') !== '') {
			self.getEl().src = webm;
		} else if (ogg !== undefined && self.getEl().canPlayType('video/ogg') !== '') {
			self.getEl().src = ogg;
		} else if (mp4 !== undefined) {
			self.getEl().src = mp4;
		}
		
		if (isNoControls !== true) {
			inner.setAttr({
				name : 'controls',
				value : 'controls'
			});
		}
		
		if (isLoop === true) {
			inner.setAttr({
				name : 'loop',
				value : 'loop'
			});
		}
		
		if (isMuted === true) {
			inner.setAttr({
				name : 'muted',
				value : 'muted'
			});
		}
		
		self.play = play = function() {
			self.getEl().play();
		};
		
		self.pause = pause = function() {
			self.getEl().pause();
		};
		
		self.stop = stop = function() {
			self.getEl().pause();
			self.getEl().currentTime = 0;
		};
	}
});

/*!
 * Bowser - a browser detector
 * https://github.com/ded/bowser
 * MIT License | (c) Dustin Diaz 2015
 */

!function (name, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(name, definition)
  else this[name] = definition()
}('bowser', function () {
  /**
    * See useragents.js for examples of navigator.userAgent
    */

  var t = true

  function detect(ua) {

    function getFirstMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[1]) || '';
    }

    function getSecondMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[2]) || '';
    }

    var iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase()
      , likeAndroid = /like android/i.test(ua)
      , android = !likeAndroid && /android/i.test(ua)
      , nexusMobile = /nexus\s*[0-6]\s*/i.test(ua)
      , nexusTablet = !nexusMobile && /nexus\s*[0-9]+/i.test(ua)
      , chromeos = /CrOS/.test(ua)
      , silk = /silk/i.test(ua)
      , sailfish = /sailfish/i.test(ua)
      , tizen = /tizen/i.test(ua)
      , webos = /(web|hpw)os/i.test(ua)
      , windowsphone = /windows phone/i.test(ua)
      , samsungBrowser = /SamsungBrowser/i.test(ua)
      , windows = !windowsphone && /windows/i.test(ua)
      , mac = !iosdevice && !silk && /macintosh/i.test(ua)
      , linux = !android && !sailfish && !tizen && !webos && /linux/i.test(ua)
      , edgeVersion = getFirstMatch(/edge\/(\d+(\.\d+)?)/i)
      , versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i)
      , tablet = /tablet/i.test(ua)
      , mobile = !tablet && /[^-]mobi/i.test(ua)
      , xbox = /xbox/i.test(ua)
      , result

    if (/opera/i.test(ua)) {
      //  an old Opera
      result = {
        name: 'Opera'
      , opera: t
      , version: versionIdentifier || getFirstMatch(/(?:opera|opr|opios)[\s\/](\d+(\.\d+)?)/i)
      }
    } else if (/opr|opios/i.test(ua)) {
      // a new Opera
      result = {
        name: 'Opera'
        , opera: t
        , version: getFirstMatch(/(?:opr|opios)[\s\/](\d+(\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (/SamsungBrowser/i.test(ua)) {
      result = {
        name: 'Samsung Internet for Android'
        , samsungBrowser: t
        , version: versionIdentifier || getFirstMatch(/(?:SamsungBrowser)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/coast/i.test(ua)) {
      result = {
        name: 'Opera Coast'
        , coast: t
        , version: versionIdentifier || getFirstMatch(/(?:coast)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/yabrowser/i.test(ua)) {
      result = {
        name: 'Yandex Browser'
      , yandexbrowser: t
      , version: versionIdentifier || getFirstMatch(/(?:yabrowser)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/ucbrowser/i.test(ua)) {
      result = {
          name: 'UC Browser'
        , ucbrowser: t
        , version: getFirstMatch(/(?:ucbrowser)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/mxios/i.test(ua)) {
      result = {
        name: 'Maxthon'
        , maxthon: t
        , version: getFirstMatch(/(?:mxios)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/epiphany/i.test(ua)) {
      result = {
        name: 'Epiphany'
        , epiphany: t
        , version: getFirstMatch(/(?:epiphany)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/puffin/i.test(ua)) {
      result = {
        name: 'Puffin'
        , puffin: t
        , version: getFirstMatch(/(?:puffin)[\s\/](\d+(?:\.\d+)?)/i)
      }
    }
    else if (/sleipnir/i.test(ua)) {
      result = {
        name: 'Sleipnir'
        , sleipnir: t
        , version: getFirstMatch(/(?:sleipnir)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/k-meleon/i.test(ua)) {
      result = {
        name: 'K-Meleon'
        , kMeleon: t
        , version: getFirstMatch(/(?:k-meleon)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (windowsphone) {
      result = {
        name: 'Windows Phone'
      , windowsphone: t
      }
      if (edgeVersion) {
        result.msedge = t
        result.version = edgeVersion
      }
      else {
        result.msie = t
        result.version = getFirstMatch(/iemobile\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/msie|trident/i.test(ua)) {
      result = {
        name: 'Internet Explorer'
      , msie: t
      , version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
      }
    } else if (chromeos) {
      result = {
        name: 'Chrome'
      , chromeos: t
      , chromeBook: t
      , chrome: t
      , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      }
    } else if (/chrome.+? edge/i.test(ua)) {
      result = {
        name: 'Microsoft Edge'
      , msedge: t
      , version: edgeVersion
      }
    }
    else if (/vivaldi/i.test(ua)) {
      result = {
        name: 'Vivaldi'
        , vivaldi: t
        , version: getFirstMatch(/vivaldi\/(\d+(\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (sailfish) {
      result = {
        name: 'Sailfish'
      , sailfish: t
      , version: getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/seamonkey\//i.test(ua)) {
      result = {
        name: 'SeaMonkey'
      , seamonkey: t
      , version: getFirstMatch(/seamonkey\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/firefox|iceweasel|fxios/i.test(ua)) {
      result = {
        name: 'Firefox'
      , firefox: t
      , version: getFirstMatch(/(?:firefox|iceweasel|fxios)[ \/](\d+(\.\d+)?)/i)
      }
      if (/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
        result.firefoxos = t
      }
    }
    else if (silk) {
      result =  {
        name: 'Amazon Silk'
      , silk: t
      , version : getFirstMatch(/silk\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/phantom/i.test(ua)) {
      result = {
        name: 'PhantomJS'
      , phantom: t
      , version: getFirstMatch(/phantomjs\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/slimerjs/i.test(ua)) {
      result = {
        name: 'SlimerJS'
        , slimer: t
        , version: getFirstMatch(/slimerjs\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
      result = {
        name: 'BlackBerry'
      , blackberry: t
      , version: versionIdentifier || getFirstMatch(/blackberry[\d]+\/(\d+(\.\d+)?)/i)
      }
    }
    else if (webos) {
      result = {
        name: 'WebOS'
      , webos: t
      , version: versionIdentifier || getFirstMatch(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)
      };
      /touchpad\//i.test(ua) && (result.touchpad = t)
    }
    else if (/bada/i.test(ua)) {
      result = {
        name: 'Bada'
      , bada: t
      , version: getFirstMatch(/dolfin\/(\d+(\.\d+)?)/i)
      };
    }
    else if (tizen) {
      result = {
        name: 'Tizen'
      , tizen: t
      , version: getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || versionIdentifier
      };
    }
    else if (/qupzilla/i.test(ua)) {
      result = {
        name: 'QupZilla'
        , qupzilla: t
        , version: getFirstMatch(/(?:qupzilla)[\s\/](\d+(?:\.\d+)+)/i) || versionIdentifier
      }
    }
    else if (/chromium/i.test(ua)) {
      result = {
        name: 'Chromium'
        , chromium: t
        , version: getFirstMatch(/(?:chromium)[\s\/](\d+(?:\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (/chrome|crios|crmo/i.test(ua)) {
      result = {
        name: 'Chrome'
        , chrome: t
        , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      }
    }
    else if (android) {
      result = {
        name: 'Android'
        , version: versionIdentifier
      }
    }
    else if (/safari|applewebkit/i.test(ua)) {
      result = {
        name: 'Safari'
      , safari: t
      }
      if (versionIdentifier) {
        result.version = versionIdentifier
      }
    }
    else if (iosdevice) {
      result = {
        name : iosdevice == 'iphone' ? 'iPhone' : iosdevice == 'ipad' ? 'iPad' : 'iPod'
      }
      // WTF: version is not part of user agent in web apps
      if (versionIdentifier) {
        result.version = versionIdentifier
      }
    }
    else if(/googlebot/i.test(ua)) {
      result = {
        name: 'Googlebot'
      , googlebot: t
      , version: getFirstMatch(/googlebot\/(\d+(\.\d+))/i) || versionIdentifier
      }
    }
    else {
      result = {
        name: getFirstMatch(/^(.*)\/(.*) /),
        version: getSecondMatch(/^(.*)\/(.*) /)
     };
   }

    // set webkit or gecko flag for browsers based on these engines
    if (!result.msedge && /(apple)?webkit/i.test(ua)) {
      if (/(apple)?webkit\/537\.36/i.test(ua)) {
        result.name = result.name || "Blink"
        result.blink = t
      } else {
        result.name = result.name || "Webkit"
        result.webkit = t
      }
      if (!result.version && versionIdentifier) {
        result.version = versionIdentifier
      }
    } else if (!result.opera && /gecko\//i.test(ua)) {
      result.name = result.name || "Gecko"
      result.gecko = t
      result.version = result.version || getFirstMatch(/gecko\/(\d+(\.\d+)?)/i)
    }

    // set OS flags for platforms that have multiple browsers
    if (!result.msedge && (android || result.silk)) {
      result.android = t
    } else if (iosdevice) {
      result[iosdevice] = t
      result.ios = t
    } else if (mac) {
      result.mac = t
    } else if (xbox) {
      result.xbox = t
    } else if (windows) {
      result.windows = t
    } else if (linux) {
      result.linux = t
    }

    // OS version extraction
    var osVersion = '';
    if (result.windowsphone) {
      osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
    } else if (iosdevice) {
      osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
      osVersion = osVersion.replace(/[_\s]/g, '.');
    } else if (android) {
      osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
    } else if (result.webos) {
      osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
    } else if (result.blackberry) {
      osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
    } else if (result.bada) {
      osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
    } else if (result.tizen) {
      osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
    }
    if (osVersion) {
      result.osversion = osVersion;
    }

    // device type extraction
    var osMajorVersion = osVersion.split('.')[0];
    if (
         tablet
      || nexusTablet
      || iosdevice == 'ipad'
      || (android && (osMajorVersion == 3 || (osMajorVersion >= 4 && !mobile)))
      || result.silk
    ) {
      result.tablet = t
    } else if (
         mobile
      || iosdevice == 'iphone'
      || iosdevice == 'ipod'
      || android
      || nexusMobile
      || result.blackberry
      || result.webos
      || result.bada
    ) {
      result.mobile = t
    }

    // Graded Browser Support
    // http://developer.yahoo.com/yui/articles/gbs
    if (result.msedge ||
        (result.msie && result.version >= 10) ||
        (result.yandexbrowser && result.version >= 15) ||
		    (result.vivaldi && result.version >= 1.0) ||
        (result.chrome && result.version >= 20) ||
        (result.samsungBrowser && result.version >= 4) ||
        (result.firefox && result.version >= 20.0) ||
        (result.safari && result.version >= 6) ||
        (result.opera && result.version >= 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] >= 6) ||
        (result.blackberry && result.version >= 10.1)
        || (result.chromium && result.version >= 20)
        ) {
      result.a = t;
    }
    else if ((result.msie && result.version < 10) ||
        (result.chrome && result.version < 20) ||
        (result.firefox && result.version < 20.0) ||
        (result.safari && result.version < 6) ||
        (result.opera && result.version < 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] < 6)
        || (result.chromium && result.version < 20)
        ) {
      result.c = t
    } else result.x = t

    return result
  }

  var bowser = detect(typeof navigator !== 'undefined' ? navigator.userAgent || '' : '')

  bowser.test = function (browserList) {
    for (var i = 0; i < browserList.length; ++i) {
      var browserItem = browserList[i];
      if (typeof browserItem=== 'string') {
        if (browserItem in bowser) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get version precisions count
   *
   * @example
   *   getVersionPrecision("1.10.3") // 3
   *
   * @param  {string} version
   * @return {number}
   */
  function getVersionPrecision(version) {
    return version.split(".").length;
  }

  /**
   * Array::map polyfill
   *
   * @param  {Array} arr
   * @param  {Function} iterator
   * @return {Array}
   */
  function map(arr, iterator) {
    var result = [], i;
    if (Array.prototype.map) {
      return Array.prototype.map.call(arr, iterator);
    }
    for (i = 0; i < arr.length; i++) {
      result.push(iterator(arr[i]));
    }
    return result;
  }

  /**
   * Calculate browser version weight
   *
   * @example
   *   compareVersions(['1.10.2.1',  '1.8.2.1.90'])    // 1
   *   compareVersions(['1.010.2.1', '1.09.2.1.90']);  // 1
   *   compareVersions(['1.10.2.1',  '1.10.2.1']);     // 0
   *   compareVersions(['1.10.2.1',  '1.0800.2']);     // -1
   *
   * @param  {Array<String>} versions versions to compare
   * @return {Number} comparison result
   */
  function compareVersions(versions) {
    // 1) get common precision for both versions, for example for "10.0" and "9" it should be 2
    var precision = Math.max(getVersionPrecision(versions[0]), getVersionPrecision(versions[1]));
    var chunks = map(versions, function (version) {
      var delta = precision - getVersionPrecision(version);

      // 2) "9" -> "9.0" (for precision = 2)
      version = version + new Array(delta + 1).join(".0");

      // 3) "9.0" -> ["000000000"", "000000009"]
      return map(version.split("."), function (chunk) {
        return new Array(20 - chunk.length).join("0") + chunk;
      }).reverse();
    });

    // iterate in reverse order by reversed chunks array
    while (--precision >= 0) {
      // 4) compare: "000000009" > "000000010" = false (but "9" > "10" = true)
      if (chunks[0][precision] > chunks[1][precision]) {
        return 1;
      }
      else if (chunks[0][precision] === chunks[1][precision]) {
        if (precision === 0) {
          // all version chunks are same
          return 0;
        }
      }
      else {
        return -1;
      }
    }
  }

  /**
   * Check if browser is unsupported
   *
   * @example
   *   bowser.isUnsupportedBrowser({
   *     msie: "10",
   *     firefox: "23",
   *     chrome: "29",
   *     safari: "5.1",
   *     opera: "16",
   *     phantom: "534"
   *   });
   *
   * @param  {Object}  minVersions map of minimal version to browser
   * @param  {Boolean} [strictMode = false] flag to return false if browser wasn't found in map
   * @param  {String}  [ua] user agent string
   * @return {Boolean}
   */
  function isUnsupportedBrowser(minVersions, strictMode, ua) {
    var _bowser = bowser;

    // make strictMode param optional with ua param usage
    if (typeof strictMode === 'string') {
      ua = strictMode;
      strictMode = void(0);
    }

    if (strictMode === void(0)) {
      strictMode = false;
    }
    if (ua) {
      _bowser = detect(ua);
    }

    var version = "" + _bowser.version;
    for (var browser in minVersions) {
      if (minVersions.hasOwnProperty(browser)) {
        if (_bowser[browser]) {
          // browser version and min supported version.
          return compareVersions([version, minVersions[browser]]) < 0;
        }
      }
    }

    return strictMode; // not found
  }

  /**
   * Check if browser is supported
   *
   * @param  {Object} minVersions map of minimal version to browser
   * @param  {Boolean} [strictMode = false] flag to return false if browser wasn't found in map
   * @param  {String}  [ua] user agent string
   * @return {Boolean}
   */
  function check(minVersions, strictMode, ua) {
    return !isUnsupportedBrowser(minVersions, strictMode, ua);
  }

  bowser.isUnsupportedBrowser = isUnsupportedBrowser;
  bowser.compareVersions = compareVersions;
  bowser.check = check;

  /*
   * Set our detect method to the main bowser object so we can
   * reuse it to test other user agents.
   * This is needed to implement future tests.
   */
  bowser._detect = detect;

  return bowser
});

/*!
audiocontext-polyfill.js v0.1.1
(c) 2013 - 2014 Shinnosuke Watanabe
Licensed under the MIT license
*/

(function(window, undefined) {
  'use strict';

  window.AudioContext = window.AudioContext ||
                        window.webkitAudioContext;

  window.OfflineAudioContext = window.OfflineAudioContext ||
                               window.webkitOfflineAudioContext;

  var Proto = AudioContext.prototype;

  var tmpctx = new AudioContext();

  // Support alternate names
  // start (noteOn), stop (noteOff), createGain (createGainNode), etc.
  var isStillOld = function(normative, old) {
    return normative === undefined && old !== undefined;
  };

  var bufProto = tmpctx.createBufferSource().constructor.prototype;

  if (isStillOld(bufProto.start, bufProto.noteOn) ||
  isStillOld(bufProto.stop, bufProto.noteOff)) {
    var nativeCreateBufferSource = Proto.createBufferSource;

    Proto.createBufferSource = function createBufferSource() {
      var returnNode = nativeCreateBufferSource.call(this);
      returnNode.start = returnNode.start || returnNode.noteOn;
      returnNode.stop = returnNode.stop || returnNode.noteOff;

      return returnNode;
    };
  }

  // Firefox 24 doesn't support OscilatorNode
  if (typeof tmpctx.createOscillator === 'function') {
    var oscProto = tmpctx.createOscillator().constructor.prototype;

    if (isStillOld(oscProto.start, oscProto.noteOn) ||
    isStillOld(oscProto.stop, oscProto.noteOff)) {
      var nativeCreateOscillator = Proto.createOscillator;

      Proto.createOscillator = function createOscillator() {
        var returnNode = nativeCreateOscillator.call(this);
        returnNode.start = returnNode.start || returnNode.noteOn;
        returnNode.stop = returnNode.stop || returnNode.noteOff;

        return returnNode;
      };
    }
  }

  if (Proto.createGain === undefined && Proto.createGainNode !== undefined) {
    Proto.createGain = Proto.createGainNode;
  }

  if (Proto.createDelay === undefined && Proto.createDelayNode !== undefined) {
    Proto.createDelay = Proto.createGainNode;
  }

  if (Proto.createScriptProcessor === undefined &&
  Proto.createJavaScriptNode !== undefined) {
    Proto.createScriptProcessor = Proto.createJavaScriptNode;
  }

  // Black magic for iOS
  var is_iOS = (navigator.userAgent.indexOf('like Mac OS X') !== -1);
  if (is_iOS) {
    var OriginalAudioContext = AudioContext;
    window.AudioContext = function AudioContext() {
      var iOSCtx = new OriginalAudioContext();

      var body = document.body;
      var tmpBuf = iOSCtx.createBufferSource();
      var tmpProc = iOSCtx.createScriptProcessor(256, 1, 1);

      body.addEventListener('touchstart', instantProcess, false);

      function instantProcess() {
        tmpBuf.start(0);
        tmpBuf.connect(tmpProc);
        tmpProc.connect(iOSCtx.destination);
      }

      // This function will be called once and for all.
      tmpProc.onaudioprocess = function() {
        tmpBuf.disconnect();
        tmpProc.disconnect();
        body.removeEventListener('touchstart', instantProcess, false);
        tmpProc.onaudioprocess = null;
      };

      return iOSCtx;
    };
  }
}(window));

(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (typeof input === 'string') {
      this.url = input
    } else {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = 'status' in options ? options.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

/**
 * HTTP DELETE 요청을 보냅니다.
 */
global.DELETE = METHOD({

	run : function(urlOrParams, responseListenerOrListeners) {
		'use strict';
		//REQUIRED: urlOrParams
		//OPTIONAL: urlOrParams.isSecure	HTTPS 프로토콜인지 여부
		//OPTIONAL: urlOrParams.host
		//OPTIONAL: urlOrParams.port
		//OPTIONAL: urlOrParams.uri
		//OPTIONAL: urlOrParams.url			요청을 보낼 URL. url을 입력하면 isSecure, host, port, uri를 입력할 필요가 없습니다.
		//OPTIONAL: urlOrParams.paramStr	a=1&b=2&c=3과 같은 형태의 파라미터 문자열
		//OPTIONAL: urlOrParams.params		데이터 형태({...})로 표현한 파라미터 목록
		//OPTIONAL: urlOrParams.data		UPPERCASE 웹 서버로 보낼 데이터. 요청을 UPPERCASE기반 웹 서버로 보내는 경우 데이터를 직접 전송할 수 있습니다.
		//OPTIONAL: urlOrParams.headers		요청 헤더
		//OPTIONAL: responseListenerOrListeners
		//OPTIONAL: responseListenerOrListeners.error
		//OPTIONAL: responseListenerOrListeners.success

		REQUEST(COMBINE([CHECK_IS_DATA(urlOrParams) === true ? urlOrParams : {
			url : urlOrParams
		}, {
			method : 'DELETE'
		}]), responseListenerOrListeners);
	}
});
/**
 * HTTP GET 요청을 보냅니다.
 */
global.GET = METHOD({

	run : function(urlOrParams, responseListenerOrListeners) {
		'use strict';
		//REQUIRED: urlOrParams
		//OPTIONAL: urlOrParams.isSecure	HTTPS 프로토콜인지 여부
		//OPTIONAL: urlOrParams.host
		//OPTIONAL: urlOrParams.port
		//OPTIONAL: urlOrParams.uri
		//OPTIONAL: urlOrParams.url			요청을 보낼 URL. url을 입력하면 isSecure, host, port, uri를 입력할 필요가 없습니다.
		//OPTIONAL: urlOrParams.paramStr	a=1&b=2&c=3과 같은 형태의 파라미터 문자열
		//OPTIONAL: urlOrParams.params		데이터 형태({...})로 표현한 파라미터 목록
		//OPTIONAL: urlOrParams.data		UPPERCASE 웹 서버로 보낼 데이터. 요청을 UPPERCASE기반 웹 서버로 보내는 경우 데이터를 직접 전송할 수 있습니다.
		//OPTIONAL: urlOrParams.headers		요청 헤더
		//OPTIONAL: responseListenerOrListeners
		//OPTIONAL: responseListenerOrListeners.error
		//OPTIONAL: responseListenerOrListeners.success

		REQUEST(COMBINE([CHECK_IS_DATA(urlOrParams) === true ? urlOrParams : {
			url : urlOrParams
		}, {
			method : 'GET'
		}]), responseListenerOrListeners);
	}
});
/**
 * HTTP POST 요청을 보냅니다.
 */
global.POST = METHOD({

	run : function(urlOrParams, responseListenerOrListeners) {
		'use strict';
		//REQUIRED: urlOrParams
		//OPTIONAL: urlOrParams.isSecure	HTTPS 프로토콜인지 여부
		//OPTIONAL: urlOrParams.host
		//OPTIONAL: urlOrParams.port
		//OPTIONAL: urlOrParams.uri
		//OPTIONAL: urlOrParams.url			요청을 보낼 URL. url을 입력하면 isSecure, host, port, uri를 입력할 필요가 없습니다.
		//OPTIONAL: urlOrParams.paramStr	a=1&b=2&c=3과 같은 형태의 파라미터 문자열
		//OPTIONAL: urlOrParams.params		데이터 형태({...})로 표현한 파라미터 목록
		//OPTIONAL: urlOrParams.data		UPPERCASE 웹 서버로 보낼 데이터. 요청을 UPPERCASE기반 웹 서버로 보내는 경우 데이터를 직접 전송할 수 있습니다.
		//OPTIONAL: urlOrParams.headers		요청 헤더
		//OPTIONAL: responseListenerOrListeners
		//OPTIONAL: responseListenerOrListeners.error
		//OPTIONAL: responseListenerOrListeners.success

		REQUEST(COMBINE([CHECK_IS_DATA(urlOrParams) === true ? urlOrParams : {
			url : urlOrParams
		}, {
			method : 'POST'
		}]), responseListenerOrListeners);
	}
});
/**
 * HTTP PUT 요청을 보냅니다.
 */
global.PUT = METHOD({

	run : function(urlOrParams, responseListenerOrListeners) {
		'use strict';
		//REQUIRED: urlOrParams
		//OPTIONAL: urlOrParams.isSecure	HTTPS 프로토콜인지 여부
		//OPTIONAL: urlOrParams.host
		//OPTIONAL: urlOrParams.port
		//OPTIONAL: urlOrParams.uri
		//OPTIONAL: urlOrParams.url			요청을 보낼 URL. url을 입력하면 isSecure, host, port, uri를 입력할 필요가 없습니다.
		//OPTIONAL: urlOrParams.paramStr	a=1&b=2&c=3과 같은 형태의 파라미터 문자열
		//OPTIONAL: urlOrParams.params		데이터 형태({...})로 표현한 파라미터 목록
		//OPTIONAL: urlOrParams.data		UPPERCASE 웹 서버로 보낼 데이터. 요청을 UPPERCASE기반 웹 서버로 보내는 경우 데이터를 직접 전송할 수 있습니다.
		//OPTIONAL: urlOrParams.headers		요청 헤더
		//OPTIONAL: responseListenerOrListeners
		//OPTIONAL: responseListenerOrListeners.error
		//OPTIONAL: responseListenerOrListeners.success

		REQUEST(COMBINE([CHECK_IS_DATA(urlOrParams) === true ? urlOrParams : {
			url : urlOrParams
		}, {
			method : 'PUT'
		}]), responseListenerOrListeners);
	}
});
/**
 * HTTP 요청을 보냅니다.
 */
global.REQUEST = METHOD({

	run : function(params, responseListenerOrListeners) {
		'use strict';
		//REQUIRED: params
		//REQUIRED: params.method	요청 메소드. GET, POST, PUT, DELETE를 설정할 수 있습니다.
		//OPTIONAL: params.isSecure	HTTPS 프로토콜인지 여부
		//OPTIONAL: params.host
		//OPTIONAL: params.port
		//OPTIONAL: params.uri
		//OPTIONAL: params.url		요청을 보낼 URL. url을 입력하면 isSecure, host, port, uri를 입력할 필요가 없습니다.
		//OPTIONAL: params.paramStr	a=1&b=2&c=3과 같은 형태의 파라미터 문자열
		//OPTIONAL: params.params	데이터 형태({...})로 표현한 파라미터 목록
		//OPTIONAL: params.data		UPPERCASE 웹 서버로 보낼 데이터. 요청을 UPPERCASE기반 웹 서버로 보내는 경우 데이터를 직접 전송할 수 있습니다.
		//OPTIONAL: params.headers	요청 헤더
		//OPTIONAL: responseListenerOrListeners
		//OPTIONAL: responseListenerOrListeners.error
		//OPTIONAL: responseListenerOrListeners.success

		var
		// method
		method = params.method,
		
		// is secure
		isSecure = params.isSecure === undefined ? BROWSER_CONFIG.isSecure : params.isSecure,
		
		// host
		host = params.host === undefined ? BROWSER_CONFIG.host : params.host,

		// port
		port = params.port === undefined ? (params.host === undefined ? BROWSER_CONFIG.port : 80) : params.port,

		// uri
		uri = params.uri,
		
		// url
		url = params.url,

		// param str
		paramStr = params.paramStr,

		// params
		_params = params.params,

		// data
		data = params.data,
		
		// headers
		headers = params.headers,

		// response listener
		responseListener,

		// error listener
		errorListener,

		// url
		url,

		// http request
		req;

		method = method.toUpperCase();
		
		if (url !== undefined) {
			
			if (url.indexOf('?') !== -1) {
				paramStr = url.substring(url.indexOf('?') + 1) + (paramStr === undefined ? '' : '&' + paramStr);
				url = url.substring(0, url.indexOf('?'));
			}
			
		} else {
			
			if (uri !== undefined && uri.indexOf('?') !== -1) {
				paramStr = uri.substring(uri.indexOf('?') + 1) + (paramStr === undefined ? '' : '&' + paramStr);
				uri = uri.substring(0, uri.indexOf('?'));
			}
		}
		
		if (_params !== undefined) {
			
			EACH(_params, function(value, name) {
				
				if (paramStr === undefined) {
					paramStr = '';
				} else {
					paramStr += '&';
				}
				
				paramStr += encodeURIComponent(name) + '=' + encodeURIComponent(value);
			});
		}
		
		if (data !== undefined) {
			paramStr = (paramStr === undefined ? '' : paramStr + '&') + '__DATA=' + encodeURIComponent(STRINGIFY(data));
		}

		paramStr = (paramStr === undefined ? '' : paramStr + '&') + Date.now();
		
		if (url === undefined) {
			url = (isSecure === true ? 'https://' : 'http://') + host + ':' + port + '/' + (uri === undefined ? '' : (uri[0] === '/' ? uri.substring(1) : uri));
		}
		
		if (CHECK_IS_DATA(responseListenerOrListeners) !== true) {
			responseListener = responseListenerOrListeners;
		} else {
			responseListener = responseListenerOrListeners.success;
			errorListener = responseListenerOrListeners.error;
		}
		
		(method === 'GET' || method === 'DELETE' ? fetch(url + '?' + paramStr, {
			method : method,
			credentials : host === BROWSER_CONFIG.host && port === BROWSER_CONFIG.port ? 'include' : undefined,
			headers : headers === undefined ? undefined : new Headers(headers)
		}) : fetch(url, {
			method : method,
			body : paramStr,
			credentials : host === BROWSER_CONFIG.host && port === BROWSER_CONFIG.port ? 'include' : undefined,
			headers : headers === undefined ? undefined : new Headers(headers)
		})).then(function(response) {
			return response.text();
		}).then(function(responseText) {
			responseListener(responseText);
		}).catch(function(error) {
			
			var
			// error msg
			errorMsg = error.toString();

			if (errorListener !== undefined) {
				errorListener(errorMsg);
			} else {
				SHOW_ERROR('REQUEST', errorMsg, params);
			}
		});
	}
});
/**
 * URI를 변경하여 다른 뷰로 이동합니다.
 */
global.GO = METHOD(function(m) {
	'use strict';
	
	var
	// is ctrl key down
	isCTRLKeyDown;

	return {
		
		run : function(uri) {
			//REQUIRED: uri
			
			if (isCTRLKeyDown === undefined) {
				isCTRLKeyDown = false;
							
				EVENT('keydown', function(e) {
					if (e.getKey() === 'Control') {
						isCTRLKeyDown = true;
					}
				});
				
				EVENT('keyup', function(e) {
					if (e.getKey() === 'Control') {
						isCTRLKeyDown = false;
					}
				});
			}
			
			if (isCTRLKeyDown === true) {
				
				GO_NEW_WIN(uri);
				
				isCTRLKeyDown = false;
			}
			
			else {
				
				history.pushState(undefined, undefined, HREF(uri));
				
				MATCH_VIEW.checkAll();
			}
		}
	};
});

FOR_BOX(function(box) {
	'use strict';

	box.GO = METHOD({

		run : function(uri) {
			//REQUIRED: uri

			GO((box.boxName === CONFIG.defaultBoxName ? '' : box.boxName + '/') + uri);
		}
	});
});

/**
 * 새 창에서 URI에 해당하는 뷰를 띄웁니다.
 */
global.GO_NEW_WIN = METHOD({

	run : function(uri) {
		'use strict';
		//REQUIRED: uri

		global.open(HREF(uri));
	}
});

FOR_BOX(function(box) {
	'use strict';

	box.GO_NEW_WIN = METHOD({

		run : function(uri) {
			//REQUIRED: uri

			GO_NEW_WIN((box.boxName === CONFIG.defaultBoxName ? '' : box.boxName + '/') + uri);
		}
	});
});

/**
 * URI로부터 주소를 생성하여 반환합니다.
 */
global.HREF = METHOD({

	run : function(uri) {
		'use strict';
		//REQUIRED: uri

		return '/' + uri;
	}
});

FOR_BOX(function(box) {
	'use strict';

	box.HREF = METHOD({

		run : function(uri) {
			//OPTIONAL: uri

			return HREF((box.boxName === CONFIG.defaultBoxName ? '' : box.boxName + '/') + (uri === undefined ? '' : uri));
		}
	});
});

/**
 * 특정 URI와 뷰를 연결합니다.
 */
global.MATCH_VIEW = METHOD(function(m) {
	'use strict';
	
	var
	// change uri handlers
	changeURIHandlers = [],
	
	// check all.
	checkAll;
	
	m.checkAll = checkAll = function() {
		EACH(changeURIHandlers, function(changeURIHandler) {
			changeURIHandler();
		});
	};
	
	return {

		run : function(params) {
			//REQUIRED: params
			//REQUIRED: params.uri
			//OPTIONAL: params.excludeURI
			//REQUIRED: params.target
	
			var
			// uri
			uri = params.uri,
			
			// exclude uri
			excludeURI = params.excludeURI,
	
			// target
			target = params.target,
	
			// uri matcher
			uriMatcher = URI_MATCHER(uri),
	
			// exclude uri matcher
			excludeURIMatcher = excludeURI === undefined ? undefined : URI_MATCHER(excludeURI),
	
			// view
			view,
	
			// pre params
			preParams,
			
			// change uri handler.
			changeURIHandler = function() {
	
				var
				// uri
				uri = URI(),
	
				// result
				result,
	
				// uri parmas
				uriParams;
	
				// when view founded
				if (uri !== REFRESH.getRefreshingURI() && (result = uriMatcher.check(uri)).checkIsMatched() === true && (excludeURI === undefined || excludeURIMatcher.check(uri).checkIsMatched() !== true)) {
	
					uriParams = result.getURIParams();
	
					// when before view not exists, create view.
					if (view === undefined) {
	
						view = target();
						view.changeParams(uriParams);
						target.lastView = view;
	
						preParams = uriParams;
					}
	
					// when before view exists, change params.
					else if (CHECK_ARE_SAME([preParams, uriParams]) !== true) {
	
						view.changeParams(uriParams);
						preParams = uriParams;
					}
					
					view.runURIChangeHandlers(uri);
				}
	
				// when view not founded, close before view
				else if (view !== undefined) {
	
					view.close();
	
					view = undefined;
					target.lastView = undefined;
				}
			};
			
			changeURIHandlers.push(changeURIHandler);
	
			EVENT('popstate', function() {
				changeURIHandler();
			});
			
			changeURIHandler();
		}
	};
});

FOR_BOX(function(box) {
	'use strict';

	box.MATCH_VIEW = METHOD({

		run : function(params) {
			//REQUIRED: params
			//REQUIRED: params.uri
			//OPTIONAL: params.excludeURI
			//REQUIRED: params.target

			var
			// uri
			uri = params.uri,
			
			// exclude uri
			excludeURI = params.excludeURI,

			// target
			target = params.target,

			// new uris
			newURIs = [],
			
			// new exclude uris
			newExcludeURIs = [],

			// push uri.
			pushURI = function(uri) {

				if (box.boxName === CONFIG.defaultBoxName) {
					newURIs.push(uri);
				}

				newURIs.push(box.boxName + '/' + uri);
			},

			// push exclude uri.
			pushExcludeURI = function(uri) {

				if (box.boxName === CONFIG.defaultBoxName) {
					newExcludeURIs.push(uri);
				}

				newExcludeURIs.push(box.boxName + '/' + uri);
			};

			if (CHECK_IS_ARRAY(uri) === true) {
				EACH(uri, pushURI);
			} else {
				pushURI(uri);
			}
			
			if (excludeURI !== undefined) {
				if (CHECK_IS_ARRAY(excludeURI) === true) {
					EACH(excludeURI, pushExcludeURI);
				} else {
					pushExcludeURI(excludeURI);
				}
			}

			MATCH_VIEW({
				uri : newURIs,
				excludeURI : newExcludeURIs,
				target : target
			});
		}
	});
});

/**
 * 뷰를 새로 불러옵니다.
 */
global.REFRESH = METHOD(function(m) {
	'use strict';
	
	var
	// refreshing uri
	refreshingURI = '__REFRESHING',
	
	// get refreshing uri.
	getRefreshingURI;
	
	m.getRefreshingURI = getRefreshingURI = function() {
		return refreshingURI;
	};
	
	return {

		run : function(uri) {
			//OPTIONAL: uri
	
			var
			// saved uri
			savedURI = uri !== undefined ? uri : location.pathname.substring(1);
	
			history.pushState(undefined, undefined, '/' + refreshingURI);
			MATCH_VIEW.checkAll();
			
			history.replaceState(undefined, undefined, '/' + savedURI);
			MATCH_VIEW.checkAll();
		}
	};
});

FOR_BOX(function(box) {
	'use strict';

	box.REFRESH = METHOD({

		run : function(uri) {
			//OPTIONAL: uri
			
			REFRESH((box.boxName === CONFIG.defaultBoxName ? '' : box.boxName + '/') + (uri === undefined ? '' : uri));
		}
	});
});

/**
 * 현재 브라우저의 URI를 가져옵니다.
 */
global.URI = METHOD({

	run : function() {
		'use strict';
		
		return decodeURIComponent(location.pathname.substring(1));
	}
});

/**
 * 뷰를 정의하기 위한 VIEW 클래스
 */
global.VIEW = CLASS({

	init : function(inner, self) {
		'use strict';

		var
		// is closed
		isClosed = false,

		// params change handlers
		paramsChangeHandlers = [],
		
		// uri change handlers
		uriChangeHandlers = [],

		// close handlers
		closeHandlers = [],
		
		// now params
		nowParams,
		
		// now uri
		nowURI,

		// on.
		on,

		// change params.
		changeParams,
		
		// run uri change handlers.
		runURIChangeHandlers,

		// close.
		close,

		// check is closed.
		checkIsClosed;

		inner.on = on = function(eventName, eventHandler) {
			//REQUIRED: eventName
			//REQUIRED: eventHandler

			// when change params
			if (eventName === 'paramsChange') {
				paramsChangeHandlers.push(eventHandler);
				if (nowParams !== undefined) {
					eventHandler(nowParams);
				}
			}
			
			// when change uri
			if (eventName === 'uriChange') {
				uriChangeHandlers.push(eventHandler);
				if (nowURI !== undefined) {
					eventHandler(nowURI);
				}
			}

			// when close
			else if (eventName === 'close') {
				closeHandlers.push(eventHandler);
			}
		};

		self.changeParams = changeParams = function(params) {
			
			nowParams = params;

			EACH(paramsChangeHandlers, function(handler) {
				handler(params);
			});
		};
		
		self.runURIChangeHandlers = runURIChangeHandlers = function(uri) {
			
			nowURI = uri;
			
			EACH(uriChangeHandlers, function(handler) {
				handler(uri);
			});
		};

		self.close = close = function() {

			EACH(closeHandlers, function(handler) {
				handler();
			});

			isClosed = true;
		};

		inner.checkIsClosed = checkIsClosed = function() {
			return isClosed;
		};
		
		scrollTo(0, 0);
	}
});

/**
 * 가로 스크롤의 현재 위치를 픽셀 단위로 가져옵니다.
 */
global.SCROLL_LEFT = METHOD({

	run : function() {
		'use strict';

		return global.pageXOffset;
	}
});

/**
 * 세로 스크롤의 현재 위치를 픽셀 단위로 가져옵니다.
 */
global.SCROLL_TOP = METHOD({

	run : function() {
		'use strict';

		return global.pageYOffset;
	}
});

/**
 * 브라우저 창에 표시되는 문서의 제목을 가져오거나 변경합니다.
 */
global.TITLE = METHOD({

	run : function(title) {
		'use strict';
		//OPTIONAL: title

		if (title === undefined) {
			return document.title;
		} else {
			document.title = title;
		}
	}
});

/**
 * 브라우저 창의 세로 길이를 픽셀 단위로 반환합니다.
 */
global.WIN_HEIGHT = METHOD({

	run : function() {
		'use strict';

		return document.documentElement.clientHeight;
	}
});

/**
 * 브라우저 창의 가로 길이를 픽셀 단위로 반환합니다.
 */
global.WIN_WIDTH = METHOD({

	run : function() {
		'use strict';

		return document.documentElement.clientWidth;
	}
});
