function Metaverse(eventHandler)
{
	this.quickJoinAddress = "https://metaverse.firebaseio.com/";
	this.eventHandler = eventHandler;
	this.error;
	this.users = {};
	this.library = {
		"items": {},
		"models": {},
		"types": {},
		"apps": {},
		"databases": {},
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
	this.universeTitles = {};
	this.local = {};
	this.rootRef = null;
	this.universeRef = null;
	this.usersRef = null;
	this.libraryRef = null;
	this.localUserRef = null;
	this.connectedRef = null;
	this.status = "Offline";

	this.lastPushTime = 0;
	this.lastRandChars = [];

	this.listeners =
	{
		"connect": {},
		"disconnect": {},
		"status": {},
		"reset": {}
	};

	this.defaultInfo = {
		"created":
		{
			"default": Firebase.ServerValue.TIMESTAMP,
			"types": "timestamp",
			"format": "/^[-+]?\\d+$/i",
			"formatDescription": "Created must be a timestamp."
		},
		"id":
		{
			"default": "",
			"types": "autokey",
			"format": "/.+$/i",
			"formatDescription": "ID must be an auto-generated key."
		},
		"owner":
		{
			"default": "",
			"types": "autokey",
			"format": "/.+$/i",
			"formatDescription": "Owner must be an auto-generated key."
		},
		"removed":
		{
			"default": "0",
			"types": "timestamp",
			"format": "/^[-+]?\\d+$/i",
			"formatDescription": "Removed must be a timestamp."
		},
		"remover":
		{
			"default": "",
			"types": "autokey",
			"format": "/.*$/i",
			"formatDescription": "Remover must be an auto-generated key."
		}		
	};

	this.defaultUniverse = {
		"info":
		{
			"title":
			{
				"default": "",
				"types": "string",
				"format": "/^.{2,1024}$/i",
				"formatDescription": "Title must be between 2 and 1024 characters."
			}
		}
	};

	this.defaultUser = {
		"username":
		{
			"default": "",
			"types": "string",
			"format": "/^.{3,1024}$/i",
			"formatDescription": "Username must be between 3 and 1024 characters."
		},
		"displayName":
		{
			"default": "",
			"types": "string",
			"format": "/^.{3,1024}$/i",
			"formatDescription": "Display name must be between 3 and 1024 characters."
		},
		"passcode":
		{
			"default": "",
			"types": "string",
			"format": "/^.{5,1024}$/i",
			"formatDescription": "Passcode must be between 5 and 1024 characters."
		}
	};

	this.defaultDatabase = {
		"info": true,
		"title":
		{
			"label": "Title",
			"default": "",
			"types": "string",
			"format": "/^.{2,1024}$/i",
			"formatDescription": "Title must be between 2 and 1024 characters."
		},
		"singleQueryUri":
		{
			"label": "Single Query Handler",
			"default": "",
			"types": "uri",
			"format": "/(((http|https):\\/\\/|(www\\.|www\\d\\.))([^\\-][a-zA-Z0-9\\-]+)?(\\.\\w+)(\\/\\w+){0,}(\\.\\w+){0,}(\\?\\w+\\=\\w+){0,}(\\&\\w+\\=\\w+)?)/i",
			"formatDescription": "Single Query must be a valid URI to a PHP handler."
		}/*,
		"types":
		{
			"label": "Types",
			"id":
			{
				"label": "ID",
				"default": "",
				"types": "autokey",
				"format": "/.+$/i",
				"formatDescription": "Types must be an auto-generated key."
			}
		}*/,
		"typeAliases":
		{
			"label": "Type Aliases",
			"id":
			{
				"label": "ID",
				"default": "",
				"types": "autokey",
				"format": "/.+$/i",
				"formatDescription": "ID must be an auto-generated key."
			},
			"aliases":
			{
				"label": "Aliases",
				"default": "",
				"types": "string",
				"format": "/.*$/i",//"/^.{2,1024}$/i",
				"formatDescription": "Aliases must be between 0 and 1024 characters."
			}
		}
	};

	this.defaultPlatform = {
		"info": true,
		"title":
		{
			"label": "Title",
			"default": "",
			"types": "string",
			"format": "/^.{2,1024}$/i",
			"formatDescription": "Title must be between 2 and 1024 characters."
		},
		"reference":
		{
			"label": "Reference",
			"default": "",
			"types": "uri",
			"format": "/((((http|https):\\/\\/|(www\\.|www\\d\\.))([^\\-][a-zA-Z0-9\\-]+)?(\\.\\w+)(\\/\\w+){0,}(\\.\\w+){0,}(\\?\\w+\\=\\w+){0,}(\\&\\w+\\=\\w+)?)|(^$))/i",
			"formatDescription": "Reference must be a valid URI."
		},
		"download":
		{
			"label": "Download",
			"default": "",
			"types": "uri",
			"format": "/((((http|https):\\/\\/|(www\\.|www\\d\\.))([^\\-][a-zA-Z0-9\\-]+)?(\\.\\w+)(\\/\\w+){0,}(\\.\\w+){0,}(\\?\\w+\\=\\w+){0,}(\\&\\w+\\=\\w+)?)|(^$))/i",
			"formatDescription": "Download must be a valid URI."
		},
		"modelCustomFields":
		{
			"label": "Model Custom Fields",
			"default": "",
			"types": "string",
			"format": "/.*$/i",
			"formatDescription": "Model Custom Fields must be comma separated fieldIDs longer than 2 characters each and under 1024 characters total."
		},
		"mapCustomFields":
		{
			"label": "Map Custom Fields",
			"default": "",
			"types": "string",
			"format": "/.*$/i",
			"formatDescription": "Map Custom Fields must be comma separated fieldIDs longer than 2 characters each and under 1024 characters total."
		}
	};

	this.defaultType = {
		"info": true,
		"fileFormat":
		{
			"label": "File Format",
			"default": "/.+$/i",
			"types": "regex",
			"format": "/.*$/i",
			"formatDescription": "File Format must be a regular expression."
		},
		"titleFormat":
		{
			"label": "Title Format",
			"default": "/(?=[^\\/]*$).+$/i",
			"types": "regex",
			"format": "/.*$/i",
			"formatDescription": "Title Format must be a regular expression."
		},
		"title":
		{
			"label": "Title",
			"default": "",
			"types": "string",
			"format": "/^.{2,1024}$/i",
			"formatDescription": "Title must be between 2 and 1024 characters."
		},
		"priority":
		{
			"label": "Priority",
			"default": "2",
			"types": "integer",
			"format": "/.*$/i",
			"formatDescription": "Priority must be an integer between 0 and 1024."
		}
	};

	this.defaultApp = {
		"info": true,
		"title":
		{
			"label": "Title",
			"default": "",
			"types": "string",
			"format": "/^.{2,1024}$/i",
			"formatDescription": "Title must be between 2 and 1024 characters."
		},
		"file":
		{
			"label": "Executable",
			"default": "",
			"types": "string",
			"format": "/^.{2,1024}$/i",
			"formatDescription": "Executable must be a valid local file."
		},
		"commandFormat":
		{
			"label": "Command Format",
			"default": "",
			"types": "string",
			"format": "/^.{2,1024}$/i",
			"formatDescription": "Command Format must be a valid metaverse command format."
		},
		"type":
		{
			"label": "Type",
			"default": "",
			"types": "autokey",
			"format": "/.+$/i",
			"formatDescription": "Type must be an auto-generated key."
		},
		"download":
		{
			"label": "Download",
			"default": "",
			"types": "uri",
			"format": "/((((http|https):\\/\\/|(www\\.|www\\d\\.))([^\\-][a-zA-Z0-9\\-]+)?(\\.\\w+)(\\/\\w+){0,}(\\.\\w+){0,}(\\?\\w+\\=\\w+){0,}(\\&\\w+\\=\\w+)?)|(^$))/i",
			"formatDescription": "Download must be a valid URI."
		},
		"reference":
		{
			"label": "Reference",
			"default": "",
			"types": "uri",
			"format": "/((((http|https):\\/\\/|(www\\.|www\\d\\.))([^\\-][a-zA-Z0-9\\-]+)?(\\.\\w+)(\\/\\w+){0,}(\\.\\w+){0,}(\\?\\w+\\=\\w+){0,}(\\&\\w+\\=\\w+)?)|(^$))/i",
			"formatDescription": "Reference must be a valid URI."
		},
		"filePaths":
		{
			"label": "File Paths",
			"id":
			{
				"label": "ID",
				"default": "",
				"types": "autokey",
				"format": "/.+$/i",
				"formatDescription": "ID must be an auto-generated key."
			},
			"path":
			{
				"label": "Path",
				"default": "",
				"types": "string",
				"format": "/^.{2,1024}$/i",
				"formatDescription": "Path must be a valid directory."
			}
		}
	};

	this.defaultItem = {
		"info": true,
		"title":
		{
			"label": "Title",
			"default": "",
			"types": "string",
			"format": "/^.{2,1024}$/i",
			"formatDescription": "Title must be between 2 and 1024 characters."
		},
		"description":
		{
			"label": "Description",
			"default": "",
			"types": "string",
			"format": "/^.{0,1024}$/i",
			"formatDescription": "Description must be between 0 and 1024 characters."
		},
		"file":
		{
			"label": "File",
			"default": "",
			"types": "uri|string",
			"format": "/^.{3,1024}$/i",
			"formatDescription": "File must be between 3 and 1024 characters."
		},
		"type":
		{
			"label": "Type",
			"default": "",
			"types": "autokey",
			"format": "/.+$/i",
			"formatDescription": "Type must be an auto-generated key."
		},
		"app":
		{
			"label": "App",
			"default": "",
			"types": "autokey",
			"format": "/.*$/i",
			"formatDescription": "App must be an auto-generated key."
		},
		"reference":
		{
			"label": "Reference",
			"default": "",
			"types": "uri",
			"format": "/((((http|https):\\/\\/|(www\\.|www\\d\\.))([^\\-][a-zA-Z0-9\\-]+)?(\\.\\w+)(\\/\\w+){0,}(\\.\\w+){0,}(\\?\\w+\\=\\w+){0,}(\\&\\w+\\=\\w+)?)|(^$))/i",
			"formatDescription": "Reference must be a valid URI."
		},
		"preview":
		{
			"label": "Preview",
			"default": "",
			"types": "uri|string",
			"format": "/^.{0,1024}$/i",
			"formatDescription": "Preview must be between 0 and 1024 characters."
		},
		"download":
		{
			"label": "Download",
			"default": "",
			"types": "uri",
			"format": "/((((http|https):\\/\\/|(www\\.|www\\d\\.))([^\\-][a-zA-Z0-9\\-]+)?(\\.\\w+)(\\/\\w+){0,}(\\.\\w+){0,}(\\?\\w+\\=\\w+){0,}(\\&\\w+\\=\\w+)?)|(^$))/i",
			"formatDescription": "Download must be a valid URI."
		},
		"stream":
		{
			"label": "Stream",
			"default": "",
			"types": "uri",
			"format": "/((((http|https):\\/\\/|(www\\.|www\\d\\.))([^\\-][a-zA-Z0-9\\-]+)?(\\.\\w+)(\\/\\w+){0,}(\\.\\w+){0,}(\\?\\w+\\=\\w+){0,}(\\&\\w+\\=\\w+)?)|(^$))/i",
			"formatDescription": "Stream must be a valid URI."
		},
		"screen":
		{
			"label": "Screen",
			"default": "",
			"types": "uri|string",
			"format": "/^.{0,1024}$/i",
			"formatDescription": "Screen must be between 0 and 1024 characters."
		},
		"marquee":
		{
			"label": "Marquee",
			"default": "",
			"types": "uri|string",
			"format": "/^.{0,1024}$/i",
			"formatDescription": "Description must be between 0 and 1024 characters."
		},
		"model":
		{
			"label": "Model",
			"default": "",
			"types": "autokey",
			"format": "/.*$/i",
			"formatDescription": "Model must be an auto-generated key."
		}
	};

	this.defaultModel = {
		"info": true,
		"title":
		{
			"label": "Title",
			"default": "",
			"types": "string",
			"format": "/^.{2,1024}$/i",
			"formatDescription": "Title must be between 2 and 1024 characters."
		},
		"keywords":
		{
			"label": "Keywords",
			"default": "",
			"types": "string",
			"format": "/^.{2,1024}$/i",
			"formatDescription": "Keywords must be comma separated strings longer than 2 characters each and under 1024 characters total."
		},
		"dynamic":
		{
			"label": "Dynamic",
			"default": 0,
			"types": "integer",
			"format": "/(0|1)$/i",
			"formatDescription": "Dynamic must be 0 or 1."
		},
		"platforms":
		{
			"label": "Platforms",
			"id":
			{
				"label": "ID",
				"default": "",
				"types": "autokey",
				"format": "/.+$/i",
				"formatDescription": "ID must be an auto-generated key."
			},
			"file":
			{
				"label": "File",
				"default": "",
				"types": "string",
				"format": "/^.{2,1024}$/i",
				"formatDescription": "File must be between 0 and 1024 characters."
			}
		}
	};

	// NOTE: The regex's get encoded as strings to be compatible with JSON.
	this.defaultPlatforms = [
		{
			"title": "AArcade: Source",
			"reference": "http://www.anarchyarcade.com/",
			"download": "http://store.steampowered.com/app/266430/",
			"modelCustomFields": "workshopIds, mountIds",
			"mapCustomFields": "workshopIds, mountIds"
		}
	];

	function customHelper(object)
	{
		var pushId = this.generatePushId();

		var dummy = {};
		dummy[pushId] = object;

		return JSON.stringify(dummy);
	}

	this.defaultDatabases = [
		{
			"title": "YouTube.com",
			"singleQueryUri": "http://metaverse.anarchyarcade.com/tubeinfo.php",
			"typeAliases":
			{
				"YouTube":
				{
					"aliases": ""
				}
			}
		}
	];

	this.defaultTypes = [
		{
			"title": "YouTube",
			"fileFormat": "/(http|https):\\/\\/(?:www\\.)?youtu(?:be\\.com\\/watch\\?v=|\\.be\\/)([\\w\\-]+)(&(amp;)?[\\w\\?=]*)?/i",
			"titleFormat": "/(?=[^\\/]*$).+$/i",
			"priority": 2
		},
		{
			"title": "Image",
			"fileFormat": "/(.jpg|.jpeg|.gif|.png|.tga)$/i",
			"titleFormat": "/(?=[^\\/]*$).+$/i",
			"priority": 2
		},
		{
			"title": "DS",
			"fileFormat": "/(.nds)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "Wii",
			"fileFormat": "/(.iso)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "PS",
			"fileFormat": "/(.iso|.bin|.img|.ccd|.mds|.pbp|.ecm)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "NES",
			"fileFormat": "/(.nes|.zip)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "Genesis",
			"fileFormat": "/(.zip|.gen|.smc)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "Arcade",
			"fileFormat": "/(.zip)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "PSP",
			"fileFormat": "/(.iso)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "N64",
			"fileFormat": "/(.n64|.zip)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "SNES",
			"fileFormat": "/(.smc|.zip)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "GB",
			"fileFormat": "/(.zip)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "GBA",
			"fileFormat": "/(.zip)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "Pinball",
			"fileFormat": "/(.vpt)$/i",
			"titleFormat": "/.+$/i",
			"priority": 1
		},
		{
			"title": "Website",
			"fileFormat": "/((http|https):\\/\\/|(www\\.|www\\d\\.))([^\\-][a-zA-Z0-9\\-]+)?(\\.\\w+)(\\/\\w+){0,}(\\.\\w+){0,}(\\?\\w+\\=\\w+){0,}(\\&\\w+\\=\\w+)?/i",
			"titleFormat": "/(?=[^\\/]*$).+$/i",
			"priority": 1
		},
		{
			"title": "Default",
			"fileFormat": "/.+$/i",
			"titleFormat": "/.+$/i",
			"priority": 0
		}
	];
//(https?:\/\/|www\d?\.)
//TomyLobo: if you have a user-submitted url you want to check
//TomyLobo: this should be anchored
//TomyLobo: ^$

	this.defaultApps = [
		{
			"title": "Steam",
			"file": "",
			"commandFormat": "",
			"download": "http://store.steampowered.com/about/",
			"reference": "https://en.wikipedia.org/wiki/Steam_(software)",
			"filePaths": {}
		},
		{
			"title": "Windows",
			"file": "",
			"commandFormat": "",
			"download": "http://www.microsoft.com/Windows10",
			"reference": "https://en.wikipedia.org/wiki/Microsoft_Windows",
			"filePaths": {}
		}
	];

//	var defaultOtherType = this.defaultTypes[this.defaultTypes.length-1];
//	var key = this.generatePushId();
//	this.defaultApps[0].filePaths[key] = {
//		"id": key,
//		"path": "",
//		"type": defaultOtherType,
//							}
//	};

	this.showMenu("metaverseMenu");
}

Metaverse.prototype.getMenus = function(options)
{
	var item;
	if( !!options && !!options.itemId )
		item = this.library.items[options.itemId].current;

	var type;
	if( !!options && !!options.typeId )
		type = this.library.types[options.typeId].current;

	var database;
	if( !!options && !!options.databaseId )
		database = this.library.databases[options.databaseId].current;

	var platform;
	if( !!options && !!options.platformId )
		platform = this.library.platforms[options.platformId].current;

	var app;
	if( !!options && !!options.appId )
		app = this.library.apps[options.appId].current;

	var model;
	if( !!options && !!options.modelId )
		model = this.library.models[options.modelId].current;

	var menus = {
		"metaverseMenu":
		{
			"menuId": "metaverseMenu",
			"menuHeader": "Metaverse",
			"quickJoin":
			{
				"type": "button",
				"value": "Quick Join",
				"action": "quickJoin"
			},
			"firebaseConnect":
			{
				"type": "button",
				"value": "Connect to Firebase",
				"action": "firebaseConnect"
			},
			"firebaseHost":
			{
				"type": "button",
				"value": "Host Firebase",
				"action": "firebaseHost"
			},
			"localLoad":
			{
				"type": "button",
				"value": "Load Local Session",
				"action": "localLoad"
			},
			"localNew":
			{
				"type": "button",
				"value": "New Local Session",
				"action": "localNew"
			}
		},
		"firebaseConnectMenu":
		{
			"menuId": "firebaseConnectMenu",
			"menuHeader": "Firebase",
			"address":
			{
				"label": "Firebase Address: ",
				"type": "text",
				"value": this.quickJoinAddress,
				"focus": true
			},
			"connect":
			{
				"type": "submit",
				"value": "Connect",
				"action": "connectToFirebase"
			},
			"cancel":
			{
				"type": "button",
				"value": "Cancel",
				"action": "cancelFirebaseConnect"
			}
		},
		"universeMenu":
		{
			"menuId": "universeMenu",
			"menuHeader": "Universe",
			"universeSelect":
			{
				"type": "select",
				"generateOptions": "universeTitles",
				"focus": true,
				"action": "universeSelectChange"
			},
			"joinUniverse":
			{
				"type": "submit",
				"value": "Join Universe",
				"action": "joinUniverse"
			},
			"newUniverse":
			{
				"type": "button",
				"value": "New Universe",
				"action": "newUniverse"
			},
			"cancel":
			{
				"type": "button",
				"value": "Cancel",
				"action": "cancelUniverse"
			}
		},
		"newUniverseMenu":
		{
			"menuId": "newUniverseMenu",
			"menuHeader": "Universe / New",
			"title":
			{
				"label": "Universe Title: ",
				"type": "text",
				"value": "",
				"placeholder": "string",
				"focus": true
			},
			"createUniverse":
			{
				"type": "submit",
				"value": "Create Universe",
				"action": "createUniverse"
			},
			"cancel":
			{
				"type": "button",
				"value": "Cancel",
				"action": "cancelNewUniverse"
			}
		},
		"signUpMenu":
		{
			"menuId": "signUpMenu",
			"menuHeader": "Dashboard / Sign-Up",
			"username":
			{
				"label": "Username: ",
				"type": "text",
				"value": this.defaultUser.username.default,
				"placeholder": this.defaultUser.username.types,
				"focus": true
			},
			"passcode":
			{
				"label": "<u>Public</u> Passcode: ",
				"type": "password",
				"value": this.defaultUser.passcode.default,
				"placeholder": this.defaultUser.passcode.types
			},
			"displayName":
			{
				"label": "Display Name: ",
				"type": "text",
				"value": this.defaultUser.displayName.default,
				"placeholder": this.defaultUser.displayName.types
			},
			"signUp":
			{
				"type": "submit",
				"value": "Sign-Up",
				"action": "doSignUp"
			},
			"cancel":
			{
				"type": "button",
				"value": "Cancel",
				"action": "cancelSignUp"
			}
		},
		"logInMenu":
		{
			"menuId": "logInMenu",
			"menuHeader": "Dashboard / Log-In",
			"username":
			{
				"label": "Username: ",
				"type": "text",
				"value": this.defaultUser.username.default,
				"placeholder": this.defaultUser.username.types,
				"focus": true
			},
			"passcode":
			{
				"label": "<u>Public</u> Passcode: ",
				"type": "password",
				"value": this.defaultUser.passcode.default,
				"placeholder": this.defaultUser.passcode.types
			},
			"logIn":
			{
				"type": "submit",
				"value": "Log-In",
				"action": "doLogIn"
			},
			"cancel":
			{
				"type": "button",
				"value": "Cancel",
				"action": "cancelLogIn"
			}
		},
		"dashboardMenu":
		{
			"menuId": "dashboardMenu",
			"menuHeader": "Dashboard",
			"library":
			{
				"type": "button",
				"value": "Library",
				"action": "showLibrary"
			},
			"logIn":
			{
				"type": "button",
				"value": "Log-In",
				"action": "logIn"
			},
			"signUp":
			{
				"type": "button",
				"value": "Sign-Up",
				"action": "signUp"
			},
			"account":
			{
				"type": "button",
				"value": "Account",
				"action": "showAccount"
			},
			"disconnect":
			{
				"type": "button",
				"value": "Disconnect",
				"action": "disconnectMetaverse"
			}
		},
		"libraryMenu":
		{
			"menuId": "libraryMenu",
			"menuHeader": "Dashboard / Library",
			"items":
			{
				"type": "button",
				"value": "Items",
				"action": "showLibraryItems"
			},
			"models":
			{
				"type": "button",
				"value": "Models",
				"action": "showLibraryModels"
			},
			"types":
			{
				"type": "button",
				"value": "Types",
				"action": "showLibraryTypes"
			},
			"apps":
			{
				"type": "button",
				"value": "Apps",
				"action": "showLibraryApps"
			},
			"databases":
			{
				"type": "button",
				"value": "Databases",
				"action": "showLibraryDatabases"
			},
			"platforms":
			{
				"type": "button",
				"value": "Platforms",
				"action": "showLibraryPlatforms"
			},
			"cancel":
			{
				"type": "button",
				"value": "Cancel",
				"action": "cancelLibrary"
			}
		},
		"accountMenu":
		{
			"menuId": "accountMenu",
			"menuHeader": "Dashboard / Account",
			"metaverse":
			{
				"label": "Metaverse: ",
				"type": "text",
				"value": this.root,
				"placeholder": "uri",
				"locked": true
			},
			"universe":
			{
				"label": "Universe: ",
				"type": "text",
				"value": this.universe,
				"placeholder": "string",
				"locked": true
			},
			"username":
			{
				"label": "Username: ",
				"type": "text",
				"value": this.localUser.username,
				"placeholder": "string",
				"locked": true
			},
			"displayName":
			{
				"label": "Display Name: ",
				"type": "text",
				"value": this.localUser.displayName,
				"placeholder": "string",
				"focus": true
			},
			"oldPasscode":
			{
				"label": "Old <u>Public</u> Passcode: ",
				"type": "password",
				"value": "",
				"placeholder": "string"
			},
			"newPasscode":
			{
				"label": "New <u>Public</u> Passcode: ",
				"type": "password",
				"value": "",
				"placeholder": "string"
			},
			"newPasscodeAgain":
			{
				"label": "New Passcode Again: ",
				"type": "password",
				"value": "",
				"placeholder": "string"
			},
			"changePasscode":
			{
				"type": "button",
				"value": "Change Passcode",
				"action": "changePasscode"
			},
			"save":
			{
				"type": "submit",
				"value": "Save",
				"action": "saveAccount"
			},
			"cancel":
			{
				"type": "button",
				"value": "Cancel",
				"action": "cancelAccount"
			}
		},
		"libraryItems":
		{
			"menuId": "libraryItems",
			"menuHeader": "Dashboard / Library / Items",
			"itemSelect":
			{
				"type": "select",
				"generateOptions": "libraryItems",
				"focus": true,
				"action": "libraryItemsSelectChange"
			},
			"selectItem":
			{
				"type": "submit",
				"value": "Select Item",
				"action": "selectItem"
			},
			"editItem":
			{
				"type": "button",
				"value": "Edit Item",
				"action": "showEditItem"
			},
			"newItem":
			{
				"type": "button",
				"value": "Create New Item",
				"action": "showCreateItem"
			},
			"cancel":
			{
				"type": "button",
				"value": "Cancel",
				"action": "cancelLibraryItems"
			}
		},
		"libraryModels":
		{
			"menuId": "libraryItems",
			"menuHeader": "Dashboard / Library / Models",
			"modelSelect":
			{
				"type": "select",
				"generateOptions": "libraryModels",
				"focus": true,
				"action": "libraryModelSelectChange"
			},
			"editModel":
			{
				"type": "submit",
				"value": "Edit Model",
				"action": "showEditModel"
			},
			"newModel":
			{
				"type": "button",
				"value": "Create New Model",
				"action": "showCreateModel"
			},
			"cancel":
			{
				"type": "button",
				"value": "Cancel",
				"action": "cancelLibraryModels"
			}
		},
		"libraryItemsCreate":
		{
			"menuId": "libraryItemsCreate",
			"menuHeader": "Dashboard / Library / Items / New",
			"shortcut":
			{
				"label": "Shortcut: ",
				"type": "text",
				"value": "",
				"placeholder": "uri|string",
				"focus": true
			},
			"create":
			{
				"type": "submit",
				"value": "Create Item",
				"action": "generateNewItem"
			},
			"cancel":
			{
				"type": "button",
				"value": "Cancel",
				"action": "cancelLibraryItemCreate"
			}
		},
		"libraryModelsCreate":
		{
			"menuId": "libraryModelsCreate",
			"menuHeader": "Dashboard / Library / Models / New",
		},
		"libraryItemsEdit":
		{
			"menuId": "libraryItemsEdit",
			"menuHeader": "Dashboard / Library / Items / Edit"
		},
		"libraryTypes":
		{
			"menuId": "libraryTypes",
			"menuHeader": "Dashboard / Library / Types",
			"typeSelect":
			{
				"type": "select",
				"generateOptions": "libraryTypes",
				"focus": true,
				"action": "libraryTypesSelectChange"
			},
			"editType":
			{
				"type": "submit",
				"value": "Edit Type",
				"action": "showEditType"
			},
			"newType":
			{
				"type": "button",
				"value": "Create New Type",
				"action": "showCreateType"
			},
			"cancel":
			{
				"type": "button",
				"value": "Cancel",
				"action": "cancelLibraryTypes"
			}
		},
		"libraryDatabases":
		{
			"menuId": "libraryDatabases",
			"menuHeader": "Dashboard / Library / Databases",
			"databaseSelect":
			{
				"type": "select",
				"generateOptions": "libraryDatabases",
				"focus": true,
				"action": "libraryDatabasesSelectChange"
			},
			"editDatabase":
			{
				"type": "submit",
				"value": "Edit Database",
				"action": "showEditDatabase"
			},
			"newDatabase":
			{
				"type": "button",
				"value": "Create New Database",
				"action": "showCreateDatabase"
			},
			"cancel":
			{
				"type": "button",
				"value": "Cancel",
				"action": "cancelLibraryDatabases"
			}
		},
		"libraryApps":
		{
			"menuId": "libraryApps",
			"menuHeader": "Dashboard / Library / Apps",
			"appSelect":
			{
				"type": "select",
				"generateOptions": "libraryApps",
				"focus": true,
				"action": "libraryAppsSelectChange"
			},
			"editApp":
			{
				"type": "submit",
				"value": "Edit App",
				"action": "showEditApp"
			},
			"newApp":
			{
				"type": "button",
				"value": "Create New App",
				"action": "showCreateApp"
			},
			"cancel":
			{
				"type": "button",
				"value": "Cancel",
				"action": "cancelLibraryApps"
			}
		},
		"libraryTypesCreate":
		{
			"menuId": "libraryTypesCreate",
			"menuHeader": "Dashboard / Library / Types / New",
		},
		"libraryAppsCreate":
		{
			"menuId": "libraryAppsCreate",
			"menuHeader": "Dashboard / Library / Apps / New",
		},
		"libraryTypesEdit":
		{
			"menuId": "libraryTypesEdit",
			"menuHeader": "Dashboard / Library / Types / Edit",
		},
		"libraryModelsEdit":
		{
			"menuId": "libraryModelsEdit",
			"menuHeader": "Dashboard / Library / Models / Edit",
		},
		"libraryAppsEdit":
		{
			"menuId": "libraryAppsEdit",
			"menuHeader": "Dashboard / Library / Apps / Edit",
		},
		"libraryPlatforms":
		{
			"menuId": "libraryPlatforms",
			"menuHeader": "Dashboard / Library / Platforms",
			"platformSelect":
			{
				"type": "select",
				"generateOptions": "libraryPlatforms",
				"focus": true,
				"action": "libraryPlatformsSelectChange"
			},
			"editPlatform":
			{
				"type": "submit",
				"value": "Edit Platform",
				"action": "showEditPlatform"
			},
			"newPlatform":
			{
				"type": "button",
				"value": "Create New Platform",
				"action": "showCreatePlatform"
			},
			"cancel":
			{
				"type": "button",
				"value": "Cancel",
				"action": "cancelLibraryPlatforms"
			}
		},
		"libraryDatabasesCreate":
		{
			"menuId": "libraryDatabasesCreate",
			"menuHeader": "Dashboard / Library / Databases / New",
		},
		"libraryDatabasesEdit":
		{
			"menuId": "libraryDatabasesEdit",
			"menuHeader": "Dashboard / Library / Databases / Edit",	
		},
		"libraryPlatformsCreate":
		{
			"menuId": "libraryPlatformsCreate",
			"menuHeader": "Dashboard / Library / Platforms / New",
		},
		"libraryPlatformsEdit":
		{
			"menuId": "libraryPlatformsEdit",
			"menuHeader": "Dashboard / Library / Platforms / Edit",	
		}
	};

	var x;
	var menuId;

	// MENU
	menuId = "libraryItemsEdit";
	if( !!item )
	{
		menus[menuId]["id"] = {
			"label": "ID: ",
			"type": "text",
			"value": item.info.id,
			"placeholder": "autokey",
			"locked": true
		};
	}
	for( x in this.defaultItem )
	{
		if( x === "info" )
			continue;

		menus[menuId][x] = {
			"label": this.defaultItem[x].label + ": ",
			"type": "text",
			"value": (!!item) ? item[x] : "",
			"placeholder": this.defaultItem[x].types
		};
	}
	menus[menuId]["save"] = {
		"type": "submit",
		"value": "Save",
		"action": "saveLibraryItemEdit"
	};
	menus[menuId]["cancel"] = {
		"type": "button",
		"value": "Cancel",
		"action": "cancelLibraryItemEdit"
	};

	// MENU
	menuId = "libraryModelsCreate";
	for( x in this.defaultModel )
	{
		if( x === "info" )
			continue;

		if( !this.defaultModel[x].hasOwnProperty("default") )
		{
			menus[menuId][x] = {
				"label": this.defaultModel[x].label
			};

			var y;
			for( y in this.defaultModel[x] )
			{
				if( y === "label" )
					continue;
				
				menus[menuId][x][y] = {
					"label": this.defaultModel[x][y].label + ": ",
					"type": "text",
					"value": "",
					"placeholder": this.defaultModel[x][y].types
				};
			}
		}
		else
		{
			menus[menuId][x] = {
				"label": this.defaultModel[x].label + ": ",
				"type": "text",
				"value": (!!item) ? item[x] : "",
				"placeholder": this.defaultModel[x].types
			};
		}
	}
	menus[menuId]["save"] = {
		"type": "submit",
		"value": "Save",
		"action": "createLibraryModel"
	};
	menus[menuId]["cancel"] = {
		"type": "button",
		"value": "Cancel",
		"action": "cancelLibraryModelCreate"
	};

	// MENU
	menuId = "libraryTypesCreate";
	for( x in this.defaultType )
	{
		if( x === "info" )
			continue;

		menus[menuId][x] = {
			"label": this.defaultType[x].label + ": ",
			"type": "text",
			"value": (!!item) ? item[x] : "",
			"placeholder": this.defaultType[x].types
		};
	}
	menus[menuId]["save"] = {
		"type": "submit",
		"value": "Save",
		"action": "createLibraryType"
	};
	menus[menuId]["cancel"] = {
		"type": "button",
		"value": "Cancel",
		"action": "cancelLibraryTypeCreate"
	};

/*
			"path":
			{
				"label": "Path",
				"default": "",
				"types": "string",
				"format": "/^.{2,1024}$/i",
				"formatDescription": "Executable must be a valid local file."
			},
			"type":
			{
				"label": "Type",
				"default": "",
				"types": "autokey",
				"format": "/.+$/i",
				"formatDescription": "Type must be an auto-generated key."
			}
*/

	// MENU
	menuId = "libraryAppsCreate";
	for( x in this.defaultApp )
	{
		if( x === "info" )
			continue;

		if( !this.defaultApp[x].hasOwnProperty("default") )
		{
			menus[menuId][x] = {
				"label": this.defaultApp[x].label
			};

			var y;
			for( y in this.defaultApp[x] )
			{
				if( y === "label" )
					continue;
				
				menus[menuId][x][y] = {
					"label": this.defaultApp[x][y].label + ": ",
					"type": "text",
					"value": "",
					"placeholder": this.defaultApp[x][y].types
				};
			}
		}
		else
		{
			menus[menuId][x] = {
				"label": this.defaultApp[x].label + ": ",
				"type": "text",
				"value": (!!item) ? item[x] : "",
				"placeholder": this.defaultApp[x].types
			};
		}
	}
	menus[menuId]["save"] = {
		"type": "submit",
		"value": "Save",
		"action": "createLibraryApp"
	};
	menus[menuId]["cancel"] = {
		"type": "button",
		"value": "Cancel",
		"action": "cancelLibraryAppCreate"
	};

	// MENU
	menuId = "libraryTypesEdit";
	if( !!type )
	{
		menus[menuId]["id"] = {
			"label": "ID: ",
			"type": "text",
			"value": type.info.id,
			"placeholder": "autokey",
			"locked": true
		};
	}
	for( x in this.defaultType )
	{
		if( x === "info" )
			continue;

		menus[menuId][x] = {
			"label": this.defaultType[x].label + ": ",
			"type": "text",
			"value": (!!type) ? type[x] : "",
			"placeholder": this.defaultType[x].types
		};
	}
	menus[menuId]["save"] = {
		"type": "submit",
		"value": "Save",
		"action": "updateLibraryType"
	};
	menus[menuId]["cancel"] = {
		"type": "button",
		"value": "Cancel",
		"action": "cancelLibraryTypeEdit"
	};

	// MENU
	menuId = "libraryModelsEdit";
	if( !!model )
	{
		menus[menuId]["id"] = {
			"label": "ID: ",
			"type": "text",
			"value": model.info.id,
			"placeholder": "autokey",
			"locked": true
		};
	}
	for( x in this.defaultModel )
	{
		if( x === "info" )
			continue;

		if( !!model && typeof model[x] === "object" )
		{
			//console.log(model[x]);
			menus[menuId][x] = {
				"label": this.defaultModel[x].label,
				"type": "child",
				"value": (!!model) ? model[x] : "",
				"placeholder": this.defaultModel[x]
			};
		}
		else
		{
			menus[menuId][x] = {
				"label": this.defaultModel[x].label + ": ",
				"type": "text",
				"value": (!!model) ? model[x] : "",
				"placeholder": this.defaultModel[x].types
			};
		}
	}
	menus[menuId]["save"] = {
		"type": "submit",
		"value": "Save",
		"action": "updateLibraryModel"
	};
	menus[menuId]["cancel"] = {
		"type": "button",
		"value": "Cancel",
		"action": "cancelLibraryModelEdit"
	};

	// MENU
	menuId = "libraryAppsEdit";
	if( !!app )
	{
		menus[menuId]["id"] = {
			"label": "ID: ",
			"type": "text",
			"value": app.info.id,
			"placeholder": "autokey",
			"locked": true
		};
	}
	for( x in this.defaultApp )
	{
		if( x === "info" )
			continue;

		if( !!app && typeof app[x] === "object" )
		{
			//console.log(app[x]);
			menus[menuId][x] = {
				"label": this.defaultApp[x].label + ": ",
				"type": "child",
				"value": (!!app) ? app[x] : "",
				"placeholder": this.defaultApp[x]
			};
		}
		else
		{
			menus[menuId][x] = {
				"label": this.defaultApp[x].label + ": ",
				"type": "text",
				"value": (!!app) ? app[x] : "",
				"placeholder": this.defaultApp[x].types
			};
		}
	}
	menus[menuId]["save"] = {
		"type": "submit",
		"value": "Save",
		"action": "updateLibraryApp"
	};
	menus[menuId]["cancel"] = {
		"type": "button",
		"value": "Cancel",
		"action": "cancelLibraryAppEdit"
	};

	// MENU
	menuId = "libraryDatabasesCreate";
	for( x in this.defaultDatabase )
	{
		if( x === "info" )
			continue;

		if( !this.defaultDatabase[x].hasOwnProperty("default") )
		{
			menus[menuId][x] = {
				"label": this.defaultDatabase[x].label
			};

			var y;
			for( y in this.defaultDatabase[x] )
			{
				if( y === "label" )
					continue;
				
				menus[menuId][x][y] = {
					"label": this.defaultDatabase[x][y].label + ": ",
					"type": "text",
					"value": "",
					"placeholder": this.defaultDatabase[x][y].types
				};
			}
		}
		else
		{
			menus[menuId][x] = {
				"label": this.defaultDatabase[x].label + ": ",
				"type": "text",
				"value": (!!item) ? item[x] : "",
				"placeholder": this.defaultDatabase[x].types
			};
		}
	}
	menus[menuId]["save"] = {
		"type": "submit",
		"value": "Save",
		"action": "createLibraryDatabase"
	};
	menus[menuId]["cancel"] = {
		"type": "button",
		"value": "Cancel",
		"action": "cancelLibraryDatabaseCreate"
	};

	// MENU
	menuId = "libraryPlatformsCreate";
	if( !!platform )
	{
		menus[menuId]["id"] = {
			"label": "ID: ",
			"type": "text",
			"value": platform.info.id,
			"placeholder": "autokey",
			"locked": true
		};
	}
	for( x in this.defaultPlatform )
	{
		if( x === "info" )
			continue;

		menus[menuId][x] = {
			"label": this.defaultPlatform[x].label + ": ",
			"type": "text",
			"value": (!!platform) ? platform[x] : "",
			"placeholder": this.defaultPlatform[x].types
		};
	}
	menus[menuId]["save"] = {
		"type": "submit",
		"value": "Save",
		"action": "createLibraryPlatform"
	};
	menus[menuId]["cancel"] = {
		"type": "button",
		"value": "Cancel",
		"action": "cancelLibraryPlatformCreate"
	};

	// MENU
	menuId = "libraryPlatformsEdit";
	if( !!platform )
	{
		menus[menuId]["id"] = {
			"label": "ID: ",
			"type": "text",
			"value": platform.info.id,
			"placeholder": "autokey",
			"locked": true
		};
	}
	for( x in this.defaultPlatform )
	{
		if( x === "info" )
			continue;

		menus[menuId][x] = {
			"label": this.defaultPlatform[x].label + ": ",
			"type": "text",
			"value": (!!platform) ? platform[x] : "",
			"placeholder": this.defaultPlatform[x].types
		};
	}
	menus[menuId]["save"] = {
		"type": "submit",
		"value": "Save",
		"action": "updateLibraryPlatform"
	};
	menus[menuId]["cancel"] = {
		"type": "button",
		"value": "Cancel",
		"action": "cancelLibraryPlatformEdit"
	};

	// MENU
	menuId = "libraryDatabasesEdit";
	if( !!database )
	{
		menus[menuId]["id"] = {
			"label": "ID: ",
			"type": "text",
			"value": database.info.id,
			"placeholder": "autokey",
			"locked": true
		};
	}
	for( x in this.defaultDatabase )
	{
		if( x === "info" )
			continue;

		if( !!database && typeof database[x] === "object" )
		{
			//console.log(model[x]);
			menus[menuId][x] = {
				"label": this.defaultDatabase[x].label,
				"type": "child",
				"value": (!!database) ? database[x] : "",
				"placeholder": this.defaultDatabase[x]
			};
		}
		else
		{
			menus[menuId][x] = {
				"label": this.defaultDatabase[x].label + ": ",
				"type": "text",
				"value": (!!database) ? database[x] : "",
				"placeholder": this.defaultDatabase[x].types
			};
		}
/*
		menus[menuId][x] = {
			"label": this.defaultDatabase[x].label + ": ",
			"type": "text",
			"value": (!!database) ? database[x] : "",
			"placeholder": this.defaultDatabase[x].types
		};
		*/
	}
	menus[menuId]["save"] = {
		"type": "submit",
		"value": "Save",
		"action": "updateLibraryDatabase"
	};
	menus[menuId]["cancel"] = {
		"type": "button",
		"value": "Cancel",
		"action": "cancelLibraryDatabaseEdit"
	};

	return menus;
};

Metaverse.prototype.tokenize = function(string)
{
	return string.split(/[,\s]+/g);
};

Metaverse.prototype.showMenu = function(menuId, options)
{
	//console.log(this.getMenus(options)[menuId]);
	//console.log(options);
	//this.eventHandler("showMenu", this.getMenus(options)[menuId]);
	this.eventHandler("showMenu", this.getMenus(options)[menuId]);
};

Metaverse.prototype.menuAction = function(actionName, actionData)
{
	if( actionName === "quickJoin" )
	{
		this.eventHandler("freezeInputs");
		this.connect(this.quickJoinAddress, function(error)
		{
			if( !!error )
			{
				this.error = error;
				this.eventHandler("error", this.error);
				this.eventHandler("unfreezeInputs");
				return;
			}
			else
				this.showMenu("universeMenu");
		}.bind(this));
	}
	else if( actionName === "cancelUniverse" )
	{
		this.reset();
		this.showMenu("metaverseMenu");
	}
	else if( actionName === "firebaseConnect" )
	{
		this.showMenu("firebaseConnectMenu");
	}
	else if( actionName === "cancelFirebaseConnect" )
	{
		this.reset();
		this.showMenu("metaverseMenu");
	}
	else if( actionName === "connectToFirebase" )
	{
		this.eventHandler("freezeInputs");

		var address = actionData["address"].value;
		this.connect(address, function(error)
		{
			if( !!error )
			{
				this.error = error;
				this.eventHandler("showError", this.error);
				this.eventHandler("unfreezeInputs");
				return;
			}
			else
			{
				this.showMenu("universeMenu");
			}
		}.bind(this));
	}
	else if( actionName === "joinUniverse" )
	{
		this.eventHandler("freezeInputs");

		var universeId = actionData["universeSelect"].options[actionData["universeSelect"].selectedIndex].value;
		this.joinUniverse(universeId, function(error)
		{
			if( !!error )
			{
				this.error = error;
				this.eventHandler("error", this.error);
				this.eventHandler("unfreezeInputs");
				return;
			}

			this.showMenu("dashboardMenu");
		}.bind(this));
	}
	else if( actionName === "newUniverse" )
	{
		this.showMenu("newUniverseMenu");
	}
	else if( actionName === "createUniverse" )
	{
		this.eventHandler("freezeInputs");

		var title = actionData["title"].value;
		this.createUniverse(title, function(universeId)
		{
			if( !!!universeId )
			{
				this.eventHandler("error", this.error);
				this.eventHandler("unfreezeInputs");
				return;
			}
			
			this.joinUniverse(universeId, function(error)
			{
				if( !!error )
				{
					this.error = error;
					this.eventHandler("error", this.error);
					this.showMenu("universeMenu");
					return;
				}

				this.showMenu("signUpMenu");
			}.bind(this));
		}.bind(this));
	}
	else if( actionName === "cancelNewUniverse" )
	{
		this.showMenu("universeMenu");
	}
	else if( actionName === "disconnectMetaverse" )
	{
		this.reset();
		this.showMenu("metaverseMenu");
	}
	else if( actionName === "signUp" )
	{
		this.showMenu("signUpMenu");
	}
	else if( actionName === "cancelSignUp" )
	{
		this.showMenu("dashboardMenu");
	}
	else if( actionName === "doSignUp" )
	{
		this.eventHandler("freezeInputs");

		var userData = {};
		var x;
		for( x in actionData )
		{
			if( actionData[x].type !== "button" && actionData[x].type !== "submit" )
				userData[x] = actionData[x].value;
		}

		this.createUser(userData, function(responseData)
		{
			if( !!!responseData )
			{
				this.eventHandler("error", this.error);
				this.eventHandler("unfreezeInputs");
				return;
			}

			this.logIn(responseData.username, actionData["passcode"].value, function(error)
			{
				if( !!error )
				{
					this.error = error;
					this.eventHandler("error", this.error);
					this.showMenu("logInMenu");
					return;
				}

				this.showMenu("dashboardMenu");
			}.bind(this));
		}.bind(this));
	}
	else if( actionName === "logIn" )
	{
		this.showMenu("logInMenu");
	}
	else if( actionName === "doLogIn" )
	{
		this.eventHandler("freezeInputs");

		var username = actionData["username"].value;
		var passcode = actionData["passcode"].value;
		this.logIn(username, passcode, function(error)
		{
			if( !!error )
			{
				this.error = error;
				this.eventHandler("error", this.error);
				this.eventHandler("unfreezeInputs");
				return;
			}
			
			this.showMenu("dashboardMenu");
		}.bind(this));
	}
	else if( actionName === "cancelLogIn" )
	{
		this.showMenu("dashboardMenu");
	}
	else if( actionName === "showLibrary" )
	{
		this.showMenu("libraryMenu");
	}
	else if( actionName === "cancelLibrary" )
	{
		this.showMenu("dashboardMenu");
	}
	else if( actionName === "showAccount" )
	{
		this.showMenu("accountMenu");
	}
	else if( actionName === "cancelAccount" )
	{
		this.showMenu("dashboardMenu");
	}
	else if( actionName === "changePasscode" )
	{
		actionData["changePasscode"].style.display = "none";
		actionData["oldPasscode"].parentNode.style.display = "block";
		actionData["newPasscode"].parentNode.style.display = "block";
		actionData["newPasscodeAgain"].parentNode.style.display = "block";
	}
	else if( actionName === "saveAccount" )
	{
		this.eventHandler("freezeInputs");

		var data = {};
		var x;
		for( x in actionData )
		{
			if( actionData[x].type !== "button" && actionData[x].type !== "submit" && x !== "metaverse" && x !== "universe" && x !== "oldPasscode" && x !== "newPasscode" && x !== "newPasscodeAgain" )
				data[x] = actionData[x].value;
		}

		if( actionData["oldPasscode"].parentNode.style.display !== "none" )
		{
			if( this.encodePasscode(actionData["oldPasscode"].value) !== this.localUser.passcode )
			{
				this.error = new Error("Incorrect public passcode.");
				this.eventHandler("error", this.error);
				this.eventHandler("unfreezeInputs");
				return;
			}

			if( actionData["newPasscode"].value !== actionData["newPasscodeAgain"].value )
			{
				this.error = new Error("New public passcodes do not match.");
				this.eventHandler("error", this.error);
				this.eventHandler("unfreezeInputs");
				return;
			}

			if( actionData["newPasscode"].value === "" || actionData["newPasscode"].value.length <= 5 )
			{
				this.error = new Error("Public passcodes must be at least 6 characters long.");
				this.eventHandler("error", this.error);
				this.eventHandler("unfreezeInputs");
				return;
			}

			data.passcode = this.encodePasscode(actionData["newPasscode"].value);
		}

		if( !this.validateData(data, this.defaultUser) )
		{
			this.eventHandler("unfreezeInputs");
			return;
		}

		this.updateLocalUser(data, function(error)
		{
			if( !!error )
			{
				this.error = error;
				this.eventHandler("error", this.error);
				this.eventHandler("unfreezeInputs");
				return;
			}

			this.showMenu("dashboardMenu");
		}.bind(this));
	}
	else if( actionName === "cancelLibraryItems" )
	{
		this.showMenu("libraryMenu");
	}
	else if( actionName === "cancelLibraryModels" )
	{
		this.showMenu("libraryMenu");
	}
	else if( actionName === "showLibraryItems" )
	{
		this.showMenu("libraryItems");
	}
	else if( actionName === "showLibraryModels" )
	{
		this.showMenu("libraryModels");
	}
	else if( actionName === "selectItem" )
	{
		console.log("Yarrr");
	}
	else if( actionName === "showEditItem" )
	{
		this.showMenu("libraryItemsEdit", {"itemId": actionData["itemSelect"].options[actionData["itemSelect"].selectedIndex].value});
	}
	else if( actionName === "cancelLibraryItemEdit" )
	{
		this.showMenu("libraryItems");
	}
	else if( actionName === "showCreateItem" )
	{
		this.showMenu("libraryItemsCreate");
	}
	else if( actionName === "showCreateModel" )
	{
		this.showMenu("libraryModelsCreate");
	}
	else if( actionName === "cancelLibraryItemCreate" )
	{
		this.showMenu("libraryItems");
	}
	else if( actionName === "cancelLibraryModelCreate" )
	{
		this.showMenu("libraryModels");
	}
	else if( actionName === "generateNewItem" )
	{
		this.eventHandler("freezeInputs");

		if( actionData["shortcut"].value.length <= 2 )
		{
			this.error = new Error("Shortcuts must be at least 3 characters long.");
			this.eventHandler("error", this.error);
			this.eventHandler("unfreezeInputs");
			return;
		}

		// Generate the item.
		var file = actionData["shortcut"].value;

		var item = {};
		item.type = this.generateType(file);
		item.title = this.generateTitle(file, item.type);
		item.file = file;
		item.app = "";
		item.description = "";
		item.preview = "";
		item.reference = "";
		item.download = "";
		item.stream = "";
		item.model = "";
		item.marquee = "";
		item.screen = "";

		// Now that the item is constructed, let's check for an existing twin.
		this.findTwinLibraryObject("Item", item, function(twin)
		{
			if( !!twin )
			{
				this.error = new Error("A version of that item already exists!");
				this.eventListener("error", this.error);
				this.eventHandler("unfreezeInputs");
				return;
			}

			// FIXME: This must be changed into an async loop!! (Right now it just uses the 1st applicable database then quits.)
			// However, it's only worth it to check the next database if it at least has the POTENTIAL to fill in missing fields.
			// This means further complicating Database definitions to specify beforehand which item fields they are able to fill.

			// IDEA: Perhaps each database, in addition to their singleQuery handler, could also have a getInfo handler that responds
			// with field names that the database is able to fill. (BUT WOULD THIS BE BETTER THAN LOCALLY DEFINING??? ANY ADDITIONAL USES FOR THE INFO RESPONSE????? ABORT THIS IDEA IF NOT.)

			// REMEMBER: The 1st database hit will usually be enough, ESPECIALLY for singleQueries.
			// POSTPONE FOR NOW!!! Come back to this after you have added MORE than just singleQuery to the databases structure.

			var async = false;
			var x;
			for( x in this.library.databases )
			{
				if( !this.library.databases[x].current.typeAliases.hasOwnProperty(item.type) )
					continue;

				var x;
				for( x in this.library.databases )
				{
					// If no item twin has been found yet, let's scout some more info and try again.
					var encodedItem = this.encodeRFC5987ValueChars(encodeURIComponent(JSON.stringify(item)));
					var request = new XMLHttpRequest();
					var requestURL = this.library.databases[x].current.singleQueryUri + "?item=" + encodedItem;//"http://metaverse.anarchyarcade.com/tubeinfo.php?id=" + this.extractYouTubeId(item.file);

					request.onreadystatechange = function()
					{
						if( request.readyState === 4 && request.status === 200 )
						{
							var response = JSON.parse(request.responseText);
							//console.log(response);
							var data = response.data;

							// Types returned by databases may be aliases!!
							if( data.hasOwnProperty("type") && !this.library.types.hasOwnProperty(data.type) )
							{
								// probably an alias at this point.
								var typeAliases = this.library.databases[x].typeAliases;

								// FIXME: Needs to be updated to tokenize aliases!!

								var aliases;
								var foundType = false;
								var y;
								for( y in typeAliases )
								{
									var aliases = this.tokenize(typeAliases[y].aliases);
									//if( typeAliases[y].aliases === data.type )
									if( aliases.indexOf(data.type) >= 0)
									{
										data.type = y;
										foundType = true;
										break;
									}
								}
console.log("yarbles");
								// If no type match was found, replace it with the original type.
								if( !foundType )
									data.type = item.type;
							}

							var x;
							for( x in data )
							{
								if( item.hasOwnProperty(x) )
									item[x] = data[x];
							}
							
							onShouldCreate.call(this);
						}
						else if( request.status >= 500 )
						{
							onShouldCreate.call(this);
						}
					}.bind(this);

					request.open("GET", requestURL, true);
					request.send();

					async = true;
					break;
				}
			}

			if( !async )
				onShouldCreate.call(this);

			function onShouldCreate()
			{
				// Add the item.
				this.createLibraryObject("Item", item, function(itemId)
				{
					if( !!!itemId )
					{
						if( !!this.error )
						{
							this.eventHandler("error", this.error);
							this.eventHandler("unfreezeInputs");
						}
						return;
					}

					this.showMenu("libraryItems");
				}.bind(this));
			}
		}.bind(this));
	}
	else if( actionName === "saveLibraryItemEdit" )
	{
		this.eventHandler("freezeInputs");

		var data = {};
		var x;
		for( x in actionData )
		{
			if( actionData[x].type !== "button" && actionData[x].type !== "submit" && x !== "id" )
				data[x] = actionData[x].value;
		}

		data.info = {"id": actionData["id"].value};

		this.updateLibraryObject("Item", data, function(itemId)
		{
			if( !!!itemId )
			{
				if( !!this.error )
				{
					this.eventHandler("error", this.error);
					this.eventHandler("unfreezeInputs");
					return;
				}

				return;
			}

			this.showMenu("libraryItems");
		}.bind(this));
	}
	else if( actionName === "showLibraryTypes" )
	{
		this.showMenu("libraryTypes");
	}
	else if( actionName === "showLibraryDatabases" )
	{
		this.showMenu("libraryDatabases");
	}
	else if( actionName === "showLibraryApps" )
	{
		this.showMenu("libraryApps");
	}
	else if( actionName === "cancelLibraryTypes" )
	{
		this.showMenu("libraryMenu");
	}
	else if( actionName === "cancelLibraryDatabases" )
	{
		this.showMenu("libraryMenu");
	}
	else if( actionName === "cancelLibraryApps" )
	{
		this.showMenu("libraryMenu");
	}
	else if( actionName === "showCreateType" )
	{
		this.showMenu("libraryTypesCreate");
	}
	else if( actionName === "showCreateApp" )
	{
		this.showMenu("libraryAppsCreate");
	}
	else if( actionName === "cancelLibraryTypeCreate" )
	{
		this.showMenu("libraryTypes");
	}
	else if( actionName === "cancelLibraryAppCreate" )
	{
		this.showMenu("libraryApps");
	}
	else if( actionName === "createLibraryModel" )
	{
		this.eventHandler("freezeInputs");

		var data = {};
		var x;
		for( x in actionData )
		{
			if( !(actionData[x] instanceof HTMLElement) )
			{
				data[x] = {};

				var y;
				for( y in actionData[x] )
				{
					data[x][y] = {};

					var z;
					for( z in actionData[x][y] )
						data[x][y][z] = actionData[x][y][z].value;
				}
			}
			else if( actionData[x].type !== "button" && actionData[x].type !== "submit" )
				data[x] = actionData[x].value;
		}

		// data MUST have platforms object
		//if( !data.hasOwnProperty("platforms") )
			//data.platforms = {};

		this.createLibraryObject("Model", data, function(modelId)
		{
			if( !!!modelId )
			{
				if( !!this.error )
				{
					this.eventHandler("error", this.error);
					this.eventHandler("unfreezeInputs");
					return;
				}

				return;
			}

			this.showMenu("libraryModels");
		}.bind(this));
	}
	else if( actionName === "createLibraryApp" )
	{
		this.eventHandler("freezeInputs");

		var data = {};
		var x;
		for( x in actionData )
		{
			if( !(actionData[x] instanceof HTMLElement) )
			{
				data[x] = {};

				var y;
				for( y in actionData[x] )
				{
					data[x][y] = {};

					var z;
					for( z in actionData[x][y] )
						data[x][y][z] = actionData[x][y][z].value;
				}
			}
			else if( actionData[x].type !== "button" && actionData[x].type !== "submit" )
				data[x] = actionData[x].value;
		}

		// data MUST have filePaths object
		//if( !data.hasOwnProperty("filePaths") )
		//	data.filePaths = {};

		this.createLibraryObject("App", data, function(appId)
		{
			if( !!!appId )
			{
				if( !!this.error )
				{
					this.eventHandler("error", this.error);
					this.eventHandler("unfreezeInputs");
					return;
				}

				return;
			}

			this.showMenu("libraryApps");
		}.bind(this));
	}
	else if( actionName === "createLibraryType" )
	{
		this.eventHandler("freezeInputs");

		var data = {};
		var x;
		for( x in actionData )
		{
			if( actionData[x].type !== "button" && actionData[x].type !== "submit" )
				data[x] = actionData[x].value;
		}

		this.createLibraryObject("Type", data, function(typeId)
		{
			if( !!!typeId )
			{
				if( !!this.error )
				{
					this.eventHandler("error", this.error);
					this.eventHandler("unfreezeInputs");
					return;
				}

				return;
			}

			this.showMenu("libraryTypes");
		}.bind(this));
	}
	else if( actionName === "showEditType" )
	{
		this.showMenu("libraryTypesEdit", {"typeId": actionData["typeSelect"].options[actionData["typeSelect"].selectedIndex].value});
	}
	else if( actionName === "showEditModel" )
	{
		this.showMenu("libraryModelsEdit", {"modelId": actionData["modelSelect"].options[actionData["modelSelect"].selectedIndex].value});
	}
	else if( actionName === "showEditApp" )
	{
		this.showMenu("libraryAppsEdit", {"appId": actionData["appSelect"].options[actionData["appSelect"].selectedIndex].value});
	}
	else if( actionName === "cancelLibraryTypeEdit" )
	{
		this.showMenu("libraryTypes");
	}
	else if( actionName === "cancelLibraryModelEdit" )
	{
		this.showMenu("libraryModels");
	}
	else if( actionName === "cancelLibraryAppEdit" )
	{
		this.showMenu("libraryApps");
	}
	else if( actionName === "updateLibraryModel" )
	{
		this.eventHandler("freezeInputs");

		var data = {};
		var x;
		for( x in actionData )
		{
			if( actionData[x].type !== "button" && actionData[x].type !== "submit" && x !== "id" )
			{
				if( actionData[x].type === undefined )
				{
					data[x] = {};

					var y;
					for( y in actionData[x] )
					{
						data[x][y] = {};
						var z;
						for( z in actionData[x][y] )
							data[x][y][z] = actionData[x][y][z].value;
					}
				}
				else
					data[x] = actionData[x].value;
			}
		}

		data.info = {"id": actionData["id"].value};

		// data MUST have platforms object
		//if( !data.hasOwnProperty("platforms") )
			//data.platforms = {};

		this.updateLibraryObject("Model", data, function(modelId)
		{
			if( !!!modelId )
			{
				if( !!this.error )
				{
					this.eventHandler("error", this.error);
					this.eventHandler("unfreezeInputs");
					return;
				}

				return;
			}

			this.showMenu("libraryModels");
		}.bind(this));
	}
	else if( actionName === "updateLibraryApp" )
	{
		this.eventHandler("freezeInputs");

		var data = {};
		var x;
		for( x in actionData )
		{
			if( actionData[x].type !== "button" && actionData[x].type !== "submit" && x !== "id" )
			{
				if( actionData[x].type === undefined )
				{
					data[x] = {};

					var y;
					for( y in actionData[x] )
					{
						data[x][y] = {};
						var z;
						for( z in actionData[x][y] )
							data[x][y][z] = actionData[x][y][z].value;
					}
				}
				else
					data[x] = actionData[x].value;
			}
		}

		data.info = {"id": actionData["id"].value};

		// data MUST have filePaths object
//		if( !data.hasOwnProperty("filePaths") )
//			data.filePaths = {};

		this.updateLibraryObject("App", data, function(appId)
		{
			if( !!!appId )
			{
				if( !!this.error )
				{
					this.eventHandler("error", this.error);
					this.eventHandler("unfreezeInputs");
					return;
				}

				return;
			}

			this.showMenu("libraryApps");
		}.bind(this));
	}
	else if( actionName === "updateLibraryType" )
	{
		this.eventHandler("freezeInputs");

		var data = {};
		var x;
		for( x in actionData )
		{
			if( actionData[x].type !== "button" && actionData[x].type !== "submit" && x !== "id" )
				data[x] = actionData[x].value;
		}

		data.info = {"id": actionData["id"].value};

		this.updateLibraryObject("Type", data, function(typeId)
		{
			if( !!!typeId )
			{
				if( !!this.error )
				{
					this.eventHandler("error", this.error);
					this.eventHandler("unfreezeInputs");
					return;
				}

				return;
			}

			this.showMenu("libraryTypes");
		}.bind(this));
	}
	else if( actionName === "showLibraryPlatforms" )
	{
		this.showMenu("libraryPlatforms");
	}
	else if( actionName === "cancelLibraryPlatforms" )
	{
		this.showMenu("libraryMenu");
	}
	else if( actionName === "cancelLibraryDatabaseCreate" )
	{
		this.showMenu("libraryDatabases");
	}
	else if( actionName === "cancelLibraryPlatformCreate" )
	{
		this.showMenu("libraryPlatforms");
	}
	else if( actionName === "cancelLibraryDatabaseEdit" )
	{
		this.showMenu("libraryDatabases");
	}
	else if( actionName === "cancelLibraryPlatformEdit" )
	{
		this.showMenu("libraryPlatforms");
	}
	else if( actionName === "showCreateDatabase" )
	{
		this.showMenu("libraryDatabasesCreate");
	}
	else if( actionName === "showCreatePlatform" )
	{
		this.showMenu("libraryPlatformsCreate");
	}
	else if( actionName === "showEditDatabase" )
	{
		this.showMenu("libraryDatabasesEdit", {"databaseId": actionData["databaseSelect"].options[actionData["databaseSelect"].selectedIndex].value});
	}
	else if( actionName === "showEditPlatform" )
	{
		this.showMenu("libraryPlatformsEdit", {"platformId": actionData["platformSelect"].options[actionData["platformSelect"].selectedIndex].value});
	}
	else if( actionName === "createLibraryDatabase" )
	{
		this.eventHandler("freezeInputs");

		var data = {};
		var x;
		for( x in actionData )
		{
			if( !(actionData[x] instanceof HTMLElement) )
			{
				data[x] = {};

				var y;
				for( y in actionData[x] )
				{
					data[x][y] = {};

					var z;
					for( z in actionData[x][y] )
						data[x][y][z] = actionData[x][y][z].value;
				}
			}
			else if( actionData[x].type !== "button" && actionData[x].type !== "submit" )
				data[x] = actionData[x].value;
		}

		this.createLibraryObject("Database", data, function(databaseId)
		{
			if( !!!databaseId )
			{
				if( !!this.error )
				{
					this.eventHandler("error", this.error);
					this.eventHandler("unfreezeInputs");
					return;
				}

				return;
			}

			this.showMenu("libraryDatabases");
		}.bind(this));
	}
	else if( actionName === "createLibraryPlatform" )
	{
		this.eventHandler("freezeInputs");

		var data = {};
		var x;
		for( x in actionData )
		{
			if( actionData[x].type !== "button" && actionData[x].type !== "submit" )
				data[x] = actionData[x].value;
		}

		this.createLibraryObject("Platform", data, function(platformId)
		{
			if( !!!platformId )
			{
				if( !!this.error )
				{
					this.eventHandler("error", this.error);
					this.eventHandler("unfreezeInputs");
					return;
				}

				return;
			}

			this.showMenu("libraryPlatforms");
		}.bind(this));
	}
	else if( actionName === "updateLibraryDatabase" )
	{
		this.eventHandler("freezeInputs");

		var data = {};
		var x;
		for( x in actionData )
		{
			if( actionData[x].type !== "button" && actionData[x].type !== "submit" && x !== "id" )
			{
				if( actionData[x].type === undefined )
				{
					data[x] = {};

					var y;
					for( y in actionData[x] )
					{
						data[x][y] = {};
						var z;
						for( z in actionData[x][y] )
							data[x][y][z] = actionData[x][y][z].value;
					}
				}
				else
					data[x] = actionData[x].value;
			}
		}

		data.info = {"id": actionData["id"].value};

		// data MUST have platforms object
		//if( !data.hasOwnProperty("platforms") )
			//data.platforms = {};

		this.updateLibraryObject("Database", data, function(databaseId)
		{
			if( !!!databaseId )
			{
				if( !!this.error )
				{
					this.eventHandler("error", this.error);
					this.eventHandler("unfreezeInputs");
					return;
				}

				return;
			}

			this.showMenu("libraryDatabases");
		}.bind(this));
		/*
		this.eventHandler("freezeInputs");

		var data = {};
		var x;
		for( x in actionData )
		{
			if( actionData[x].type !== "button" && actionData[x].type !== "submit" && x !== "id" )
				data[x] = actionData[x].value;
		}

		data.info = {"id": actionData["id"].value};

		this.updateLibraryObject("Database", data, function(databaseId)
		{
			if( !!!databaseId )
			{
				if( !!this.error )
				{
					this.eventHandler("error", this.error);
					this.eventHandler("unfreezeInputs");
					return;
				}

				return;
			}

			this.showMenu("libraryDatabases");
		}.bind(this));
*/
	}
	else if( actionName === "updateLibraryPlatform" )
	{
		this.eventHandler("freezeInputs");

		var data = {};
		var x;
		for( x in actionData )
		{
			if( actionData[x].type !== "button" && actionData[x].type !== "submit" && x !== "id" )
				data[x] = actionData[x].value;
		}

		data.info = {"id": actionData["id"].value};

		this.updateLibraryObject("Platform", data, function(platformId)
		{
			if( !!!platformId )
			{
				if( !!this.error )
				{
					this.eventHandler("error", this.error);
					this.eventHandler("unfreezeInputs");
					return;
				}

				return;
			}

			this.showMenu("libraryPlatforms");
		}.bind(this));
	}
};

Metaverse.prototype.findType = function(title)
{
	var x, type;
	for( x in this.library.types )
	{
		type = this.library.types[x].current;
		if( type.title == title )
			return type;
	}

	return null;
};

// Based on: https://gist.github.com/mikelehen/3596a30bd69384624c11
Metaverse.prototype.generatePushId = function()
{
	var PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

	var now = new Date().getTime();
	var duplicateTime = (now === this.lastPushTime);
	this.lastPushTime = now;

	var timeStampChars = new Array(8);
	for (var i = 7; i >= 0; i--) {
		timeStampChars[i] = PUSH_CHARS.charAt(now % 64);
		// NOTE: Can't use << here because javascript will convert to int and lose the upper bits.
		now = Math.floor(now / 64);
	}
	if (now !== 0) throw new Error('We should have converted the entire timestamp.');

	var id = timeStampChars.join('');

	if (!duplicateTime) {
		for (i = 0; i < 12; i++) {
			this.lastRandChars[i] = Math.floor(Math.random() * 64);
		}
	} else {
		// If the timestamp hasn't changed since last push, use the same random number, except incremented by 1.
		for (i = 11; i >= 0 && this.lastRandChars[i] === 63; i--) {
			this.lastRandChars[i] = 0;
		}
		this.lastRandChars[i]++;
	}
	for (i = 0; i < 12; i++) {
		id += PUSH_CHARS.charAt(this.lastRandChars[i]);
	}
	if(id.length != 20) throw new Error('Length should be 20.');

	return id;
};

Metaverse.prototype.reset = function()
{
	// Unregister change listeners
	var x;

	if( this.libraryRef )
	{
		this.libraryRef.child("items").off();
		for( x in this.library.items )
			this.libraryRef.child("items").child(this.library.items[x].current.info.id).child("current").off();

		this.libraryRef.child("models").off();
		for( x in this.library.models )
			this.libraryRef.child("models").child(this.library.models[x].current.info.id).child("current").off();
	
		this.libraryRef.child("types").off();
		for( x in this.library.types )
			this.libraryRef.child("types").child(this.library.types[x].current.info.id).child("current").off();

		this.libraryRef.child("databases").off();
		for( x in this.library.databases )
			this.libraryRef.child("databases").child(this.library.databases[x].current.info.id).child("current").off();

		this.libraryRef.child("platforms").off();
		for( x in this.library.platforms )
			this.libraryRef.child("platforms").child(this.library.platforms[x].current.info.id).child("current").off();
	}

	if( this.usersRef )
		this.usersRef.off();

	if( this.connectedRef )
		this.connectedRef.off();

	if( this.localUserRef )
		this.localUserRef.off();

	Firebase.goOffline();

	this.users = {};
	this.library = {
		"items": {},
		"models": {},
		"types": {},
		"apps": {},
		"databases": {},
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
	this.universeTitles = {};
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

		function getUniverseTitles()
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
							this.rootRef.child(objectKeys[count]).child("info").child("title").once("value", function(snapshot)
							{
								count++;

								if( snapshot.exists() )
								{
									var val = snapshot.val();
									var key = snapshot.key();
									universeKeys[objectKeys[count-1]] = val;

									if( count < len )
										this.rootRef.child(objectKeys[count]).child("info").child("title").once("value", arguments.callee.bind(this));
								}

								if( count >= len )
									onGotUniverseTitles.call(this, universeKeys);
							}.bind(this));
						}
						else
							onGotUniverseTitles.call(this, universeKeys);

						function onGotUniverseTitles(universeKeys)
						{
							this.universeTitles = universeKeys;
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

		this.universeTitles = {};
		getUniverseTitles.call(this);
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

Metaverse.prototype.createUniverse = function(title, callback)
{
	if( !this.validateData({"title": title}, this.defaultUniverse.info, callback) )
		return;

	var ref = this.rootRef.push();
	var key = ref.key();
	var data = {
		"info":
		{
			"id": key,
			"title": title,
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
			this.universeTitles[key] = data.info.name;
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
		"models": {},
		"types": {},
		"apps": {},
		"databases": {},
		"platforms": {}
	};

	this.libraryRef.child("items").on("child_added", this.itemAdded.bind(this))
	this.libraryRef.child("items").on("child_removed", this.itemRemoved.bind(this));

	this.libraryRef.child("models").on("child_added", this.modelAdded.bind(this))
	this.libraryRef.child("models").on("child_removed", this.modelRemoved.bind(this));

	this.libraryRef.child("types").on("child_added", this.typeAdded.bind(this))
	this.libraryRef.child("types").on("child_removed", this.typeRemoved.bind(this));

	this.libraryRef.child("databases").on("child_added", this.databaseAdded.bind(this))
	this.libraryRef.child("databases").on("child_removed", this.databaseRemoved.bind(this));

	this.libraryRef.child("platforms").on("child_added", this.platformAdded.bind(this))
	this.libraryRef.child("platforms").on("child_removed", this.platformRemoved.bind(this));

	this.libraryRef.child("apps").on("child_added", this.appAdded.bind(this))
	this.libraryRef.child("apps").on("child_removed", this.appRemoved.bind(this));

	this.usersRef.on("child_added", this.userAdded.bind(this));
	this.usersRef.on("child_removed", this.userRemoved.bind(this));

	callback();
};

Metaverse.prototype.userAdded = function(child, prevChildKey)
{
	var key = child.key();
	console.log("Downloaded metaverse information for user " + key);
	this.users[key] = child.val();
};

Metaverse.prototype.userRemoved = function(child)
{
	console.log("User removed.");
	delete this.users[child.key()];
};

Metaverse.prototype.itemAdded = function(child, prevChildKey)
{
	var key = child.key();
	console.log("Downloaded metaverse information for item " + key);
	this.library.items[key] = child.val();
	this.libraryRef.child("items").child(key).child("current").on("value", this.itemChanged.bind(this));
};

Metaverse.prototype.itemRemoved = function(child)
{
	console.log("Item removed.");
	delete this.library.items[child.key()];
};

Metaverse.prototype.itemChanged = function(child, prevChildKey)
{
	var val = child.val();
	this.library.items[val.info.id].current = val;
};

Metaverse.prototype.modelAdded = function(child, prevChildKey)
{
	var key = child.key();
	console.log("Downloaded metaverse information for model " + key);

	// Make sure the model has all required fields.
	var val = child.val();
	var x;
	for( x in this.defaultModel )
	{
		if( !val.current.hasOwnProperty(x) )
		{
			// Assume it is an empty container object.
			val.current[x] = {};
		}
	}

	this.library.models[key] = val;
	this.libraryRef.child("models").child(key).child("current").on("value", this.modelChanged.bind(this));
};

Metaverse.prototype.modelRemoved = function(child)
{
	console.log("Model removed.");
	delete this.library.models[child.key()];
};

Metaverse.prototype.modelChanged = function(child, prevChildKey)
{
	var val = child.val();

	// Make sure the model has all required fields.
	var x;
	for( x in this.defaultModel )
	{
		if( !val.hasOwnProperty(x) )
		{
			// Assume it is an empty container object.
			val[x] = {};
		}
	}

	this.library.models[val.info.id].current = val;
};

Metaverse.prototype.typeAdded = function(child, prevChildKey)
{
	var key = child.key();
	console.log("Downloaded metaverse information for type " + key);

	this.library.types[key] = child.val();
	this.libraryRef.child("types").child(key).child("current").on("value", this.typeChanged.bind(this));
};

Metaverse.prototype.typeRemoved = function(child)
{
	console.log("Type removed.");
	delete this.library.types[child.key()];
};

Metaverse.prototype.appAdded = function(child, prevChildKey)
{
	var key = child.key();
	console.log("Downloaded metaverse information for app " + key);

	// Make sure the app has all required fields.
	var val = child.val();
	var x;
	for( x in this.defaultApp )
	{
		if( !val.current.hasOwnProperty(x) )
		{
			// Assume it is an empty container object.
			val.current[x] = {};
		}
	}

	this.library.apps[key] = val;
	this.libraryRef.child("apps").child(key).child("current").on("value", this.appChanged.bind(this));
};

Metaverse.prototype.appRemoved = function(child)
{
	console.log("App removed.");
	delete this.library.apps[child.key()];
};

Metaverse.prototype.appChanged = function(child, prevChildKey)
{
	var val = child.val();

	// Make sure the app has all required fields.
	var x;
	for( x in this.defaultApp )
	{
		if( !val.hasOwnProperty(x) )
		{
			// Assume it is an empty container object.
			val[x] = {};
		}
	}

	this.library.apps[val.info.id].current = val;
};

Metaverse.prototype.typeChanged = function(child, prevChildKey)
{
	var val = child.val();
	this.library.types[val.info.id].current = val;
};

Metaverse.prototype.databaseAdded = function(child, prevChildKey)
{
	var key = child.key();
	console.log("Downloaded metaverse information for database " + key);

	// Make sure the database has all required fields.
	var val = child.val();
	var x;
	for( x in this.defaultDatabase )
	{
		if( !val.current.hasOwnProperty(x) )
		{
			// Assume it is an empty container object.
			val.current[x] = {};
		}
	}

	this.library.databases[key] = val;
	this.libraryRef.child("databases").child(key).child("current").on("value", this.databaseChanged.bind(this));
};

Metaverse.prototype.databaseRemoved = function(child)
{
	console.log("Database removed.");
	delete this.library.databases[child.key()];
};

Metaverse.prototype.databaseChanged = function(child, prevChildKey)
{
	var val = child.val();

	// Make sure the database has all required fields.
	var x;
	for( x in this.defaultDatabase )
	{
		if( !val.hasOwnProperty(x) )
		{
			// Assume it is an empty container object.
			val[x] = {};
		}
	}
	
	this.library.databases[val.info.id].current = val;
};

Metaverse.prototype.platformAdded = function(child, prevChildKey)
{
	var key = child.key();
	console.log("Downloaded metaverse information for platform " + key);

	this.library.platforms[key] = child.val();
	this.libraryRef.child("platforms").child(key).child("current").on("value", this.platformChanged.bind(this));
};

Metaverse.prototype.platformRemoved = function(child)
{
	console.log("Platform removed.");
	delete this.library.platforms[child.key()];
};

Metaverse.prototype.platformChanged = function(child, prevChildKey)
{
	var val = child.val();
	this.library.platforms[val.info.id].current = val;
};

Metaverse.prototype.getUniverseKey = function(universeTitle)
{
	var x;
	for( x in this.universeTitles)
	{
		if( this.universeTitles[x] === universeTitle )
			return x;
	}

	return;
};

Metaverse.prototype.getUniverseName = function(universeKey)
{
	return this.universeTitles[universeKey];
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
								"ban": true,
								"purge": true,
								"rollback": true,
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

					function onOwnerResolved(needsDefaults)
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
									this.localUserRef.onDisconnect().update({"lastLogOut": Firebase.ServerValue.TIMESTAMP});
									this.sessionRef.set({"status": "Online", "timestamp": Firebase.ServerValue.TIMESTAMP}, function(error)
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

									if( needsDefaults )
									{
										// Import all of the default platforms.
										var numDefaultPlatforms = this.defaultPlatforms.length;
										var resolvedPlatformIndex = -1;
										createPlatformHelper.call(this);

										function createPlatformHelper(platformId)
										{
											if( !!platformId )
												resolvedPlatformIndex++;

											if( resolvedPlatformIndex+1 < numDefaultPlatforms )
												this.createLibraryObject("Platform", this.defaultPlatforms[resolvedPlatformIndex+1], arguments.callee.bind(this));
											else
												onPlatformsCreated.call(this);
										}

										function onPlatformsCreated()
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
													this.createLibraryObject("Type", this.defaultTypes[resolvedIndex+1], arguments.callee.bind(this));
												else
													onTypesCreated.call(this);
											}
										}
									}
									else
										onCallbackReady.call(this);

									function onTypesCreated()
									{
										// Now import all of the default databases.
										var numDefaultDatabases = this.defaultDatabases.length;
										var resolvedDatabaseIndex = -1;
										createDatabaseHelper.call(this);

										function createDatabaseHelper(databaseId)
										{
											if( !!databaseId )
												resolvedDatabaseIndex++;

											if( resolvedDatabaseIndex+1 < numDefaultDatabases )
											{
												// Resolve type names to type ID's
												var database = this.defaultDatabases[resolvedDatabaseIndex+1];

												var realTypes = {};
												var realTypeAliases = {};
												
												var x, realType;
												/*
												for( x in database.types )
												{
													// find "x" in types, and replace x with the actual type id
													realType = this.findType(x);

													if( !realType )
														continue;

													realTypes[realType.info.id] = {"id": realType.info.id};
												}
												database.types = realTypes;
												*/

												for( x in database.typeAliases )
												{
													// find "x" in types, and replace x with the actual type id
													realType = this.findType(x);

													if( !realType )
														continue;

													realTypeAliases[realType.info.id] = {"id": realType.info.id, "aliases": database.typeAliases[x].aliases};
												}
												database.typeAliases = realTypeAliases;
	
												this.createLibraryObject("Database", database, arguments.callee.bind(this));
											}
											else
												onDatabasesCreated.call(this);
										}

										function onDatabasesCreated()
										{
											onCallbackReady.call(this);
										/*
											// Now import all of the default apps.
											var numDefaultApps = this.defaultApps.length;
											var resolvedIndex = -1;
											createAppHelper.call(this);

											function createAppHelper(appId)
											{
												if( !!appId )
													resolvedIndex++;

												if( resolvedIndex+1 < numDefaultApps )
													this.createLibraryObject("App", this.defaultApps[resolvedIndex+1], arguments.callee.bind(this));
												else
													onCallbackReady.call(this);
											}
											*/
										}
									}

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
				callback(new Error("Invalid username or passcode."));
		}
		else
			callback(new Error("Invalid username or passcode."));
	}.bind(this));
}

Metaverse.prototype.createUser = function(data, callback)
{
	var x;
	for( x in this.users )
	{
		if( this.users[x].username === data.username )
		{
			this.error = new Error("Username already exists.");
			callback();
			return;
		}
	}

	if( !this.validateData(data, this.defaultUser, callback) )
		return;

	var ref = this.usersRef.push();
	data.id = ref.key();
	data.passcode = this.encodePasscode(data.passcode);
	data.lastLogOut = 0;
	data.lastLogIn = Firebase.ServerValue.TIMESTAMP;
	ref.set(data);

	callback(data);
	return;
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

Metaverse.prototype.validateData = function(data, defaultData, callback)
{
	var x, y, z;
	for( x in defaultData )
	{
		//if( x === "info" || !data.hasOwnProperty(x) )
		if( defaultData[x] === true || !data.hasOwnProperty(x) || data[x] === undefined )
			continue;
//		console.log(x);
//console.log(data[x]);
		if( defaultData[x].types === "integer" )
		{
			if( typeof data[x] === "string" && data[x] === "" )
				data[x] = defaultData[x].default;
			else if( (typeof data[x] === "number" && isNaN(data[x])) ||
				(typeof data[x] !== "number" && parseInt(data[x], 10) + "" !== data[x] ) )
			{
				this.error = new Error(defaultData[x].formatDescription);
				if( !!callback )
					callback();
				else
					this.eventHandler("error", this.error);
				return false;
			}
		}
		else if( typeof data[x] === "object" )
		{
			//console.log("data object, no validation protocol defined.")
			var r;
			for( r in data[x] )
			{
				for( s in data[x][r] )
				{
					if( !defaultData[x].hasOwnProperty(s) )
						continue;

					//console.log(defaultData[x]);
					//console.log(data[x][r][s]);
					if( data[x][r][s].search(eval(defaultData[x][s].format)) === -1 )
					{
						this.error = new Error(defaultData[x][s].formatDescription);

						if( !!callback )
							callback();
						else
							this.eventHandler("error", this.error);
						return false;
					}
				}
			}
		}
		else if( data[x].search(eval(defaultData[x].format)) === -1 )
		{
			this.error = new Error(defaultData[x].formatDescription);
			if( !!callback )
				callback();
			else
				this.eventHandler("error", this.error);
			return false;
		}
		else
		{
			if( data[x] === "" )
				data[x] = defaultData[x].default;
		}
	}

	return true;
};

Metaverse.prototype.findTwinPlatform = function(original, callback)
{
	callback();
};

Metaverse.prototype.updateLibraryObject = function(type, data, callback)
{
	console.log(data);
	if( !this.validateData(data, this["default" + type], callback) )
		return;

	var lowerCaseType = type.toLowerCase();

	var rawData = this.library[lowerCaseType + "s"][data.info.id];
	var currentData = rawData.current;

	if( !!!rawData[this.localUser.id] )
		rawData[this.localUser.id] = {};

	// Detect which fields have actually changed.
	var updateData = {};

	var isModified = false;
	var x;
	for( x in data )
	{
		if( x === "info" )
			continue;

		if( currentData[x] !== data[x] )
		{
			currentData[x] = data[x];
			updateData["current/" + x] = data[x];
			isModified = true;
		}
	}

	if( isModified )
	{
		currentData.info.modified = Firebase.ServerValue.TIMESTAMP;
		currentData.info.modifier = this.localUser.id;
		updateData["current/info/modified"] = currentData.info.modified;//Firebase.ServerValue.TIMESTAMP;
		updateData["current/info/modifier"] = currentData.info.modifier;//this.localUser.id;
	}

	rawData[this.localUser.id] = currentData;

	var needsCallback = true;
	for( x in updateData )
	{
		needsCallback = false;
		this.libraryRef.child(lowerCaseType + "s").child(data.info.id).update(updateData, function(error1)
		{
			if( !!error1 )
			{
				this.error = new Error("Failed to update current data on metaverse.");
				callback();
			}
			else
			{
				this.libraryRef.child(lowerCaseType + "s").child(data.info.id).child(this.localUser.id).set(currentData, function(error2)
				{
					if( !!error2 )
					{
						this.error = new Error("Failed to update user data on metaverse.");
						callback();
					}
					else
						callback(data.info.id);
				}.bind(this));
			}
		}.bind(this));

		break;
	}

	if( needsCallback )
		callback(data.info.id);
};

Metaverse.prototype.createLibraryObject = function(type, data, callback)
{
	if( !this.validateData(data, this["default" + type], callback) )
		return;

	var lowerCaseType = type.toLowerCase();

	var ref = this.universeRef.child("library").child(lowerCaseType + "s").push();
	var key = ref.key();

	data["info"] = {
		"created": Firebase.ServerValue.TIMESTAMP,
		"id": key,
		"owner": this.localUser.id,
		"modified": Firebase.ServerValue.TIMESTAMP,
		"modifier": this.localUser.id,
		"removed": 0,
		"remover": ""
	};

	var rawData = {};
	rawData["current"] = data;
	rawData[this.localUser.id] = data;
	
	ref.set(rawData, function(error)
	{
		if( !!!error )
			callback(key);
		else
			callback();
	});
};

Metaverse.prototype.findTwinLibraryObject = function(type, original, callback)
{
	callback();
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
	//var cookedType = this.cookType(this.library.types[typeId]);

	if( this.library.types[typeId].current.titleFormat !== "" )
	{
		var regEx = eval(this.library.types[typeId].current.titleFormat);
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

		//cookedType = metaverse.cookType(this.library.types[x]);
		if( file.search(eval(this.library.types[x].current.fileFormat)) !== -1 )
			typeMatches.push(this.library.types[x].current);
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

// Originally from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
Metaverse.prototype.encodeRFC5987ValueChars = function(str){
    return encodeURIComponent(str).
        // Note that although RFC3986 reserves "!", RFC5987 does not,
        // so we do not need to escape it
        replace(/['()]/g, escape). // i.e., %27 %28 %29
        replace(/\*/g, '%2A').
            // The following are not required for percent-encoding per RFC5987, 
            // so we can allow for a little better readability over the wire: |`^
            replace(/%(?:7C|60|5E)/g, unescape);
};

/*
Metaverse.prototype.extractYouTubeId = function(trailerURL) {
  if( typeof trailerURL === "undefined" )
    return trailerURL;

  var youtubeid;
  if( trailerURL.indexOf("youtube") != -1 && trailerURL.indexOf("v=") != -1 ) {
    youtubeid = trailerURL.substr(trailerURL.indexOf("v=")+2);

    var found = youtubeid.indexOf("&");
    if( found > -1 ) {
      youtubeid = youtubeid.substr(0, found);
    }
  }
  else {
    var found = trailerURL.indexOf("youtu.be/");
    if( found != -1 ) {
      youtubeid = trailerURL.substr(found+9);

      found = youtubeid.indexOf("&");
      if( found != -1 ) {
        youtubeid = youtubeid.substr(0, found);
      }
    }
  }

  return youtubeid;
};
*/