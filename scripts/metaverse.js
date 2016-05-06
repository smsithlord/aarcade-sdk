function Metaverse()
{
	this.users = {};
	this.library = {
		"items": {},
		"types": {},
		"platforms": {}
	};

	this.localUser = 
	{
		"id": "annon",
		"username": "annon",
		"displayName": "Annon"
	};

	this.root = null;
	this.universe = null;
	this.universeNames = {};
	this.local = {};
	this.rootRef = null;
	this.universeRef = null;
	this.usersRef = null;
	this.libraryRef = null;
	this.localUserRef = null;
	this.connectedRef = null;
	this.status = "Offline";

	this.listeners =
	{
		"connect": {},
		"disconnect": {},
		"status": {},
		"reset": {}
	};

	this.types = {};

	// NOTE: The regex's get encoded as strings to be compatible with JSON.
	this.defaultTypes = [
		{
			"title": "youtube",
			"fileFormat": "/(http|https):\\/\\/(?:www\\.)?youtu(?:be\\.com\\/watch\\?v=|\\.be\\/)([\\w\\-]+)(&(amp;)?[\\w\\?=]*)?/i",
			"titleFormat": "/(?=[^\\/]*$).+$/i",
			"priority": 2
		},
		{
			"title": "image",
			"fileFormat": "/(.jpg|.jpeg|.gif|.png|.tga)$/i",
			"titleFormat": "/(?=[^\\/]*$).+$/i",
			"priority": 2
		},
		{
			"title": "ds",
			"fileFormat": "/(.nds)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "wii",
			"fileFormat": "/(.iso)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "ps",
			"fileFormat": "/(.iso|.bin|.img|.ccd|.mds|.pbp|.ecm)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "nes",
			"fileFormat": "/(.nes|.zip)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "genesis",
			"fileFormat": "/(.zip|.gen|.smc)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "arcade",
			"fileFormat": "/(.zip)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "psp",
			"fileFormat": "/(.iso)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "n64",
			"fileFormat": "/(.n64|.zip)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "snes",
			"fileFormat": "/(.smc|.zip)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "gb",
			"fileFormat": "/(.zip)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "gba",
			"fileFormat": "/(.zip)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "pinball",
			"fileFormat": "/(.vpt)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "website",
			"fileFormat": "/((http|https):\\/\\/|(www\\.|www\\d\\.))([^\\-][a-zA-Z0-9\\-]+)?(\\.\\w+)(\\/\\w+){0,}(\\.\\w+){0,}(\\?\\w+\\=\\w+){0,}(\\&\\w+\\=\\w+)?/i",
			"titleFormat": "/(?=[^\\/]*$).+$/i",
			"priority": 1
		},
		{
			"title": "standard",
			"fileFormat": "/.+$/i",
			"titleFormat": "/.+$/i",
			"priority": 0
		}
	];
}

Metaverse.prototype.updateItem = function(data, callback)
{
	var rawItem = this.library.items[data.info.id];
	var item = this.cookItem(rawItem);

	// Detect which fields have actually changed.
	var updateData = {};

	var x, dataObject;
	for( x in data )
	{
		if( x === "info" )
			continue;

		if( item[x] !== data[x] )
		{
			dataObject = {"timestamp": Firebase.ServerValue.TIMESTAMP, "value": data[x]};
			rawItem[x][metaverse.localUser.id] = dataObject;
			
			updateData[x + "/" + metaverse.localUser.id] = dataObject;
		}
	}

	var needsCallback = true;
	for( x in updateData )
	{
		needsCallback = false;
		this.libraryRef.child("items").child(data.info.id).update(updateData, function(error)
		{
			if( !!error )
				callback("ERROR: Failed to update item.");
			else
				callback();
		});

		break;
	}

	if( needsCallback )
		callback();
};

Metaverse.prototype.updateType = function(data, callback)
{
	var rawType = this.library.types[data.info.id];
	var type = this.cookType(rawType);

	// Detect which fields have actually changed.
	var updateData = {};

	var x, dataObject;
	for( x in data )
	{
		if( x === "info" )
			continue;

		if( type[x] !== data[x] )
		{
			dataObject = {"timestamp": Firebase.ServerValue.TIMESTAMP, "value": data[x]};
			rawType[x][metaverse.localUser.id] = dataObject;
			
			updateData[x + "/" + metaverse.localUser.id] = dataObject;
		}
	}

	var needsCallback = true;
	for( x in updateData )
	{
		needsCallback = false;
		this.libraryRef.child("types").child(data.info.id).update(updateData, function(error)
		{
			if( !!error )
				callback("ERROR: Failed to update type.");
			else
				callback();
		});

		break;
	}

	if( needsCallback )
		callback();
};

Metaverse.prototype.updatePlatform = function(data, callback)
{
	var rawPlatform = this.library.platforms[data.info.id];
	var platform = this.cookPlatform(rawPlatform);

	// Detect which fields have actually changed.
	var updateData = {};

	var x, dataObject;
	for( x in data )
	{
		if( x === "info" )
			continue;

		if( platform[x] !== data[x] )
		{
			dataObject = {"timestamp": Firebase.ServerValue.TIMESTAMP, "value": data[x]};
			rawPlatform[x][metaverse.localUser.id] = dataObject;
			
			updateData[x + "/" + metaverse.localUser.id] = dataObject;
		}
	}

	var needsCallback = true;
	for( x in updateData )
	{
		needsCallback = false;
		this.libraryRef.child("platforms").child(data.info.id).update(updateData, function(error)
		{
			if( !!error )
				callback("ERROR: Failed to update platform.");
			else
				callback();
		});

		break;
	}

	if( needsCallback )
		callback();
};

Metaverse.prototype.reset = function()
{
	// Unregister change listeners

	var x;
	for( x in this.library.items )
		this.libraryRef.child("items").off();
	
	for( x in this.library.maps )
		this.libraryRef.child("types").off();

	if( this.connectedRef )
		this.connectedRef.off();

	if( this.localUserRef )
		this.localUserRef.off();

	Firebase.goOffline();

	this.users = {};
	this.library = {
		"items": {},
		"types": {},
		"platforms": {}
	};

	this.localUser = 
	{
		"id": "annon",
		"username": "annon",
		"displayName": "Annon"
	};

	this.root = null;
	this.universe = null;
	this.universeNames = {};
	this.local = {};
	this.rootRef = null;
	this.universeRef = null;
	this.usersRef = null;
	this.localUserRef = null;
	this.connectedRef = null;
	
	this.setStatus("Offline");

	for( x in this.listeners.status )
		this.listeners.status[x](this.status);

	for( x in this.listeners.reset )
		this.listeners.reset[x](this.reset);

	Firebase.goOnline();
};

Metaverse.prototype.connect = function(server, callback)
{
	if( this.status !== "Offline" )
	{
		callback("ERROR: Not ready to connect.");
		return;
	}

	if( server !== "local" && !this.isUrl(server) )
	{
		callback("ERROR: Invalid server.");
		return;
	}

	this.root = server;
	if( this.root !== "local" )
	{
		this.rootRef = new Firebase(this.root);

		this.setStatus("Connecting");

		function getUniverseNames()
		{
			var request = new XMLHttpRequest();
			request.onreadystatechange = function()
			{
				if( request.readyState === 4 )
				{
					if( request.status === 200 )
					{
						var universeKeys = JSON.parse(request.responseText);

						if( !universeKeys )
							universeKeys = {};

						var objectKeys = Object.keys(universeKeys)
						var len = objectKeys.length;

						if( len > 0 )
						{
							var count = 0;
							this.rootRef.child(objectKeys[count]).child("info").child("name").once("value", function(snapshot)
							{
								count++;

								if( snapshot.exists() )
								{
									var val = snapshot.val();
									var key = snapshot.key();
									universeKeys[objectKeys[count-1]] = val;

									if( count < len )
										this.rootRef.child(objectKeys[count]).child("info").child("name").once("value", arguments.callee.bind(this));
								}

								if( count >= len )
									onGotUniverseNames.call(this, universeKeys);
							}.bind(this));
						}
						else
							onGotUniverseNames.call(this, universeKeys);

						function onGotUniverseNames(universeKeys)
						{
							this.universeNames = universeKeys;
							this.setStatus("Select Universe");

							callback();
						}
					}
					else if( request.status === 404 )
					{
						this.setStatus("Offline");

						callback("ERROR: Failed to connect.");
					}
				}
			}.bind(this);

			request.open("GET", this.root + ".json?shallow=true", true);
			request.send(null);
		}

		this.universeNames = {};
		getUniverseNames.call(this);
	}
	else
	{
		/*
		this.local = {
			"info":
			{
				"owner": "12354151616753",
				"remover": "",
				"removed": "",
				"created": Firebase.ServerValue.TIMESTAMP
			}
		};
*/

/*
		this.local[this.universe] = {
			"servers": {},
			"users": {},
			"items": {},
			"models": {},
			"apps": {},
			"types": {}
		};
		*/
		this.setStatus("Select Universe");
	}
};

Metaverse.prototype.cookType = function(rawType)
{
	var type = {
		"info": rawType.info
	};

	var x, y, mostRecent, value, timestamp;
	for( x in rawType )
	{
		if( x === "info" )
			continue;

		// Find the most recent entry.
		mostRecentTimestamp = 0;
		mostRecentKey = null;

		for( y in rawType[x] )
		{
			timestamp = rawType[x][y].timestamp;
			if( timestamp > mostRecentTimestamp )
			{
				mostRecentTimestamp = timestamp;
				mostRecentKey = y;
			}
		}

		if( mostRecentKey )
			type[x] = rawType[x][mostRecentKey].value;
	}

	return type;
};

Metaverse.prototype.cookPlatform = function(rawPlatform)
{
	var platform = {
		"info": rawPlatform.info
	};

	var x, y, mostRecent, value, timestamp;
	for( x in rawPlatform )
	{
		if( x === "info" )
			continue;

		// Find the most recent entry.
		mostRecentTimestamp = 0;
		mostRecentKey = null;

		for( y in rawPlatform[x] )
		{
			timestamp = rawPlatform[x][y].timestamp;
			if( timestamp > mostRecentTimestamp )
			{
				mostRecentTimestamp = timestamp;
				mostRecentKey = y;
			}
		}

		if( mostRecentKey )
			platform[x] = rawPlatform[x][mostRecentKey].value;
	}

	return platform;
};

Metaverse.prototype.cookItem = function(rawItem)
{
	var item = {
		"info": rawItem.info
	};

	var x, y, mostRecent, value, timestamp;
	for( x in rawItem )
	{
		if( x === "info" )
			continue;

		// Find the most recent entry.
		mostRecentTimestamp = 0;
		mostRecentKey = null;

		for( y in rawItem[x] )
		{
			timestamp = rawItem[x][y].timestamp;
			if( timestamp > mostRecentTimestamp )
			{
				mostRecentTimestamp = timestamp;
				mostRecentKey = y;
			}
		}

		if( mostRecentKey )
			item[x] = rawItem[x][mostRecentKey].value;
	}

	return item;
};

Metaverse.prototype.createUniverse = function(name, callback)
{
	var ref = this.rootRef.push();
	var key = ref.key();
	var data = {
		"info":
		{
			"id": key,
			"name": name,
			"owner": "",
			"admins": {},
			"remover": "",
			"removed": 0,
			"created": Firebase.ServerValue.TIMESTAMP
		}
	};

	ref.set(data, function(error)
	{
		if( !!!error )
		{
			this.universeNames[key] = data.info.name;
			callback(key);
		}
	}.bind(this));
};

Metaverse.prototype.setStatus = function(status)
{
	this.status = status;

	var x;
	for( x in this.listeners.status )
		this.listeners.status[x](this.status);
};

Metaverse.prototype.joinUniverse = function(universeKey, callback)
{
	this.universe = universeKey;
	this.universeRef = this.rootRef.child(this.universe);
	this.usersRef = this.universeRef.child("users");
	this.libraryRef = this.universeRef.child("library");

	this.library = {
		"items": {},
		"types": {},
		"platforms": {}
	};

	this.libraryRef.child("items").on("child_changed", this.itemChanged.bind(this));
	this.libraryRef.child("items").on("child_added", this.itemAdded.bind(this))
	this.libraryRef.child("items").on("child_removed", this.itemRemoved.bind(this));

	this.libraryRef.child("types").on("child_changed", this.typeChanged.bind(this));
	this.libraryRef.child("types").on("child_added", this.typeAdded.bind(this))
	this.libraryRef.child("types").on("child_removed", this.typeRemoved.bind(this));

	this.libraryRef.child("platforms").on("child_changed", this.platformChanged.bind(this));
	this.libraryRef.child("platforms").on("child_added", this.platformAdded.bind(this))
	this.libraryRef.child("platforms").on("child_removed", this.platformRemoved.bind(this));

	callback();
};

Metaverse.prototype.itemChanged = function(child, prevChildKey)
{
	this.library.items[child.key()] = child.val();
};

Metaverse.prototype.itemAdded = function(child, prevChildKey)
{
	var key = child.key();
	console.log("Downloaded metaverse information for item " + key);
	this.library.items[key] = child.val();
};

Metaverse.prototype.itemRemoved = function(child)
{
	console.log("Item removed.");
	delete this.library.items[child.key()];
};

Metaverse.prototype.itemChanged = function(child, prevChildKey)
{
	this.library.items[child.key()] = child.val();
};

Metaverse.prototype.typeAdded = function(child, prevChildKey)
{
	var key = child.key();
	console.log("Downloaded metaverse information for type " + key);

	this.library.types[key] = child.val();
};

Metaverse.prototype.typeRemoved = function(child)
{
	console.log("Type removed.");
	delete this.library.types[child.key()];
};

Metaverse.prototype.typeChanged = function(child, prevChildKey)
{
	this.library.types[child.key()] = child.val();
};

Metaverse.prototype.platformAdded = function(child, prevChildKey)
{
	var key = child.key();
	console.log("Downloaded metaverse information for platform " + key);

	this.library.platforms[key] = child.val();
};

Metaverse.prototype.platformRemoved = function(child)
{
	console.log("Platform removed.");
	delete this.library.platforms[child.key()];
};

Metaverse.prototype.platformChanged = function(child, prevChildKey)
{
	this.library.platforms[child.key()] = child.val();
};

Metaverse.prototype.getUniverseKey = function(universeName)
{
	var x;
	for( x in this.universeNames)
	{
		if( this.universeNames[x] === universeName )
			return x;
	}

	return;
};

Metaverse.prototype.getUniverseName = function(universeKey)
{
	return this.universeNames[universeKey];
};

Metaverse.prototype.encodePasscode = function(passcode)
{
	return md5(passcode + "katchup");
};

Metaverse.prototype.logIn = function(username, passcode, callback)
{
	passcode = this.encodePasscode(passcode);
	this.usersRef.orderByChild("username").equalTo(username).once("value", function(snapshot)
	{
		if( snapshot.exists() )
		{
			var val = snapshot.val();

			var key;
			for( key in val )
			{
				val = val[key];
				break;
			}

			if( val.passcode === passcode )
			{
				// If there is no owner of this universe, then set US as the owner.
				this.universeRef.child("info").child("owner").once("value", function(ownerSnapshot)
				{
					if( !ownerSnapshot.exists() || ownerSnapshot.val() === "" )
					{
						var data = {
							"owner": key,
							"admins": {}
						};

						data.admins[key] = {
							"id": key,
							"privileges":
							{
								"undo": true,
								"ban": true,
								"unban": true
							}
						};

						this.universeRef.child("info").update(data, function()
						{
							onOwnerResolved.call(this, true);
						}.bind(this));
					}
					else
						onOwnerResolved.call(this, false);

					function onOwnerResolved(needsDefaultTypes)
					{
						this.localUserRef = this.usersRef.child(key);

						this.connectedRef = new Firebase(this.root + ".info/connected");
						this.connectedRef.on("value", connectedRefUpdate.bind(this));

						function connectedRefUpdate(connectedSnapshot)
						{
							var needsCallback = false;

							if( connectedSnapshot.val() === true )
							{
								if( this.localUserRef )
								{
									this.sessionRef = this.localUserRef.child("sessions").push();

									this.sessionRef.onDisconnect().remove();
									this.localUserRef.onDisconnect().update({"lastSeen": Firebase.ServerValue.TIMESTAMP});
									this.sessionRef.set({"status": "Online", "mode": "Spectate", "timestamp": Firebase.ServerValue.TIMESTAMP}, function(error)
									{
										// Monitor our own user for changes
										needsCallback = true;
										this.localUserRef.on("value", localUserUpdate.bind(this));
									}.bind(this));
								}
								else
									console.log("NOTICE: Connection reestablished.");
							}
							else
							{
								console.log("NOTICE: Connection lost.");
								//this.connectedRef.off("value", connectedRefUpdate.bind(this));
								//this.localUserRef.off("value", localUserUpdate.bind(this));
							}

							function localUserUpdate(userSnapshot)
							{
								this.localUser = userSnapshot.val();

								if( needsCallback )
								{
									needsCallback = false;

									if( needsDefaultTypes )
									{
										// Now import all of the default types.
										var numDefaultTypes = this.defaultTypes.length;
										var resolvedIndex = -1;
										createTypeHelper.call(this);

										function createTypeHelper(typeId)
										{
											if( !!typeId )
												resolvedIndex++;

											if( resolvedIndex+1 < numDefaultTypes )
												this.createType(this.defaultTypes[resolvedIndex+1], arguments.callee.bind(this));
											else
												onCallbackReady.call(this);
										}
									}
									else
										onCallbackReady.call(this);

									function onCallbackReady()
									{
										this.setStatus("Online");
										callback();
									}
								}
							}
						}
					}
				}.bind(this));
			}
			else
				callback("ERROR: Invalid username or passcode.");
		}
		else
			callback("ERROR: Invalid username or passcode.");
	}.bind(this));
}

Metaverse.prototype.createUser = function(data, callback)
{
	var ref = this.usersRef.push();
	data.id = ref.key();
	data.passcode = this.encodePasscode(data.passcode);
	ref.set(data);
	return data;
};

Metaverse.prototype.updateLocalUser = function(data, callback)
{
	if( !this.localUserRef )
	{
		callback("No local user.");
		return;
	}

	this.localUserRef.update(data, function(error)
	{
		if( !!error )
			callback(error);
		else
		{
			var x;
			for( x in data )
				this.localUser[x] = data[x];

			callback();
		}
	}.bind(this));
};

Metaverse.prototype.addEventListener = function(eventType, handler)
{
	var lastNum = -1;
	var x;
	for( x in this.listeners[eventType] )
		lastNum = parseInt(x[5]);

	var handlerId = "local" + (lastNum + 1);
	this.listeners[eventType][handlerId] = handler;
};

Metaverse.prototype.removeEventListener = function(eventType, handler)
{
	var x;
	for( x in this.listeners[eventType] )
	{
		if( this.listeners[eventType][x] === handler )
		{
			delete this.listeners[eventType][x];
			break;
		}
	}
};

Metaverse.prototype.findTwinType = function(original, callback)
{
	callback();
};

Metaverse.prototype.createType = function(data, callback)
{
	var ref = this.universeRef.child("library").child("types").push();
	var key = ref.key();

	var typeData = {
		"info":
		{
			"id": key,
			"created": Firebase.ServerValue.TIMESTAMP,
			"owner": metaverse.localUser.id,
			"removed": 0,
			"remover": ""
		}
	};

	var x;
	for( x in data )
	{
		typeData[x] = {};

		typeData[x][metaverse.localUser.id] = {
			"value": data[x],
			"timestamp": Firebase.ServerValue.TIMESTAMP
		};
	}

	ref.set(typeData, function(error)
	{
		if( !!!error )
			callback(key);
		else
			callback();
	});
};

Metaverse.prototype.findTwinPlatform = function(original, callback)
{
	callback();
};

Metaverse.prototype.createPlatform = function(data, callback)
{
	var ref = this.universeRef.child("library").child("platforms").push();
	var key = ref.key();

	var platformData = {
		"info":
		{
			"id": key,
			"created": Firebase.ServerValue.TIMESTAMP,
			"owner": metaverse.localUser.id,
			"removed": 0,
			"remover": ""
		}
	};

	var x;
	for( x in data )
	{
		platformData[x] = {};
		platformData[x][metaverse.localUser.id] = {
			"value": data[x],
			"timestamp": Firebase.ServerValue.TIMESTAMP
		};
	}

	ref.set(platformData, function(error)
	{
		if( !!!error )
			callback(key);
		else
			callback();
	});
};

Metaverse.prototype.findTwinItem = function(original, callback)
{
	//this.items
	callback();
};

Metaverse.prototype.createItem = function(data, callback)
{
	var ref = this.universeRef.child("library").child("items").push();
	var key = ref.key();

	var itemData = {
		"info":
		{
			"id": key,
			"created": Firebase.ServerValue.TIMESTAMP,
			"owner": metaverse.localUser.id,
			"removed": 0,
			"remover": ""
		}
	};

	var x;
	for( x in data )
	{
		itemData[x] = {};

		itemData[x][metaverse.localUser.id] = {
			"value": data[x],
			"timestamp": Firebase.ServerValue.TIMESTAMP
		};
	}

	ref.set(itemData, function(error)
	{
		if( !!!error )
			callback(key);
		else
			callback();
	});
};

Metaverse.prototype.generateHash = function(text)
{
	var hash = 0, i, chr, len;
	if( text.length === 0 )
		return hash;

	for( i = 0, len = text.length; i < len; i++ )
	{
		chr = text.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0;
	}

	return hash;
};

Metaverse.prototype.generateTitle = function(file, typeId)
{
	var title = file;
	var cookedType = this.cookType(this.library.types[typeId]);

	if( cookedType.titleFormat !== "" )
	{
		var regEx = eval(cookedType.titleFormat);
		var matches = regEx.exec(file);
		if( matches )
			title = matches[matches.length-1];
	}

	return title;
};

Metaverse.prototype.generateType = function(file)
{
	var typeMatches = new Array();
	var x, cookedType;
	for( x in this.library.types )
	{
		// FIX ME: use new RegExp instead of eval for security reasons.
		// new RegExp
		//var regEx = new RegExp(this.types[x].format);

		cookedType = metaverse.cookType(this.library.types[x]);
		if( file.search(eval(cookedType.fileFormat)) !== -1 )
			typeMatches.push(cookedType);
	}

	typeMatches.sort(function(a, b)
	{
		return b.priority-a.priority;
	});

	if( typeMatches.length === 0 )
	{
		console.log("ERROR: No type matches found!");
		return;
	}

	return typeMatches[0].info.id;
};

Metaverse.prototype.isUrl = function(text)
{
	return (text.search(/((http|https):\/\/|(www\.|www\d\.))([^\-][a-zA-Z0-9\-]+)?(\.\w+)(\/\w+){0,}(\.\w+){0,}(\?\w+\=\w+){0,}(\&\w+\=\w+)?/i) !== -1);
};