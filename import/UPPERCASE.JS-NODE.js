/*

Welcome to UPPERCASE.JS! (http://uppercase.io)

*/

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
	workerId,

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
						console.log(CONSOLE_RED('[UPPERCASE.JS-CPU_CLUSTERING] WORKER #' + worker.id + ' died. (' + (signal !== undefined ? signal : code) + '). restarting...'));
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

					// save cpu shared value.
					on('__CPU_SHARED_STORE_SAVE', CPU_SHARED_STORE.save);

					// remove cpu shared value.
					on('__CPU_SHARED_STORE_REMOVE', CPU_SHARED_STORE.remove);

					// save shared data.
					on('__SHARED_DB_SAVE', SHARED_DB.save);
					
					// update shared data.
					on('__SHARED_DB_UPDATE', SHARED_DB.update);

					// remove shared data.
					on('__SHARED_DB_REMOVE', SHARED_DB.remove);

					// save cpu shared data.
					on('__CPU_SHARED_DB_SAVE', CPU_SHARED_DB.save);
					
					// update cpu shared data.
					on('__CPU_SHARED_DB_UPDATE', CPU_SHARED_DB.update);

					// remove cpu shared data.
					on('__CPU_SHARED_DB_REMOVE', CPU_SHARED_DB.remove);

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

					console.log(CONSOLE_GREEN('[UPPERCASE.JS-CPU_CLUSTERING] RUNNING WORKER... (ID:' + workerId + ')'));
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
	
	// list.
	list,

	// remove.
	remove;

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
	
	cls.list = list = function(dbName) {
		//REQUIRED: dbName
		
		var
		// storage
		storage = storages[dbName];
		
		return storage === undefined ? {} : storage;
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

	return {

		init : function(inner, self, dbName) {
			//REQUIRED: dbName

			var
			// save.
			save,
			
			// update.
			update,
			
			// list.
			list,

			// remove.
			remove;

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
			
			self.list = list = function() {
				return cls.list(dbName);
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
			
			// list.
			list,

			// remove.
			remove;

			self.save = save = sharedDB.save;

			self.update = update = sharedDB.update;

			self.get = get = sharedDB.get;
			
			self.list = list = sharedDB.list;

			self.remove = remove = sharedDB.remove;
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
	
	// list.
	list,

	// remove.
	remove;

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
	
	cls.list = list = function(storeName) {
		//REQUIRED: storeName
		
		var
		// storage
		storage = storages[storeName];
		
		return storage === undefined ? {} : storage;
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

	return {

		init : function(inner, self, storeName) {
			//REQUIRED: storeName

			var
			// save.
			save,

			// get.
			get,
			
			// list.
			list,

			// remove.
			remove;

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
			
			self.list = list = function() {
				return cls.list(storeName);
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
			
			// list.
			list,

			// remove.
			remove;

			self.save = save = sharedStore.save;

			self.get = get = sharedStore.get;
			
			self.list = list = sharedStore.list;

			self.remove = remove = sharedStore.remove;
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

							console.log('[UPPERCASE.JS-SERVER_CLUSTERING] CONNECTED CLUSTERING SERVER. (SERVER NAME:' + serverName + ')');

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

			console.log(CONSOLE_BLUE('[UPPERCASE.JS-SERVER_CLUSTERING] RUNNING CLUSTERING SERVER... (THIS SERVER NAME:' + thisServerName + ', PORT:' + port + ')'));
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
	
	// list.
	list,

	// remove.
	remove;

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
	
	cls.list = list = function(dbName) {
		//REQUIRED: dbName
		
		var
		// storage
		storage = storages[dbName];
		
		return storage === undefined ? {} : storage;
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
			
			// list.
			list,

			// remove.
			remove;

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
			
			self.list = list = function() {
				return cls.list(dbName);
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
			
			// list.
			list,

			// remove.
			remove;

			self.save = save = sharedDB.save;

			self.update = update = sharedDB.update;

			self.get = get = sharedDB.get;
			
			self.list = list = sharedDB.list;

			self.remove = remove = sharedDB.remove;
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
	
	// list.
	list,

	// remove.
	remove;

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
	
	cls.list = list = function(storeName) {
		//REQUIRED: storeName
		
		var
		// storage
		storage = storages[storeName];
		
		return storage === undefined ? {} : storage;
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

	return {

		init : function(inner, self, storeName) {
			//REQUIRED: storeName

			var
			// save.
			save,

			// get.
			get,
			
			// list.
			list,

			// remove.
			remove;

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
			
			self.list = list = function() {
				return cls.list(storeName);
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
			
			// list.
			list,

			// remove.
			remove;

			self.save = save = sharedStore.save;

			self.get = get = sharedStore.get;
			
			self.list = list = sharedStore.list;

			self.remove = remove = sharedStore.remove;
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
				//REQUIRED: params.data
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
					console.log(CONSOLE_RED('[UPPERCASE.JS-CONNECT_TO_SOCKET_SERVER] CONNECT TO SOCKET SERVER FAILED: ' + errorMsg));
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
										console.log(CONSOLE_RED('[UPPERCASE.JS-COPY_FILE] ERROR:' + errorMsg));
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
									console.log(CONSOLE_YELLOW('[UPPERCASE.JS-COPY_FILE] NOT EXISTS! <' + from + '>'));
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
										console.log(CONSOLE_YELLOW('[UPPERCASE.JS-COPY_FILE] NOT EXISTS! <' + from + '>'));
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
										console.log(CONSOLE_RED('[UPPERCASE.JS-COPY_FILE] ERROR: ' + errorMsg));
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
											console.log(CONSOLE_RED('[UPPERCASE.JS-CREATE_FOLDER] ERROR: ' + errorMsg));
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
								console.log(CONSOLE_RED('[UPPERCASE.JS-CREATE_FOLDER] ERROR: ' + errorMsg));
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
									console.log(CONSOLE_RED('[UPPERCASE.JS-FIND_FILE_NAMES] ERROR:' + errorMsg));
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
													console.log(CONSOLE_RED('[UPPERCASE.JS-FIND_FILE_NAMES] ERROR:' + errorMsg));
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
							console.log(CONSOLE_YELLOW('[UPPERCASE.JS-FIND_FOLDER_NAMES] NOT EXISTS! <' + path + '>'));
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
								console.log(CONSOLE_YELLOW('[UPPERCASE.JS-FIND_FILE_NAMES] NOT EXISTS! <' + path + '>'));
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
								console.log(CONSOLE_RED('[UPPERCASE.JS-FIND_FILE_NAMES] ERROR: ' + errorMsg));
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
									console.log(CONSOLE_RED('[UPPERCASE.JS-FIND_FOLDER_NAMES] ERROR:' + errorMsg));
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
													console.log(CONSOLE_RED('[UPPERCASE.JS-FIND_FOLDER_NAMES] ERROR:' + errorMsg));
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
							console.log(CONSOLE_YELLOW('[UPPERCASE.JS-FIND_FOLDER_NAMES] NOT EXISTS! <' + path + '>'));
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
								console.log(CONSOLE_YELLOW('[UPPERCASE.JS-FIND_FOLDER_NAMES] NOT EXISTS! <' + path + '>'));
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
								console.log(CONSOLE_RED('[UPPERCASE.JS-FIND_FOLDER_NAMES] ERROR: ' + errorMsg));
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
									console.log(CONSOLE_RED('[UPPERCASE.JS-GET_FILE_INFO] ERROR: ' + errorMsg));
								}

							} else if (stat.isDirectory() === true) {

								if (notExistsHandler !== undefined) {
									notExistsHandler(path);
								} else {
									console.log(CONSOLE_YELLOW('[UPPERCASE.JS-GET_FILE_INFO] NOT EXISTS! <' + path + '>'));
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
							console.log(CONSOLE_YELLOW('[UPPERCASE.JS-GET_FILE_INFO] NOT EXISTS! <' + path + '>'));
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
									console.log(CONSOLE_YELLOW('[UPPERCASE.JS-GET_FILE_INFO] NOT EXISTS! <' + path + '>'));
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
								console.log(CONSOLE_YELLOW('[UPPERCASE.JS-GET_FILE_INFO] NOT EXISTS! <' + path + '>'));
							}
						}

					} catch(error) {

						if (error !== TO_DELETE) {

							errorMsg = error.toString();

							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								console.log(CONSOLE_RED('[UPPERCASE.JS-GET_FILE_INFO] ERROR: ' + errorMsg));
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
									console.log(CONSOLE_RED('[UPPERCASE.JS-READ_FILE] ERROR: ' + errorMsg));
								}

							} else if (stat.isDirectory() === true) {

								if (notExistsHandler !== undefined) {
									notExistsHandler(path);
								} else {
									console.log(CONSOLE_YELLOW('[UPPERCASE.JS-READ_FILE] NOT EXISTS! <' + path + '>'));
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
											console.log(CONSOLE_RED('[UPPERCASE.JS-READ_FILE] ERROR: ' + errorMsg));
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
							console.log(CONSOLE_YELLOW('[UPPERCASE.JS-READ_FILE] NOT EXISTS! <' + path + '>'));
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
									console.log(CONSOLE_YELLOW('[UPPERCASE.JS-READ_FILE] NOT EXISTS! <' + path + '>'));
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
								console.log(CONSOLE_YELLOW('[UPPERCASE.JS-READ_FILE] NOT EXISTS! <' + path + '>'));
							}
						}

					} catch(error) {

						if (error !== TO_DELETE) {

							errorMsg = error.toString();

							if (errorHandler !== undefined) {
								errorHandler(errorMsg);
							} else {
								console.log(CONSOLE_RED('[UPPERCASE.JS-READ_FILE] ERROR: ' + errorMsg));
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
									console.log(CONSOLE_RED('[UPPERCASE.JS-REMOVE_FILE] ERROR: ' + errorMsg));
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
							console.log(CONSOLE_YELLOW('[UPPERCASE.JS-REMOVE_FILE] NOT EXISTS! <' + path + '>'));
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
								console.log(CONSOLE_YELLOW('[UPPERCASE.JS-REMOVE_FILE] NOT EXISTS! <' + path + '>'));
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
								console.log(CONSOLE_RED('[UPPERCASE.JS-REMOVE_FILE] ERROR: ' + errorMsg));
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
								console.log(CONSOLE_RED('[UPPERCASE.JS-WRITE_FILE] ERROR:' + errorMsg));
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
									console.log(CONSOLE_RED('[UPPERCASE.JS-WRITE_FILE] ERROR: ' + errorMsg));
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
					console.log(CONSOLE_RED('[UPPERCASE.JS-NODE] DOWNLOAD FAILED: ' + errorMsg), params);
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
					console.log(CONSOLE_RED('[UPPERCASE.JS-NODE] REQUEST FAILED: ' + errorMsg), params);
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
	//IMPORT: path
	path = require('path'),

	//IMPORT: querystring
	querystring = require('querystring'),

	// get content type from uri.
	getContentTypeFromURI;

	cls.getContentTypeFromURI = getContentTypeFromURI = function(uri) {
		//REQUIRED: uri

		var
		// extname
		extname = path.extname(uri);

		// png image
		if (extname === '.png') {
			return 'image/png';
		}

		// jpeg image
		if (extname === '.jpeg' || extname === '.jpg') {
			return 'image/jpeg';
		}

		// gif image
		if (extname === '.gif') {
			return 'image/gif';
		}

		// svg
		if (extname === '.svg') {
			return 'image/svg+xml';
		}

		// javascript
		if (extname === '.js') {
			return 'application/javascript';
		}

		// json document
		if (extname === '.json') {
			return 'application/json';
		}

		// css
		if (extname === '.css') {
			return 'text/css';
		}

		// text
		if (extname === '.text' || extname === '.txt') {
			return 'text/plain';
		}

		// markdown
		if (extname === '.markdown' || extname === '.md') {
			return 'text/x-markdown';
		}

		// html document
		if (extname === '.html') {
			return 'text/html';
		}

		// swf
		if (extname === '.swf') {
			return 'application/x-shockwave-flash';
		}

		// mp3
		if (extname === '.mp3') {
			return 'audio/mpeg';
		}

		return 'application/octet-stream';
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

			// resource caches
			resourceCaches = {},

			// web server
			webServer,

			// get native http server.
			getNativeHTTPServer;

			// init params.
			if (CHECK_IS_DATA(portOrParams) !== true) {
				port = portOrParams;
			} else {
				port = portOrParams.port;
				securedPort = portOrParams.securedPort;
				originRootPath = portOrParams.rootPath;
				version = portOrParams.version;
			}

			if (requestListenerOrHandlers !== undefined) {
				if (CHECK_IS_DATA(requestListenerOrHandlers) !== true) {
					requestListener = requestListenerOrHandlers;
				} else {
					requestListener = requestListenerOrHandlers.requestListener;
					errorHandler = requestListenerOrHandlers.error;
					notExistsResourceHandler = requestListenerOrHandlers.notExistsResource;
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

						// check ETag.
						if (CONFIG.isDevMode !== true && (overrideResponseInfo.isFinal !== true ?

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
									console.log(CONSOLE_RED('[UPPERCASE.JS-RESOURCE_SERVER] ERROR: ' + errorMsg));
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

												notExists : responseNotFound,
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

									if (contentType === undefined) {
										contentType = getContentTypeFromURI(uri);
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

			console.log('[UPPERCASE.JS-RESOURCE_SERVER] RUNNING RESOURCE SERVER...' + (port === undefined ? '' : (' (PORT:' + port + ')')) + (securedPort === undefined ? '' : (' (SECURED PORT:' + securedPort + ')')));

			self.getNativeHTTPServer = getNativeHTTPServer = function() {
				return webServer.getNativeHTTPServer();
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
					console.log(CONSOLE_RED('[UPPERCASE.JS-SOCEKT_SERVER] ERROR:'), error.toString());
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

				console.log(CONSOLE_RED('[UPPERCASE.JS-SOCEKT_SERVER] ERROR:'), errorMsg);

				runMethods('__ERROR', errorMsg);
			});

			connectionListener(

			// client info
			{
				ip : conn.remoteAddress
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
			},

			// disconnect.
			function() {
				conn.end();
			});
		});

		// listen.
		server.listen(port);

		console.log('[UPPERCASE.JS-SOCKET_SERVER] RUNNING SOCKET SERVER... (PORT:' + port + ')');
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
			console.log('[UPPERCASE.JS-UDP_SERVER] RUNNING UDP SERVER... (PORT:' + port + ')');
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

			// server
			nativeHTTPServer,

			// serve.
			serve,

			// get native http server.
			getNativeHTTPServer;

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

			serve = function(nativeReq, nativeRes) {

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
						data = params.__DATA;
						
						if (data !== undefined) {
							
							data = PARSE_STR(data);
							
							delete params.__DATA;
						}

						requestListener( requestInfo = {

							headers : headers,

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
									encoding = contentOrParams.encoding;
									version = contentOrParams.version;
									isFinal = contentOrParams.isFinal;
								}

								if (statusCode === undefined) {
									statusCode = 200;
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
				nativeHTTPServer = http.createServer(serve).listen(port);
			}

			// init secured sever.
			if (securedPort !== undefined) {

				nativeHTTPServer = https.createServer({
					key : fs.readFileSync(securedKeyFilePath),
					cert : fs.readFileSync(securedCertFilePath)
				}, serve).listen(securedPort);
			}

			console.log('[UPPERCASE.JS-WEB_SERVER] RUNNING WEB SERVER...' + (port === undefined ? '' : (' (PORT:' + port + ')')) + (securedPort === undefined ? '' : (' (SECURED PORT:' + securedPort + ')')));

			self.getNativeHTTPServer = getNativeHTTPServer = function() {
				return nativeHTTPServer;
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
			strs.push(name + '=' + encodeURIComponent(value));
		});

		return strs;
	}
});
