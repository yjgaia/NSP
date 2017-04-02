'use strict';

/*

Welcome to UPPERCASE-CORE! (http://uppercase.io)

*/

// 웹 브라우저 환경에서는 window가 global 객체 입니다.
let global = window;

/*
 * 기본 설정
 */
global.CONFIG = {
	
	// 개발 모드 설정
	isDevMode : false
};

/*
 * 메소드를 생성합니다.
 */
global.METHOD = (define) => {
	//REQUIRED: define		메소드 정의 구문
	//REQUIRED: define.run	메소드 실행 구문

	let funcs;
	let run;

	let m = (params, funcs) => {
		//OPTIONAL: params
		//OPTIONAL: funcs

		if (run !== undefined) {
			return run(params, funcs);
		}
	};
	
	m.type = METHOD;
	
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

/*
 * DB의 update 기능을 사용할 때, 데이터의 특정 값에 TO_DELETE를 지정하게 되면 해당 값이 삭제됩니다.
 * 자세한 것은 DB의 update 예제를 살펴보시기 바랍니다.
 *
 * 참고로 UPPERCASE 기반 프로젝트에서 이 TO_DELETE만이 null이 될 수 있는 유일한 변수입니다.
 * 다른 변수에서는 null을 사용하지 않고 undefined를 사용해 주시기 바랍니다.
 */
global.TO_DELETE = null;

/*
 * BOX를 생성합니다.
 */
global.BOX = METHOD((m) => {

	let boxes = {};
	
	let getAllBoxes = m.getAllBoxes = () => {
		return boxes;
	};

	return {

		run : (boxName) => {
			//REQUIRED: boxName

			let box = (packName) => {
				//REQUIRED: packName

				let packNameSps = packName.split('.');
				
				let pack;

				EACH(packNameSps, (packNameSp) => {

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

/*
 * 모든 박스를 대상으로 하는 메소드와 클래스, 싱글톤 객체를 선언할 때 사용합니다.
 */
global.FOR_BOX = METHOD((m) => {

	let funcs = [];
	
	let inject = m.inject = (box) => {
		EACH(funcs, (func) => {
			func(box);
		});
	};

	return {

		run : (func) => {
			//REQUIRED: func

			EACH(BOX.getAllBoxes(), (box) => {
				func(box);
			});

			funcs.push(func);
		}
	};
});

/*
 * 콘솔에 오류 메시지를 출력합니다.
 */
global.SHOW_ERROR = (tag, errorMsg, params) => {
	//REQUIRED: tag
	//REQUIRED: errorMsg
	//OPTIONAL: params
	
	let cal = CALENDAR();
		
	console.error(cal.getYear() + '-' + cal.getMonth(true) + '-' + cal.getDate(true) + ' ' + cal.getHour(true) + ':' + cal.getMinute(true) + ':' + cal.getSecond(true) + ' [' + tag + '] 오류가 발생했습니다. 오류 메시지: ' + errorMsg);
	
	if (params !== undefined) {
		console.error('다음은 오류를 발생시킨 파라미터입니다.');
		console.error(JSON.stringify(params, TO_DELETE, 4));
	}
};
/*
 * 콘솔에 경고 메시지를 출력합니다.
 */
global.SHOW_WARNING = (tag, warningMsg, params) => {
	//REQUIRED: tag
	//REQUIRED: warningMsg
	//OPTIONAL: params
	
	let cal = CALENDAR();
	
	console.warn(cal.getYear() + '-' + cal.getMonth(true) + '-' + cal.getDate(true) + ' ' + cal.getHour(true) + ':' + cal.getMinute(true) + ':' + cal.getSecond(true) + ' [' + tag + '] 경고가 발생했습니다. 경고 메시지: ' + warningMsg);
	
	if (params !== undefined) {
		console.warn('다음은 경고를 발생시킨 파라미터입니다.');
		console.warn(JSON.stringify(params, TO_DELETE, 4));
	}
};
/*
 * 클래스를 생성합니다.
 */
global.CLASS = METHOD((m) => {

	let instanceCount = 0;

	let getNextInstanceId = m.getNextInstanceId = () => {

		instanceCount += 1;

		return instanceCount - 1;
	};

	return {

		run : (define) => {
			//REQUIRED: define	클래스 정의 구문

			let funcs;
			
			let preset;
			let init;
			let _params;
			let afterInit;
			
			let cls = (params, funcs) => {
				//OPTIONAL: params
				//OPTIONAL: funcs

				// inner (protected)
				let inner = {};

				// self (public)
				let self = {
					
					type : cls,
					
					id : getNextInstanceId(),
					
					checkIsInstanceOf : (checkCls) => {
	
						let targetCls = cls;
	
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

			let innerInit = cls.innerInit = (inner, self, params, funcs) => {
				//OPTIONAL: params
				//OPTIONAL: funcs
				
				// mom (parent class)
				let mom;
				
				let paramValue;

				let extend = (params, tempParams) => {

					EACH(tempParams, (value, name) => {

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

						let tempParams = _params(cls);

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

			let innerAfterInit = cls.innerAfterInit = (inner, self, params, funcs) => {
				//OPTIONAL: params
				//OPTIONAL: funcs

				let mom = cls.mom;

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

/*
 * 모든 정의된 싱글톤 객체의 초기화를 수행합니다.
 */
global.INIT_OBJECTS = METHOD({

	run : () => {

		OBJECT.initObjects();
	}
});

/*
 * 실글톤 객체를 생성합니다.
 */
global.OBJECT = METHOD((m) => {

	let readyObjects = [];
	let isInited = false;

	let initObject = (object) => {
		//REQUIRED: object	초기화 할 싱글톤 객체

		let cls = object.type;
		let inner = {};
		let params = {};

		// set id.
		object.id = CLASS.getNextInstanceId();

		cls.innerInit(inner, object, params);
		cls.innerAfterInit(inner, object, params);
	};

	let addReadyObject = (object) => {
		//REQUIRED: object	초기화를 대기시킬 싱글톤 객체

		if (isInited === true) {
			initObject(object);
		} else {
			readyObjects.push(object);
		}
	};

	let removeReadyObject = m.removeReadyObject = (object) => {
		//REQUIRED: object	대기열에서 삭제할 싱글톤 객체
		
		REMOVE({
			array : readyObjects,
			value : object
		});
	};

	let initObjects = m.initObjects = () => {

		// init all objects.
		EACH(readyObjects, (object) => {
			initObject(object);
		});

		isInited = true;
	};

	return {

		run : (define) => {
			//REQUIRED: define	클래스 정의 구문

			let cls = CLASS(define);

			let self = {
				
				type : cls,
				
				checkIsInstanceOf : (checkCls) => {

					let targetCls = cls;
	
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

/*
 * target이 JavaScript arguments인지 확인합니다.
 */
global.CHECK_IS_ARGUMENTS = METHOD({

	run : (target) => {
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

/*
 * 주어진 비동기 함수들을 순서대로 실행합니다.
 */
global.NEXT = METHOD({

	run : (countOrArray, funcs) => {
		//OPTIONAL: countOrArray
		//REQUIRED: funcs

		let count;
		let array;
		
		let f;
		
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
		}, (i) => {

			let next;

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
					next = () => {
						// ignore.
					};
				}

				f = funcs[i];

				if (count !== undefined) {
					
					let i = -1;

					RUN((self) => {

						i += 1;

						if (i + 1 < count) {
							f(i, self);
						} else {
							f(i, next);
						}
					});
				}
				
				else if (array !== undefined) {

					let length = array.length;

					if (length === 0) {
						next();
					}
					
					else {
						
						let i = -1;

						RUN((self) => {

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
				}
				
				else {
					f(next);
				}
			}
		});
	}
});

/*
 * 오버라이딩을 수행합니다.
 */
global.OVERRIDE = METHOD({

	run : (origin, func) => {
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

/*
 * 주어진 비동기 함수들을 병렬로 실행합니다.
 */
global.PARALLEL = METHOD({

	run : (dataOrArrayOrCount, funcs) => {
		//OPTIONAL: dataOrArrayOrCount
		//REQUIRED: funcs
		
		let doneCount = 0;

		// only funcs
		if (funcs === undefined) {
			funcs = dataOrArrayOrCount;
			
			let length = funcs.length - 1;

			EACH(funcs, (func, i) => {

				if (i < length) {

					func(() => {

						doneCount += 1;

						if (doneCount === length) {
							funcs[length]();
						}
					});
				}
			});
		}
		
		else if (dataOrArrayOrCount === undefined) {
			funcs[1]();
		}
		
		else if (CHECK_IS_DATA(dataOrArrayOrCount) === true) {
			
			let propertyCount = COUNT_PROPERTIES(dataOrArrayOrCount);

			if (propertyCount === 0) {
				funcs[1]();
			} else {

				EACH(dataOrArrayOrCount, (value, name) => {

					funcs[0](value, () => {

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

				EACH(dataOrArrayOrCount, (value, i) => {

					funcs[0](value, () => {

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

				REPEAT(dataOrArrayOrCount, (i) => {

					funcs[0](i, () => {

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

/*
 * JSON 문자열을 원래 데이터나 배열, 값으로 변환합니다.
 */
global.PARSE_STR = METHOD({

	run : (dataStr) => {
		//REQUIRED: dataStr
		
		try {

			let data = JSON.parse(dataStr);
			
			if (CHECK_IS_DATA(data) === true) {
				return UNPACK_DATA(data);
			}
			
			else if (CHECK_IS_ARRAY(data) === true) {
				
				let array = [];
				
				EACH(data, (data) => {
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

/*
 * 알파벳 대, 소문자와 숫자로 이루어진 임의의 문자열을 생성합니다.
 */
global.RANDOM_STR = METHOD(() => {
	
	const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	
	return {
	
		run : (length) => {
			//REQUIRED: length
	
			let randomStr = '';
	
			REPEAT(length, () => {
	
				// add random character to random string.
				randomStr += CHARACTERS.charAt(RANDOM({
					limit : CHARACTERS.length
				}));
			});
	
			return randomStr;
		}
	};
});

/*
 * 데이터나 배열, 값을 JSON 문자열로 변환합니다.
 */
global.STRINGIFY = METHOD({

	run : (data) => {
		//REQUIRED: data
		
		if (CHECK_IS_DATA(data) === true) {
			return JSON.stringify(PACK_DATA(data));
		}
		
		else if (CHECK_IS_ARRAY(data) === true) {
			
			let array = [];
			
			EACH(data, (data) => {
				array.push(PACK_DATA(data));
			});
			
			return JSON.stringify(array);
		}
		
		else {
			return JSON.stringify(data);
		}
	}
});

/*
 * 테스트용 메소드입니다.
 * 
 * 테스트에 성공하거나 실패하면 콘솔에 메시지를 출력합니다.
 */
global.TEST = METHOD((m) => {

	let errorCount = 0;

	return {

		run : (name, test) => {
			//REQUIRED: name
			//REQUIRED: test

			test((bool) => {
				//REQUIRED: bool

				let temp = {};
				let line;
				
				if (bool === true) {
					console.log('[' + name + ' 테스트] 테스트를 통과하였습니다. 총 ' + errorCount + '개의 오류가 있습니다.');
				} else {

					temp.__THROW_ERROR_$$$ = () => {
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

/*
 * URI가 주어진 포맷에 맞는지 확인하는 URI_MATCHER 클래스
 * 
 * 포맷에 파라미터 구간을 지정할 수 있어 URI로부터 파라미터 값을 가져올 수 있습니다.
 */
global.URI_MATCHER = CLASS({

	init : (inner, self, format) => {
		//REQUIRED: format

		let Check = CLASS({

			init : (inner, self, uri) => {
				//REQUIRED: uri

				let uriParts = uri.split('/');
				
				let isMatched;
				let uriParams = {};

				let find = (format) => {

					let formatParts = format.split('/');

					return EACH(uriParts, (uriPart, i) => {

						let formatPart = formatParts[i];

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
				};

				if (CHECK_IS_ARRAY(format) === true) {
					isMatched = EACH(format, (format) => {
						return find(format) !== true;
					}) !== true;
				} else {
					isMatched = find(format);
				}

				let checkIsMatched = self.checkIsMatched = () => {
					return isMatched;
				};

				let getURIParams = self.getURIParams = () => {
					return uriParams;
				};
			}
		});
		
		let check = self.check = (uri) => {
			return Check(uri);
		};
	}
});

/*
 * 데이터를 검증하고, 어떤 부분이 잘못되었는지 오류를 확인할 수 있는 VALID 클래스
 */
global.VALID = CLASS((cls) => {
	
	let notEmpty = cls.notEmpty = (value) => {
		//REQUIRED: value

		let str = (value === undefined || value === TO_DELETE) ? '' : String(value);

		return CHECK_IS_ARRAY(value) === true || str.trim() !== '';
	};

	let regex = cls.regex = (params) => {
		//REQUIRED: params
		//REQUIRED: params.value
		//REQUIRED: params.pattern

		let str = String(params.value);
		let pattern = params.pattern;

		return str === str.match(pattern)[0];
	};

	let size = cls.size = (params) => {
		//REQUIRED: params
		//REQUIRED: params.value
		//OPTIONAL: params.min
		//REQUIRED: params.max
		
		let str = String(params.value);
		let min = params.min;
		let max = params.max;
		
		if (min === undefined) {
			min = 0;
		}

		return min <= str.trim().length && (max === undefined || str.length <= max);
	};

	let integer = cls.integer = (value) => {
		//REQUIRED: value

		let str = String(value);

		return notEmpty(str) === true && str.match(/^(?:-?(?:0|[1-9][0-9]*))$/) !== TO_DELETE;
	};

	let real = cls.real = (value) => {
		//REQUIRED: value
		
		let str = String(value);

		return notEmpty(str) === true && str.match(/^(?:-?(?:0|[1-9][0-9]*))?(?:\.[0-9]*)?$/) !== TO_DELETE;
	};

	let bool = cls.bool = (value) => {
		//REQUIRED: value
		
		let str = String(value);

		return str === 'true' || str === 'false';
	};

	let date = cls.date = (value) => {
		//REQUIRED: value

		let str = String(value);
		let date = Date.parse(str);

		return isNaN(date) === false;
	};

	let min = cls.min = (params) => {
		//REQUIRED: params
		//REQUIRED: params.value
		//REQUIRED: params.min
		
		let value = params.value;
		let min = params.min;

		return real(value) === true && min <= value;
	};

	let max = cls.max = (params) => {
		//REQUIRED: params
		//REQUIRED: params.value
		//REQUIRED: params.max
		
		let value = params.value;
		let max = params.max;

		return real(value) === true && max >= value;
	};

	let email = cls.email = (value) => {
		//REQUIRED: value

		return typeof value === 'string' && notEmpty(value) === true && value.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/) !== TO_DELETE;
	};

	let png = cls.png = (value) => {
		//REQUIRED: value

		return typeof value === 'string' && notEmpty(value) === true && value.match(/^data:image\/png;base64,/) !== TO_DELETE;
	};

	let url = cls.url = (value) => {
		//REQUIRED: value

		return typeof value === 'string' && notEmpty(value) === true && value.match(/^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i) !== TO_DELETE && value.length <= 2083;
	};

	let username = cls.username = (value) => {
		//REQUIRED: value

		return typeof value === 'string' && notEmpty(value) === true && value.match(/^[_a-zA-Z0-9\-]+$/) !== TO_DELETE;
	};

	// mongodb id check
	let mongoId = cls.mongoId = (value) => {
		//REQUIRED: value

		return typeof value === 'string' && notEmpty(value) === true && value.match(/[0-9a-f]{24}/) !== TO_DELETE && value.length === 24;
	};

	let one = cls.one = (params) => {
		//REQUIRED: params
		//REQUIRED: params.value
		//REQUIRED: params.array

		let value = params.value;
		let array = params.array;

		return EACH(array, (_value) => {
			if (value === _value) {
				return false;
			}
		}) === false;
	};

	let array = cls.array = (value) => {
		//REQUIRED: value

		return CHECK_IS_ARRAY(value) === true;
	};

	let data = cls.data = (value) => {
		//REQUIRED: value

		return CHECK_IS_DATA(value) === true;
	};

	let element = cls.element = (params) => {
		//REQUIRED: params
		//REQUIRED: params.array
		//REQUIRED: params.validData
		//OPTIONAL: params.isToWash
		
		let array = params.array;

		let valid = VALID({
			_ : params.validData
		});
		
		let isToWash = params.isToWash;
		
		return EACH(array, (value) => {
			if ((isToWash === true ? valid.checkAndWash : valid.check)({
				_ : value
			}).checkHasError() === true) {
				return false;
			}
		}) === true;
	};

	let property = cls.property = (params) => {
		//REQUIRED: params
		//REQUIRED: params.data
		//REQUIRED: params.validData
		//OPTIONAL: params.isToWash

		let data = params.data;

		let valid = VALID({
			_ : params.validData
		});
		
		let isToWash = params.isToWash;
		
		return EACH(data, (value) => {
			if ((isToWash === true ? valid.checkAndWash : valid.check)({
				_ : value
			}).checkHasError() === true) {
				return false;
			}
		}) === true;
	};

	let detail = cls.detail = (params) => {
		//REQUIRED: params
		//REQUIRED: params.data
		//REQUIRED: params.validDataSet
		//OPTIONAL: params.isToWash
		
		let data = params.data;
		let valid = VALID(params.validDataSet);
		let isToWash = params.isToWash;
		
		return (isToWash === true ? valid.checkAndWash : valid.check)(data).checkHasError() !== true;
	};

	let equal = cls.equal = (params) => {
		//REQUIRED: params
		//REQUIRED: params.value
		//REQUIRED: params.validValue

		let str = String(params.value);
		let validStr = String(params.validValue);

		return str === validStr;
	};

	return {

		init : (inner, self, validDataSet) => {
			//REQUIRED: validDataSet

			let Check = CLASS({

				init : (inner, self, params) => {
					//REQUIRED: params
					//REQUIRED: params.data
					//OPTIONAL: params.isToWash
					//OPTIONAL: params.isForUpdate

					let data = params.data;
					let isToWash = params.isToWash;
					let isForUpdate = params.isForUpdate;

					let hasError = false;
					let errors = {};

					EACH(validDataSet, (validData, attr) => {

						// when valid data is true, pass
						if (validData !== true) {

							EACH(validData, (validParams, name) => {

								let value = data[attr];
								
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
						
						EACH(data, (value, attr) => {
							if (validDataSet[attr] === undefined) {
								delete data[attr];
							}
						});
					}

					let checkHasError = self.checkHasError = () => {
						return hasError;
					};

					let getErrors = self.getErrors = () => {
						return errors;
					};
				}
			});

			let check = self.check = (data) => {
				return Check({
					data : data
				});
			};

			let checkAndWash = self.checkAndWash = (data) => {
				return Check({
					data : data,
					isToWash : true
				});
			};

			let checkForUpdate = self.checkForUpdate = (data) => {
				return Check({
					data : data,
					isToWash : true,
					isForUpdate : true
				});
			};
			
			let getValidDataSet = self.getValidDataSet = () => {
				return validDataSet;
			};
		}
	};
});

/*
 * 배열 안의 모든 요소들이 동일한지 확인합니다.
 */
global.CHECK_ARE_SAME = METHOD({

	run : (array) => {
		//REQUIRED: array

		let areSame = false;

		let checkTwoSame = (a, b) => {

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
				return EACH(a, (value, name) => {
					return checkTwoSame(value, b[name]);
				});
			}

			// when a, b are array
			else if (CHECK_IS_ARRAY(a) === true && CHECK_IS_ARRAY(b) === true) {
				return EACH(a, (value, i) => {
					return checkTwoSame(value, b[i]);
				});
			}

			// when a, b are value
			else {
				return a === b;
			}
		};

		if (array.length > 1) {

			areSame = REPEAT(array.length, (i) => {
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

/*
 * target이 배열인지 확인합니다.
 */
global.CHECK_IS_ARRAY = METHOD({

	run : (target) => {
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

/*
 * target이 데이터인지 확인합니다.
 */
global.CHECK_IS_DATA = METHOD({

	run : (target) => {
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

/*
 * 데이터가 아무런 값이 없는 빈 데이터({})인지 확인합니다.
 */
global.CHECK_IS_EMPTY_DATA = METHOD({

	run : (data) => {
		//REQUIRED: data

		return CHECK_ARE_SAME([data, {}]);
	}
});

/*
 * 데이터 내 값들의 개수를 반환합니다.
 */
global.COUNT_PROPERTIES = METHOD({

	run : (data) => {
		//OPTIONAL: data

		let count = 0;
		
		EACH(data, () => {
			count += 1;
		});
		
		return count;
	}
});

/*
 * 주어진 데이터의 값들 중 Date형은 정수형태로, RegExp형은 문자열 형태로 변환한 데이터를 반환합니다.
 */
global.PACK_DATA = METHOD({

	run : (data) => {
		//REQUIRED: data

		let result = COPY(data);
		let dateNames = [];
		let regexNames = [];

		EACH(result, (value, name) => {

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

				EACH(value, (v, i) => {

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

/*
 * PACK_DATA가 적용된 데이터의 값들 중 정수형태로 변환된 Date형과 문자열 형태로 변환된 RegExp형을 원래대로 되돌린 데이터를 반환합니다.
 */
global.UNPACK_DATA = METHOD({

	run : (packedData) => {
		//REQUIRED: packedData	PACK_DATA가 적용된 데이터

		let result = COPY(packedData);

		// when date property names exists
		if (result.__D !== undefined) {

			// change timestamp integer to Date type.
			EACH(result.__D, (dateName, i) => {
				result[dateName] = new Date(result[dateName]);
			});
			
			delete result.__D;
		}
		
		// when regex property names exists
		if (result.__R !== undefined) {

			// change string to RegExp type.
			EACH(result.__R, (regexName, i) => {
				
				let pattern = result[regexName];
				let flags;
				
				for (let j = pattern.length - 1; j >= 0; j -= 1) {
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

		EACH(result, (value, name) => {

			if (CHECK_IS_DATA(value) === true) {
				result[name] = UNPACK_DATA(value);
			}

			else if (CHECK_IS_ARRAY(value) === true) {

				EACH(value, (v, i) => {

					if (CHECK_IS_DATA(v) === true) {
						value[i] = UNPACK_DATA(v);
					}
				});
			}
		});

		return result;
	}
});

/*
 * 특정 값이 데이터나 배열에 존재하는지 확인합니다.
 */
global.CHECK_IS_IN = METHOD({

	run : (params) => {
		//REQUIRED: params
		//OPTIONAL: params.data
		//OPTIONAL: params.array
		//REQUIRED: params.value	존재하는지 확인 할 값

		let data = params.data;
		let array = params.array;
		let value = params.value;

		if (data !== undefined) {
			return EACH(data, (_value, name) => {
				if (CHECK_ARE_SAME([_value, value]) === true) {
					return false;
				}
			}) !== true;
		}

		if (array !== undefined) {
			return EACH(array, (_value, key) => {
				if (CHECK_ARE_SAME([_value, value]) === true) {
					return false;
				}
			}) !== true;
		}
	}
});

/*
 * 데이터들이나 배열들을 하나의 데이터나 배열로 합칩니다.
 */
global.COMBINE = METHOD({

	run : (dataSetOrArrays) => {
		//REQUIRED: dataSetOrArrays

		let result;

		if (dataSetOrArrays.length > 0) {

			let first = dataSetOrArrays[0];

			if (CHECK_IS_DATA(first) === true) {

				result = {};

				EACH(dataSetOrArrays, (data) => {
					EXTEND({
						origin : result,
						extend : data
					});
				});
			}

			else if (CHECK_IS_ARRAY(first) === true) {

				result = [];

				EACH(dataSetOrArrays, (array) => {
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

/*
 * 데이터나 배열을 복제합니다.
 */
global.COPY = METHOD({

	run : (dataOrArray) => {
		//REQUIRED: dataOrArray
		
		let copy;
		
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

/*
 * 데이터나 배열을 덧붙혀 확장합니다.
 */
global.EXTEND = METHOD({

	run : (params) => {
		//REQUIRED: params
		//REQUIRED: params.origin	기존 데이터나 배열
		//REQUIRED: params.extend	덧붙힐 데이터나 배열

		let origin = params.origin;
		let extend = params.extend;

		if (CHECK_IS_DATA(origin) === true) {

			EACH(extend, (value, name) => {
				
				if ( value instanceof Date === true) {
					origin[name] = new Date(value.getTime());
				}
				
				else if ( value instanceof RegExp === true) {
					
					let pattern = value.toString();
					let flags;
					
					for (let i = pattern.length - 1; i >= 0; i -= 1) {
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

			EACH(extend, (value) => {

				if ( value instanceof Date === true) {
					origin.push(new Date(value.getTime()));
				}
				
				else if ( value instanceof RegExp === true) {
					
					let pattern = value.toString();
					let flags;
					
					for (let i = pattern.length - 1; i >= 0; i -= 1) {
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

/*
 * 데이터나 배열의 특정 값을 찾아, 데이터인 경우 그 값에 해당하는 이름을, 배열인 경우 그 값에 해당하는 키(index)를 반환합니다.
 */
global.FIND = METHOD({

	run : (dataOrArrayOrParams, filter) => {
		//REQUIRED: dataOrArrayOrParams
		//OPTIONAL: dataOrArrayOrParams.data
		//OPTIONAL: dataOrArrayOrParams.array
		//REQUIRED: dataOrArrayOrParams.value	찾을 값
		//OPTIONAL: filter

		let ret;

		if (filter !== undefined) {

			if (CHECK_IS_DATA(dataOrArrayOrParams) === true) {

				EACH(dataOrArrayOrParams, (value, name) => {

					// value passed filter.
					if (filter(value, name) === true) {
						ret = value;
						return false;
					}
				});
			}

			else if (CHECK_IS_ARRAY(dataOrArrayOrParams) === true) {

				EACH(dataOrArrayOrParams, (value, key) => {

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
			let data = dataOrArrayOrParams.data;
			let array = dataOrArrayOrParams.array;
			let value = dataOrArrayOrParams.value;

			if (data !== undefined) {

				EACH(data, (_value, name) => {
					if (_value === value) {
						ret = name;
						return false;
					}
				});
			}

			if (array !== undefined) {

				EACH(array, (_value, key) => {
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

/*
 * 데이터나 배열의 특정 값을 삭제합니다.
 */
global.REMOVE = METHOD({

	run : (dataOrArrayOrParams, filter) => {
		//REQUIRED: dataOrArrayOrParams
		//OPTIONAL: dataOrArrayOrParams.data
		//OPTIONAL: dataOrArrayOrParams.array
		//OPTIONAL: dataOrArrayOrParams.name	데이터에서 삭제할 값의 이름
		//OPTIONAL: dataOrArrayOrParams.key		배열에서 삭제할 값의 키 (index)
		//OPTIONAL: dataOrArrayOrParams.value	삭제할 값, 이 값을 찾아 삭제합니다.
		//OPTIONAL: filter
		
		if (filter !== undefined) {

			if (CHECK_IS_DATA(dataOrArrayOrParams) === true) {

				EACH(dataOrArrayOrParams, (value, name) => {

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

				EACH(dataOrArrayOrParams, (value, key) => {

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
			let data = dataOrArrayOrParams.data;
			let array = dataOrArrayOrParams.array;
			let name = dataOrArrayOrParams.name;
			let key = dataOrArrayOrParams.key;
			let value = dataOrArrayOrParams.value;

			if (name !== undefined) {
				delete data[name];
			}

			if (key !== undefined) {
				array.splice(key, 1);
			}

			if (value !== undefined) {

				if (data !== undefined) {

					EACH(data, (_value, name) => {

						if (CHECK_ARE_SAME([_value, value]) === true) {

							REMOVE({
								data : data,
								name : name
							});
						}
					});
				}

				if (array !== undefined) {

					EACH(array, (_value, key) => {

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

/*
 * 날짜를 처리할 때 Date형을 좀 더 쓰기 편하도록 개선한 CALENDAR 클래스
 */
global.CALENDAR = CLASS({

	init : (inner, self, date) => {
		//OPTIONAL: date	입력하지 않으면 현재 시각을 기준으로 생성합니다.

		if (date === undefined) {
			date = new Date();
		}

		let getYear = self.getYear = () => {
			return date.getFullYear();
		};

		let getMonth = self.getMonth = (isFormal) => {
			//OPTIONAL: isFormal	true로 설정하면 10보다 작은 수일 경우 앞에 0을 붙힌 문자열을 반환합니다. ex) 01, 04, 09
			
			let month = date.getMonth() + 1;
			
			if (isFormal === true) {
				return month < 10 ? '0' + month : '' + month;
			} else {
				return month;
			}
		};

		let getDate = self.getDate = (isFormal) => {
			//OPTIONAL: isFormal	true로 설정하면 10보다 작은 수일 경우 앞에 0을 붙힌 문자열을 반환합니다. ex) 01, 04, 09
			
			let d = date.getDate();
			
			if (isFormal === true) {
				return d < 10 ? '0' + d : '' + d;
			} else {
				return d;
			}
		};

		let getDay = self.getDay = () => {
			return date.getDay();
		};

		let getHour = self.getHour = (isFormal) => {
			//OPTIONAL: isFormal	true로 설정하면 10보다 작은 수일 경우 앞에 0을 붙힌 문자열을 반환합니다. ex) 01, 04, 09
			
			let hour = date.getHours();
			
			if (isFormal === true) {
				return hour < 10 ? '0' + hour : '' + hour;
			} else {
				return hour;
			}
		};

		let getMinute = self.getMinute = (isFormal) => {
			//OPTIONAL: isFormal	true로 설정하면 10보다 작은 수일 경우 앞에 0을 붙힌 문자열을 반환합니다. ex) 01, 04, 09
			
			let minute = date.getMinutes();
			
			if (isFormal === true) {
				return minute < 10 ? '0' + minute : '' + minute;
			} else {
				return minute;
			}
		};

		let getSecond = self.getSecond = (isFormal) => {
			//OPTIONAL: isFormal	true로 설정하면 10보다 작은 수일 경우 앞에 0을 붙힌 문자열을 반환합니다. ex) 01, 04, 09
			
			let second = date.getSeconds();
			
			if (isFormal === true) {
				return second < 10 ? '0' + second : '' + second;
			} else {
				return second;
			}
		};
	}
});

/*
 * Date형 값을 생성합니다.
 */
global.CREATE_DATE = METHOD({

	run : (params) => {
		//REQUIRED: params
		//OPTIONAL: params.year		년
		//OPTIONAL: params.month	월
		//OPTIONAL: params.date		일
		//OPTIONAL: params.hour		시
		//OPTIONAL: params.minute	분
		//OPTIONAL: params.second	초
		
		let year = params.year;
		let month = params.month;
		let date = params.date;
		let hour = params.hour;
		let minute = params.minute;
		let second = params.second;
		
		let nowCal = CALENDAR(new Date());
		
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

/*
 * 주어진 초가 흐른 뒤에 함수를 실행하는 DELAY 클래스
 */
global.DELAY = CLASS({

	init : (inner, self, seconds, func) => {
		//REQUIRED: seconds
		//OPTIONAL: func

		if (func === undefined) {
			func = seconds;
			seconds = 0;
		}
		
		let milliseconds;
		
		let startTime = Date.now();
		
		let remaining = milliseconds = seconds * 1000;
		
		let timeout;
		
		let resume = self.resume = RAR(() => {
			
			if (timeout === undefined) {
				
				timeout = setTimeout(() => {
					func();
				}, remaining);
			}
		});
		
		let pause = self.pause = () => {
			
			remaining = milliseconds - (Date.now() - startTime);
			
			clearTimeout(timeout);
			timeout = undefined;
		};
		
		let remove = self.remove = () => {
			pause();
		};
	}
});

/*
 * 주어진 초 마다 함수를 반복해서 실행하는 INTERVAL 클래스
 */
global.INTERVAL = CLASS({

	init : (inner, self, seconds, func) => {
		//REQUIRED: seconds
		//OPTIONAL: func

		if (func === undefined) {
			func = seconds;
			seconds = 0;
		}

		let milliseconds;
		
		let startTime = Date.now();
		
		let remaining = milliseconds = seconds === 0 ? 1 : seconds * 1000;
		
		let interval;
		
		let resume = self.resume = RAR(() => {
			
			if (interval === undefined) {
				
				interval = setInterval(() => {
					
					if (func(self) === false) {
						remove();
					}
					
					startTime = Date.now();
					
				}, remaining);
			}
		});
		
		let pause = self.pause = () => {
			
			remaining = milliseconds - (Date.now() - startTime);
			
			clearInterval(interval);
			interval = undefined;
		};
		
		let remove = self.remove = () => {
			pause();
		};
	}
});

/*
 * 아주 짧은 시간동안 반복해서 실행하는 로직을 작성할때 사용하는 LOOP 클래스
 */
global.LOOP = CLASS((cls) => {
	
	let animationInterval;
	let loopInfos = [];
	let runs = [];

	let fire = () => {

		if (animationInterval === undefined) {

			let beforeTime = Date.now();

			animationInterval = INTERVAL(() => {

				let time = Date.now();
				let deltaTime = time - beforeTime;
				
				if (deltaTime > 0) {

					for (let i = 0; i < loopInfos.length; i += 1) {

						let loopInfo = loopInfos[i];

						if (loopInfo.fps !== undefined && loopInfo.fps > 0) {

							if (loopInfo.timeSigma === undefined) {
								loopInfo.timeSigma = 0;
								loopInfo.countSigma = 0;
							}

							// calculate count.
							let count = parseInt(loopInfo.fps / (1000 / deltaTime) * (loopInfo.timeSigma / deltaTime + 1), 10) - loopInfo.countSigma;

							// start.
							if (loopInfo.start !== undefined) {
								loopInfo.start();
							}

							// run interval.
							let interval = loopInfo.interval;
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
					for (let i = 0; i < runs.length; i += 1) {
						runs[i](deltaTime);
					}

					beforeTime = time;
				}
			});
		}
	};
	
	let stop = () => {

		if (loopInfos.length <= 0 && runs.length <= 0) {

			animationInterval.remove();
			animationInterval = undefined;
		}
	};

	return {

		init : (inner, self, fpsOrRun, intervalOrFuncs) => {
			//OPTIONAL: fpsOrRun
			//OPTIONAL: intervalOrFuncs
			//OPTIONAL: intervalOrFuncs.start
			//REQUIRED: intervalOrFuncs.interval
			//OPTIONAL: intervalOrFuncs.end

			let run;
			let start;
			let interval;
			let end;

			let info;

			if (intervalOrFuncs !== undefined) {

				// init intervalOrFuncs.
				if (CHECK_IS_DATA(intervalOrFuncs) !== true) {
					interval = intervalOrFuncs;
				} else {
					start = intervalOrFuncs.start;
					interval = intervalOrFuncs.interval;
					end = intervalOrFuncs.end;
				}
			
				let resume = self.resume = RAR(() => {
					
					loopInfos.push( info = {
						fps : fpsOrRun,
						start : start,
						interval : interval,
						end : end
					});
					
					fire();
				});

				let pause = self.pause = () => {

					REMOVE({
						array : loopInfos,
						value : info
					});

					stop();
				};

				let changeFPS = self.changeFPS = (fps) => {
					//REQUIRED: fps

					info.fps = fps;
				};

				let remove = self.remove = () => {
					pause();
				};
			}

			// when fpsOrRun is run
			else {
				
				let resume = self.resume = RAR(() => {
					
					runs.push(run = fpsOrRun);
					
					fire();
				});

				let pause = self.pause = () => {

					REMOVE({
						array : runs,
						value : run
					});

					stop();
				};

				let remove = self.remove = () => {
					pause();
				};
			}
		}
	};
});

/*
 * 주어진 함수를 즉시 실행하고, 함수를 반환합니다.
 * 
 * 선언과 동시에 실행되어야 하는 함수를 선언할 때 유용합니다.
 */
global.RAR = METHOD({

	run : (params, func) => {
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

/*
 * 주어진 함수를 즉시 실행합니다.
 */
global.RUN = METHOD({

	run : (func) => {
		//REQUIRED: func
		
		let f = () => {
			return func(f);
		};

		return f();
	}
});

/*
 * 정수 문자열을 정수 값으로 변환합니다.
 */
global.INTEGER = METHOD({

	run : (integerString) => {
		//OPTIONAL: integerString

		return integerString === undefined ? undefined : parseInt(integerString, 10);
	}
});

/*
 * 임의의 정수를 생성합니다.
 */
global.RANDOM = METHOD({

	run : (limitOrParams) => {
		//REQUIRED: limitOrParams
		//OPTIONAL: limitOrParams.min	생성할 정수 범위 최소값, 이 값 이상인 값만 생성합니다.
		//OPTIONAL: limitOrParams.max	생성할 정수 범위 최대값, 이 값 이하인 값만 생성합니다.
		//OPTIONAL: limitOrParams.limit	생성할 정수 범위 제한값, 이 값 미만인 값만 생성합니다.

		let min;
		let max
		let limit;

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

/*
 * 실수 문자열을 실수 값으로 변환합니다.
 */
global.REAL = METHOD({

	run : (realNumberString) => {
		//OPTIONAL: realNumberString

		return realNumberString === undefined ? undefined : parseFloat(realNumberString);
	}
});

/*
 * 데이터나 배열, 문자열의 각 요소를 순서대로 대입하여 주어진 함수를 실행합니다.
 */
global.EACH = METHOD({

	run : (dataOrArrayOrString, func) => {
		//OPTIONAL: dataOrArrayOrString
		//REQUIRED: func
		
		if (dataOrArrayOrString === undefined) {
			return false;
		}

		else if (CHECK_IS_DATA(dataOrArrayOrString) === true) {

			for (let name in dataOrArrayOrString) {
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

			return (dataOrArrayOrString) => {
				return EACH(dataOrArrayOrString, func);
			};
		}

		// when dataOrArrayOrString is array or arguments or string
		else {

			let length = dataOrArrayOrString.length;

			for (let i = 0; i < length; i += 1) {

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

/*
 * 주어진 함수를 주어진 횟수만큼 반복해서 실행합니다.
 */
global.REPEAT = METHOD({

	run : (countOrParams, func) => {
		//OPTIONAL: countOrParams
		//REQUIRED: countOrParams.start
		//OPTIONAL: countOrParams.end
		//OPTIONAL: countOrParams.limit
		//OPTIONAL: countOrParams.step
		//REQUIRED: func

		let count;
		let start;
		let end;
		let limit;
		let step;
		
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

			for (let i = 0; i < parseInt(count, 10); i += 1) {
				if (func(i) === false) {
					return false;
				}
			}
		}

		// end mode
		else if (end !== undefined && start > end) {

			for (let i = start; i >= end; i -= step) {
				if (func(i) === false) {
					return false;
				}
			}

		}

		// limit mode
		else if (limit !== undefined) {

			for (let i = start; i < limit; i += step) {
				if (func(i) === false) {
					return false;
				}
			}
		}
		
		// func mode
		else {
			
			return (countOrParams) => {
				return REPEAT(countOrParams, func);
			};
		}

		return true;
	}
});

/*
 * 데이터나 배열, 문자열의 각 요소를 역순으로 대입하여 주어진 함수를 실행합니다.
 */
global.REVERSE_EACH = METHOD({

	run : (arrayOrString, func) => {
		//OPTIONAL: arrayOrString
		//REQUIRED: func
		
		if (arrayOrString === undefined) {
			return false;
		}

		// when arrayOrString is func
		else if (func === undefined) {

			func = arrayOrString;
			arrayOrString = undefined;

			return (arrayOrString) => {
				return REVERSE_EACH(arrayOrString, func);
			};
		}

		// when arrayOrString is array or arguments or string
		else {

			let length = arrayOrString.length;

			for (let i = length - 1; i >= 0; i -= 1) {

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

/*
 * 웹 폰트를 사용할 수 있도록 불러옵니다.
 */
global.ADD_FONT = METHOD({

	run : (params) => {
		//REQUIRED: params
		//REQUIRED: params.name
		//OPTIONAL: params.style
		//OPTIONAL: params.weight
		//OPTIONAL: params.woff2
		//OPTIONAL: params.woff
		//OPTIONAL: params.otf
		//OPTIONAL: params.ttf
		
		let name = params.name;
		let style = params.style;
		let weight = params.weight;
		let woff2 = params.woff2;
		let woff = params.woff;
		let otf = params.otf;
		let ttf = params.ttf;
		
		let src = '';
		if (woff2 !== undefined) {
			src += 'url(' + woff2 + ') format(\'woff2\'),';
		}
		if (woff !== undefined) {
			src += 'url(' + woff + ') format(\'woff\'),';
		}
		if (otf !== undefined) {
			src += 'url(' + otf + ') format(\'opentype\'),';
		}
		if (ttf !== undefined) {
			src += 'url(' + ttf + ') format(\'truetype\'),';
		}
		
		let content = '@font-face {';
		content += 'font-family:' + name + ';';
		
		if (style !== undefined) {
			content += 'font-style:' + style + ';';
		}
		if (weight !== undefined) {
			content += 'font-weight:' + weight + ';';
		}
		
		content += 'src:' + src.substring(0, src.length - 1) + ';';
		content += '}';
		
		// create font style element.
		let fontStyleEl = document.createElement('style');
		fontStyleEl.type = 'text/css';
		fontStyleEl.appendChild(document.createTextNode(content));
		document.getElementsByTagName('head')[0].appendChild(fontStyleEl);
	}
});

OVERRIDE(BOX, (origin) => {
	
	/*
	 * BOX를 생성합니다.
	 */
	global.BOX = METHOD((m) => {
		
		m.getAllBoxes = origin.getAllBoxes;
		
		return {
			
			run : (boxName) => {
				//REQUIRED: boxName
				
				if (BROWSER_CONFIG[boxName] === undefined) {
					BROWSER_CONFIG[boxName] = {};
				}
		
				return origin(boxName);
			}
		};
	});
});

/*
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

	run : (portOrParams, connectionListenerOrListeners) => {
		//REQUIRED: portOrParams
		//OPTIONAL: portOrParams.isSecure
		//OPTIONAL: portOrParams.host
		//REQUIRED: portOrParams.port
		//REQUIRED: connectionListenerOrListeners
		//REQUIRED: connectionListenerOrListeners.success
		//OPTIONAL: connectionListenerOrListeners.error

		let isSecure;
		let host;
		let port;

		let connectionListener;
		let errorListener;
		
		let isConnected;

		let methodMap = {};
		let sendKey = 0;
		
		let on;
		let off;
		let send;

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

		let runMethods = (methodName, data, sendKey) => {

			let methods = methodMap[methodName];

			if (methods !== undefined) {

				EACH(methods, (method) => {

					// run method.
					method(data,

					// ret.
					(retData) => {

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

		let conn = new WebSocket((isSecure === true ? 'wss://': 'ws://') + host + ':' + port);

		conn.onopen = () => {

			isConnected = true;

			connectionListener(

			// on.
			on = (methodName, method) => {
				//REQUIRED: methodName
				//REQUIRED: method

				let methods = methodMap[methodName];

				if (methods === undefined) {
					methods = methodMap[methodName] = [];
				}

				methods.push(method);
			},

			// off.
			off = (methodName, method) => {
				//REQUIRED: methodName
				//OPTIONAL: method

				let methods = methodMap[methodName];

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
			send = (methodNameOrParams, callback) => {
				//REQUIRED: methodNameOrParams
				//REQUIRED: methodNameOrParams.methodName
				//OPTIONAL: methodNameOrParams.data
				//OPTIONAL: callback
				
				let methodName;
				let data;
				let callbackName;
				
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
						on(callbackName, (data) => {
	
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
			() => {
				if (conn !== undefined) {
					conn.close();
					conn = undefined;
				}
			});
		};

		// receive data.
		conn.onmessage = (e) => {

			let params = PARSE_STR(e.data);

			if (params !== undefined) {
				runMethods(params.methodName, params.data, params.sendKey);
			}
		};

		// when disconnected
		conn.onclose = () => {
			runMethods('__DISCONNECTED');
		};

		// when error
		conn.onerror = (error) => {

			let errorMsg = error.toString();

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

/*
 * 웹 브라우저 정보를 담고 있는 객체
 */
global.INFO = OBJECT({

	init : (inner, self) => {

		let isTouchMode = global.ontouchstart !== undefined;
		let isTouching;

		let getLang = self.getLang = () => {

			let lang = STORE('__INFO').get('lang');

			if (lang === undefined) {

				lang = navigator.language;

				if (lang.length > 2) {
					lang = lang.substring(0, 2);
				}

				lang = lang.toLowerCase();
			}

			return lang;
		};

		let changeLang = self.changeLang = (lang) => {
			//REQUIRED: lang

			STORE('__INFO').save({
				name : 'lang',
				value : lang
			});

			location.reload();
		};

		let checkIsTouchMode = self.checkIsTouchMode = () => {
			return isTouchMode;
		};

		let getBrowserInfo = self.getBrowserInfo = () => {
			// using bowser. (https://github.com/ded/bowser)
			return {
				name : bowser.name,
				version : REAL(bowser.version)
			};
		};
		
		EVENT_LOW('mousemove', () => {
			if (isTouching !== true) {
				isTouchMode = false;
			}
		});
		
		EVENT_LOW('touchstart', () => {
			isTouchMode = true;
			isTouching = true;
		});
		
		EVENT_LOW('touchend', () => {
			DELAY(() => {
				isTouching = false;
			});
		});
	}
});

OVERRIDE(LOOP, (origin) => {
	
	/*
	 * 아주 짧은 시간동안 반복해서 실행하는 로직을 작성할때 사용하는 LOOP 클래스
	 */
	global.LOOP = CLASS((cls) => {
		
		let beforeTime;
		let animationInterval;
		
		let loopInfos = [];
		let runs = [];
		
		let fire = () => {
			
			if (animationInterval === undefined) {
				
				let step;
	
				beforeTime = Date.now();
				
				animationInterval = requestAnimationFrame(step = () => {
	
					let time = Date.now();
					let deltaTime = time - beforeTime;
					
					if (deltaTime > 0) {
						
						for (let i = 0; i < loopInfos.length; i += 1) {
							
							let loopInfo = loopInfos[i];
							
							if (loopInfo.fps !== undefined && loopInfo.fps > 0) {
	
								if (loopInfo.timeSigma === undefined) {
									loopInfo.timeSigma = 0;
									loopInfo.countSigma = 0;
								}
	
								// calculate count.
								let count = parseInt(loopInfo.fps / (1000 / deltaTime) * (loopInfo.timeSigma / deltaTime + 1), 10) - loopInfo.countSigma;
	
								// start.
								if (loopInfo.start !== undefined) {
									loopInfo.start();
								}
	
								// run interval.
								let interval = loopInfo.interval;
								
								for (let j = 0; j < count; j += 1) {
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
						for (let i = 0; i < runs.length; i += 1) {
							runs[i](deltaTime);
						}
	
						beforeTime = time;
					}
					
					animationInterval = requestAnimationFrame(step);
				});
			}
		};
		
		let stop = () => {
			
			if (loopInfos.length <= 0 && runs.length <= 0) {
	
				cancelAnimationFrame(animationInterval);
				animationInterval = undefined;
			}
		};
	
		return {
			
			init : (inner, self, fpsOrRun, intervalOrFuncs) => {
				//OPTIONAL: fpsOrRun
				//OPTIONAL: intervalOrFuncs
				//OPTIONAL: intervalOrFuncs.start
				//REQUIRED: intervalOrFuncs.interval
				//OPTIONAL: intervalOrFuncs.end
				
				let resume;
				let pause;
				let changeFPS;
				let remove;
	
				if (intervalOrFuncs !== undefined) {
					
					let start;
					let interval;
					let end;
					let info;
					
					// init intervalOrFuncs.
					if (CHECK_IS_DATA(intervalOrFuncs) !== true) {
						interval = intervalOrFuncs;
					} else {
						start = intervalOrFuncs.start;
						interval = intervalOrFuncs.interval;
						end = intervalOrFuncs.end;
					}
				
					resume = self.resume = RAR(() => {
						
						loopInfos.push(info = {
							fps : fpsOrRun,
							start : start,
							interval : interval,
							end : end
						});
						
						fire();
					});
	
					pause = self.pause = () => {
	
						REMOVE({
							array : loopInfos,
							value : info
						});
	
						stop();
					};
	
					changeFPS = self.changeFPS = (fps) => {
						//REQUIRED: fps
	
						info.fps = fps;
					};
	
					remove = self.remove = () => {
						pause();
					};
				}
	
				// when fpsOrRun is run
				else {
					
					let run;
					
					resume = self.resume = RAR(() => {
						
						runs.push(run = fpsOrRun);
						
						fire();
					});
	
					pause = self.pause = () => {
	
						REMOVE({
							array : runs,
							value : run
						});
	
						stop();
					};
	
					remove = self.remove = () => {
						pause();
					};
				}
			}
		};
	});
});

/*
 * INFO의 웹 애플리케이션 언어 설정 코드에 해당하는 문자열을 반환합니다.
 * 
 * 만약 알 수 없는 언어 설정 코드라면, 첫 문자열을 반환합니다.
 */
global.MSG = METHOD({

	run : (msgs) => {
		//REQUIRED: msgs

		let msg = msgs[INFO.getLang()];

		if (msg === undefined) {

			// get first msg.
			EACH(msgs, (_msg) => {
				msg = _msg;
				return false;
			});
		}

		return msg;
	}
});

/*
 * 사운드 파일을 재생하는 SOUND 클래스
 */
global.SOUND = CLASS((cls) => {

	let audioContext;

	return {

		init : (inner, self, params) => {
			//REQUIRED: params
			//OPTIONAL: params.ogg
			//OPTIONAL: params.mp3
			//OPTIONAL: params.isLoop

			let ogg = params.ogg;
			let mp3 = params.mp3;
			let isLoop = params.isLoop;
			
			let buffer;
			let source;
			
			let startedAt = 0;
			let pausedAt = 0;
			
			let delayed;
			
			// init audioContext.
			if (audioContext === undefined) {
				audioContext = new AudioContext();
			}
			
			let request = new XMLHttpRequest();
			request.open('GET', new Audio().canPlayType('audio/ogg') !== '' ? ogg : mp3, true);
			request.responseType = 'arraybuffer';

			request.onload = () => {

				audioContext.decodeAudioData(request.response, (_buffer) => {

					let gain = audioContext.createGain ? audioContext.createGain() : audioContext.createGainNode();

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

			let play = self.play = () => {

				delayed = () => {

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
			
			let pause = self.pause = () => {
				if (source !== undefined) {
					source.stop(0);
					pausedAt = Date.now() - startedAt;
				}
			};

			let stop = self.stop = () => {
				if (source !== undefined) {
					source.stop(0);
					pausedAt = 0;
				}
			};
		}
	};
});

/*
 * 저장소 클래스
 * 
 * 웹 브라우저가 종료되어도 저장된 값들이 보존됩니다.
 */
global.STORE = CLASS({

	init : (inner, self, storeName) => {
		//REQUIRED: storeName
		
		// gen full name.
		let genFullName = (name) => {
			//REQUIRED: name

			return storeName + '.' + name;
		};

		let save = self.save = (params) => {
			//REQUIRED: params
			//REQUIRED: params.name
			//REQUIRED: params.value

			let name = params.name;
			let value = params.value;

			localStorage.setItem(genFullName(name), STRINGIFY(value));
		};

		let get = self.get = (name) => {
			//REQUIRED: name

			let value = PARSE_STR(localStorage.getItem(genFullName(name)));

			if (value === TO_DELETE) {
				value = undefined;
			}

			return value;
		};

		let remove = self.remove = (name) => {
			//REQUIRED: name
			
			localStorage.removeItem(genFullName(name));
		};
	}
});

FOR_BOX((box) => {

	box.STORE = CLASS({

		init : (inner, self, storeName) => {
			//REQUIRED: storeName

			let store = STORE(box.boxName + '.' + storeName);

			let save = self.save = store.save;
			let get = self.get = store.get;
			let remove = self.remove = store.remove;
		}
	});
});

FOR_BOX((box) => {

	box.SHOW_ERROR = METHOD({

		run : (tag, errorMsg, params) => {
			//REQUIRED: tag
			//REQUIRED: errorMsg
			//OPTIONAL: params

			SHOW_ERROR(box.boxName + '.' + tag, errorMsg, params);
		}
	});
});
FOR_BOX((box) => {

	box.SHOW_WARNING = METHOD({

		run : (tag, warningMsg, params) => {
			//REQUIRED: tag
			//REQUIRED: warningMsg
			//OPTIONAL: params

			SHOW_WARNING(box.boxName + '.' + tag, warningMsg, params);
		}
	});
});
/*
 * 노드에 스타일을 지정합니다.
 */
global.ADD_STYLE = METHOD({
	
	run : (params) => {
		//REQUIRED: params
		//REQUIRED: params.node		스타일을 지정할 노드
		//REQUIRED: params.style	스타일 데이터

		let node = params.node;
		let style = params.style;
		let el = node.getWrapperEl();

		EACH(style, (value, name) => {
			
			if (value !== undefined) {

				// on display resize
				if (name === 'onDisplayResize') {

					let resizeEvent = EVENT({
						name : 'resize'
					}, RAR(() => {

						// when this, value is function.
						ADD_STYLE({
							node : node,
							style : value(WIN_WIDTH(), WIN_HEIGHT())
						});
					}));

					// remove resize event when remove node.
					node.on('remove', () => {
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

/*
 * 노드에 애니메이션을 지정합니다.
 */
global.ANIMATE = METHOD((m) => {
	
	let keyframesCount = 0;
	
	return {
		
		run : (params, animationEndHandler) => {
			//REQUIRED: params
			//REQUIRED: params.node				애니메이션을 지정할 노드
			//REQUIRED: params.keyframes		애니메이션 키 프레임
			//OPTIONAL: params.duration			애니메이션 지속 시간 (입력하지 않으면 0.5)
			//OPTIONAL: params.timingFunction	애니메이션 작동 방식, 점점 빨라지거나, 점점 느려지거나, 점점 빨라졌다 끝에서 점점 느려지는 등의 처리 (입력하지 않으면 'ease', 'linear', 'ease', 'ease-in', 'ease-out' 사용 가능)
			//OPTIONAL: params.delay			애니메이션이 발동하기 전 지연 시간 (입력하지 않으면 0)
			//OPTIONAL: params.iterationCount	애니메이션을 몇번 발동시킬지 (입력하지 않으면 1, 계속 애니메이션이 발동되도록 하려면 'infinite' 지정)
			//OPTIONAL: params.direction		애니메이션의 방향 (입력하지 않으면 'normal', 'reverse', 'alternate', 'alternate-reverse' 사용 가능)
			//OPTIONAL: animationEndHandler		애니메이션이 끝날 때 호출될 핸들러
			
			let node = params.node;
			let keyframes = params.keyframes;
			let duration = params.duration === undefined ? 0.5 : params.duration;
			let timingFunction = params.timingFunction === undefined ? 'ease' : params.timingFunction;
			let delay = params.delay === undefined ? 0 : params.delay;
			let iterationCount = params.iterationCount === undefined ? 1 : params.iterationCount;
			let direction = params.direction === undefined ? 'normal' : params.direction;
			
			let keyframesName = '__KEYFRAMES_' + keyframesCount;
			let keyframesStr = '';
			
			let keyframesStartStyle;
			let keyframesFinalStyle;
			
			keyframesCount += 1;
			
			EACH(keyframes, (style, key) => {
				
				keyframesStr += key + '{';
	
				EACH(style, (value, name) => {
	
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
			let keyframesStyleEl = document.createElement('style');
			keyframesStyleEl.type = 'text/css';
			keyframesStyleEl.appendChild(document.createTextNode('@keyframes ' + keyframesName + '{' + keyframesStr + '}'));
			document.getElementsByTagName('head')[0].appendChild(keyframesStyleEl);
			
			node.addStyle(keyframesStartStyle);
			
			node.addStyle({
				animation : keyframesName + ' ' + duration + 's ' + timingFunction + ' ' + delay + 's ' + iterationCount + ' ' + direction
			});
			
			node.addStyle(keyframesFinalStyle);
	
			if (animationEndHandler !== undefined && iterationCount === 1) {
	
				DELAY(duration, () => {
					animationEndHandler(node);
				});
			}
		}
	};
});


/*
 * clear : 'both' 스타일이 지정된 div를 생성합니다.
 */
global.CLEAR_BOTH = METHOD({

	run : () => {

		return DIV({
			style : {
				clear : 'both'
			}
		});
	}
});

/*
 * DOM 객체를 생성하고 다루는 클래스
 */
global.DOM = CLASS({

	preset : () => {
		return NODE;
	},

	init : (inner, self, params) => {
		//REQUIRED: params
		//OPTIONAL: params.tag		생설할 DOM 객체에 해당하는 태그 지정
		//OPTIONAL: params.el		태그를 지정하지 않고 HTML element를 직접 지정
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트
		//OPTIONAL: params.__TEXT	UPPERCASE가 문자열 DOM 객체를 생성하기 위해 내부적으로 사용하는 파라미터

		let tag = params.tag;
		let el = params.el;
		let id = params.id;
		let cls = params.cls;
		let __TEXT = params.__TEXT;

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

		let getEl = self.getEl = () => {
			return el;
		};

		let setEl = inner.setEl = (_el) => {
			//REQUIRED: _el

			el = _el;

			inner.setDom(self);
		};

		setEl(el);

		let setAttr = inner.setAttr = (params) => {
			//REQUIRED: params
			//REQUIRED: params.name
			//REQUIRED: params.value

			let name = params.name;
			let value = params.value;

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

/*
 * DOM 트리 구조를 정의하기 위한 NODE 클래스
 */
global.NODE = CLASS({

	init : (inner, self, params) => {
		//OPTIONAL: params
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		let wrapperDom;
		let contentDom;
		
		let wrapperEl;
		let contentEl;
		
		let waitingAfterNodes;
		let waitingBeforeNodes;
		
		let parentNode;
		let childNodes = [];
		
		let originDisplay;
		let data;

		let setWrapperDom = inner.setWrapperDom = (dom) => {
			//REQUIRED: dom

			wrapperDom = dom;
			wrapperEl = dom.getEl();

			originDisplay = getStyle('display');

			on('show', () => {

				EACH(childNodes, (childNode) => {

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

		let setContentDom = inner.setContentDom = (dom) => {
			//REQUIRED: dom

			contentDom = dom;
			contentEl = dom.getEl();
		};

		let setDom = inner.setDom = (dom) => {
			//REQUIRED: dom

			setWrapperDom(dom);
			setContentDom(dom);
		};

		let getWrapperDom = self.getWrapperDom = () => {
			return wrapperDom;
		};

		let getContentDom = self.getContentDom = () => {
			return contentDom;
		};

		let getWrapperEl = self.getWrapperEl = () => {
			return wrapperEl;
		};

		let getContentEl = self.getContentEl = () => {
			return contentEl;
		};

		let attach = (node, index) => {
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
				EACH(waitingAfterNodes, (node) => {
					after(node);
				});
			}

			// run before wating before nodes.
			if (waitingBeforeNodes !== undefined) {
				EACH(waitingBeforeNodes, (node) => {
					before(node);
				});
			}
		};

		let append = self.append = (node) => {
			//REQUIRED: node
			
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

				let splits = String(node === undefined ? '' : node).split('\n');

				EACH(splits, (text, i) => {

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

		let appendTo = self.appendTo = (node) => {
			//REQUIRED: node
			
			let parentEl = node.getContentEl();

			if (parentEl !== undefined) {
				
				parentEl.appendChild(wrapperEl);

				attach(node);
			}

			return self;
		};

		let prepend = self.prepend = (node) => {
			//REQUIRED: node

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

				let splits = String(node === undefined ? '' : node).split('\n');

				REPEAT({
					start : splits.length - 1,
					end : 0
				}, (i) => {

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

		let prependTo = self.prependTo = (node) => {
			//REQUIRED: node

			let parentEl = node.getContentEl();

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

		let after = self.after = (node) => {
			//REQUIRED: node

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
	
						let splits = String(node === undefined ? '' : node).split('\n');
	
						REPEAT({
							start : splits.length - 1,
							end : 0
						}, (i) => {
	
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

		let insertAfter = self.insertAfter = (node) => {
			//REQUIRED: node

			let beforeEl = node.getWrapperEl();
			
			if (beforeEl !== undefined) {
				
				beforeEl.parentNode.insertBefore(wrapperEl, beforeEl.nextSibling);
				
				let nowIndex = FIND({
					array : node.getParent().getChildren(),
					value : self
				});
				
				let toIndex = FIND({
					array : node.getParent().getChildren(),
					value : node
				}) + 1;

				attach(node.getParent(), nowIndex < toIndex ? toIndex - 1 : toIndex);
			}

			return self;
		};

		let before = self.before = (node) => {
			//REQUIRED: node
			
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
	
						let splits = String(node === undefined ? '' : node).split('\n');
	
						EACH(splits, (text, i) => {
	
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

		let insertBefore = self.insertBefore = (node) => {
			//REQUIRED: node

			let afterEl = node.getWrapperEl();

			if (afterEl !== undefined) {
				
				afterEl.parentNode.insertBefore(wrapperEl, afterEl);

				attach(node.getParent(), FIND({
					array : node.getParent().getChildren(),
					value : node
				}));
			}

			return self;
		};

		let getChildren = self.getChildren = () => {
			return childNodes;
		};

		let setParent = (node) => {
			//OPTIONAL: node
			
			if (parentNode !== undefined) {
				REMOVE({
					array : parentNode.getChildren(),
					value : self
				});
			}

			parentNode = node;
		};
		
		let getParent = self.getParent = () => {
			return parentNode;
		};

		let empty = self.empty = () => {
			EACH(childNodes, (child) => {
				child.remove();
			});
		};

		let remove = self.remove = () => {

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

		let on = self.on = (eventName, eventHandler) => {
			//REQUIRED: eventName
			//REQUIRED: eventHandler

			EVENT({
				node : self,
				name : eventName
			}, eventHandler);
		};

		let off = self.off = (eventName, eventHandler) => {
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

		let addStyle = self.addStyle = (style) => {
			//REQUIRED: style

			ADD_STYLE({
				node : self,
				style : style
			});
		};

		let getStyle = self.getStyle = (name) => {
			//REQUIRED: name
			
			if (wrapperEl !== undefined) {

				let styles = wrapperEl.style;

				if (styles !== undefined) {

					let style = styles[name];

					return style === '' ? undefined : (style.substring(style.length - 2) === 'px' ? REAL(style) : style);
				}
			}
		};

		let getWidth = self.getWidth = () => {
			return wrapperEl.offsetWidth;
		};

		let getInnerWidth = self.getInnerWidth = () => {
			return wrapperEl.clientWidth;
		};

		let getHeight = self.getHeight = () => {
			return wrapperEl.offsetHeight;
		};

		let getInnerHeight = self.getInnerHeight = () => {
			return wrapperEl.clientHeight;
		};

		let getLeft = self.getLeft = () => {

			let left = 0;
			
			let parentEl = wrapperEl;

			do {
				left += parentEl.offsetLeft - (parentEl === document.body ? 0 : parentEl.scrollLeft);
				parentEl = parentEl.offsetParent;
			} while (parentEl !== TO_DELETE);

			return left;
		};

		let getTop = self.getTop = () => {

			let top = 0;
			
			let parentEl = wrapperEl;

			do {
				top += parentEl.offsetTop - (parentEl === document.body ? 0 : parentEl.scrollTop);
				parentEl = parentEl.offsetParent;
			} while (parentEl !== TO_DELETE);

			return top;
		};

		let hide = self.hide = () => {

			addStyle({
				display : 'none'
			});
		};

		let show = self.show = () => {

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

		let checkIsShowing = self.checkIsShowing = () => {

			if (wrapperEl === document.body) {
				return true;
			} else {
				return parentNode !== undefined && parentNode.checkIsShowing() === true && getStyle('display') !== 'none';
			}
		};
		
		let scrollTo = self.scrollTo = (params) => {
			//REQUIRED: params
			//OPTIONAL: params.left
			//OPTIONAL: params.top
			
			let left = params.left;
			let top = params.top;
			
			if (contentEl !== undefined) {
			
				if (left !== undefined) {
					contentEl.scrollLeft = left;
				}
				
				if (top !== undefined) {
					contentEl.scrollTop = top;
				}
			}
		};
		
		let getScrollLeft = self.getScrollLeft = () => {
			if (contentEl !== undefined) {
				return contentEl.scrollLeft;
			} else {
				return 0;
			}
		};
		
		let getScrollTop = self.getScrollTop = () => {
			if (contentEl !== undefined) {
				return contentEl.scrollTop;
			} else {
				return 0;
			}
		};
		
		let getScrollWidth = self.getScrollWidth = () => {
			if (contentEl !== undefined) {
				return contentEl.scrollWidth;
			} else {
				return 0;
			}
		};
		
		let getScrollHeight = self.getScrollHeight = () => {
			if (contentEl !== undefined) {
				return contentEl.scrollHeight;
			} else {
				return 0;
			}
		};
		
		let setData = self.setData = (_data) => {
			//REQUIRED: _data
			
			data = _data;
		};
		
		let getData = self.getData = () => {
			return data;
		};
	},

	afterInit : (inner, self, params) => {
		//OPTIONAL: params
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		let style;
		let children;
		let on;

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
			EACH(on, (handler, name) => {
				self.on(name, handler);
			});
		}

		if (children !== undefined) {
			EACH(children, (child, i) => {
				self.append(child);
			});
		}
	}
});

/*
 * 이벤트 정보를 제공하는 객체를 생성하는 E 클래스
 */
global.E = CLASS({

	init : (inner, self, params) => {
		//REQUIRED: params
		//REQUIRED: params.e
		//REQUIRED: params.el
		
		let e = params.e;
		let el = params.el;

		let checkIsDescendant = (parent, child) => {

			let node = child.parentNode;

			while (node !== TO_DELETE) {

				if (node === parent) {
					return true;
				}

				node = node.parentNode;
			}

			return false;
		};

		let stopDefault = self.stopDefault = () => {
			e.preventDefault();
		};

		let stopBubbling = self.stopBubbling = () => {
			e.stopPropagation();
		};

		let stop = self.stop = () => {
			stopDefault();
			stopBubbling();
		};

		let getLeft = self.getLeft = () => {
			
			// if is touch mode
			if (INFO.checkIsTouchMode() === true) {
				
				let touchPageX;

				if (e.touches !== undefined && e.touches[0] !== undefined) {

					// first touch position.

					EACH(e.touches, (touch) => {
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

					EACH(e.changedTouches, (touch) => {
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

		let getTop = self.getTop = () => {

			// if is touch mode
			if (INFO.checkIsTouchMode() === true) {
				
				let touchPageY;

				if (e.touches !== undefined && e.touches[0] !== undefined) {

					// first touch position.

					EACH(e.touches, (touch) => {
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

					EACH(e.changedTouches, (touch) => {
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

		let getKey = self.getKey = () => {
			return e.key;
		};
		
		let getWheelDelta = self.getWheelDelta = () => {
			return e.deltaY;
		};
	}
});

/*
 * 빈 이벤트 정보를 제공하는 객체를 생성하는 EMPTY_E 클래스
 */
global.EMPTY_E = CLASS({

	init : (inner, self) => {

		let stopDefault = self.stopDefault = () => {
			// ignore.
		};

		let stopBubbling = self.stopBubbling = () => {
			// ignore.
		};

		let stop = self.stop = () => {
			// ignore.
		};

		let getLeft = self.getLeft = () => {
			
			// on heaven!
			return -999999;
		};

		let getTop = self.getTop = () => {
			
			// on heaven!
			return -999999;
		};

		let getKey = self.getKey = () => {
			return '';
		};
		
		let getWheelDelta = self.getWheelDelta = () => {
			return 0;
		};
	}
});

/*
 * 노드의 이벤트 처리를 담당하는 EVENT 클래스
 */
global.EVENT = CLASS((cls) => {

	let eventMaps = {};
	
	let fireAll = cls.fireAll = (nameOrParams) => {
		//REQUIRED: nameOrParams
		//OPTIONAL: nameOrParams.node	이벤트가 등록된 노드
		//REQUIRED: nameOrParams.name	이벤트 이름

		let node;
		let name;
		
		let nodeId;
		
		let eventMap;

		let ret;

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

			let events = eventMap[name];

			if (events !== undefined) {

				EACH(events, (evt) => {

					if (evt.fire() === false) {
						
						ret = false;
					}
				});
			}
		}

		return ret;
	};

	let removeAll = cls.removeAll = (nameOrParams) => {
		//OPTIONAL: nameOrParams
		//OPTIONAL: nameOrParams.node	이벤트가 등록된 노드
		//OPTIONAL: nameOrParams.name	이벤트 이름
		
		let node;
		let name;
		
		let nodeId;
		
		let eventMap;

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

				let events = eventMap[name];

				if (events !== undefined) {

					EACH(events, (evt) => {
						evt.remove();
					});
				}

			} else {

				EACH(eventMap, (events) => {
					EACH(events, (evt) => {
						evt.remove();
					});
				});
			}
		}
	};

	let remove = cls.remove = (nameOrParams, eventHandler) => {
		//REQUIRED: nameOrParams
		//OPTIONAL: nameOrParams.node	이벤트가 등록된 노드
		//REQUIRED: nameOrParams.name	이벤트 이름
		//REQUIRED: eventHandler
		
		let node;
		let name;

		let nodeId;
		
		let eventMap;
		
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

			let events = eventMap[name];

			if (events !== undefined) {

				EACH(events, (evt) => {
					if (evt.getEventHandler() === eventHandler) {
						evt.remove();
					}
				});
			}
		}
	};

	return {

		init : (inner, self, nameOrParams, eventHandler) => {
			//REQUIRED: nameOrParams
			//OPTIONAL: nameOrParams.node		이벤트를 등록 및 적용할 노드
			//OPTIONAL: nameOrParams.lowNode	이벤트 '등록'은 node 파라미터에 지정된 노드에 하지만, 실제 이벤트의 동작을 '적용'할 노드는 다른 경우 해당 노드
			//REQUIRED: nameOrParams.name		이벤트 이름
			//REQUIRED: eventHandler
			
			let node;
			let lowNode;
			let name;
			
			let nodeId;
			
			let eventLows = [];
			
			let subEvent;
			
			let lastTapTime;

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

			let removeFromMap = () => {

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
				}, (e) => {

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
				}, (e, node) => {
					if (INFO.checkIsTouchMode() === true) {
						eventHandler(e, node);
					}
				}));
				
				// by mouse
				eventLows.push(EVENT_LOW({
					node : node,
					lowNode : lowNode,
					name : 'mousedown'
				}, (e, node) => {
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
				}, (e, node) => {
					if (INFO.checkIsTouchMode() === true) {
						eventHandler(e, node);
					}
				}));
				
				// by mouse
				eventLows.push(EVENT_LOW({
					node : node,
					lowNode : lowNode,
					name : 'mousemove'
				}, (e, node) => {
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
				}, (e, node) => {
					if (INFO.checkIsTouchMode() === true) {
						eventHandler(e, node);
					}
				}));
				
				// by mouse
				eventLows.push(EVENT_LOW({
					node : node,
					lowNode : lowNode,
					name : 'mouseup'
				}, (e, node) => {
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
				}, (e, node) => {
					if (INFO.checkIsTouchMode() === true) {
						eventHandler(e, node);
					}
				}));

				// by mouse
				eventLows.push(EVENT_LOW({
					node : node,
					lowNode : lowNode,
					name : 'mouseover'
				}, (e, node) => {
					if (INFO.checkIsTouchMode() !== true) {
						eventHandler(e, node);
					}
				}));
			}

			// other events
			else if (name !== 'attach' && name !== 'show' && name !== 'remove') {
				eventLows.push(EVENT_LOW(nameOrParams, eventHandler));
			}
			
			let remove = self.remove = () => {

				EACH(eventLows, (eventLow) => {
					eventLow.remove();
				});
					
				if (subEvent !== undefined) {
					subEvent.remove();
				}

				removeFromMap();
			};

			let fire = self.fire = () => {

				// pass empty e object.
				return eventHandler(EMPTY_E(), node);
			};

			let getEventHandler = self.getEventHandler = () => {
				return eventHandler;
			};
		}
	};
});
/*
 * 내부적으로 이벤트를 처리하기 위해 사용되는 EVENT_LOW 클래스
 */
global.EVENT_LOW = CLASS({

	init : (inner, self, nameOrParams, eventHandler) => {
		//REQUIRED: nameOrParams
		//OPTIONAL: nameOrParams.node		이벤트를 등록 및 적용할 노드
		//OPTIONAL: nameOrParams.lowNode	이벤트 '등록'은 node 파라미터에 지정된 노드에 하지만, 실제 이벤트의 동작을 '적용'할 노드는 다른 경우 해당 노드
		//REQUIRED: nameOrParams.name		이벤트 이름
		//REQUIRED: eventHandler
		
		let node;
		let lowNode;
		let name;
		
		let el;
		
		let innerHandler;

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
		
		el.addEventListener(name, innerHandler = (e) => {
			
			let result = eventHandler(E({
				e : e,
				el : el
			}), node);
			
			if (name === 'beforeunload' && result !== undefined) {
				e.returnValue = result;
			}

			return result;
			
		}, false);

		let remove = self.remove = () => {
			el.removeEventListener(name, innerHandler, false);
		};
	}
});

/*
 * 이벤트가 한번 발생하면 자동으로 제거되는 EVENT_ONCE 클래스
 */
global.EVENT_ONCE = CLASS({

	init : (inner, self, nameOrParams, eventHandler) => {
		//REQUIRED: nameOrParams
		//OPTIONAL: nameOrParams.node		이벤트를 등록 및 적용할 노드
		//OPTIONAL: nameOrParams.lowNode	이벤트 '등록'은 node 파라미터에 지정된 노드에 하지만, 실제 이벤트의 동작을 '적용'할 노드는 다른 경우 해당 노드
		//REQUIRED: nameOrParams.name		이벤트 이름
		//REQUIRED: eventHandler

		let evt = EVENT(nameOrParams, (e, node) => {
			eventHandler(e, node);
			evt.remove();
		});

		let remove = self.remove = () => {
			evt.remove();
		};

		let fire = self.fire = () => {
			evt.fire();
		};
	}
});

/*
 * A class
 */
global.A = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'a'
		};
	},

	init : (inner, self, params) => {
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.href		이동할 경로
		//OPTIONAL: params.target	이동할 타겟
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트
		
		let style;
		let href;
		let target;
		
		// init params.
		if (params !== undefined) {
			style = params.style;
			href = params.href;
			target = params.target;
		}

		let setHref = self.setHref = (href) => {
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
		
		let tap = self.tap = () => {
			
			EVENT.fireAll({
				node : self,
				name : 'tap'
			});
		};
	},

	afterInit : (inner, self, params) => {
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.href		이동할 경로
		//OPTIONAL: params.target	이동할 타겟
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		let children;
		let href;
		
		let isHrefContent = false;
		
		let append;
		let prepend;
		
		// init params.
		if (params !== undefined) {
			children = params.c;
			href = params.href;
		}

		// 아무런 내용이 없으면 이동할 경로를 그대로 표시합니다.
		if (children === undefined && href !== undefined) {
			
			self.append(href);
			
			isHrefContent = true;
			
			OVERRIDE(self.append, (origin) => {
				
				append = self.append = (node) => {
					//REQUIRED: node
					
					if (isHrefContent === true) {
						self.empty();
						isHrefContent = false;
					}
					
					origin(node);
				};
			});
			
			OVERRIDE(self.prepend, (origin) => {
				
				prepend = self.prepend = (node) => {
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

/*
 * HTML audio 태그와 대응되는 클래스
 */
global.AUDIO = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'audio'
		};
	},

	init : (inner, self, params) => {
		//REQUIRED: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.ogg		OGG 사운드 파일 경로
		//OPTIONAL: params.mp3		MP3 사운드 파일 경로
		//OPTIONAL: params.isLoop	반복 재생할지 여부
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		let mp3 = params.mp3;
		let ogg = params.ogg;
		let isLoop = params.isLoop;
		
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
		
		let play = self.play = () => {
			self.getEl().play();
		};
		
		let pause = self.pause = () => {
			self.getEl().pause();
		};
		
		let stop = self.stop = () => {
			self.getEl().pause();
			self.getEl().currentTime = 0;
		};
	}
});

/*
 * HTML body 태그와 대응되는 객체
 */
global.BODY = OBJECT({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'body'
		};
	}
});

/*
 * HTML br 태그와 대응되는 클래스
 */
global.BR = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'br'
		};
	}
});

/*
 * HTML canvas 태그와 대응되는 클래스
 */
global.CANVAS = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'canvas'
		};
	},

	init : (inner, self, params) => {
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.width
		//OPTIONAL: params.height
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트
		
		let width;
		let height;

		// init params.
		if (params !== undefined) {
			width = params.width;
			height = params.height;
		}

		let getContext = self.getContext = (contextType) => {
			//REQUIRED: contextType
			
			return self.getEl().getContext(contextType);
		};

		let setSize = self.setSize = (size) => {
			//REQUIRED: size
			//OPTIONAL: size.width
			//OPTIONAL: size.height

			let el = self.getEl();

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

		let getWidth = self.getWidth = () => {
			return width;
		};

		let getHeight = self.getHeight = () => {
			return height;
		};

		let getDataURL = self.getDataURL = () => {
			return self.getEl().toDataURL();
		};
	}
});

/*
 * HTML div 태그와 대응되는 클래스
 */
global.DIV = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'div'
		};
	}
});

/*
 * Form class
 */
global.FORM = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'form'
		};
	},

	init : (inner, self, params) => {
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
		
		let action;
		let target;
		let method;
		let enctype;

		let getData;
		let setData;

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
			}, (e) => {
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

		OVERRIDE(self.setData, (origin) => {
			
			getData = self.getData = () => {
	
				let data = origin();
	
				let f = (node) => {
					//REQUIRED: node
	
					EACH(node.getChildren(), (child) => {
	
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

		OVERRIDE(self.setData, (origin) => {
			
			setData = self.setData = (data) => {
				//REQUIRED: data
				
				let f = (node) => {
					//REQUIRED: node
	
					EACH(node.getChildren(), (child) => {
	
						let value;
	
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

		let submit = self.submit = () => {
			
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

/*
 * HTML h1 태그와 대응되는 클래스
 */
global.H1 = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'h1'
		};
	}
});

/*
 * HTML h2 태그와 대응되는 클래스
 */
global.H2 = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'h2'
		};
	}
});

/*
 * HTML h3 태그와 대응되는 클래스
 */
global.H3 = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'h3'
		};
	}
});

/*
 * HTML h4 태그와 대응되는 클래스
 */
global.H4 = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'h4'
		};
	}
});

/*
 * HTML h5 태그와 대응되는 클래스
 */
global.H5 = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'h5'
		};
	}
});

/*
 * HTML h6 태그와 대응되는 클래스
 */
global.H6 = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'h6'
		};
	}
});

/*
 * HTML iframe 태그와 대응되는 클래스
 */
global.IFRAME = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		
		return {
			tag : 'iframe',
			style : {
				border : 'none'
			}
		};
	},

	init : (inner, self, params) => {
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.name
		//OPTIONAL: params.src
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트
		
		let name;
		let src;

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

		let setSrc = self.setSrc = (_src) => {
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

		let getSrc = self.getSrc = () => {
			return src;
		};
	}
});

/*
 * HTML img 태그와 대응되는 클래스
 */
global.IMG = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'img'
		};
	},

	init : (inner, self, params) => {
		//REQUIRED: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//REQUIRED: params.src		이미지 경로
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트
		
		let src = params.src;
		let el = self.getEl();

		//OVERRIDE: self.getWidth
		let getWidth = self.getWidth = () => {
			return el.width;
		};

		//OVERRIDE: self.getHeight
		let getHeight = self.getHeight = () => {
			return el.height;
		};

		let setSize = self.setSize = (size) => {
			//REQUIRED: size
			//OPTIONAL: size.width
			//OPTIONAL: size.height

			let width = size.width;
			let height = size.height;

			if (width !== undefined) {
				el.width = width;
			}

			if (height !== undefined) {
				el.height = height;
			}
		};

		let getSrc = self.getSrc = () => {
			return src;
		};

		let setSrc = self.setSrc = (_src) => {
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

/*
 * HTML input 태그와 대응되는 클래스
 */
global.INPUT = CLASS((cls) => {

	let focusingInputIds = [];

	let getFocusingInputIds = cls.getFocusingInputIds = (id) => {
		return focusingInputIds;
	};

	return {

		preset : () => {
			return DOM;
		},

		params : () => {
			return {
				tag : 'input'
			};
		},

		init : (inner, self, params) => {
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
			
			let name;
			let type;
			let placeholder;
			let accept;
			let isMultiple;
			let isOffAutocomplete;

			let getName;
			let getValue;
			let setValue;
			let select;
			let focus;
			let blur;
			
			let toggleCheck;
			let checkIsChecked;

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
				
				getName = self.getName = () => {
					return name;
				};

				getValue = self.getValue = () => {
					if (type === 'checkbox' || type === 'radio') {
						return self.getEl().checked;
					}
					return self.getEl().value;
				};

				select = self.select = () => {
					if (type === 'file') {
						self.getEl().click();
					} else {
						self.getEl().select();
					}
				};

				focus = self.focus = () => {
					self.getEl().focus();
				};

				blur = self.blur = () => {
					self.getEl().blur();
				};

				if (type === 'checkbox' || type === 'radio') {

					toggleCheck = self.toggleCheck = (e) => {

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

					checkIsChecked = self.checkIsChecked = () => {
						return self.getEl().checked;
					};

					EVENT({
						node : self,
						name : 'keyup'
					}, (e) => {
						
						if (e !== undefined && e.getKey() === 'Enter') {
							
							DELAY(() => {
								
								EVENT.fireAll({
									node : self,
									name : 'change'
								});
							});
						}
					});
				}
			}

			self.setValue = setValue = (value) => {
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
			}, () => {
				getFocusingInputIds().push(self.id);
			});

			EVENT({
				node : self,
				name : 'blur'
			}, () => {

				REMOVE({
					array : getFocusingInputIds(),
					value : self.id
				});
			});

			self.on('remove', () => {

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
				}, () => {
					
					if (checkIsChecked() === true) {
						
						EVENT_ONCE({
							node : self,
							name : 'touchend'
						}, () => {
							DELAY(() => {
								setValue(false);
							});
						});
					}
				});
			}
		},

		afterInit : (inner, self, params) => {
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
			
			let type;
			let value;

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

/*
 * HTML li 태그와 대응되는 클래스
 */
global.LI = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'li'
		};
	}
});

/*
 * HTML optgroup 태그와 대응되는 클래스
 */
global.OPTGROUP = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'optgroup'
		};
	},

	init : (inner, self, params) => {
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.label
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		let label = params.label;

		inner.setAttr({
			name : 'label',
			value : label
		});
	}
});

/*
 * HTML option 태그와 대응되는 클래스
 */
global.OPTION = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'option'
		};
	},

	init : (inner, self, params) => {
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.value
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트
		
		let getValue = self.getValue = () => {
			return self.getEl().value;
		};

		let setValue = self.setValue = (value) => {
			//REQUIRED: value

			self.getEl().value = value;
		};
	},

	afterInit : (inner, self, params) => {
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.value
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트
		
		let value;
		let children;

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

/*
 * HTML p 태그와 대응되는 클래스
 */
global.P = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'p'
		};
	}
});

/*
 * HTML select 태그와 대응되는 클래스
 */
global.SELECT = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'select'
		};
	},

	init : (inner, self, params) => {
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.name
		//OPTIONAL: params.placeholder
		//OPTIONAL: params.value
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트
		
		let name;
		
		let isCtrlDown = false;

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

		let getName = self.getName = () => {
			return name;
		};

		let getValue = self.getValue = () => {
			return self.getEl().value;
		};

		let setValue = self.setValue = (value) => {
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

		let select = self.select = () => {
			self.getEl().select();
		};

		let focus = self.focus = () => {
			self.getEl().focus();
		};

		let blur = self.blur = () => {
			self.getEl().blur();
		};

		EVENT({
			node : self,
			name : 'keydown'
		}, (e) => {
			
			if (e.getKey() === 'Control') {
				isCtrlDown = true;
			} else if (isCtrlDown !== true) {
				e.stopBubbling();
			}
		});

		EVENT({
			node : self,
			name : 'keyup'
		}, (e) => {

			if (e.getKey() === 'Control') {
				isCtrlDown = false;
			}
		});

		EVENT({
			node : self,
			name : 'focus'
		}, () => {
			INPUT.getFocusingInputIds().push(self.id);
		});

		EVENT({
			node : self,
			name : 'blur'
		}, () => {

			REMOVE({
				array : INPUT.getFocusingInputIds(),
				value : self.id
			});
		});

		self.on('remove', () => {

			REMOVE({
				array : INPUT.getFocusingInputIds(),
				value : self.id
			});
		});
	},

	afterInit : (inner, self, params) => {
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일을 지정합니다.
		//OPTIONAL: params.name
		//OPTIONAL: params.placeholder
		//OPTIONAL: params.value
		//OPTIONAL: params.c		자식 노드를 지정합니다. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트를 지정합니다.

		let value;

		// init params.
		if (params !== undefined) {
			value = params.value;
		}

		if (value !== undefined) {
			self.setValue(value);
		}
	}
});

/*
 * HTML span 태그와 대응되는 클래스
 */
global.SPAN = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'span'
		};
	}
});

/*
 * HTML table 태그와 대응되는 클래스
 */
global.TABLE = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'table'
		};
	}
});

/*
 * HTML td 태그와 대응되는 클래스
 */
global.TD = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'td'
		};
	},

	init : (inner, self, params) => {
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.rowspan
		//OPTIONAL: params.colspan
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트
		
		let rowspan;
		let colspan;

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

/*
 * Textarea class
 */
global.TEXTAREA = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'textarea'
		};
	},

	init : (inner, self, params) => {
		//OPTIONAL: params
		//OPTIONAL: params.id			id 속성
		//OPTIONAL: params.cls			class 속성
		//OPTIONAL: params.style		스타일
		//OPTIONAL: params.name
		//OPTIONAL: params.placeholder	값이 없는 경우 표시되는 짧은 설명
		//OPTIONAL: params.value
		//OPTIONAL: params.c			자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on			이벤트

		let name;
		let placeholder;
		
		let isCtrlDown = false;

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

		let getName = self.getName = () => {
			return name;
		};

		let getValue = self.getValue = () => {
			return self.getEl().value;
		};

		let setValue = self.setValue = (value) => {
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

		let select = self.select = () => {
			self.getEl().select();
		};

		let focus = self.focus = () => {
			self.getEl().focus();
		};

		let blur = self.blur = () => {
			self.getEl().blur();
		};

		EVENT({
			node : self,
			name : 'keydown'
		}, (e) => {

			if (e.getKey() === 'Control') {
				isCtrlDown = true;
			} else if (isCtrlDown !== true) {
				e.stopBubbling();
			}
		});

		EVENT({
			node : self,
			name : 'keyup'
		}, (e) => {

			if (e.getKey() === 'Control') {
				isCtrlDown = false;
			}
		});

		EVENT({
			node : self,
			name : 'focus'
		}, () => {
			INPUT.getFocusingInputIds().push(self.id);
		});

		EVENT({
			node : self,
			name : 'blur'
		}, () => {

			REMOVE({
				array : INPUT.getFocusingInputIds(),
				value : self.id
			});
		});

		self.on('remove', () => {

			REMOVE({
				array : INPUT.getFocusingInputIds(),
				value : self.id
			});
		});
	},

	afterInit : (inner, self, params) => {
		//OPTIONAL: params
		//OPTIONAL: params.id			id 속성
		//OPTIONAL: params.cls			class 속성
		//OPTIONAL: params.style		스타일
		//OPTIONAL: params.name
		//OPTIONAL: params.placeholder	값이 없는 경우 표시되는 짧은 설명
		//OPTIONAL: params.value
		//OPTIONAL: params.c			자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on			이벤트

		let value;

		// init params.
		if (params !== undefined) {
			value = params.value;
		}

		if (value !== undefined) {
			self.setValue(value);
		}
	}
});

/*
 * HTML th 태그와 대응되는 클래스
 */
global.TH = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'th'
		};
	},

	init : (inner, self, params) => {
		//OPTIONAL: params
		//OPTIONAL: params.id		id 속성
		//OPTIONAL: params.cls		class 속성
		//OPTIONAL: params.style	스타일
		//OPTIONAL: params.rowspan
		//OPTIONAL: params.colspan
		//OPTIONAL: params.c		자식 노드. 하나의 노드를 지정하거나, 노드들의 배열을 지정할 수 있습니다.
		//OPTIONAL: params.on		이벤트

		let rowspan;
		let colspan;

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

/*
 * HTML tr 태그와 대응되는 클래스
 */
global.TR = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'tr'
		};
	}
});

/*
 * HTML ul 태그와 대응되는 클래스
 */
global.UL = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'ul'
		};
	}
});

/*
 * HTML video 태그와 대응되는 클래스
 */
global.VIDEO = CLASS({

	preset : () => {
		return DOM;
	},

	params : () => {
		return {
			tag : 'video'
		};
	},

	init : (inner, self, params) => {
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

		let webm = params.webm;
		let ogg = params.ogg;
		let mp4 = params.mp4;
		let poster = params.poster;
		let isNoControls = params.isNoControls;
		let isLoop = params.isLoop;
		let isMuted = params.isMuted;
		
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
		
		let play = self.play = () => {
			self.getEl().play();
		};
		
		let pause = self.pause = () => {
			self.getEl().pause();
		};
		
		let stop = self.stop = () => {
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

!function (root, name, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(name, definition)
  else root[name] = definition()
}(this, 'bowser', function () {
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
    if (!result.windowsphone && !result.msedge && (android || result.silk)) {
      result.android = t
    } else if (!result.windowsphone && !result.msedge && iosdevice) {
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
          if (typeof minVersions[browser] !== 'string') {
            throw new Error('Browser version in the minVersion map should be a string: ' + browser + ': ' + String(minVersions));
          }

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

/*
 * HTTP DELETE 요청을 보냅니다.
 */
global.DELETE = METHOD({

	run : (urlOrParams, responseListenerOrListeners) => {
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
/*
 * HTTP GET 요청을 보냅니다.
 */
global.GET = METHOD({

	run : (urlOrParams, responseListenerOrListeners) => {
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
/*
 * HTTP POST 요청을 보냅니다.
 */
global.POST = METHOD({

	run : (urlOrParams, responseListenerOrListeners) => {
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
/*
 * HTTP PUT 요청을 보냅니다.
 */
global.PUT = METHOD({

	run : (urlOrParams, responseListenerOrListeners) => {
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
/*
 * HTTP 요청을 보냅니다.
 */
global.REQUEST = METHOD({

	run : (params, responseListenerOrListeners) => {
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

		let method = params.method;
		let isSecure = params.isSecure === undefined ? BROWSER_CONFIG.isSecure : params.isSecure;
		let host = params.host === undefined ? BROWSER_CONFIG.host : params.host;
		let port = params.port === undefined ? (params.host === undefined ? BROWSER_CONFIG.port : 80) : params.port;
		let uri = params.uri;
		let url = params.url;
		let paramStr = params.paramStr;
		let _params = params.params;
		let data = params.data;
		let headers = params.headers;
		
		let responseListener;
		let errorListener;

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
			
			EACH(_params, (value, name) => {
				
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
		})).then((response) => {
			return response.text();
		}).then((responseText) => {
			responseListener(responseText);
		}).catch((error) => {
			
			let errorMsg = error.toString();

			if (errorListener !== undefined) {
				errorListener(errorMsg);
			} else {
				SHOW_ERROR('REQUEST', errorMsg, params);
			}
		});
	}
});
/*
 * URI를 변경하여 다른 뷰로 이동합니다.
 */
global.GO = METHOD((m) => {
	
	let isCTRLKeyDown;

	return {
		
		run : (uri) => {
			//REQUIRED: uri
			
			if (isCTRLKeyDown === undefined) {
				isCTRLKeyDown = false;
				
				EVENT('keydown', (e) => {
					if (e.getKey() === 'Control') {
						isCTRLKeyDown = true;
					}
				});
				
				EVENT('keyup', (e) => {
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

FOR_BOX((box) => {

	box.GO = METHOD({

		run : (uri) => {
			//REQUIRED: uri

			GO((box.boxName === CONFIG.defaultBoxName ? '' : box.boxName + '/') + uri);
		}
	});
});

/*
 * 새 창에서 URI에 해당하는 뷰를 띄웁니다.
 */
global.GO_NEW_WIN = METHOD({

	run : (uri) => {
		//REQUIRED: uri

		global.open(HREF(uri));
	}
});

FOR_BOX((box) => {

	box.GO_NEW_WIN = METHOD({

		run : (uri) => {
			//REQUIRED: uri

			GO_NEW_WIN((box.boxName === CONFIG.defaultBoxName ? '' : box.boxName + '/') + uri);
		}
	});
});

/*
 * URI로부터 주소를 생성하여 반환합니다.
 */
global.HREF = METHOD({

	run : (uri) => {
		//REQUIRED: uri

		return '/' + uri;
	}
});

FOR_BOX((box) => {

	box.HREF = METHOD({

		run : (uri) => {
			//OPTIONAL: uri

			return HREF((box.boxName === CONFIG.defaultBoxName ? '' : box.boxName + '/') + (uri === undefined ? '' : uri));
		}
	});
});

/*
 * 특정 URI와 뷰를 연결합니다.
 */
global.MATCH_VIEW = METHOD((m) => {
	
	let changeURIHandlers = [];
	
	let checkAll = m.checkAll = () => {
		EACH(changeURIHandlers, (changeURIHandler) => {
			changeURIHandler();
		});
	};
	
	return {

		run : (params) => {
			//REQUIRED: params
			//REQUIRED: params.uri
			//OPTIONAL: params.excludeURI
			//REQUIRED: params.target

			let uri = params.uri;
			let excludeURI = params.excludeURI;
			let target = params.target;
			
			let uriMatcher = URI_MATCHER(uri);
			let excludeURIMatcher = excludeURI === undefined ? undefined : URI_MATCHER(excludeURI);
	
			let view;
			let preParams;
			
			let changeURIHandler = () => {
	
				let uri = URI();
				let result;
	
				// when view founded
				if (
				uri !== REFRESH.getRefreshingURI() &&
				(result = uriMatcher.check(uri)).checkIsMatched() === true &&
				(excludeURI === undefined || excludeURIMatcher.check(uri).checkIsMatched() !== true)) {

					let uriParams = result.getURIParams();
	
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
	
			EVENT('popstate', () => {
				changeURIHandler();
			});
			
			changeURIHandler();
		}
	};
});

FOR_BOX((box) => {

	box.MATCH_VIEW = METHOD({

		run : (params) => {
			//REQUIRED: params
			//REQUIRED: params.uri
			//OPTIONAL: params.excludeURI
			//REQUIRED: params.target

			let uri = params.uri;
			let excludeURI = params.excludeURI;
			let target = params.target;

			let newURIs = [];
			let newExcludeURIs = [];

			let pushURI = (uri) => {

				if (box.boxName === CONFIG.defaultBoxName) {
					newURIs.push(uri);
				}

				newURIs.push(box.boxName + '/' + uri);
			};

			let pushExcludeURI = (uri) => {

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

/*
 * 뷰를 새로 불러옵니다.
 */
global.REFRESH = METHOD((m) => {
	
	const REFRESHING_URI = '__REFRESHING';
	
	let getRefreshingURI = m.getRefreshingURI = () => {
		return REFRESHING_URI;
	};
	
	return {

		run : (uri) => {
			//OPTIONAL: uri
	
			let savedURI = uri !== undefined ? uri : location.pathname.substring(1);
	
			history.pushState(undefined, undefined, '/' + REFRESHING_URI);
			MATCH_VIEW.checkAll();
			
			history.replaceState(undefined, undefined, '/' + savedURI);
			MATCH_VIEW.checkAll();
		}
	};
});

FOR_BOX((box) => {

	box.REFRESH = METHOD({

		run : (uri) => {
			//OPTIONAL: uri
			
			REFRESH((box.boxName === CONFIG.defaultBoxName ? '' : box.boxName + '/') + (uri === undefined ? '' : uri));
		}
	});
});

/*
 * 현재 브라우저의 URI를 가져옵니다.
 */
global.URI = METHOD({

	run : () => {
		
		return decodeURIComponent(location.pathname.substring(1));
	}
});

/*
 * 뷰를 정의하기 위한 VIEW 클래스
 */
global.VIEW = CLASS({

	init : (inner, self) => {

		let isClosed = false;
		let paramsChangeHandlers = [];
		let uriChangeHandlers = [];
		let closeHandlers = [];
		
		let nowParams;
		let nowURI;

		let on = inner.on = (eventName, eventHandler) => {
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

		let changeParams = self.changeParams = (params) => {
			
			nowParams = params;

			EACH(paramsChangeHandlers, (handler) => {
				handler(params);
			});
		};
		
		let runURIChangeHandlers = self.runURIChangeHandlers = (uri) => {
			
			nowURI = uri;
			
			EACH(uriChangeHandlers, (handler) => {
				handler(uri);
			});
		};

		let close = self.close = () => {

			EACH(closeHandlers, (handler) => {
				handler();
			});

			isClosed = true;
		};

		let checkIsClosed = inner.checkIsClosed = () => {
			return isClosed;
		};
		
		scrollTo(0, 0);
	}
});

/*
 * 가로 스크롤의 현재 위치를 픽셀 단위로 가져옵니다.
 */
global.SCROLL_LEFT = METHOD({

	run : () => {
		
		return global.pageXOffset;
	}
});

/*
 * 세로 스크롤의 현재 위치를 픽셀 단위로 가져옵니다.
 */
global.SCROLL_TOP = METHOD({

	run : () => {

		return global.pageYOffset;
	}
});

/*
 * 브라우저 창에 표시되는 문서의 제목을 가져오거나 변경합니다.
 */
global.TITLE = METHOD({

	run : (title) => {
		//OPTIONAL: title

		if (title === undefined) {
			return document.title;
		} else {
			document.title = title;
		}
	}
});

/*
 * 브라우저 창의 세로 길이를 픽셀 단위로 반환합니다.
 */
global.WIN_HEIGHT = METHOD({

	run : () => {

		return document.documentElement.clientHeight;
	}
});

/*
 * 브라우저 창의 가로 길이를 픽셀 단위로 반환합니다.
 */
global.WIN_WIDTH = METHOD({

	run : () => {

		return document.documentElement.clientWidth;
	}
});
