function Metaverse()
{
	this.root = null;
	this.universe = null;
	this.universeNames = {};
	this.local = {};
	this.localUser = null;
	this.rootRef = null;
	this.universeRef = null;
	this.usersRef = null;
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

	// FIX ME: hard-coded types for now.
	// NOTE: The regex's get encoded as strings to be compatible with JSON.
	this.types = {
		"youtube":
		{
			extensions: "/(http|https):\\/\\/(?:www\\.)?youtu(?:be\\.com\\/watch\\?v=|\\.be\\/)([\\w\\-]+)(&(amp;)?[\\w\\?=]*)?/i"
		},
		"website":
		{
			extensions: "/((http|https):\\/\\/|(www\\.|www\\d\\.))([^\\-][a-zA-Z0-9\\-]+)?(\\.\\w+)(\\/\\w+){0,}(\\.\\w+){0,}(\\?\\w+\\=\\w+){0,}(\\&\\w+\\=\\w+)?/i"
		},
		"standard":
		{
			extensions: "/.*/i"
		}
	};
}

Metaverse.prototype.reset = function()
{
	Firebase.goOffline();

	this.root = null;
	this.universe = null;
	this.universeNames = {};
	this.local = {};
	this.localUser = null;
	this.rootRef = null;
	this.universeRef = null;
	this.usersRef = null;
	this.localUserRef = null;
	this.connectedRef = null;
	this.status = "Offline";

	var x;
	for( x in this.listeners.status )
		this.listeners.status[x](this.status);

	for( x in this.listeners.reset )
		this.listeners.reset[x](this.reset);

	Firebase.goOnline();
};

Metaverse.prototype.connect = function(server)
{
	if( this.status !== "Offline" )
		return false;

	if( server !== "local" && !this.isUrl(server) )
	{
		var error = "ERROR: Invalid server.";
		console.log(error);
		alert(error);
		return false;
	}

	this.root = server;
	if( this.root !== "local" )
	{
		this.rootRef = new Firebase(this.root);

		this.status = "Connecting";

		var x;
		for( x in this.listeners.status )
			this.listeners.status[x](this.status);

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

							this.status = "Select Universe";

							var x;
							for( x in this.listeners.status )
								this.listeners.status[x](this.status);
						}
					}
					else if( request.status === 404 )
					{
						this.status = "Connection Failed";

						var x;
						for( x in this.listeners.status )
							this.listeners.status[x](this.status);
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
		this.status = "Select Universe";

		var x;
		for( x in this.listeners.status )
			this.listeners.status[x](this.status);
	}

	return true;
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
			"removed": "",
			"created": Firebase.ServerValue.TIMESTAMP
		}
	};

	ref.set(data, function(error)
	{
		if( !!error )
			callback("ERROR: Failed to update firebase.");
		else
		{
			this.universeNames[key] = data.info.name;
			callback();
		}
	}.bind(this));
};

Metaverse.prototype.joinUniverse = function(universeKey)
{
	this.universe = universeKey;
	this.universeRef = this.rootRef.child(this.universe);
	this.usersRef = this.universeRef.child("users");
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
							onOwnerResolved.call(this);
						}.bind(this));
					}
					else
						onOwnerResolved.call(this);

					function onOwnerResolved()
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
										this.status = "Online";

										var x;
										for( x in this.listeners.status )
											this.listeners.status[x](this.status);

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
								this.connectedRef.off("value", connectedRefUpdate.bind(this));
								this.localUserRef.off("value", localUserUpdate.bind(this));
							}

							function localUserUpdate(userSnapshot)
							{
								this.localUser = userSnapshot.val();

								if( needsCallback )
								{
									needsCallback = false;
									callback();
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

Metaverse.prototype.generateTitle = function(file)
{
	var title = file;
	return title;
};

Metaverse.prototype.generateType = function(file)
{
	var type;

	var x;
	for( x in this.types )
	{
		// FIX ME: use new RegExp instead of eval for security reasons.
		// new RegExp
		if( file.search(eval(this.types[x].extensions)) !== -1 )
		{
			type = x;
			break;
		}
	}

	return type;
};

Metaverse.prototype.isUrl = function(text)
{
	return (text.search(/((http|https):\/\/|(www\.|www\d\.))([^\-][a-zA-Z0-9\-]+)?(\.\w+)(\/\w+){0,}(\.\w+){0,}(\?\w+\=\w+){0,}(\&\w+\=\w+)?/i) !== -1);
};