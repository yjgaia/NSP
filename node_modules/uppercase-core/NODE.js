'use strict';

/*

Welcome to UPPERCASE-CORE! (http://uppercase.io)

*/

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

OVERRIDE(BOX, (origin) => {
	
	/*
	 * BOX를 생성합니다.
	 */
	global.BOX = METHOD((m) => {
		
		m.getAllBoxes = origin.getAllBoxes;
		
		return {
			
			run : (boxName) => {
				//REQUIRED: boxName
				
				if (NODE_CONFIG[boxName] === undefined) {
					NODE_CONFIG[boxName] = {};
				}
		
				return origin(boxName);
			}
		};
	});
});

/*
 * Node.js 환경에서의 기본 설정
 */
global.NODE_CONFIG = {};

/*
 * CPU 코어 간 클러스터링을 수행합니다.
 */
global.CPU_CLUSTERING = METHOD((m) => {

	let Cluster = require('cluster');
	
	// 클러스터링을 수행하지 않을 경우 기본적으로 1개
	let workerCount = 1;
	
	// 클러스터링을 수행하지 않을 경우 기본적으로 1
	let thisWorkerId = 1;
	
	Cluster.schedulingPolicy = Cluster.SCHED_RR;

	let getWorkerId = m.getWorkerId = () => {
		return thisWorkerId;
	};
	
	let getWorkerCount = m.getWorkerCount = () => {
		return workerCount;
	};

	return {

		run : (work) => {
			//REQUIRED: work
			
			let methodMap = {};
			let sendKey = 0;
			
			let innerSend;

			let runMethods = (methodName, data, sendKey, fromWorkerId) => {
				
				try {
					
					let methods = methodMap[methodName];

					if (methods !== undefined) {
	
						EACH(methods, (method) => {
	
							// run method.
							method(data,
	
							// ret.
							(retData) => {
	
								if (sendKey !== undefined) {
	
									send({
										workerId : fromWorkerId,
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
					
					SHOW_ERROR('CPU_CLUSTERING', error.toString(), {
						methodName : methodName,
						data : data
					});
				}
			};
			
			// 워커 개수 (CPU 개수보다 하나 적음, 하나는 마스터에게 배분)
			let workerCount = require('os').cpus().length - 1;
			
			// 최소한 한개의 워커는 필요
			if (workerCount < 1) {
				workerCount = 1;
			}
			
			let on = m.on = (methodName, method) => {

				let methods = methodMap[methodName];

				if (methods === undefined) {
					methods = methodMap[methodName] = [];
				}

				methods.push(method);
			};
			
			let off = m.off = (methodName) => {
				delete methodMap[methodName];
			};

			let send = m.send = (params, callback) => {
				//REQUIRED: params
				//REQUIRED: params.workerId
				//REQUIRED: params.methodName
				//REQUIRED: params.data
				//OPTIONAL: callback
				
				let workerId = params.workerId;
				let methodName = params.methodName;
				let data = params.data;
				
				if (callback === undefined) {
					
					if (workerId === thisWorkerId) {
						runMethods(methodName, data);
					} else {
						innerSend({
							workerId : workerId,
							methodName : methodName,
							data : data
						});
					}
				}
				
				else {
					
					let callbackName = '__CALLBACK_' + sendKey;
					
					// on callback.
					on(callbackName, (data) => {

						// run callback.
						callback(data);

						// off callback.
						off(callbackName);
					});
					
					sendKey += 1;
					
					if (workerId === thisWorkerId) {
						runMethods(methodName, data, sendKey - 1, thisWorkerId);
					} else {
						innerSend({
							workerId : workerId,
							methodName : methodName,
							data : data,
							sendKey : sendKey - 1,
							fromWorkerId : thisWorkerId
						});
					}
				}
			};
			
			let broadcast = m.broadcast = (params) => {
				//REQUIRED: params
				//REQUIRED: params.methodName
				//REQUIRED: params.data

				innerSend({
					methodName : params.methodName,
					data : params.data
				});
			};

			// when master
			if (Cluster.isMaster) {
				
				// 마스터용 아이디
				thisWorkerId = '~';
				
				innerSend = (params) => {
					//REQUIRED: params
					//OPTIONAL: params.workerId
					//REQUIRED: params.methodName
					//REQUIRED: params.data
					//OPTIONAL: params.sendKey
					//OPTIONAL: params.fromWorkerId
					
					// send.
					if (params.workerId !== undefined) {
						
						let worker = Cluster.workers[params.workerId];
						
						if (worker !== undefined) {
							worker.send(PACK_DATA(params));
						}
					}
					
					// broadcast.
					else {
						
						// send params to all workers except new worker.
						EACH(Cluster.workers, (worker) => {
							worker.send(PACK_DATA(params));
						});
					}
				};
				
				// save shared data.
				on('__SHARED_STORE_SAVE', SHARED_STORE.save);
				
				// update shared data.
				on('__SHARED_STORE_UPDATE', SHARED_STORE.update);

				// get shared data.
				on('__SHARED_STORE_GET', SHARED_STORE.get);

				// remove shared data.
				on('__SHARED_STORE_REMOVE', SHARED_STORE.remove);
				
				// get all shared data.
				on('__SHARED_STORE_ALL', SHARED_STORE.all);
				
				// count shared data.
				on('__SHARED_STORE_COUNT', SHARED_STORE.count);
				
				// check is exists shared data.
				on('__SHARED_STORE_CHECK_IS_EXISTS', SHARED_STORE.checkIsExists);

				// clear shared store.
				on('__SHARED_STORE_CLEAR', SHARED_STORE.clear);
				
				let fork = () => {

					let newWorker = Cluster.fork();
					
					// receive params from new worker.
					newWorker.on('message', (params) => {
						
						// send.
						if (params.workerId !== undefined) {
							
							// for master
							if (params.workerId === '~') {
								
								params = UNPACK_DATA(params);
								
								runMethods(params.methodName, params.data, params.sendKey, params.fromWorkerId);
							}
							
							else {
								
								let worker = Cluster.workers[params.workerId];
								
								if (worker !== undefined) {
									worker.send(params);
								}
							}
						}
						
						// broadcast.
						else {
							
							// send params to all workers except new worker.
							EACH(Cluster.workers, (worker) => {
								if (worker !== newWorker) {
									worker.send(params);
								}
							});
						}
					});
				};

				// 워커 생성
				REPEAT(workerCount, () => {
					fork();
				});

				Cluster.on('exit', (worker, code, signal) => {
					SHOW_ERROR('CPU_CLUSTERING', '워커 ID:' + worker.id + '가 작동을 중지하였습니다. (코드:' + (signal !== undefined ? signal : code) + '). 재시작합니다.');
					fork();
				});
			}

			// when worker
			else {
				
				thisWorkerId = Cluster.worker.id;
				
				innerSend = (params) => {
					//REQUIRED: params
					//OPTIONAL: params.workerId
					//REQUIRED: params.methodName
					//REQUIRED: params.data
					//OPTIONAL: params.sendKey
					//OPTIONAL: params.fromWorkerId
					
					process.send(PACK_DATA(params));
				};
				
				// receive data.
				process.on('message', (params) => {
					
					params = UNPACK_DATA(params);
					
					runMethods(params.methodName, params.data, params.sendKey, params.fromWorkerId);
				});
				
				work();

				console.log('[CPU_CLUSTERING] 클러스터링 워커가 실행중입니다. (워커 ID:' + thisWorkerId + ')');
			}
		}
	};
});

/*
 * 서버 간 클러스터링을 수행합니다.
 */
global.SERVER_CLUSTERING = METHOD((m) => {

	return {

		run : (params, work) => {
			//REQUIRED: params
			//REQUIRED: params.hosts
			//REQUIRED: params.thisServerName
			//REQUIRED: params.port
			//OPTIONAL: work

			let hosts = params.hosts;
			let thisServerName = params.thisServerName;
			let port = params.port;
			
			let methodMap = {};
			let isConnectings = {};
			let waitingSendInfoMap = {};
			let serverSends = {};
			let socketServeOns = [];
			
			let runMethods = (methodName, data, callback) => {

				try {
					
					let methods = methodMap[methodName];

					if (methods !== undefined) {
	
						EACH(methods, (method) => {
	
							// run method.
							method(data,
	
							// ret.
							callback);
						});
					}
				}
				
				// if catch error
				catch(error) {
					
					SHOW_ERROR('SERVER_CLUSTERING', error.toString(), {
						methodName : methodName,
						data : data
					});
				}
			};

			let connectToClusteringServer = (serverName) => {

				if (isConnectings[serverName] !== true) {
					isConnectings[serverName] = true;
					
					if (waitingSendInfoMap[serverName] === undefined) {
						waitingSendInfoMap[serverName] = [];
					}

					CONNECT_TO_SOCKET_SERVER({
						host : hosts[serverName],
						port : port
					}, {
						error : () => {
							delete isConnectings[serverName];
						},

						success : (on, off, send) => {

							send({
								methodName : '__BOOTED',
								data : thisServerName
							});

							serverSends[serverName] = (params, callback) => {
								//REQUIRED: params
								//REQUIRED: params.methodName
								//REQUIRED: params.data

								let methodName = params.methodName;
								let data = params.data;
								
								send({
									methodName : 'SERVER_CLUSTERING.' + methodName,
									data : data
								}, callback);
							};

							on('__DISCONNECTED', () => {
								delete serverSends[serverName];
								delete isConnectings[serverName];
								
								SHOW_ERROR('SERVER_CLUSTERING', '클러스터링 서버와의 연결이 끊어졌습니다. (끊어진 서버 이름:' + serverName + ')');
							});

							console.log('[SERVER_CLUSTERING] 클러스터링 서버와 연결되었습니다. (연결된 서버 이름:' + serverName + ')');

							if (CPU_CLUSTERING.broadcast !== undefined) {

								CPU_CLUSTERING.broadcast({
									methodName : '__SERVER_CLUSTERING__CONNECT_TO_CLUSTERING_SERVER',
									data : serverName
								});
							}
							
							EACH(waitingSendInfoMap[serverName], (info) => {
								serverSends[serverName]({
									methodName : info.methodName,
									data : info.data
								}, info.callback);
							});
							
							delete waitingSendInfoMap[serverName];
						}
					});
				}
			};

			if (CPU_CLUSTERING.on !== undefined) {
				CPU_CLUSTERING.on('__SERVER_CLUSTERING__CONNECT_TO_CLUSTERING_SERVER', connectToClusteringServer);
			}

			// try connect to all clustering hosts.
			EACH(hosts, (host, serverName) => {
				if (serverName !== thisServerName) {
					connectToClusteringServer(serverName);
				}
			});

			SOCKET_SERVER(port, (clientInfo, socketServeOn) => {
				
				let serverName;

				socketServeOns.push(socketServeOn);

				socketServeOn('__BOOTED', (_serverName) => {
					
					serverName = _serverName;
					
					connectToClusteringServer(serverName);
				});

				EACH(methodMap, (methods, methodName) => {
					EACH(methods, (method) => {
						socketServeOn('SERVER_CLUSTERING.' + methodName, method);
					});
				});

				socketServeOn('__DISCONNECTED', () => {
					
					REMOVE({
						array : socketServeOns,
						value : socketServeOn
					});
					
					SHOW_ERROR('SERVER_CLUSTERING', '클러스터링 서버와의 연결이 끊어졌습니다. (끊어진 서버 이름:' + serverName + ')');
				});
			});

			let getHosts = m.getHosts = () => {
				return hosts;
			};
			
			let getThisServerName = m.getThisServerName = () => {
				return thisServerName;
			};
			
			let on = m.on = (methodName, method) => {

				let methods = methodMap[methodName];

				if (methods === undefined) {
					methods = methodMap[methodName] = [];
				}

				methods.push(method);

				EACH(socketServeOns, (socketServeOn) => {
					socketServeOn('SERVER_CLUSTERING.' + methodName, method);
				});
			};

			// save shared data.
			on('__SHARED_STORE_SAVE', (params, ret) => {
				
				if (CPU_CLUSTERING.send !== undefined) {

					CPU_CLUSTERING.send({
						workerId : '~',
						methodName : '__SHARED_STORE_SAVE',
						data : params
					}, ret);
				}
				
				else {
					SHARED_STORE.save(params, ret);
				}
			});
			
			// update shared data.
			on('__SHARED_STORE_UPDATE', (params, ret) => {

				if (CPU_CLUSTERING.send !== undefined) {

					CPU_CLUSTERING.send({
						workerId : '~',
						methodName : '__SHARED_STORE_UPDATE',
						data : params
					}, ret);
				}
				
				else {
					SHARED_STORE.update(params, ret);
				}
			});
			
			// get shared data.
			on('__SHARED_STORE_GET', (params, ret) => {

				if (CPU_CLUSTERING.send !== undefined) {

					CPU_CLUSTERING.send({
						workerId : '~',
						methodName : '__SHARED_STORE_GET',
						data : params
					}, ret);
				}
				
				else {
					SHARED_STORE.get(params, ret);
				}
			});

			// remove shared data.
			on('__SHARED_STORE_REMOVE', (params, ret) => {

				if (CPU_CLUSTERING.send !== undefined) {

					CPU_CLUSTERING.send({
						workerId : '~',
						methodName : '__SHARED_STORE_REMOVE',
						data : params
					}, ret);
				}
				
				else {
					SHARED_STORE.remove(params, ret);
				}
			});

			// get all shared data.
			on('__SHARED_STORE_ALL', (params, ret) => {

				if (CPU_CLUSTERING.send !== undefined) {

					CPU_CLUSTERING.send({
						workerId : '~',
						methodName : '__SHARED_STORE_ALL',
						data : params
					}, ret);
				}
				
				else {
					SHARED_STORE.all(params, ret);
				}
			});

			// count shared data.
			on('__SHARED_STORE_COUNT', (params, ret) => {

				if (CPU_CLUSTERING.send !== undefined) {

					CPU_CLUSTERING.send({
						workerId : '~',
						methodName : '__SHARED_STORE_COUNT',
						data : params
					}, ret);
				}
				
				else {
					SHARED_STORE.count(params, ret);
				}
			});

			// check is exists shared data.
			on('__SHARED_STORE_CHECK_IS_EXISTS', (params, ret) => {

				if (CPU_CLUSTERING.send !== undefined) {

					CPU_CLUSTERING.send({
						workerId : '~',
						methodName : '__SHARED_STORE_CHECK_IS_EXISTS',
						data : params
					}, ret);
				}
				
				else {
					SHARED_STORE.checkIsExists(params, ret);
				}
			});

			// clear shared store.
			on('__SHARED_STORE_CLEAR', (storeName, ret) => {

				if (CPU_CLUSTERING.send !== undefined) {

					CPU_CLUSTERING.send({
						workerId : '~',
						methodName : '__SHARED_STORE_CLEAR',
						data : storeName
					}, ret);
				}
				
				else {
					SHARED_STORE.clear(storeName, ret);
				}
			});

			let off = m.off = (methodName) => {
				delete methodMap[methodName];
			};

			let send = m.send = (params, callback) => {
				//REQUIRED: params
				//REQUIRED: params.serverName
				//REQUIRED: params.methodName
				//REQUIRED: params.data
				//OPTIONAL: callback
				
				let serverName = params.serverName;
				let methodName = params.methodName;
				let data = params.data;
				
				if (callback === undefined) {
					
					if (serverName === thisServerName) {
						runMethods(methodName, data);
					}
					
					else if (serverSends[serverName] === undefined) {
						if (waitingSendInfoMap[serverName] !== undefined) {
							waitingSendInfoMap[serverName].push({
								methodName : methodName,
								data : data
							});
						} else {
							SHOW_ERROR('SERVER_CLUSTERING', '[' + serverName + ']라는 서버는 존재하지 않습니다.');
						}
					}
					
					else {
						serverSends[serverName]({
							methodName : methodName,
							data : data
						});
					}
				}
				
				else {
					
					if (serverName === thisServerName) {
						runMethods(methodName, data, callback);
					}
					
					else if (serverSends[serverName] === undefined) {
						if (waitingSendInfoMap[serverName] !== undefined) {
							waitingSendInfoMap[serverName].push({
								methodName : methodName,
								data : data,
								callback : callback
							});
						} else {
							SHOW_ERROR('SERVER_CLUSTERING', '[' + serverName + ']라는 서버는 존재하지 않습니다.');
						}
					}
					
					else {
						serverSends[serverName]({
							methodName : methodName,
							data : data
						}, callback);
					}
				}
			};

			let broadcast = m.broadcast = (params) => {
				//REQUIRED: params
				//REQUIRED: params.methodName
				//REQUIRED: params.data

				EACH(serverSends, (serverSend) => {
					serverSend(params);
				});
			};

			if (work !== undefined) {
				work();
			}

			console.log(CONSOLE_BLUE('[SERVER_CLUSTERING] 클러스터링 서버가 실행중입니다. (현재 서버 이름:' + thisServerName + ', 포트:' + port + ')'));
		}
	};
});

/*
 * 클러스터링 공유 저장소를 생성하는 클래스
 */
global.SHARED_STORE = CLASS((cls) => {
	
	let Sift = require('sift');

	let storages = {};
	let removeDelayMap = {};
	let getWorkerIdByStoreName;
	
	let getStorages = cls.getStorages = () => {
		return storages;
	};

	let save = cls.save = (params, callback) => {
		//REQUIRED: params
		//REQUIRED: params.storeName
		//REQUIRED: params.id
		//REQUIRED: params.data
		//OPTIONAL: params.removeAfterSeconds
		//OPTIONAL: callback

		let storeName = params.storeName;
		let id = params.id;
		let data = params.data;
		let removeAfterSeconds = params.removeAfterSeconds;
		
		let storage = storages[storeName];
		let removeDelays = removeDelayMap[storeName];
		
		if (storage === undefined) {
			storage = storages[storeName] = {};
		}

		storage[id] = data;
		
		if (removeDelays === undefined) {
			removeDelays = removeDelayMap[storeName] = {};
		}

		if (removeDelays[id] !== undefined) {
			removeDelays[id].remove();
			delete removeDelays[id];
		}

		if (removeAfterSeconds !== undefined) {
			removeDelays[id] = DELAY(removeAfterSeconds, remove);
		}
		
		if (callback !== undefined) {
			callback(data);
		}
	};
	
	let update = cls.update = (params, callback) => {
		//REQUIRED: params
		//REQUIRED: params.storeName
		//REQUIRED: params.id
		//REQUIRED: params.data
		//OPTIONAL: params.data.$inc
		//OPTIONAL: params.data.$push
		//OPTIONAL: params.data.$addToSet
		//OPTIONAL: params.data.$pull
		//OPTIONAL: params.removeAfterSeconds
		//OPTIONAL: callback

		let storeName = params.storeName;
		let id = params.id;
		let data = COPY(params.data);
		let $inc = data.$inc;
		let $push = data.$push;
		let $addToSet = data.$addToSet;
		let $pull = data.$pull;
		let removeAfterSeconds = params.removeAfterSeconds;
		
		let storage = storages[storeName];
		let removeDelays = removeDelayMap[storeName];
		let savedData;
		
		if (storage === undefined) {
			storage = storages[storeName] = {};
		}
		
		delete data.$inc;
		delete data.$push;
		delete data.$addToSet;
		delete data.$pull;
		
		savedData = storage[id];
		
		if (savedData !== undefined) {
			
			EXTEND({
				origin : savedData,
				extend : data
			});
			
			if ($inc !== undefined) {
				EACH($inc, (value, name) => {
					savedData[name] += value;
				});
			}
			
			if ($push !== undefined) {
				
				EACH($push, (value, name) => {
					
					if (CHECK_IS_ARRAY(savedData[name]) === true) {
						
						if (CHECK_IS_DATA(value) === true) {
							
							if (value.$each !== undefined) {
								
								EACH(value.$each, (v, i) => {
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
				
				EACH($addToSet, (value, name) => {
					
					if (CHECK_IS_ARRAY(savedData[name]) === true) {
						
						if (CHECK_IS_DATA(value) === true) {
							
							if (value.$each !== undefined) {
								
								EACH(value.$each, (value) => {
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
				
				EACH($pull, (value, name) => {
					
					if (CHECK_IS_ARRAY(savedData[name]) === true) {
						
						REMOVE({
							array : savedData[name],
							value : value
						});
					}
				});
			}
			
			if (removeDelays === undefined) {
				removeDelays = removeDelayMap[storeName] = {};
			}
	
			if (removeDelays[id] !== undefined) {
				removeDelays[id].remove();
				delete removeDelays[id];
			}
	
			if (removeAfterSeconds !== undefined) {
				removeDelays[id] = DELAY(removeAfterSeconds, remove);
			}
		}
		
		if (callback !== undefined) {
			callback(savedData);
		}
	};

	let get = cls.get = (params, callback) => {
		//REQUIRED: params
		//REQUIRED: params.storeName
		//REQUIRED: params.id
		//REQUIRED: callback
		
		let storeName = params.storeName;
		let id = params.id;
		let storage = storages[storeName];
		
		let savedData;
		
		if (storage !== undefined) {
			savedData = storage[id];
		}
		
		callback(savedData);
	};

	let remove = cls.remove = (params, callback) => {
		//REQUIRED: params
		//REQUIRED: params.storeName
		//REQUIRED: params.id
		//OPTIONAL: callback
		
		let storeName = params.storeName;
		let id = params.id;
		
		let storage = storages[storeName];
		let removeDelays = removeDelayMap[storeName];
		
		let originData;
		
		if (storage !== undefined) {
			originData = storage[id];
			
			delete storage[id];
		}

		if (removeDelays !== undefined && removeDelays[id] !== undefined) {
			removeDelays[id].remove();
			delete removeDelays[id];
		}
		
		if (callback !== undefined) {
			callback(originData);
		}
	};
	
	let all = cls.all = (params, callback) => {
		//REQUIRED: params
		//REQUIRED: params.storeName
		//OPTIONAL: params.filter
		//REQUIRED: callback
		
		let storeName = params.storeName;
		let filter = params.filter;
		
		let storage = storages[storeName];
		
		if (storage === undefined) {
			callback({});
		}
		
		else if (filter === undefined) {
			callback(storage);
		}
		
		else {
			
			let result = {};
			
			EACH(storage, (data, id) => {
				if (Sift(filter)(data) === true) {
					result[id] = data;
				}
			});
			
			callback(result);
		}
	};
	
	let count = cls.count = (params, callback) => {
		//REQUIRED: params
		//REQUIRED: params.storeName
		//OPTIONAL: params.filter
		//REQUIRED: callback
		
		all(params, (dataSet) => {
			callback(COUNT_PROPERTIES(dataSet));
		});
	};

	let checkIsExists = cls.checkIsExists = (params, callback) => {
		//REQUIRED: params
		//REQUIRED: params.storeName
		//OPTIONAL: params.id
		//OPTIONAL: params.filter
		//REQUIRED: callback
		
		let storeName = params.storeName;
		let id = params.id;
		let filter = params.filter;
		
		let storage = storages[storeName];
		
		if (storage === undefined) {
			callback(false);
		}
		
		else if (id !== undefined) {
			callback(storage[id] !== undefined);
		}
		
		else if (filter !== undefined) {
			
			// 중간에 멈추면, 해당하는 값이 존재한다.
			callback(EACH(storage, (data) => {
				if (Sift(filter)(data) === true) {
					return false;
				}
			}) !== true);
		}
		
		else {
			callback(false);
		}
	};
	
	let clear = cls.clear = (storeName, callback) => {
		//REQUIRED: storeName
		//OPTIONAL: callback
		
		delete storages[storeName];
		
		if (callback !== undefined) {
			callback();
		}
	};

	return {

		init : (inner, self, storeName) => {
			//REQUIRED: storeName
			
			let serverName;
			
			let a = 0;
			
			REPEAT(storeName.length, (i) => {
				a += storeName.charCodeAt(i);
			});
			
			if (SERVER_CLUSTERING.getHosts !== undefined) {
				
				let serverNames = [];
				
				EACH(SERVER_CLUSTERING.getHosts(), (host, serverName) => {
					serverNames.push(serverName);
				});
				
				serverName = serverNames[a % serverNames.length];
			}

			let save = self.save = (params, callback) => {
				//REQUIRED: params
				//REQUIRED: params.id
				//REQUIRED: params.data
				//OPTIONAL: params.removeAfterSeconds
				//OPTIONAL: callback

				let id = params.id;
				let data = params.data;
				let removeAfterSeconds = params.removeAfterSeconds;
				
				if (SERVER_CLUSTERING.send !== undefined) {

					SERVER_CLUSTERING.send({
						serverName : serverName,
						methodName : '__SHARED_STORE_SAVE',
						data : {
							storeName : storeName,
							id : id,
							data : data,
							removeAfterSeconds : removeAfterSeconds
						}
					}, callback);
				}

				else if (CPU_CLUSTERING.send !== undefined) {

					CPU_CLUSTERING.send({
						workerId : '~',
						methodName : '__SHARED_STORE_SAVE',
						data : {
							storeName : storeName,
							id : id,
							data : data,
							removeAfterSeconds : removeAfterSeconds
						}
					}, callback);
				}
				
				else {
					
					cls.save({
						storeName : storeName,
						id : id,
						data : data,
						removeAfterSeconds : removeAfterSeconds
					}, callback);
				}
			};
			
			let update = self.update = (params, callbackOrHandlers) => {
				//REQUIRED: params
				//REQUIRED: params.id
				//REQUIRED: params.data
				//OPTIONAL: params.data.$inc
				//OPTIONAL: params.data.$push
				//OPTIONAL: params.data.$addToSet
				//OPTIONAL: params.data.$pull
				//OPTIONAL: params.removeAfterSeconds
				//OPTIONAL: callbackOrHandlers
				//OPTIONAL: callbackOrHandlers.notExists
				//OPTIONAL: callbackOrHandlers.success

				let id = params.id;
				let data = params.data;
				let removeAfterSeconds = params.removeAfterSeconds;
				
				let notExistsHandler;
				let callback;
				
				if (callbackOrHandlers !== undefined) {
					if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
						callback = callbackOrHandlers;
					} else {
						notExistsHandler = callbackOrHandlers.notExists;
						callback = callbackOrHandlers.success;
					}
				}
				
				let innerCallback = (savedData) => {
					if (savedData === undefined) {
						if (notExistsHandler !== undefined) {
							notExistsHandler();
						} else {
							SHOW_WARNING('SHARED_STORE (' + storeName + ')', '수정할 데이터가 존재하지 않습니다.', params);
						}
					} else if (callback !== undefined) {
						callback(savedData);
					}
				};
				
				if (SERVER_CLUSTERING.send !== undefined) {

					SERVER_CLUSTERING.send({
						serverName : serverName,
						methodName : '__SHARED_STORE_UPDATE',
						data : {
							storeName : storeName,
							id : id,
							data : data,
							removeAfterSeconds : removeAfterSeconds
						}
					}, innerCallback);
				}

				else if (CPU_CLUSTERING.send !== undefined) {

					CPU_CLUSTERING.send({
						workerId : '~',
						methodName : '__SHARED_STORE_UPDATE',
						data : {
							storeName : storeName,
							id : id,
							data : data,
							removeAfterSeconds : removeAfterSeconds
						}
					}, innerCallback);
				}
				
				else {
					
					cls.update({
						storeName : storeName,
						id : id,
						data : data,
						removeAfterSeconds : removeAfterSeconds
					}, innerCallback);
				}
			};

			let get = self.get = (id, callbackOrHandlers) => {
				//REQUIRED: id
				//REQUIRED: callbackOrHandlers
				//OPTIONAL: callbackOrHandlers.notExists
				//OPTIONAL: callbackOrHandlers.success
				
				let notExistsHandler;
				let callback;
				
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					notExistsHandler = callbackOrHandlers.notExists;
					callback = callbackOrHandlers.success;
				}
				
				let innerCallback = (savedData) => {
					if (savedData === undefined) {
						if (notExistsHandler !== undefined) {
							notExistsHandler();
						} else {
							SHOW_WARNING('SHARED_STORE (' + storeName + ')', '가져올 데이터가 존재하지 않습니다.', id);
						}
					} else if (callback !== undefined) {
						callback(savedData);
					}
				};
				
				if (SERVER_CLUSTERING.send !== undefined) {

					SERVER_CLUSTERING.send({
						serverName : serverName,
						methodName : '__SHARED_STORE_GET',
						data : {
							storeName : storeName,
							id : id
						}
					}, innerCallback);
				}

				else if (CPU_CLUSTERING.send !== undefined) {

					CPU_CLUSTERING.send({
						workerId : '~',
						methodName : '__SHARED_STORE_GET',
						data : {
							storeName : storeName,
							id : id
						}
					}, innerCallback);
				}
				
				else {
					
					cls.get({
						storeName : storeName,
						id : id
					}, innerCallback);
				}
			};

			let remove = self.remove = (id, callbackOrHandlers) => {
				//REQUIRED: id
				//OPTIONAL: callbackOrHandlers
				//OPTIONAL: callbackOrHandlers.notExists
				//OPTIONAL: callbackOrHandlers.success
				
				let notExistsHandler;
				let callback;
				
				if (callbackOrHandlers !== undefined) {
					if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
						callback = callbackOrHandlers;
					} else {
						notExistsHandler = callbackOrHandlers.notExists;
						callback = callbackOrHandlers.success;
					}
				}
				
				let innerCallback = (originData) => {
					if (originData === undefined) {
						if (notExistsHandler !== undefined) {
							notExistsHandler();
						} else {
							SHOW_WARNING('SHARED_STORE (' + storeName + ')', '삭제할 데이터가 존재하지 않습니다.', id);
						}
					} else if (callback !== undefined) {
						callback(originData);
					}
				};

				if (SERVER_CLUSTERING.send !== undefined) {

					SERVER_CLUSTERING.send({
						serverName : serverName,
						methodName : '__SHARED_STORE_REMOVE',
						data : {
							storeName : storeName,
							id : id
						}
					}, innerCallback);
				}

				else if (CPU_CLUSTERING.send !== undefined) {

					CPU_CLUSTERING.send({
						workerId : '~',
						methodName : '__SHARED_STORE_REMOVE',
						data : {
							storeName : storeName,
							id : id
						}
					}, innerCallback);
				}
				
				else {
					
					cls.remove({
						storeName : storeName,
						id : id
					}, innerCallback);
				}
			};
			
			let all = self.all = (filter, callback) => {
				//OPTIONAL: filter
				//REQUIRED: callback
				
				if (callback === undefined) {
					callback = filter;
					filter = undefined;
				}
				
				if (SERVER_CLUSTERING.send !== undefined) {

					SERVER_CLUSTERING.send({
						serverName : serverName,
						methodName : '__SHARED_STORE_ALL',
						data : {
							storeName : storeName,
							filter : filter
						}
					}, callback);
				}

				else if (CPU_CLUSTERING.send !== undefined) {

					CPU_CLUSTERING.send({
						workerId : '~',
						methodName : '__SHARED_STORE_ALL',
						data : {
							storeName : storeName,
							filter : filter
						}
					}, callback);
				}
				
				else {
					cls.all({
						storeName : storeName,
						filter : filter
					}, callback);
				}
			};
			
			let count = self.count = (filter, callback) => {
				//OPTIONAL: filter
				//REQUIRED: callback
				
				if (callback === undefined) {
					callback = filter;
					filter = undefined;
				}
				
				if (SERVER_CLUSTERING.send !== undefined) {

					SERVER_CLUSTERING.send({
						serverName : serverName,
						methodName : '__SHARED_STORE_COUNT',
						data : {
							storeName : storeName,
							filter : filter
						}
					}, callback);
				}

				else if (CPU_CLUSTERING.send !== undefined) {

					CPU_CLUSTERING.send({
						workerId : '~',
						methodName : '__SHARED_STORE_COUNT',
						data : {
							storeName : storeName,
							filter : filter
						}
					}, callback);
				}
				
				else {
					cls.count({
						storeName : storeName,
						filter : filter
					}, callback);
				}
			};
			
			let checkIsExists = self.checkIsExists = (idOrFilter, callback) => {
				//REQUIRED: idOrFilter
				//REQUIRED: callback
				
				let id;
				let filter;
				
				if (CHECK_IS_DATA(idOrFilter) !== true) {
					id = idOrFilter;
				} else {
					filter = idOrFilter;
				}
				
				if (SERVER_CLUSTERING.send !== undefined) {

					SERVER_CLUSTERING.send({
						serverName : serverName,
						methodName : '__SHARED_STORE_CHECK_IS_EXISTS',
						data : {
							storeName : storeName,
							id : id,
							filter : filter
						}
					}, callback);
				}

				else if (CPU_CLUSTERING.send !== undefined) {

					CPU_CLUSTERING.send({
						workerId : '~',
						methodName : '__SHARED_STORE_CHECK_IS_EXISTS',
						data : {
							storeName : storeName,
							id : id,
							filter : filter
						}
					}, callback);
				}
				
				else {
					cls.checkIsExists({
						storeName : storeName,
						id : id,
						filter : filter
					}, callback);
				}
			};
			
			let clear = self.clear = (callback) => {
				//OPTIONAL: callback
				
				if (SERVER_CLUSTERING.send !== undefined) {

					SERVER_CLUSTERING.send({
						serverName : serverName,
						methodName : '__SHARED_STORE_CLEAR',
						data : storeName
					}, callback);
				}

				else if (CPU_CLUSTERING.send !== undefined) {

					CPU_CLUSTERING.send({
						workerId : '~',
						methodName : '__SHARED_STORE_CLEAR',
						data : storeName
					}, callback);
				}
				
				else {
					cls.clear(storeName, callback);
				}
			};
		}
	};
});

FOR_BOX((box) => {

	box.SHARED_STORE = CLASS({

		init : (inner, self, name) => {
			//REQUIRED: name

			let sharedStore = SHARED_STORE(box.boxName + '.' + name);

			let save = self.save = sharedStore.save;
			
			let update = self.update = sharedStore.update;
			
			let get = self.get = sharedStore.get;
			
			let remove = self.remove = sharedStore.remove;
			
			let all = self.all = sharedStore.all;
			
			let count = self.count = sharedStore.count;
			
			let checkIsExists = self.checkIsExists = sharedStore.checkIsExists;
			
			let clear = self.clear = sharedStore.clear;
		}
	});
});

/*
 * 콘솔에 표시할 텍스트를 파란색으로 설정합니다.
 */
global.CONSOLE_BLUE = METHOD({

	run : (text) => {
		//REQUIRED: text

		return '[36m' + text + '[0m';
	}
});

/*
 * 콘솔에 표시할 텍스트를 초록색으로 설정합니다.
 */
global.CONSOLE_GREEN = METHOD({

	run : (text) => {
		//REQUIRED: text

		return '[32m' + text + '[0m';
	}
});

/*
 * 콘솔에 표시할 텍스트를 빨간색으로 설정합니다.
 */
global.CONSOLE_RED = METHOD({

	run : (text) => {
		//REQUIRED: text

		return '[31m' + text + '[0m';
	}
});

/*
 * 콘솔에 표시할 텍스트를 노란색으로 설정합니다.
 */
global.CONSOLE_YELLOW = METHOD({

	run : (text) => {
		//REQUIRED: text

		return '[33m' + text + '[0m';
	}
});

/*
 * 콘솔에 오류 메시지를 출력합니다.
 */
global.SHOW_ERROR = (tag, errorMsg, params) => {
	//REQUIRED: tag
	//REQUIRED: errorMsg
	//OPTIONAL: params
	
	let cal = CALENDAR();
	
	console.error(CONSOLE_RED(cal.getYear() + '-' + cal.getMonth(true) + '-' + cal.getDate(true) + ' ' + cal.getHour(true) + ':' + cal.getMinute(true) + ':' + cal.getSecond(true) + ' [' + tag + '] 오류가 발생했습니다. 오류 메시지: ' + errorMsg));
	
	if (params !== undefined) {
		console.error(CONSOLE_RED('다음은 오류를 발생시킨 파라미터입니다.'));
		console.error(CONSOLE_RED(JSON.stringify(params, TO_DELETE, 4)));
	}
};

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
/*
 * 콘솔에 경고 메시지를 출력합니다.
 */
global.SHOW_WARNING = (tag, warningMsg, params) => {
	//REQUIRED: tag
	//REQUIRED: warningMsg
	//OPTIONAL: params
	
	let cal = CALENDAR();
	
	console.error(CONSOLE_YELLOW(cal.getYear() + '-' + cal.getMonth(true) + '-' + cal.getDate(true) + ' ' + cal.getHour(true) + ':' + cal.getMinute(true) + ':' + cal.getSecond(true) + ' [' + tag + '] 경고가 발생했습니다. 경고 메시지: ' + warningMsg));
	
	if (params !== undefined) {
		console.error(CONSOLE_YELLOW('다음은 경고를 발생시킨 파라미터입니다.'));
		console.error(CONSOLE_YELLOW(JSON.stringify(params, TO_DELETE, 4)));
	}
};

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
 * 비밀번호를 주어진 키를 이용하여 HMAC SHA256 알고리즘으로 암호화 합니다.
 */
global.SHA256 = METHOD({

	run : (params) => {
		//REQUIRED: params
		//REQUIRED: params.password
		//REQUIRED: params.key

		let password = params.password;
		let key = params.key;
		
		let crypto = require('crypto');

		return crypto.createHmac('sha256', key).update(password).digest('hex');
	}
});

/*
 * 비밀번호를 주어진 키를 이용하여 HMAC SHA512 알고리즘으로 암호화 합니다.
 */
global.SHA512 = METHOD({

	run : (params) => {
		//REQUIRED: params
		//REQUIRED: params.password
		//REQUIRED: params.key

		let password = params.password;
		let key = params.key;
		
		let crypto = require('crypto');

		return crypto.createHmac('sha512', key).update(password).digest('hex');
	}
});

/*
 * 지정된 경로에 파일이나 폴더가 존재하는지 확인합니다.
 */
global.CHECK_FILE_EXISTS = METHOD(() => {

	let FS = require('fs');

	return {

		run : (pathOrParams, callback) => {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path	확인할 경로
			//OPTIONAL: pathOrParams.isSync	true로 설정하면 callback을 실행하지 않고 즉시 실행하여 결과를 반환합니다. 이 설정은 명령이 끝날때 까지 프로그램이 멈추게 되므로 필요한 경우에만 사용합니다.
			//OPTIONAL: callback

			let path;
			let isSync;

			// init params.
			if (CHECK_IS_DATA(pathOrParams) !== true) {
				path = pathOrParams;
			} else {
				path = pathOrParams.path;
				isSync = pathOrParams.isSync;
			}

			// when normal mode
			if (isSync !== true) {
				FS.exists(path, callback);
			}

			// when sync mode
			else {
				return FS.existsSync(path);
			}
		}
	};
});

/*
 * 지정된 경로가 (파일이 아닌) 폴더인지 확인합니다.
 */
global.CHECK_IS_FOLDER = METHOD(() => {

	let FS = require('fs');

	return {

		run : (pathOrParams, callbackOrHandlers) => {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path	확인할 경로
			//OPTIONAL: pathOrParams.isSync	true로 설정하면 callback을 실행하지 않고 즉시 실행하여 결과를 반환합니다. 이 설정은 명령이 끝날때 까지 프로그램이 멈추게 되므로 필요한 경우에만 사용합니다.
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.error
			//OPTIONAL: callbackOrHandlers.success

			let path;
			let isSync;
			
			let errorHandler;
			let callback;

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
					errorHandler = callbackOrHandlers.error;
					callback = callbackOrHandlers.success;
				}
			}

			// when normal mode
			if (isSync !== true) {
				
				FS.stat(path, (error, stat) => {
					
					if (error !== TO_DELETE) {

						let errorMsg = error.toString();

						if (errorHandler !== undefined) {
							errorHandler(errorMsg);
						} else {
							SHOW_ERROR('CHECK_IS_FOLDER', errorMsg);
						}

					} else if (callback !== undefined) {
						callback(stat.isDirectory());
					}
				});
			}

			// when sync mode
			else {
				return FS.statSync(path).isDirectory();
			}
		}
	};
});

/*
 * 파일을 복사합니다.
 */
global.COPY_FILE = METHOD(() => {

	let FS = require('fs');
	let Path = require('path');

	return {

		run : (params, callbackOrHandlers) => {
			//REQUIRED: params
			//REQUIRED: params.from		복사할 파일의 위치
			//REQUIRED: params.to		파일을 복사할 위치
			//OPTIONAL: params.isSync	true로 설정하면 callback을 실행하지 않고 즉시 실행합니다. 이 설정은 명령이 끝날때 까지 프로그램이 멈추게 되므로 필요한 경우에만 사용합니다.
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.notExistsHandler
			//OPTIONAL: callbackOrHandlers.error
			//OPTIONAL: callbackOrHandlers.success

			let from = params.from;
			let to = params.to;
			let isSync = params.isSync;
			
			let notExistsHandler;
			let errorHandler;
			let callback;

			if (callbackOrHandlers !== undefined) {
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					notExistsHandler = callbackOrHandlers.notExists;
					errorHandler = callbackOrHandlers.error;
					callback = callbackOrHandlers.success;
				}
			}

			CREATE_FOLDER({
				path : Path.dirname(to),
				isSync : isSync
			}, {

				error : errorHandler,

				success : () => {

					// when normal mode
					if (isSync !== true) {

						CHECK_FILE_EXISTS(from, (isExists) => {

							if (isExists === true) {

								let reader = FS.createReadStream(from);

								reader.pipe(FS.createWriteStream(to));

								reader.on('error', (error) => {

									let errorMsg = error.toString();

									if (errorHandler !== undefined) {
										errorHandler(errorMsg);
									} else {
										SHOW_ERROR('COPY_FILE', errorMsg);
									}
								});

								reader.on('end', () => {
									if (callback !== undefined) {
										callback();
									}
								});

							} else {

								if (notExistsHandler !== undefined) {
									notExistsHandler(from);
								} else {
									SHOW_WARNING('COPY_FILE', '파일이 존재하지 않습니다.', {
										from : from
									});
								}
							}
						});
					}

					// when sync mode
					else {

						RUN(() => {

							try {

								if (CHECK_FILE_EXISTS({
									path : from,
									isSync : true
								}) === true) {

									FS.writeFileSync(to, FS.readFileSync(from));

								} else {

									if (notExistsHandler !== undefined) {
										notExistsHandler(from);
									} else {
										SHOW_WARNING('COPY_FILE', '파일이 존재하지 않습니다.', {
											from : from
										});
									}

									// do not run callback.
									return;
								}

							} catch(error) {

								if (error !== TO_DELETE) {

									let errorMsg = error.toString();

									if (errorHandler !== undefined) {
										errorHandler(errorMsg);
									} else {
										SHOW_ERROR('COPY_FILE', errorMsg);
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
 * 폴더를 생성합니다.
 */
global.CREATE_FOLDER = METHOD(() => {

	let FS = require('fs');
	let Path = require('path');

	return {

		run : (pathOrParams, callbackOrHandlers) => {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path	폴더를 생성할 경로
			//OPTIONAL: pathOrParams.isSync	true로 설정하면 callback을 실행하지 않고 즉시 실행합니다. 이 설정은 명령이 끝날때 까지 프로그램이 멈추게 되므로 필요한 경우에만 사용합니다.
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.error
			//OPTIONAL: callbackOrHandlers.success

			let path;
			let isSync;
			
			let errorHandler;
			let callback;

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
					errorHandler = callbackOrHandlers.error;
					callback = callbackOrHandlers.success;
				}
			}

			// when normal mode
			if (isSync !== true) {

				CHECK_FILE_EXISTS(path, (isExists) => {

					if (isExists === true) {

						if (callback !== undefined) {
							callback();
						}

					} else {

						let folderPath = Path.dirname(path);

						CHECK_FILE_EXISTS(folderPath, (isExists) => {

							if (isExists === true) {

								FS.mkdir(path, (error) => {

									if (error !== TO_DELETE) {

										let errorMsg = error.toString();

										if (errorHandler !== undefined) {
											errorHandler(errorMsg);
										} else {
											SHOW_ERROR('CREATE_FOLDER', errorMsg);
										}

									} else {
										callback();
									}
								});

							} else {

								CREATE_FOLDER(folderPath, () => {

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

				try {

					if (CHECK_FILE_EXISTS({
						path : path,
						isSync : true
					}) !== true) {

						let folderPath = Path.dirname(path);

						if (CHECK_FILE_EXISTS({
							path : folderPath,
							isSync : true
						}) === true) {
							FS.mkdirSync(path);
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

						let errorMsg = error.toString();

						if (errorHandler !== undefined) {
							errorHandler(errorMsg);
						} else {
							SHOW_ERROR('CREATE_FOLDER', errorMsg);
						}
					}
				}

				if (callback !== undefined) {
					callback();
				}
			}
		}
	};
});

/*
 * 지정된 경로에 위치한 파일들의 이름 목록을 불러옵니다.
 */
global.FIND_FILE_NAMES = METHOD(() => {

	let FS = require('fs');
	
	return {

		run : (pathOrParams, callbackOrHandlers) => {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path	파일들이 위치한 경로
			//OPTIONAL: pathOrParams.isSync	true로 설정하면 callback을 실행하지 않고 즉시 실행하여 결과를 반환합니다. 이 설정은 명령이 끝날때 까지 프로그램이 멈추게 되므로 필요한 경우에만 사용합니다.
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.notExistsHandler
			//OPTIONAL: callbackOrHandlers.error
			//OPTIONAL: callbackOrHandlers.success

			let path;
			let isSync;
			
			let notExistsHandler
			let errorHandler;
			let callback;
			
			let fileNames = [];

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
					notExistsHandler = callbackOrHandlers.notExists;
					errorHandler = callbackOrHandlers.error;
					callback = callbackOrHandlers.success;
				}
			}

			// when normal mode
			if (isSync !== true) {

				CHECK_FILE_EXISTS(path, (isExists) => {

					if (isExists === true) {

						FS.readdir(path, (error, names) => {

							if (error !== TO_DELETE) {

								let errorMsg = error.toString();

								if (errorHandler !== undefined) {
									errorHandler(errorMsg);
								} else {
									SHOW_ERROR('FIND_FILE_NAMES', errorMsg);
								}

							} else if (callback !== undefined) {

								PARALLEL(names, [
								(name, done) => {

									if (name[0] !== '.') {

										FS.stat(path + '/' + name, (error, stats) => {

											if (error !== TO_DELETE) {

												let errorMsg = error.toString();

												if (errorHandler !== undefined) {
													errorHandler(errorMsg);
												} else {
													SHOW_ERROR('FIND_FILE_NAMES', errorMsg);
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

								() => {
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
							SHOW_WARNING('FIND_FOLDER_NAMES', '폴더가 존재하지 않습니다.', {
								path : path
							});
						}
					}
				});
			}

			// when sync mode
			else {

				return RUN(() => {

					try {

						if (CHECK_FILE_EXISTS({
							path : path,
							isSync : true
						}) === true) {

							let names = FS.readdirSync(path);

							EACH(names, (name) => {
								if (name[0] !== '.' && FS.statSync(path + '/' + name).isDirectory() !== true) {
									fileNames.push(name);
								}
							});

						} else {

							if (notExistsHandler !== undefined) {
								notExistsHandler(path);
							} else {
								SHOW_WARNING('FIND_FILE_NAMES', '폴더가 존재하지 않습니다.', {
									path : path
								});
							}

							// return undefined.
							return;
						}

					} catch(error) {

						if (error !== TO_DELETE) {

							let errorMsg = error.toString();

							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								SHOW_ERROR('FIND_FILE_NAMES', errorMsg);
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
 * 지정된 경로에 위치한 폴더들의 이름 목록을 불러옵니다.
 */
global.FIND_FOLDER_NAMES = METHOD(() => {

	let FS = require('fs');
	
	return {

		run : (pathOrParams, callbackOrHandlers) => {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path	폴더들이 위치한 경로
			//OPTIONAL: pathOrParams.isSync	true로 설정하면 callback을 실행하지 않고 즉시 실행하여 결과를 반환합니다. 이 설정은 명령이 끝날때 까지 프로그램이 멈추게 되므로 필요한 경우에만 사용합니다.
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.notExistsHandler
			//OPTIONAL: callbackOrHandlers.error
			//OPTIONAL: callbackOrHandlers.success

			let path;
			let isSync;
			
			let notExistsHandler;
			let errorHandler;
			let callback;

			let folderNames = [];

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
					notExistsHandler = callbackOrHandlers.notExists;
					errorHandler = callbackOrHandlers.error;
					callback = callbackOrHandlers.success;
				}
			}

			// when normal mode
			if (isSync !== true) {

				CHECK_FILE_EXISTS(path, (isExists) => {

					if (isExists === true) {

						FS.readdir(path, (error, names) => {

							if (error !== TO_DELETE) {

								let errorMsg = error.toString();

								if (errorHandler !== undefined) {
									errorHandler(errorMsg);
								} else {
									SHOW_ERROR('FIND_FOLDER_NAMES', errorMsg);
								}

							} else if (callback !== undefined) {

								PARALLEL(names, [
								(name, done) => {

									if (name[0] !== '.') {

										FS.stat(path + '/' + name, (error, stats) => {

											if (error !== TO_DELETE) {

												let errorMsg = error.toString();

												if (errorHandler !== undefined) {
													errorHandler(errorMsg);
												} else {
													SHOW_ERROR('FIND_FOLDER_NAMES', errorMsg);
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

								() => {
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
							SHOW_WARNING('FIND_FOLDER_NAMES', '폴더가 존재하지 않습니다.', {
								path : path
							});
						}
					}
				});
			}

			// when sync mode
			else {

				return RUN(() => {
					
					try {

						if (CHECK_FILE_EXISTS({
							path : path,
							isSync : true
						}) === true) {

							let names = FS.readdirSync(path);

							EACH(names, (name) => {
								if (name[0] !== '.' && FS.statSync(path + '/' + name).isDirectory() === true) {
									folderNames.push(name);
								}
							});

						} else {

							if (notExistsHandler !== undefined) {
								notExistsHandler(path);
							} else {
								SHOW_WARNING('FIND_FOLDER_NAMES', '폴더가 존재하지 않습니다.', {
									path : path
								});
							}

							// return undefined.
							return;
						}

					} catch(error) {

						if (error !== TO_DELETE) {

							let errorMsg = error.toString();

							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								SHOW_ERROR('FIND_FOLDER_NAMES', errorMsg);
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
 * 파일의 정보를 불러옵니다.
 * 
 * 파일의 크기(size), 생성 시간(createTime), 최종 수정 시간(lastUpdateTime)을 불러옵니다.
 */
global.GET_FILE_INFO = METHOD(() => {
	
	let FS = require('fs');

	return {

		run : (pathOrParams, callbackOrHandlers) => {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path	불러올 파일의 경로
			//OPTIONAL: pathOrParams.isSync	true로 설정하면 callback을 실행하지 않고 즉시 실행하여 결과를 반환합니다. 이 설정은 명령이 끝날때 까지 프로그램이 멈추게 되므로 필요한 경우에만 사용합니다.
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.notExists
			//OPTIONAL: callbackOrHandlers.error
			//OPTIONAL: callbackOrHandlers.success

			let path;
			let isSync;
			
			let notExistsHandler;
			let errorHandler;
			let callback;

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
					notExistsHandler = callbackOrHandlers.notExists;
					errorHandler = callbackOrHandlers.error;
					callback = callbackOrHandlers.success;
				}
			}

			// when normal mode
			if (isSync !== true) {

				CHECK_FILE_EXISTS(path, (isExists) => {

					if (isExists === true) {

						FS.stat(path, (error, stat) => {

							if (error !== TO_DELETE) {

								let errorMsg = error.toString();

								if (errorHandler !== undefined) {
									errorHandler(errorMsg);
								} else {
									SHOW_ERROR('GET_FILE_INFO', errorMsg);
								}

							} else if (stat.isDirectory() === true) {

								if (notExistsHandler !== undefined) {
									notExistsHandler(path);
								} else {
									SHOW_WARNING('GET_FILE_INFO', '파일이 존재하지 않습니다.', {
										path : path
									});
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
							SHOW_WARNING('GET_FILE_INFO', '파일이 존재하지 않습니다.', {
								path : path
							});
						}
					}
				});
			}

			// when sync mode
			else {

				return RUN(() => {

					try {

						if (CHECK_FILE_EXISTS({
							path : path,
							isSync : true
						}) === true) {
							
							let stat = FS.statSync(path);

							if (stat.isDirectory() === true) {

								if (notExistsHandler !== undefined) {
									notExistsHandler(path);
								} else {
									SHOW_WARNING('GET_FILE_INFO', '파일이 존재하지 않습니다.', {
										path : path
									});
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
								SHOW_WARNING('GET_FILE_INFO', '파일이 존재하지 않습니다.', {
									path : path
								});
							}
						}

					} catch(error) {

						if (error !== TO_DELETE) {

							let errorMsg = error.toString();

							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								SHOW_ERROR('GET_FILE_INFO', errorMsg);
							}
						}
					}

					// return undefined.
					return;
				});
			}
		}
	};
});

/*
 * 파일의 위치를 이동시킵니다.
 */
global.MOVE_FILE = METHOD({

	run : (params, callbackOrHandlers) => {
		//REQUIRED: params
		//REQUIRED: params.from		파일의 원래 위치
		//REQUIRED: params.to		파일을 옮길 위치
		//OPTIONAL: params.isSync	true로 설정하면 callback을 실행하지 않고 즉시 실행합니다. 이 설정은 명령이 끝날때 까지 프로그램이 멈추게 되므로 필요한 경우에만 사용합니다.
		//REQUIRED: callbackOrHandlers
		//OPTIONAL: callbackOrHandlers.notExistsHandler
		//OPTIONAL: callbackOrHandlers.error
		//REQUIRED: callbackOrHandlers.success

		let from = params.from;
		let isSync = params.isSync;
		
		let notExistsHandler;
		let errorHandler;
		let callback;

		if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
			callback = callbackOrHandlers;
		} else {
			notExistsHandler = callbackOrHandlers.notExists;
			errorHandler = callbackOrHandlers.error;
			callback = callbackOrHandlers.success;
		}

		COPY_FILE(params, {
			error : errorHandler,
			notExists : notExistsHandler,
			success : () => {

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
 * 파일의 내용을 불러옵니다.
 * 
 * 내용을 Buffer형으로 불러오기 때문에, 내용을 문자열로 불러오려면 toString 함수를 이용하시기 바랍니다.
 */
global.READ_FILE = METHOD(() => {
	
	let FS = require('fs');

	return {

		run : (pathOrParams, callbackOrHandlers) => {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path	불러올 파일의 경로
			//OPTIONAL: pathOrParams.isSync	true로 설정하면 callback을 실행하지 않고 즉시 실행하여 결과를 반환합니다. 이 설정은 명령이 끝날때 까지 프로그램이 멈추게 되므로 필요한 경우에만 사용합니다.
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.notExists
			//OPTIONAL: callbackOrHandlers.error
			//OPTIONAL: callbackOrHandlers.success

			let path;
			let isSync;
			
			let notExistsHandler;
			let errorHandler;
			let callback;

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
					notExistsHandler = callbackOrHandlers.notExists;
					errorHandler = callbackOrHandlers.error;
					callback = callbackOrHandlers.success;
				}
			}

			// when normal mode
			if (isSync !== true) {

				CHECK_FILE_EXISTS(path, (isExists) => {

					if (isExists === true) {

						FS.stat(path, (error, stat) => {
							
							if (error !== TO_DELETE) {

								let errorMsg = error.toString();

								if (errorHandler !== undefined) {
									errorHandler(errorMsg);
								} else {
									SHOW_ERROR('READ_FILE', errorMsg);
								}

							} else if (stat.isDirectory() === true) {

								if (notExistsHandler !== undefined) {
									notExistsHandler(path);
								} else {
									SHOW_WARNING('READ_FILE', '파일이 존재하지 않습니다.', {
										path : path
									});
								}

							} else {

								FS.readFile(path, (error, buffer) => {

									if (error !== TO_DELETE) {

										let errorMsg = error.toString();

										if (errorHandler !== undefined) {
											errorHandler(errorMsg);
										} else {
											SHOW_ERROR('READ_FILE', errorMsg);
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
							SHOW_WARNING('READ_FILE', '파일이 존재하지 않습니다.', {
								path : path
							});
						}
					}
				});
			}

			// when sync mode
			else {

				return RUN(() => {

					try {

						if (CHECK_FILE_EXISTS({
							path : path,
							isSync : true
						}) === true) {

							if (FS.statSync(path).isDirectory() === true) {

								if (notExistsHandler !== undefined) {
									notExistsHandler(path);
								} else {
									SHOW_WARNING('READ_FILE', '파일이 존재하지 않습니다.', {
										path : path
									});
								}
								
							} else {
								
								let buffer = FS.readFileSync(path);
			
								if (callback !== undefined) {
									callback(buffer);
								}
			
								return buffer;
							}

						} else {

							if (notExistsHandler !== undefined) {
								notExistsHandler(path);
							} else {
								SHOW_WARNING('READ_FILE', '파일이 존재하지 않습니다.', {
									path : path
								});
							}
						}

					} catch(error) {

						if (error !== TO_DELETE) {

							let errorMsg = error.toString();

							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								SHOW_ERROR('READ_FILE', errorMsg);
							}
						}
					}

					// return undefined.
					return;
				});
			}
		}
	};
});

/*
 * 파일을 삭제합니다.
 */
global.REMOVE_FILE = METHOD(() => {

	let FS = require('fs');

	return {

		run : (pathOrParams, callbackOrHandlers) => {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path	삭제할 파일의 경로
			//OPTIONAL: pathOrParams.isSync	true로 설정하면 callback을 실행하지 않고 즉시 실행합니다. 이 설정은 명령이 끝날때 까지 프로그램이 멈추게 되므로 필요한 경우에만 사용합니다.
			//REQUIRED: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.notExists
			//OPTIONAL: callbackOrHandlers.error
			//REQUIRED: callbackOrHandlers.success

			let path;
			let isSync;
			
			let notExistsHandler;
			let errorHandler;
			let callback;

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
				notExistsHandler = callbackOrHandlers.notExists;
				errorHandler = callbackOrHandlers.error;
				callback = callbackOrHandlers.success;
			}

			// when normal mode
			if (isSync !== true) {

				CHECK_FILE_EXISTS(path, (isExists) => {

					if (isExists === true) {

						FS.unlink(path, (error) => {

							if (error !== TO_DELETE) {

								let errorMsg = error.toString();

								if (errorHandler !== undefined) {
									errorHandler(errorMsg);
								} else {
									SHOW_ERROR('REMOVE_FILE', errorMsg);
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
							SHOW_WARNING('REMOVE_FILE', '파일이 존재하지 않습니다.', {
								path : path
							});
						}
					}
				});
			}

			// when sync mode
			else {

				RUN(() => {

					try {

						if (CHECK_FILE_EXISTS({
							path : path,
							isSync : true
						}) === true) {

							FS.unlinkSync(path);

						} else {

							if (notExistsHandler !== undefined) {
								notExistsHandler(path);
							} else {
								SHOW_WARNING('REMOVE_FILE', '파일이 존재하지 않습니다.', {
									path : path
								});
							}

							// do not run callback.
							return;
						}

					} catch(error) {

						if (error !== TO_DELETE) {

							let errorMsg = error.toString();

							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								SHOW_ERROR('REMOVE_FILE', errorMsg);
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
 * 폴더를 삭제합니다.
 * 
 * 폴더 내의 모든 파일 및 폴더를 삭제하므로, 주의해서 사용해야 합니다.
 */
global.REMOVE_FOLDER = METHOD(() => {

	let FS = require('fs');

	return {

		run : (pathOrParams, callbackOrHandlers) => {
			//REQUIRED: pathOrParams
			//REQUIRED: pathOrParams.path	삭제할 폴더의 경로
			//OPTIONAL: pathOrParams.isSync	true로 설정하면 callback을 실행하지 않고 즉시 실행합니다. 이 설정은 명령이 끝날때 까지 프로그램이 멈추게 되므로 필요한 경우에만 사용합니다.
			//REQUIRED: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.notExists
			//OPTIONAL: callbackOrHandlers.error
			//REQUIRED: callbackOrHandlers.success

			let path;
			let isSync;
			
			let notExistsHandler;
			let errorHandler;
			let callback;

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
				notExistsHandler = callbackOrHandlers.notExists;
				errorHandler = callbackOrHandlers.error;
				callback = callbackOrHandlers.success;
			}

			// when normal mode
			if (isSync !== true) {

				CHECK_FILE_EXISTS(path, (isExists) => {

					if (isExists === true) {
						
						NEXT([
						(next) => {
							
							FIND_FILE_NAMES(path, (fileNames) => {
								
								PARALLEL(fileNames, [
								(fileName, done) => {
									REMOVE_FILE(path + '/' + fileName, done);
								},
								
								() => {
									next();
								}]);
							});
						},
						
						(next) => {
							return () => {
								
								FIND_FOLDER_NAMES(path, (folderNames) => {
									
									PARALLEL(folderNames, [
									(folderName, done) => {
										REMOVE_FOLDER(path + '/' + folderName, done);
									},
									
									() => {
										next();
									}]);
								});
							};
						},
						
						(next) => {
							return () => {
								
								FS.rmdir(path, (error) => {
									
									if (error !== TO_DELETE) {
										
										let errorMsg = error.toString();
										
										if (errorHandler !== undefined) {
											errorHandler(errorMsg);
										} else {
											SHOW_ERROR('REMOVE_FOLDER', errorMsg);
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
							SHOW_WARNING('REMOVE_FOLDER', '폴더가 존재하지 않습니다.', {
								path : path
							});
						}
					}
				});
			}

			// when sync mode
			else {

				RUN(() => {

					try {

						if (CHECK_FILE_EXISTS({
							path : path,
							isSync : true
						}) === true) {
							
							FIND_FILE_NAMES({
								path : path,
								isSync : true
							}, EACH((fileName) => {
								
								REMOVE_FILE({
									path : path + '/' + fileName,
									isSync : true
								});
							}));
							
							FIND_FOLDER_NAMES({
								path : path,
								isSync : true
							}, EACH((folderName) => {
								
								REMOVE_FOLDER({
									path : path + '/' + folderName,
									isSync : true
								});
							}));
							
							FS.rmdirSync(path);

						} else {

							if (notExistsHandler !== undefined) {
								notExistsHandler(path);
							} else {
								SHOW_WARNING('REMOVE_FOLDER', '폴더가 존재하지 않습니다.', {
									path : path
								});
							}

							// do not run callback.
							return;
						}

					} catch(error) {
						
						if (error !== TO_DELETE) {
							
							let errorMsg = error.toString();
	
							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								SHOW_ERROR('REMOVE_FOLDER', errorMsg);
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
 * 파일을 작성합니다.
 * 
 * 파일이 없으면 파일을 생성하고, 파일이 이미 있으면 내용을 덮어씁니다.
 */
global.WRITE_FILE = METHOD(() => {

	let FS = require('fs');
	let Path = require('path');

	return {

		run : (params, callbackOrHandlers) => {
			//REQUIRED: params
			//REQUIRED: params.path		작성할 파일의 경로
			//OPTIONAL: params.content	파일에 작성할 내용 (문자열)
			//OPTIONAL: params.buffer	파일에 작성할 내용 (Buffer)
			//OPTIONAL: params.isSync	true로 설정하면 callback을 실행하지 않고 즉시 실행합니다. 이 설정은 명령이 끝날때 까지 프로그램이 멈추게 되므로 필요한 경우에만 사용합니다.
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.error
			//OPTIONAL: callbackOrHandlers.success

			let path = params.path;
			let content = params.content;
			let buffer = params.buffer;
			let isSync = params.isSync;
			
			let errorHandler;
			let callback;

			if (callbackOrHandlers !== undefined) {
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					errorHandler = callbackOrHandlers.error;
					callback = callbackOrHandlers.success;
				}
			}

			CREATE_FOLDER({
				path : Path.dirname(path),
				isSync : isSync
			}, () => {

				// when normal mode
				if (isSync !== true) {

					FS.writeFile(path, buffer !== undefined ? buffer : content, (error) => {
						
						if (error !== TO_DELETE) {
							
							let errorMsg = error.toString();

							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								SHOW_ERROR('WRITE_FILE', errorMsg);
							}

						} else if (callback !== undefined) {
							callback();
						}
					});
				}

				// when sync mode
				else {
					
					try {

						FS.writeFileSync(path, buffer !== undefined ? buffer : content);

					} catch(error) {
						
						if (error !== TO_DELETE) {
							
							let errorMsg = error.toString();
								
							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								SHOW_ERROR('WRITE_FILE', errorMsg);
							}
						}
					}

					if (callback !== undefined) {
						callback();
					}
				}
			});
		}
	};
});

/*
 * ImageMagick의 convert 기능을 사용합니다.
 */
global.IMAGEMAGICK_CONVERT = METHOD(() => {

	let ImageMagick = require('hanul-imagemagick');

	return {

		run : (params, callbackOrHandlers) => {
			//REQUIRED: params
			//OPTIONAL: callbackOrHandlers

			let callback;
			let errorHandler;

			if (callbackOrHandlers !== undefined) {
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					callback = callbackOrHandlers.success;
					errorHandler = callbackOrHandlers.error;
				}
			}
			
			ImageMagick.convert(params, (error) => {

				if (error !== TO_DELETE) {

					let errorMsg = error.toString();

					if (errorHandler !== undefined) {
						errorHandler(errorMsg);
					} else {
						SHOW_ERROR('IMAGEMAGICK_CONVERT', errorMsg);
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

/*
 * ImageMagick의 identify 기능을 사용합니다.
 */
global.IMAGEMAGICK_IDENTIFY = METHOD(() => {

	let ImageMagick = require('hanul-imagemagick');

	return {

		run : (path, callbackOrHandlers) => {
			//REQUIRED: path
			//REQUIRED: callbackOrHandlers

			let callback;
			let errorHandler;

			if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
				callback = callbackOrHandlers;
			} else {
				callback = callbackOrHandlers.success;
				errorHandler = callbackOrHandlers.error;
			}
			
			ImageMagick.identify(path, (error, features) => {

				if (error !== TO_DELETE) {

					let errorMsg = error.toString();

					if (errorHandler !== undefined) {
						errorHandler(errorMsg);
					} else {
						SHOW_ERROR('IMAGEMAGICK_IDENTIFY', errorMsg);
					}

				} else {
					callback(features);
				}
			});
		}
	};
});

/*
 * ImageMagick을 이용해 이미지의 메타데이터를 반한홥니다.
 */
global.IMAGEMAGICK_READ_METADATA = METHOD(() => {

	let ImageMagick = require('hanul-imagemagick');

	return {

		run : (path, callbackOrHandlers) => {
			//REQUIRED: path
			//REQUIRED: callbackOrHandlers

			let callback;
			let errorHandler;

			if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
				callback = callbackOrHandlers;
			} else {
				callback = callbackOrHandlers.success;
				errorHandler = callbackOrHandlers.error;
			}
			
			ImageMagick.readMetadata(path, (error, metadata) => {

				if (error !== TO_DELETE) {

					let errorMsg = error.toString();

					if (errorHandler !== undefined) {
						errorHandler(errorMsg);
					} else {
						SHOW_ERROR('IMAGEMAGICK_READ_METADATA', errorMsg);
					}

				} else {
					callback(metadata);
				}
			});
		}
	};
});

/*
 * ImageMagick을 사용해 이미지의 크기를 조절하여 새 파일로 저장합니다.
 */
global.IMAGEMAGICK_RESIZE = METHOD(() => {

	let Path = require('path');

	return {

		run : (params, callbackOrHandlers) => {
			//REQUIRED: params.srcPath
			//REQUIRED: params.distPath
			//OPTIONAL: params.width
			//OPTIONAL: params.height
			//OPTIONAL: callbackOrHandlers

			let srcPath = params.srcPath;
			let distPath = params.distPath;
			let width = params.width;
			let height = params.height;
			
			let callback;
			let errorHandler;

			if (callbackOrHandlers !== undefined) {
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					callback = callbackOrHandlers.success;
					errorHandler = callbackOrHandlers.error;
				}
			}

			CREATE_FOLDER(Path.dirname(distPath), {
				error : errorHandler,
				success : () => {

					IMAGEMAGICK_IDENTIFY(srcPath, {
						error : errorHandler,
						success : (features) => {

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

/*
 * CSS 코드를 압축합니다.
 */
global.MINIFY_CSS = METHOD(() => {

	let Sqwish = require('sqwish');

	return {

		run : (code) => {
			//REQUIRED: code

			return Sqwish.minify(code.toString());
		}
	};
});

/*
 * JavaScript 코드를 압축합니다.
 */
global.MINIFY_JS = METHOD(() => {

	let UglifyJS = require('hanul-uglify-js');

	return {

		run : (code) => {
			//REQUIRED: code
			
			code = code.toString();
			
			try {

				return UglifyJS.minify(code, {
					fromString : true,
					mangle : true,
					output : {
						comments : /@license|@preserve|^!/
					}
				}).code;
			
			} catch(error) {
				
				SHOW_ERROR('MINIFY_JS', error.message, {
					code : (error.pos - 50 > 0 ? '...' : '') + code.substring(error.pos - 50, error.pos + 50) + (error.pos + 50 < code.length ? '...' : ''),
					line : error.line,
					column : error.col
				});
			}
		}
	};
});

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
		
		if (CHECK_IS_DATA(urlOrParams) !== true) {
			urlOrParams = {
				url : urlOrParams
			};
		}
		
		REQUEST(COMBINE([{
			method : 'DELETE'
		}, urlOrParams]), responseListenerOrListeners);
	}
});

/*
 * HTTP 리소스를 다운로드합니다.
 */
global.DOWNLOAD = METHOD(() => {

	let HTTP = require('http');
	let HTTPS = require('https');
	let URL = require('url');
	let Querystring = require('querystring');

	return {

		run : (params, callbackOrHandlers) => {
			//REQUIRED: params
			//REQUIRED: params.method
			//OPTIONAL: params.isSecure	HTTPS 프로토콜인지 여부
			//OPTIONAL: params.host
			//OPTIONAL: params.port
			//OPTIONAL: params.uri
			//OPTIONAL: params.url		요청을 보낼 URL. url을 입력하면 isSecure, host, port, uri를 입력할 필요가 없습니다.
			//OPTIONAL: params.paramStr	a=1&b=2&c=3과 같은 형태의 파라미터 문자열
			//OPTIONAL: params.params	데이터 형태({...})로 표현한 파라미터 목록
			//OPTIONAL: params.data		UPPERCASE 웹 서버로 보낼 데이터. 요청을 UPPERCASE기반 웹 서버로 보내는 경우 데이터를 직접 전송할 수 있습니다.
			//OPTIONAL: params.headers	요청 헤더
			//REQUIRED: params.path		리소스를 다운로드하여 저장할 경로
			//OPTIONAL: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.success
			//OPTIONAL: callbackOrHandlers.error

			let method = params.method;
			let isSecure = params.isSecure;
			let host = params.host;
			let port = params.port;
			let uri = params.uri;
			let url = params.url;
			let paramStr = params.paramStr;
			let _params = params.params;
			let data = params.data;
			let headers = params.headers;
			let path = params.path;
			
			let errorHandler;
			let callback;
			
			let urlData;
			let req;
			
			if (url !== undefined) {
				urlData = URL.parse(url);
				
				host = urlData.hostname === TO_DELETE ? undefined : urlData.hostname,
				port = urlData.port === TO_DELETE ? undefined : INTEGER(urlData.port),
				isSecure = urlData.protocol === 'https:',
				uri = urlData.pathname === TO_DELETE ? undefined : urlData.pathname.substring(1),
				paramStr = urlData.query === TO_DELETE ? undefined : urlData.query
			}
			
			if (port === undefined) {
				port = isSecure !== true ? 80 : 443;
			}

			if (uri !== undefined && uri.indexOf('?') !== -1) {
				paramStr = uri.substring(uri.indexOf('?') + 1) + (paramStr === undefined ? '' : '&' + paramStr);
				uri = uri.substring(0, uri.indexOf('?'));
			}
			
			if (_params !== undefined) {
				paramStr = (paramStr === undefined ? '' : paramStr + '&') + Querystring.stringify(_params);
			}

			if (data !== undefined) {
				paramStr = (paramStr === undefined ? '' : paramStr + '&') + '__DATA=' + encodeURIComponent(STRINGIFY(data));
			}
			
			paramStr = (paramStr === undefined ? '' : paramStr + '&') + Date.now();

			if (callbackOrHandlers !== undefined) {
				if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
					callback = callbackOrHandlers;
				} else {
					errorHandler = callbackOrHandlers.error;
					callback = callbackOrHandlers.success;
				}
			}

			req = (isSecure !== true ? HTTP : HTTPS).get({
				rejectUnauthorized : false,
				hostname : host,
				port : port,
				path : '/' + (uri === undefined ? '' : uri) + '?' + paramStr,
				headers : headers
			}, (httpResponse) => {
				
				// redirect.
				if (httpResponse.statusCode === 301 || httpResponse.statusCode === 302) {
					
					DOWNLOAD({
						url : httpResponse.headers.location,
						path : path
					}, {
						error : errorHandler,
						success : callback
					});
					
					httpResponse.destroy();
					
				} else {
				
					let data = [];
	
					httpResponse.on('data', (chunk) => {
						data.push(chunk);
					});
					httpResponse.on('end', () => {
						
						WRITE_FILE({
							path : path,
							buffer : Buffer.concat(data)
						}, {
							error : errorHandler,
							success : callback
						});
					});
				}
			});

			req.on('error', (error) => {

				let errorMsg = error.toString();

				if (errorHandler !== undefined) {
					errorHandler(errorMsg);
				} else {
					SHOW_ERROR('DOWNLOAD', errorMsg, params);
				}
			});
		}
	};
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
		
		if (CHECK_IS_DATA(urlOrParams) !== true) {
			urlOrParams = {
				url : urlOrParams
			};
		}
		
		REQUEST(COMBINE([{
			method : 'GET'
		}, urlOrParams]), responseListenerOrListeners);
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
		
		if (CHECK_IS_DATA(urlOrParams) !== true) {
			urlOrParams = {
				url : urlOrParams
			};
		}
		
		REQUEST(COMBINE([{
			method : 'POST'
		}, urlOrParams]), responseListenerOrListeners);
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
		
		if (CHECK_IS_DATA(urlOrParams) !== true) {
			urlOrParams = {
				url : urlOrParams
			};
		}
		
		REQUEST(COMBINE([{
			method : 'PUT'
		}, urlOrParams]), responseListenerOrListeners);
	}
});

/*
 * HTTP 요청을 보냅니다.
 */
global.REQUEST = METHOD((m) => {

	let HTTP = require('http');
	let HTTPS = require('https');
	let URL = require('url');
	let Querystring = require('querystring');

	return {

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
			let isSecure = params.isSecure;
			let host = params.host;
			let port = params.port;
			let uri = params.uri;
			let url = params.url;
			let paramStr = params.paramStr;
			let _params = params.params;
			let data = params.data;
			let headers = params.headers;
			
			let errorListener;
			let responseListener;
			
			let urlData;
			let req;

			method = method.toUpperCase();
			
			if (url !== undefined) {
				urlData = URL.parse(url);
				
				host = urlData.hostname === TO_DELETE ? undefined : urlData.hostname,
				port = urlData.port === TO_DELETE ? undefined : INTEGER(urlData.port),
				isSecure = urlData.protocol === 'https:',
				uri = urlData.pathname === TO_DELETE ? undefined : urlData.pathname.substring(1),
				paramStr = urlData.query === TO_DELETE ? undefined : urlData.query
			}
			
			if (port === undefined) {
				port = isSecure !== true ? 80 : 443;
			}

			if (uri !== undefined && uri.indexOf('?') !== -1) {
				paramStr = uri.substring(uri.indexOf('?') + 1) + (paramStr === undefined ? '' : '&' + paramStr);
				uri = uri.substring(0, uri.indexOf('?'));
			}
			
			if (_params !== undefined) {
				paramStr = (paramStr === undefined ? '' : paramStr + '&') + Querystring.stringify(_params);
			}

			if (data !== undefined) {
				paramStr = (paramStr === undefined ? '' : paramStr + '&') + '__DATA=' + encodeURIComponent(STRINGIFY(data));
			}
			
			if (paramStr === undefined) {
				paramStr = '';
			}
			
			if (responseListenerOrListeners !== undefined) {
				if (CHECK_IS_DATA(responseListenerOrListeners) !== true) {
					responseListener = responseListenerOrListeners;
				} else {
					errorListener = responseListenerOrListeners.error;
					responseListener = responseListenerOrListeners.success;
				}
			}

			// GET request.
			if (method === 'GET') {

				req = (isSecure !== true ? HTTP : HTTPS).get({
					rejectUnauthorized : false,
					hostname : host,
					port : port,
					path : '/' + (uri === undefined ? '' : uri) + '?' + paramStr,
					headers : headers
				}, (httpResponse) => {
					
					// redirect.
					if (httpResponse.statusCode === 301 || httpResponse.statusCode === 302) {
						
						GET(httpResponse.headers.location, {
							error : errorListener,
							success : responseListener
						});
						
						httpResponse.destroy();
						
					} else {
						
						let content = '';

						httpResponse.setEncoding('utf-8');
						httpResponse.on('data', (str) => {
							content += str;
						});
						httpResponse.on('end', () => {
							if (responseListener !== undefined) {
								responseListener(content, httpResponse.headers);
							}
						});
					}
				});
			}

			// other request.
			else {

				req = (isSecure !== true ? HTTP : HTTPS).request({
					rejectUnauthorized : false,
					hostname : host,
					port : port,
					path : '/' + (uri === undefined ? '' : uri) + (method === 'DELETE' ? '?' + paramStr : ''),
					method : method,
					headers : headers
				}, (httpResponse) => {

					let content = '';

					httpResponse.setEncoding('utf-8');
					httpResponse.on('data', (str) => {
						content += str;
					});
					httpResponse.on('end', () => {
						if (responseListener !== undefined) {
							responseListener(content, httpResponse.headers);
						}
					});
				});

				if (method !== 'DELETE') {
					req.write(paramStr);
				}
				req.end();
			}

			req.on('error', (error) => {

				let errorMsg = error.toString();

				if (errorListener !== undefined) {
					errorListener(errorMsg);
				} else {
					SHOW_ERROR('REQUEST', errorMsg, params);
				}
			});
		}
	};
});

/*
 * SOCKET_SERVER로 생성한 TCP 소켓 서버에 연결합니다.
 */
global.CONNECT_TO_SOCKET_SERVER = METHOD({

	run : (params, connectionListenerOrListeners) => {
		//REQUIRED: params
		//REQUIRED: params.host
		//REQUIRED: params.port
		//REQUIRED: connectionListenerOrListeners
		//REQUIRED: connectionListenerOrListeners.success
		//OPTIONAL: connectionListenerOrListeners.error

		let host = params.host;
		let port = params.port;

		let connectionListener;
		let errorListener;

		let Net = require('net');
		
		let isConnected;
		
		let methodMap = {};
		let sendKey = 0;
		
		let receivedStr = '';

		let on;
		let off;
		let send;

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

		let conn = Net.connect({
			host : host,
			port : port
		}, () => {

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
				
				if (CHECK_IS_DATA(methodNameOrParams) !== true) {
					methodName = methodNameOrParams;
				} else {
					methodName = methodNameOrParams.methodName;
					data = methodNameOrParams.data;
				}
				
				if (conn !== undefined) {
					
					conn.write(STRINGIFY({
						methodName : methodName,
						data : data,
						sendKey : sendKey
					}) + '\r\n');
	
					if (callback !== undefined) {
						
						let callbackName = '__CALLBACK_' + sendKey;
	
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
					conn.end();
					conn = undefined;
				}
			});
		});

		// when receive data
		conn.on('data', (content) => {

			let index;

			receivedStr += content.toString();

			while ((index = receivedStr.indexOf('\r\n')) !== -1) {
				
				let params = PARSE_STR(receivedStr.substring(0, index));

				if (params !== undefined) {
					runMethods(params.methodName, params.data, params.sendKey);
				}

				receivedStr = receivedStr.substring(index + 1);
			}
		});

		// when disconnected
		conn.on('close', () => {
			runMethods('__DISCONNECTED');
		});

		// when error
		conn.on('error', (error) => {

			let errorMsg = error.toString();

			if (isConnected !== true) {

				if (errorListener !== undefined) {
					errorListener(errorMsg);
				} else {
					SHOW_ERROR('CONNECT_TO_SOCKET_SERVER', errorMsg);
				}

			} else {
				runMethods('__ERROR', errorMsg);
			}
		});
	}
});

/*
 * TCP 소켓 및 웹 소켓 서버를 통합하여 생성합니다.
 */
global.MULTI_PROTOCOL_SOCKET_SERVER = CLASS({

	init : (inner, self, params, connectionListener) => {
		//REQUIRED: params
		//OPTIONAL: params.socketServerPort
		//OPTIONAL: params.webServer
		//REQUIRED: connectionListener

		let socketServerPort = params.socketServerPort;
		let webServer = params.webServer;

		if (socketServerPort !== undefined) {

			// create socket server.
			SOCKET_SERVER(socketServerPort, connectionListener);
		}

		if (webServer !== undefined) {

			// create web socket server.
			WEB_SOCKET_SERVER(webServer, connectionListener);
		}
	}
});

/*
 * TCP 소켓 서버를 생성합니다.
 */
global.SOCKET_SERVER = METHOD({

	run : (port, connectionListener) => {
		//REQUIRED: port
		//REQUIRED: connectionListener

		let Net = require('net');
		
		let server = Net.createServer((conn) => {
			
			let methodMap = {};
			let sendKey = 0;
			
			let receivedStr = '';
			
			let clientInfo;

			let on;
			let off;
			let send;
			
			let runMethods = (methodName, data, sendKey) => {
				
				try {
					
					let methods = methodMap[methodName];

					if (methods !== undefined) {
	
						EACH(methods, (method) => {
	
							// run method.
							method(data,
	
							// ret.
							(retData) => {
	
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
					
					SHOW_ERROR('SOCKET_SERVER', error.toString(), {
						methodName : methodName,
						data : data
					});
				}
			};

			// when receive data
			conn.on('data', (content) => {

				let index;

				receivedStr += content.toString();

				while ((index = receivedStr.indexOf('\r\n')) !== -1) {
					
					let params = PARSE_STR(receivedStr.substring(0, index));

					if (params !== undefined) {
						runMethods(params.methodName, params.data, params.sendKey);
					}

					receivedStr = receivedStr.substring(index + 1);
				}
				
				clientInfo.lastRecieveTime = new Date();
			});

			// when disconnected
			conn.on('close', () => {
				
				runMethods('__DISCONNECTED');
				
				// free method map.
				methodMap = undefined;
			});

			// when error
			conn.on('error', (error) => {
				
				if (error.code !== 'ECONNRESET' && error.code !== 'EPIPE' && error.code !== 'ETIMEDOUT' && error.code !== 'ENETUNREACH' && error.code !== 'EHOSTUNREACH' && error.code !== 'ECONNREFUSED' && error.code !== 'EINVAL') {
					
					let errorMsg = error.toString();
					
					SHOW_ERROR('SOCKET_SERVER', errorMsg);
					
					runMethods('__ERROR', errorMsg);
				}
			});

			connectionListener(

			// client info
			clientInfo = {
				
				ip : conn.remoteAddress,
				
				connectTime : new Date()
			},

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

			// send to client.
			send = (methodNameOrParams, callback) => {
				//REQUIRED: methodNameOrParams
				//REQUIRED: methodNameOrParams.methodName	클라이언트에 on 함수로 설정된 메소드 이름
				//REQUIRED: methodNameOrParams.data			전송할 데이터
				//OPTIONAL: callback

				let methodName;
				let data;
				
				if (CHECK_IS_DATA(methodNameOrParams) !== true) {
					methodName = methodNameOrParams;
				} else {
					methodName = methodNameOrParams.methodName;
					data = methodNameOrParams.data;
				}
				
				if (conn !== undefined && conn.writable === true) {
					
					if (callback === undefined) {
						
						conn.write(STRINGIFY({
							methodName : methodName,
							data : data
						}) + '\r\n');
					}
					
					else {
						
						let callbackName = '__CALLBACK_' + sendKey;
	
						// on callback.
						on(callbackName, (data) => {
	
							// run callback.
							callback(data);
	
							// off callback.
							off(callbackName);
						});
						
						conn.write(STRINGIFY({
							methodName : methodName,
							data : data,
							sendKey : sendKey
						}) + '\r\n');
						
						sendKey += 1;
					}
					
					clientInfo.lastSendTime = new Date();
				}
			},

			// disconnect.
			() => {
				if (conn !== undefined) {
					conn.end();
					conn = undefined;
				}
			});
		});

		// listen.
		server.listen(port);

		console.log('[SOCKET_SERVER] TCP 소켓 서버가 실행중입니다. (포트:' + port + ')');
	}
});

/*
 * UDP 소켓 서버를 생성하는 CLASS
 */
global.UDP_SERVER = CLASS({

	init : (inner, self, port, requestListener) => {
		//REQUIRED: port
		//REQUIRED: requestListener

		let dgram = require('dgram');
		let server = dgram.createSocket('udp6');
		
		let send = self.send = (params) => {
			//REQUIRED: params
			//REQUIRED: params.ip
			//REQUIRED: params.port
			//REQUIRED: params.content
			
			let message = new Buffer(params.content);
			
			server.send(message, 0, message.length, params.port, params.ip);
		};
		
		server.on('message', (message, nativeRequestInfo) => {
			
			let ip = nativeRequestInfo.address;
			let port = nativeRequestInfo.port;
			
			requestListener(
			
			// request info	
			{
				ip : ip,
				
				port : port
			},
			
			// content
			message.toString(),
			
			// response.
			(content) => {
				
				send({
					ip : ip,
					port : port,
					content : content
				});
			});
		});
		
		server.on('listening', () => {
			console.log('[UDP_SERVER] UDP 서버가 실행중입니다. (포트:' + port + ')');
		});
		
		server.bind(port);
	}
});

/*
 * 웹 서버를 생성하는 클래스
 */
global.WEB_SERVER = CLASS((cls) => {

	const DEFAULT_MAX_UPLOAD_FILE_MB = 10;
	
	let HTTP = require('http');
	let HTTPS = require('https');
	let FS = require('fs');
	let Path = require('path');
	let Querystring = require('querystring');
	let ZLib = require('zlib');
	let IncomingForm = require('formidable').IncomingForm;

	let getContentTypeFromExtension = (extension) => {
		
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

		// ogv
		if (extension === 'ogv') {
			return 'video/ogg';
		}

		// mp4
		if (extension === 'mp4') {
			return 'video/mp4';
		}

		// webm
		if (extension === 'webm') {
			return 'video/webm';
		}

		return 'application/octet-stream';
	};

	let getEncodingFromContentType = (contentType) => {

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

		if (contentType === 'audio/mpeg') {
			return 'binary';
		}

		if (contentType === 'audio/ogg') {
			return 'binary';
		}

		if (contentType === 'video/ogv') {
			return 'binary';
		}

		if (contentType === 'video/mp4') {
			return 'binary';
		}

		if (contentType === 'video/webm') {
			return 'binary';
		}

		return 'binary';
	};
	
	let createCookieStrArray = (data) => {
		
		let strs = [];

		EACH(data, (value, name) => {
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
	};
	
	let parseCookieStr = (cookieStr) => {
		
		let data = {};

		if (cookieStr !== undefined) {

			let splits = cookieStr.split(';');

			EACH(splits, (cookie) => {

				let parts = cookie.split('=');

				data[parts[0].trim()] = decodeURIComponent(parts[1]);
			});
		}

		return data;
	};
	
	return {

		init : (inner, self, portOrParams, requestListenerOrHandlers) => {
			//REQUIRED: portOrParams
			//OPTIONAL: portOrParams.port					HTTP 서버 포트
			//OPTIONAL: portOrParams.securedPort			HTTPS 서버 포트
			//OPTIONAL: portOrParams.securedKeyFilePath		SSL인증 .key 파일 경로
			//OPTIONAL: portOrParams.securedCertFilePath	SSL인증 .cert 파일 경로
			//OPTIONAL: portOrParams.rootPath				리소스 루트 폴더
			//OPTIONAL: portOrParams.version				캐싱을 위한 버전. 입력하지 않으면 캐싱 기능이 작동하지 않습니다.
			//OPTIONAL: portOrParams.preprocessors			프리프로세서들. 뷰 템플릿 등과 같이, 특정 확장자의 리소스를 응답하기 전에 내용을 변경하는 경우 사용합니다.
			//OPTIONAL: portOrParams.uploadURI				업로드를 처리할 URI. URI 문자열 혹은 URI 문자열 배열로 입력합니다.
			//OPTIONAL: portOrParams.uploadPath				업로드한 파일을 저장할 경로
			//OPTIONAL: portOrParams.maxUploadFileMB		최대 업로드 파일 크기 (MB). 입력하지 않으면 10MB로 지정됩니다.
			//OPTIONAL: requestListenerOrHandlers
			//OPTIONAL: requestListenerOrHandlers.notExistsResource		리소스가 존재하지 않는 경우
			//OPTIONAL: requestListenerOrHandlers.error					오류가 발생한 경우
			//OPTIONAL: requestListenerOrHandlers.requestListener		요청 리스너
			//OPTIONAL: requestListenerOrHandlers.uploadProgress		업로드 진행중
			//OPTIONAL: requestListenerOrHandlers.uploadOverFileSize	업로드 하는 파일의 크기가 maxUploadFileMB보다 클 경우
			//OPTIONAL: requestListenerOrHandlers.uploadSuccess			업로드가 정상적으로 완료된 경우

			let port;
			let securedPort;
			let securedKeyFilePath;
			let securedCertFilePath;
			let originRootPath;
			let version;
			let preprocessors;
			let uploadURI;
			let uploadPath;
			let maxUploadFileMB;
			
			let notExistsResourceHandler;
			let errorHandler;
			let requestListener;
			let uploadProgressHandler;
			let uploadOverFileSizeHandler;
			let uploadSuccessHandler;
			
			let resourceCaches = {};
			let nativeServer;

			// init params.
			if (CHECK_IS_DATA(portOrParams) !== true) {
				port = portOrParams;
			} else {
				port = portOrParams.port;
				securedPort = portOrParams.securedPort;
				securedKeyFilePath = portOrParams.securedKeyFilePath;
				securedCertFilePath = portOrParams.securedCertFilePath;
				
				originRootPath = portOrParams.rootPath;
				version = String(portOrParams.version);
				
				preprocessors = portOrParams.preprocessors;
				
				uploadURI = portOrParams.uploadURI;
				uploadPath = portOrParams.uploadPath;
				maxUploadFileMB = portOrParams.maxUploadFileMB;
			}
			
			if (maxUploadFileMB === undefined) {
				maxUploadFileMB = DEFAULT_MAX_UPLOAD_FILE_MB;
			}

			if (requestListenerOrHandlers !== undefined) {
				if (CHECK_IS_DATA(requestListenerOrHandlers) !== true) {
					requestListener = requestListenerOrHandlers;
				} else {
					notExistsResourceHandler = requestListenerOrHandlers.notExistsResource;
					errorHandler = requestListenerOrHandlers.error;
					requestListener = requestListenerOrHandlers.requestListener;
					
					uploadProgressHandler = requestListenerOrHandlers.uploadProgress;
					uploadOverFileSizeHandler = requestListenerOrHandlers.uploadOverFileSize;
					uploadSuccessHandler = requestListenerOrHandlers.uploadSuccess;
				}
			}

			let serve = (nativeReq, nativeRes, isSecure) => {

				let headers = nativeReq.headers;
				let uri = nativeReq.url;
				let method = nativeReq.method.toUpperCase();
				let ip = headers['x-forwarded-for'];
				let acceptEncoding = headers['accept-encoding'];
				
				let paramStr;
				let isUploadURI;
				
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
				
				isUploadURI = CHECK_IS_ARRAY(uploadURI) === true ? CHECK_IS_IN({
					array : uploadURI,
					value : uri
				}) === true : uploadURI === uri;

				NEXT([
				(next) => {
					
					if (method === 'GET' || isUploadURI === true) {
						next();
					} else {
						
						let isAppendedParamStr;
						
						nativeReq.on('data', (data) => {
							
							if (isAppendedParamStr !== true) {
								if (paramStr === undefined) {
									paramStr = '';
								} else {
									paramStr += '&';
								}
								isAppendedParamStr = true;
							}
							
							paramStr += data;
						});

						nativeReq.on('end', () => {
							next();
						});
					}
				},

				() => {
					return () => {
						
						let params = Querystring.parse(paramStr);
						let data;
						let requestInfo;
						let rootPath = originRootPath;
						let isGoingOn;
						let originalURI = uri;
						let overrideResponseInfo = {};
						
						EACH(params, (param, name) => {
							if (CHECK_IS_ARRAY(param) === true) {
								params[name] = param[param.length - 1];
							}
						});
						
						data = params.__DATA;
						
						if (data !== undefined) {
							data = PARSE_STR(data);
							delete params.__DATA;
						}
						
						requestInfo = {
							headers : headers,
							cookies : parseCookieStr(headers.cookie),							
							isSecure : isSecure,
							uri : uri,
							method : method,
							params : params,
							data : data,
							ip : ip
						};
						
						let response = (contentOrParams) => {
							//REQUIRED: contentOrParams
							//OPTIONAL: contentOrParams.statusCode		HTTP 응답 상태
							//OPTIONAL: contentOrParams.headers			응답 헤더
							//OPTIONAL: contentOrParams.cookies			클라이언트에 전달할 HTTP 쿠키
							//OPTIONAL: contentOrParams.contentType		응답하는 컨텐츠의 종류
							//OPTIONAL: contentOrParams.buffer			응답 내용을 Buffer형으로 전달
							//OPTIONAL: contentOrParams.content			응답 내용을 문자열로 전달
							//OPTIONAL: contentOrParams.stream			FS.createReadStream와 같은 함수로 스트림을 생성한 경우, 스트림을 응답으로 전달할 수 있습니다.
							//OPTIONAL: contentOrParams.totalSize		stream으로 응답을 전달하는 경우 스트림의 전체 길이
							//OPTIONAL: contentOrParams.startPosition	stream으로 응답을 전달하는 경우 전달할 시작 위치
							//OPTIONAL: contentOrParams.endPosition		stream으로 응답을 전달하는 경우 전달할 끝 위치
							//OPTIONAL: contentOrParams.encoding		응답 인코딩
							//OPTIONAL: contentOrParams.version			지정된 버전으로 웹 브라우저에 리소스를 캐싱합니다.
							//OPTIONAL: contentOrParams.isFinal			리소스가 결코 변경되지 않는 경우 true로 지정합니다. 그러면 version과 상관 없이 캐싱을 수행합니다.
							
							let statusCode;
							let cookies;
							let headers;
							let contentType;
							let content;
							let buffer;
							let stream;
							let totalSize;
							let startPosition;
							let endPosition;
							let encoding;
							let version;
							let isFinal;

							if (requestInfo.isResponsed !== true) {

								if (CHECK_IS_DATA(contentOrParams) !== true) {
									content = contentOrParams;
								} else {
									
									statusCode = contentOrParams.statusCode;
									cookies = contentOrParams.cookies;
									headers = contentOrParams.headers;
									contentType = contentOrParams.contentType;
									content = contentOrParams.content;
									buffer = contentOrParams.buffer;
									
									stream = contentOrParams.stream;
									totalSize = contentOrParams.totalSize;
									startPosition = contentOrParams.startPosition;
									endPosition = contentOrParams.endPosition;
									
									encoding = contentOrParams.encoding;
									version = contentOrParams.version;
									isFinal = contentOrParams.isFinal;
								}

								if (headers === undefined) {
									headers = {};
								}
								
								if (cookies !== undefined) {
									headers['Set-Cookie'] = createCookieStrArray(cookies);
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

										ZLib.gzip(buffer !== undefined ? buffer : String(content), (error, buffer) => {
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
						};
						
						let responseError = (errorMsg) => {
							
							if (errorHandler !== undefined) {
								isGoingOn = errorHandler(errorMsg, requestInfo, response);
							} else {
								SHOW_ERROR('WEB_SERVER', errorMsg);
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
						
						// when upload request
						if (isUploadURI === true) {
							
							CREATE_FOLDER(uploadPath, () => {
								
								// serve upload.
								if (method === 'POST') {
				
									let form = new IncomingForm();
									
									let fileDataSet = [];
									
									form.uploadDir = uploadPath;
									
									form.on('progress', (bytesRecieved, bytesExpected) => {
										
										if (uploadProgressHandler !== undefined) {
											uploadProgressHandler(params, bytesRecieved, bytesExpected, requestInfo);
										}
										
									}).on('field', (name, value) => {
				
										params[name] = value;
				
									}).on('file', (name, fileInfo) => {
				
										fileDataSet.push({
											path : fileInfo.path,
											size : fileInfo.size,
											name : fileInfo.name,
											type : fileInfo.type,
											lastModifiedTime : fileInfo.lastModifiedDate
										});
				
									}).on('end', () => {
										
										NEXT(fileDataSet, [
										(fileData, next) => {
											
											let path = fileData.path;
											let fileSize = fileData.size;
											let fileType = fileData.type;
											
											fileData.ip = ip;
											
											if (fileSize > maxUploadFileMB * 1024 * 1024) {
				
												NEXT(fileDataSet, [
												(fileData, next) => {
													REMOVE_FILE(fileData.path, next);
												},
				
												() => {
													return () => {
														if (uploadOverFileSizeHandler !== undefined) {
															uploadOverFileSizeHandler(params, maxUploadFileMB, requestInfo, response);
														}
													};
												}]);
				
												return false;
											}
											
											if (fileType === 'image/png' || fileType === 'image/jpeg' || fileType === 'image/gif') {
				
												IMAGEMAGICK_READ_METADATA(path, {
													error : () => {
														next(fileData);
													},
													success : (metadata) => {
				
														if (metadata.exif !== undefined) {
				
															fileData.exif = metadata.exif;
				
															IMAGEMAGICK_CONVERT([path, '-auto-orient', path], {
																error : errorHandler,
																success : next
															});
				
														} else {
															next();
														}
													}
												});
				
											} else {
												next();
											}
										},
				
										() => {
											return () => {
												uploadSuccessHandler(params, fileDataSet, requestInfo, response);
											};
										}]);
										
									}).on('error', (error) => {
										responseError(error.toString());
									});
				
									form.parse(nativeReq);
								}
							});
						}
						
						// when non-upload request
						else {
							
							NEXT([
							(next) => {
			
								if (requestListener !== undefined) {
									
									isGoingOn = requestListener(requestInfo, response, (newRootPath) => {
										rootPath = newRootPath;
									}, (_overrideResponseInfo) => {
			
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
			
							() => {
								return () => {
									
									// stream audio or video.
									if (headers.range !== undefined) {
										
										GET_FILE_INFO(rootPath + '/' + uri, {
											
											notExists : () => {
											
												response(EXTEND({
													origin : {
														statusCode : 404
													},
													extend : overrideResponseInfo
												}));
											},
											
											success : (fileInfo) => {
												
												let positions = headers.range.replace(/bytes=/, '').split('-');
												let totalSize = fileInfo.size;
												let startPosition = INTEGER(positions[0]);
												let endPosition = positions[1] === undefined || positions[1] === '' ? totalSize - 1 : INTEGER(positions[1]);
												
												let stream = FS.createReadStream(rootPath + '/' + uri, {
													start : startPosition,
													end : endPosition
												}).on('open', () => {
													
													response(EXTEND({
														origin : {
															contentType : getContentTypeFromExtension(Path.extname(uri).substring(1)),
															totalSize : totalSize,
															startPosition : startPosition,
															endPosition : endPosition,
															stream : stream
														},
														extend : overrideResponseInfo
													}));
													
												}).on('error', (error) => {
													
													response(EXTEND({
														origin : {
															contentType : getContentTypeFromExtension(Path.extname(uri).substring(1)),
															totalSize : totalSize,
															startPosition : startPosition,
															endPosition : endPosition,
															content : error.toString()
														},
														extend : overrideResponseInfo
													}));
												});
											}
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
													'Location' : '/' + originalURI + '?' + Querystring.stringify(COMBINE([params, {
														version : version
													}]))
												}
											},
											extend : overrideResponseInfo
										}));
									}
			
									// response resource file.
									else if (rootPath !== undefined && method === 'GET') {
										
										NEXT([
										(next) => {
			
											let resourceCache = resourceCaches[originalURI];
			
											if (resourceCache !== undefined) {
												next(resourceCache.buffer, resourceCache.contentType);
											} else {
												
												// serve file.
												READ_FILE(rootPath + '/' + uri, {
													
													notExists : () => {
			
														// not found file, so serve index.
														READ_FILE(rootPath + (uri === '' ? '' : ('/' + uri)) + '/index.html', {
			
															notExists : () => {
																
																if (notExistsResourceHandler !== undefined) {
																	isGoingOn = notExistsResourceHandler(rootPath + '/' + uri, requestInfo, response);
																}
																
																if (isGoingOn !== false && requestInfo.isResponsed !== true) {
								
																	response(EXTEND({
																		origin : {
																			statusCode : 404
																		},
																		extend : overrideResponseInfo
																	}));
																}
															},
															
															error : responseError,
															success : (buffer) => {
																next(buffer, 'text/html');
															}
														});
													},
			
													error : responseError,
													success : next
												});
											}
										},
			
										() => {
											return (buffer, contentType) => {
												
												let extension = Path.extname(uri).substring(1);
												
												if (preprocessors !== undefined && preprocessors[extension] !== undefined) {
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
						}
					};
				}]);
			};

			// init sever.
			if (port !== undefined) {
				
				nativeServer = HTTP.createServer((nativeReq, nativeRes) => {
					
					if (securedPort === undefined) {
						serve(nativeReq, nativeRes, false);
					}
					
					else {
						nativeRes.writeHead(302, {
							'Location' : 'https://' + nativeReq.headers.host + nativeReq.url
						});
						nativeRes.end();
					}
					
				}).listen(port);
			}

			// init secured sever.
			if (securedPort !== undefined) {
				nativeServer = HTTPS.createServer({
					key : FS.readFileSync(securedKeyFilePath),
					cert : FS.readFileSync(securedCertFilePath)
				}, (nativeReq, nativeRes) => {
					serve(nativeReq, nativeRes, true);
				}).listen(securedPort);
			}
			
			let getNativeServer = self.getNativeServer = () => {
				return nativeServer;
			};
			
			let addPreprocessor = self.addPreprocessor = (params) => {
				//REQUIRED: params
				//REQUIRED: params.extension
				//REQUIRED: params.preprocessor
				
				let extension = params.extension;
				let preprocessor = params.preprocessor;
				
				if (preprocessors === undefined) {
					preprocessors = {};
				}
				
				preprocessors[extension] = preprocessor;
			};
			
			console.log('[WEB_SERVER] 웹 서버가 실행중입니다.' + (port === undefined ? '' : (' (HTTP 서버 포트:' + port + ')')) + (securedPort === undefined ? '' : (' (HTTPS 서버 포트:' + securedPort + ')')));
		}
	};
});

/*
 * 웹 소켓 서버를 생성합니다.
 */
global.WEB_SOCKET_SERVER = METHOD({

	run : (webServer, connectionListener) => {
		//REQUIRED: webServer
		//REQUIRED: connectionListener

		let WebSocket = require('ws');
		let WebSocketServer = WebSocket.Server;
		
		let nativeConnectionListener = (conn) => {

			let headers = conn.upgradeReq.headers;

			let methodMap = {};
			let sendKey = 0;
			
			let clientInfo;
			let ip;
			
			let on;
			let off;
			let send;

			let runMethods = (methodName, data, sendKey) => {
				
				try {
					
					let methods = methodMap[methodName];
	
					if (methods !== undefined) {
	
						EACH(methods, (method) => {
	
							// run method.
							method(data,
	
							// ret.
							(retData) => {
	
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
					SHOW_ERROR('WEB_SOCKET_SERVER', error.toString());
				}
			};

			// when receive data
			conn.on('message', (str) => {

				let params = PARSE_STR(str);

				if (params !== undefined) {
					runMethods(params.methodName, params.data, params.sendKey);
				}
				
				clientInfo.lastRecieveTime = new Date();
			});

			// when disconnected
			conn.on('close', () => {

				runMethods('__DISCONNECTED');

				// free method map.
				methodMap = undefined;
			});

			// when error
			conn.on('error', (error) => {

				let errorMsg = error.toString();

				SHOW_ERROR('WEB_SOCKET_SERVER', errorMsg);

				runMethods('__ERROR', errorMsg);
			});

			ip = headers['x-forwarded-for'];

			if (ip === undefined) {
				ip = conn.upgradeReq.connection.remoteAddress;
			}

			connectionListener(

			// client info
			clientInfo = {
				
				ip : ip,
				
				connectTime : new Date()
			},

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

			// send to client.
			send = (methodNameOrParams, callback) => {
				//REQUIRED: methodNameOrParams
				//OPTIONAL: methodNameOrParams.methodName
				//OPTIONAL: methodNameOrParams.data
				//OPTIONAL: callback
				
				let methodName;
				let data;
				
				if (CHECK_IS_DATA(methodNameOrParams) !== true) {
					methodName = methodNameOrParams;
				} else {
					methodName = methodNameOrParams.methodName;
					data = methodNameOrParams.data;
				}
				
				if (conn !== undefined && conn.readyState === WebSocket.OPEN) {
					
					try {
						
						if (callback === undefined) {
							
							conn.send(STRINGIFY({
								methodName : methodName,
								data : data
							}));
						}
	
						else {
							
							let callbackName = '__CALLBACK_' + sendKey;
		
							// on callback.
							on(callbackName, (data) => {
		
								// run callback.
								callback(data);
		
								// off callback.
								off(callbackName);
							});
							
							conn.send(STRINGIFY({
								methodName : methodName,
								data : data,
								sendKey : sendKey
							}));

							sendKey += 1;
						}
						
					} catch(error) {
						SHOW_ERROR('WEB_SOCKET_SERVER', error.toString(), methodNameOrParams);
					}
					
					clientInfo.lastSendTime = new Date();
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
		
		new WebSocketServer({
			server : webServer.getNativeServer()
		}).on('connection', nativeConnectionListener);
		
		console.log('[WEB_SOCKET_SERVER] 웹 소켓 서버가 실행중입니다.');
	}
});

/*
 * CPU 각 코어 당 사용률을 반환합니다.
 */
global.CPU_USAGES = METHOD((m) => {
	
	let os = require('os');
	
	return {
		
		run : () => {
			
			let cpuInfos = os.cpus();
			let usages = [];
			
			EACH(cpuInfos, (cpuInfo) => {
				
				let total = 0;
				
				let idleTime;
				
				EACH(cpuInfo.times, (time, type) => {
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

/*
 * 디스크 사용률을 반환합니다.
 */
global.DISK_USAGE = METHOD(() => {

	let diskspace = require('diskspace');

	return {

		run : (drive, callbackOrHandlers) => {
			//OPTIONAL: drive	확인할 디스크 드라이브
			//REQUIRED: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.error
			//REQUIRED: callbackOrHandlers.success
			
			let errorHandler;
			let callback;

			if (callbackOrHandlers === undefined) {
				callbackOrHandlers = drive;
				drive = undefined;
			}
			
			if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
				callback = callbackOrHandlers;
			} else {
				errorHandler = callbackOrHandlers.error;
				callback = callbackOrHandlers.success;
			}
			
			if (drive === undefined) {
				if (process.platform === 'win32') {
					drive = 'c:';
				} else {
					drive = '/';
				}
			}
			
			diskspace.check(drive, (err, total, free, status) => {
				if (status === 'READY') {
					callback((1 - free / total) * 100);
				} else if (errorHandler !== undefined) {
					errorHandler(status);
				} else {
					SHOW_ERROR('DISK_USAGE', status);
				}
			});
		}
	};
});

/*
 * 메모리 사용률을 반환합니다.
 */
global.MEMORY_USAGE = METHOD((m) => {
	
	let os = require('os');
	
	let totalMemory = os.totalmem();
	
	return {
		
		run : () => {
			
			let freeMemory = os.freemem();
			
			return (1 - freeMemory / totalMemory) * 100;
		}
	};
});

/*
 * 매일 정해진 시간마다 주어진 터미널 명령어들을 실행하는 데몬을 구동합니다.
 */
global.RUN_SCHEDULE_DAEMON = METHOD((m) => {
	
	let exec = require('child_process').exec;
	
	return {
		
		run : (schedules) => {
			//REQUIRED: schedules
			
			INTERVAL(60, RAR(() => {
				
				let nowCal = CALENDAR();
				
				EACH(schedules, (schedule) => {
					
					if (nowCal.getHour() === schedule.hour && nowCal.getMinute() === (schedule.minute === undefined ? 0 : schedule.minute)) {
						
						EACH(schedule.commands, (command) => {
							
							exec(command, (error) => {
								if (error !== TO_DELETE) {
									SHOW_ERROR('RUN_SCHEDULE_DAEMON', error.toString());
								}
							});
						});
					}
				});
			}));
		}
	};
});
