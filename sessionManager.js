function SessionManager()
{
	this.options = {
		"server": "",
		"universe": "",
		"instance": ""
	};

	this.metaverse;

	this.server = "";
	this.universe = "";
	this.instance = "";

	this.uberScale = 2.0;	// extra zoom to apply ontop of everything else.

	this.clientXLocalUser = -1;
	this.clientYLocalUser = -1;

	this.modalMessageElem;
	this.playerCursorElem;
	this.playerMarkerElems = {};
	this.playerMarkerWidth;
	this.playerCursorElem;
	this.overviewCanvasElem;
	this.overviewWidth;
	this.viewerElem;
	this.viewerWidth;
	this.viewerHeight;

	this.overviewInfo;
	this.overviewInfos = {};
	//Overview: scale 1.00, pos_x -410, pos_y 911
	this.overviewInfos["nowhere.bsp"] = {"file": "overviews/nowhere.png", "scale": 1.00, "pos_x": 0, "pos_y": 0};
	this.overviewInfos["ge_bunker_classic.bsp"] = {"file": "overviews/ge_bunker_classic.png", "scale": 3.50, "pos_x": -1487, "pos_y": 2017};
	this.overviewInfos["sm_apartmentsuite.bsp"] = {"file": "overviews/sm_apartmentsuite.png", "scale": 1.00, "pos_x": -410, "pos_y": 911};
	this.overviewInfos["sm_garage.bsp"] = {"file": "overviews/sm_garage.png", "scale": 0.60, "pos_x": -237, "pos_y": 248};
	this.overviewInfos["sm_orchard.bsp"] = {"file": "overviews/sm_orchard.png", "scale": 2.00, "pos_x": -588, "pos_y": 867};
	this.overviewInfos["de_cbble.bsp"] = {"file": "overviews/de_cbble.png", "scale": 5.2, "pos_x": -3665, "pos_y": 3001};
	this.overviewInfos["meta_hood.bsp"] = {"file": "overviews/meta_hood.png", "scale": 7.00, "pos_x": -3596, "pos_y": 7674};
	this.overviewInfos["oververse.bsp"] = {"file": "overviews/oververse.png", "scale": 3.00, "pos_x": 489, "pos_y": 2065};
	this.overviewInfos["sm_apartment.bsp"] = {"file": "overviews/sm_apartment.png", "scale": 0.80, "pos_x": -291, "pos_y": 562};
	this.overviewInfos["sm_acreage.bsp"] = {"file": "overviews/sm_acreage.png", "scale": 1.20, "pos_x": -655, "pos_y": 753};
	this.overviewInfos["sm_expo.bsp"] = {"file": "overviews/sm_expo.png", "scale": 3.50, "pos_x": -1450, "pos_y": 2156};
	this.overviewInfos["dm_lockdown.bsp"] = {"file": "overviews/dm_lockdown.png", "scale": 6.00, "pos_x": -6483, "pos_y": 7124};
	this.overviewInfos["sm_gallery.bsp"] = {"file": "overviews/sm_gallery.png", "scale": 2.00, "pos_x": -835, "pos_y": 937};
	this.overviewInfos["sm_primo.bsp"] = {"file": "overviews/sm_primo.png", "scale": 1.70, "pos_x": -447, "pos_y": 841};

	//this.overviewInfos["ge_casino.bsp"] = {"file": "overviews/ge_casino.png", "scale": 4.30, "pos_x": -1206, "pos_y": 2354, "shift_x": 0, "shift_y": 0};
	//this.overviewInfos["cyberpunk_3.bsp"] = {"file": "overviews/cyberpunk_3.png", "scale": 6.00, "pos_x": 3511, "pos_y": 3345, "shift_x": -20, "shift_y": 0};
	//this.overviewInfos["fof_robertlee.bsp"] = {"file": "overviews/fof_robertlee.png", "scale": 6.00, "pos_x": 2080, "pos_y": 3361, "shift_x": -235, "shift_y": -125};
}

SessionManager.prototype.getParameterByName = function(name, url)
{
	// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

SessionManager.prototype.loadItemBestImage = function(imageElem, item, callback, overrideUrl)
{
	var dummy = {
		"imageElem": imageElem,
		"item": item,
		"potentials":
		{
			"marquee": true,
			"screen": true,
			"preview": true,
			"file": true
		},
		"re": /(.bmp|.ico|.gif|.jpg|.jpeg|.jpe|.jp2|.pcx|.pic|.png|.pix|.raw|.tga|.tif|.vtf|.tbn)$/i
	};

	function getNextPotential()
	{
		var i;
		var keys = Object.keys(this.potentials);
		var potential;
		for( i = 0; i < keys.length; i++ )
		{
			potential = keys[i];//this.potentials[keys[i]];
			//console.log(potential);

			if( !!this.item[potential] && this.item[potential].match(this.re) )
				return potential;
			else
				delete this.potentials[potential];
		}
	}

	function tryPotential()
	{
		var potential = getNextPotential.call(this);

		//console.log("Potential is: " + potential);
		if( !!potential )
			this.imageElem.src = item[potential];
			//tryPotential.call(this);		
	}

	imageElem.addEventListener("error", function()
	{
		// remove the failed potential
		var potential = getNextPotential.call(this);
		if( !!potential )
			delete this.potentials[potential];

		tryPotential.call(this);
	}.bind(dummy));

	imageElem.addEventListener("load", function()
	{
		if( !!callback )
			callback.call(this.imageElem);
		else
			this.imageElem.style.display = "block";
	}.bind(dummy));

	if( !!overrideUrl )
		dummy.imageElem.src = overrideUrl;
	else	
		tryPotential.call(dummy);
};

SessionManager.prototype.onInstanceOverviewChanged = function(snapshot)
{
	if( this.overviewInfo === this.overviewInfos["nowhere.bsp"] )
		window.g_overview = snapshot.val();
};

SessionManager.prototype.onPanoAdded = function(panoInfo)
{
	setModuleEnabled("3D", true);

	var panoMarkerContainerElem = document.createElement("div");
	panoMarkerContainerElem.style.cssText = "border-radius: 50%; padding: 10px; background-color: rgb(30, 30, 30); border: 2px solid #ccc; position: absolute; z-index: 5;";
	panoMarkerContainerElem.className = "panoMarkerContainer alwaysSeen";
	panoMarkerContainerElem.panoInfo = panoInfo;

	panoMarkerContainerElem.addEventListener(g_touchEvent, function()
	{
		var panoInfo = this.panoInfo;
		if( !!panoInfo.binary )
			loadPano(panoInfo);
		else
		{
			sessionManager.metaverse.fetchPano(panoInfo, function(fetchedPanoInfo)
			{
				var goodPanoInfo = sessionManager.metaverse.panos[fetchedPanoInfo.id];
				

				if( g_panoReady )
					loadPano(goodPanoInfo);
				else
				{
					g_panoReady = true;
					init(goodPanoInfo);
					animate();

					if( g_activeModuleName !== "3D" )
						activateModule("3D");
				}
			});
		}
	}.bind(panoMarkerContainerElem), true);

	var splitOrigin = panoInfo.body.origin.trim().split(" ");
	var origin = {
		"x": parseFloat(splitOrigin[0]),
		"y": parseFloat(splitOrigin[1]),
		"z": parseFloat(splitOrigin[2])
	};

	//var playerMarkerElem = this.playerMarkerElems[userId];
	//var userOriginDotElem = playerMarkerElem.querySelector(".userOriginDot");
	var size = 64;//parseInt(userOriginDotElem.style.width);

	var position = this.adjustOrigin(origin);
	var newTop = (parseInt(position.y) - (size / 2.0)) + "px";
	var newLeft = (parseInt(position.x) - (size / 2.0)) + "px";
	panoMarkerContainerElem.style.top = newTop;
	panoMarkerContainerElem.style.left = newLeft;
	panoMarkerContainerElem.innerHTML = "<img src='icon3d.png' class='alwaysSeen panoMarker' />";

	this.overviewCanvasElem.insertBefore(panoMarkerContainerElem, this.overviewCanvasElem.firstChild);
	this.addAlertMsg("New 360 screenshot has been added.");
};

SessionManager.prototype.connect = function(options, callback)
{
	// temp test stuff...
	//this.overviewInfo = this.overviewInfos["ge_bunker_classic"];//sm_apartmentsuite"];
	//this.playerMarkerElem = document.querySelector(".playerMarker");
	//this.playerMarkerWidth = this.playerMarkerElem.offsetWidth;
	this.playerCursorElem = document.querySelector("#playerCursor");
	this.overviewCanvasElem = document.querySelector("#overviewCanvas");
	//this.overviewWidth = this.overviewCanvasElem.offsetWidth;
	this.viewerElem = document.querySelector("#viewer");
	this.viewerWidth = this.viewerElem.offsetWidth;
	this.viewerHeight = this.viewerElem.offsetHeight;
	//this.overviewImageElem = document.querySelector("#overviewImage");
	// end temp test stuff

	window.onInstanceUserAdded = this.onInstanceUserAdded.bind(this);
	window.onInstanceUserRemoved = this.onInstanceUserRemoved.bind(this);
	window.onInstanceChanged = this.onInstanceChanged.bind(this);
	window.onUserSessionUpdated = this.onUserSessionUpdated.bind(this);
	window.onEntryChanged = this.onEntryChanged.bind(this);
	window.onEntryRemoved = this.onEntryRemoved.bind(this);
	window.onPanoAdded = this.onPanoAdded.bind(this);
	window.onInstanceOverviewChanged = this.onInstanceOverviewChanged.bind(this);

	this.metaverse = new Metaverse();

	// set any custom options
	for( x in this.options )
	{
		if( options.hasOwnProperty(x) )
			this.options[x] = options[x];
	}

	//var paramServer = this.getParameterByName("server");
	//var paramLobby = this.getParameterByName("server");
	//var paramUniverse = this.getParameterByName("universe");
	//var paramInstance = this.getParameterByName("instance");

	this.server = (this.options.server !== "") ? this.options.server : "https://metaverse.firebaseio.com/";
/*
	this.universe = this.options.universe;
	if( this.universe === "" && !!paramUniverse)
		this.universe = paramUniverse;

	this.instance = this.options.instance;
	if( this.instance === "" && !!paramInstance)
		this.instance = paramInstance;
*/
	this.metaverse.connect(this.server, function()
	{
		// get universe & instance from lobby
		this.metaverse.rootRef.child("lobbies").child(g_lobbyId).once("value", function(lobbySnapshot)
		{
			var lobbyInfo = lobbySnapshot.val();
			this.universe = lobbyInfo.universe;
			this.instance = lobbyInfo.instance;

			//console.log("Connecting to session...");
			if( this.universe !== "" )
			{
				this.metaverse.joinUniverse(this.universe, g_localUserHashedIP, function()
				{
					if( this.instance !== "" )
					{
						this.metaverse.connectInstance(this.instance, function(connectInfo)
						{
							if( !!!connectInfo )
							{
								window.location = "http://aarcade.tv/";
								return;
							}

							activateModule("map");
							var mapFile = connectInfo.map.current.platforms["-KJvcne3IKMZQTaG7lPo"]
	.file;

							if( !!this.overviewInfos[mapFile] )
								this.overviewInfo = this.overviewInfos[mapFile];
							else
							{
								//this.overviewInfo = this.overviewInfos["nowhere.bsp"];
								//console.log(window.g_overview.scale);
								//if( !!window.g_overview )
								//{
								//	window.g_overview.file = window.g_overview.binary;
								//	this.overviewInfo = window.g_overview;
								//}
								//else
									//this.overviewInfo = this.overviewInfos["nowhere.bsp"];

								
								if( !!window.g_overview )
								{
									window.g_overview.file = window.g_overview.binary;
									this.overviewInfo = window.g_overview;
									//document.querySelector("#overviewImage").src = this.overviewInfo.file;
								}
							}

							if( !!!this.overviewInfo )
								this.overviewInfo = this.overviewInfos["nowhere.bsp"];

							var imageElem = document.querySelector("#overviewImage");

							// determine scale
							var scaledSize = 1024 * sessionManager.uberScale * sessionManager.overviewInfo.scale;
							var startLeft = (parseFloat(overviewCanvasElem.style.width)/2.0) + (sessionManager.overviewInfo.pos_x);
							var startTop = (parseFloat(overviewCanvasElem.style.width)/2.0) - (sessionManager.overviewInfo.pos_y);

							overviewContainerElem.style.width = scaledSize + "px";
							overviewContainerElem.style.height = scaledSize + "px";
							overviewContainerElem.style.left = startLeft + "px";
							overviewContainerElem.style.top = startTop + "px";

							var zoom = 1 / sessionManager.overviewInfo.scale;
							if( zoom < minZoom )
								zoom = minZoom;
							else if( zoom > maxZoom )
								zoom = maxZoom;

							zoom = 1.0;

							overviewCanvasElem.style.zoom = zoom;
							g_canvasStartZoom = zoom;

							var containerWidth = parseFloat(overviewCanvasContainerElem.offsetWidth);// / sessionManager.uberScale;
							var containerXOffset = ((containerWidth / zoom) / 2.0) - (scaledSize / 2.0);	// use / 2.0 to make it perfectly centered instead!!
							g_canvasStartLeft = (-startLeft) + containerXOffset;
							overviewCanvasElem.style.left = g_canvasStartLeft + "px";	// DOES NOTHING!!
							//overviewCanvasElem.style.left = (-startLeft) + "px";
							//overviewCanvasElem.style.top = (-startTop) + "px";

							var containerHeight = parseFloat(overviewCanvasContainerElem.offsetHeight);
							var containerYOffset = ((containerHeight / zoom) / 2.0) - (scaledSize / 2.0);
							g_canvasStartTop = (-startTop) + containerYOffset;
							overviewCanvasElem.style.top = g_canvasStartTop + "px";

							//g_canvasStartZoom = parseFloat(overviewCanvasElem.style.zoom);

							//imageElem.style.width = this.overviewWidth + "px";
							var goodFile = this.overviewInfo.file;
							if( !!!goodFile || goodFile === "" )
								goodFile = "nowhere.png";

							imageElem.src = goodFile;
							imageElem.addEventListener("load", function(e)
							{
								setTimeout(function()
								{
									callback();
								}.bind(this), 500);
							}.bind(this));

							//this.overviewCanvasElem.appendChild(imageElem);
							this.overviewImageElem = imageElem;
						}.bind(this));
					}
					else
						callback();
				}.bind(this));
			}
			else
				callback();
		}.bind(this));
	}.bind(this));
};

SessionManager.prototype.adjustOrigin = function(position)
{
	var midX = parseFloat(overviewContainer.style.left) - (sessionManager.overviewInfo.pos_x * this.uberScale);
	var midY = parseFloat(overviewContainer.style.top) + (sessionManager.overviewInfo.pos_y * this.uberScale);

	var x = (position.x * this.uberScale) + midX;
	var y = -(position.y * this.uberScale) + midY;

	return {"x": x, "y": y, "z": position.z};
};

SessionManager.prototype.modalMessage = function(content)
{
	if( this.modalMessageElem )
		this.modalMessageElem.parentNode.removeChild(this.modalMessageElem);

	var modalMessageElem = document.createElement("div");
	modalMessageElem.style.cssText = "position: fixed; top: 0; bottom: 0; left: 0; right: 0; background-color: rgba(0, 0, 0.7);";
	modalMessageElem.innerHTML = content;
	modalMessageElem.addEventListener(g_touchEvent, function(e)
	{
		this.modalMessageElem.parentNode.removeChild(this.modalMessageElem);
		this.modalMessageElem = undefined;
	}.bind(this), true);
	document.body.appendChild(modalMessageElem);

	this.modalMessageElem = modalMessageElem;
};

SessionManager.prototype.shortcutMouseOut = function(e)//shortcutContainerElem)
{
	var bestItemImageElem = document.querySelector("#mediaTipImage");
	bestItemImageElem.parentNode.style.display = "none";
	bestItemImageElem.style.display = "none";
	bestItemImageElem.style.opacity = 0;

	var sessionManager = window.sessionManager;
	//var shortcutContainerElem = e.target.parentNode;
	var shortcutContainerElem = (!!e && !!e.target) ? e.target.parentNode : this;

	var selectedEntriesElems = document.querySelectorAll(".selectedEntryRow[objectId='" + shortcutContainerElem.getAttribute("objectId") + "']");
	if( selectedEntriesElems.length > 0 )//shortcutContainerElem.classList.contains("shortcutContainerElem"))
		return;

	var shortcutElem = shortcutContainerElem.querySelector(".shortcut");
	var objectSlateElem = shortcutContainerElem.querySelector(".objectSlate");
	//if( objectSlateElem.style.width === "100%" )
	//	return;

	shortcutElem.style.webkitTransitionDelay = "0.2s";
	shortcutElem.style.transitionDelay = "0.2s";

	objectSlateElem.style.webkitTransitionDelay = "0s";
	objectSlateElem.style.transitionDelay = "0s";

	//sessionManager.shortcutMouseOut.call(sessionManager, shortcutContainerElem);

	/*
	//var shortcutContainerElem = e.target.parentNode;
	var shortcutElem = shortcutContainerElem.querySelector(".shortcut");
	var objectSlateElem = shortcutContainerElem.querySelector(".objectSlate");
*/
	objectSlateElem.style.width = "0";
	objectSlateElem.style.opacity = 0;
	//objectSlateElem.style.transform = "scale(0.1)";

	shortcutElem.style.transform = "scale(1.0)";
	shortcutElem.style.zIndex = shortcutElem.oldZ;
	shortcutContainerElem.style.zIndex = shortcutElem.oldZ;

	objectSlateElem.offsetWidth;

	shortcutElem.style.webkitTransitionDelay = "0s";
	shortcutElem.style.transitionDelay = "0s";

	objectSlateElem.style.webkitTransitionDelay = "0.2s";
	objectSlateElem.style.transitionDelay = "0.2s";
};

SessionManager.prototype.switchToTab = function(targetContentElem)
{
	var oldSelectedTab = this.parentNode.querySelector(".activeTab");
	oldSelectedTab.classList.remove("activeTab");

	var itemContentElem = this.parentNode.parentNode.querySelector(".itemInfoContainer");
	if( !!itemContentElem )
		itemContentElem = itemContentElem.parentNode;

	var modelContentElem = this.parentNode.parentNode.querySelector(".modelInfoContainer");
	if( !!modelContentElem )
		modelContentElem = modelContentElem.parentNode;

	var viewerContentElem = this.parentNode.parentNode.querySelector("#viewer");
	if( !!viewerContentElem )
		viewerContentElem = viewerContentElem.parentNode;


	var chatContentElem = this.parentNode.parentNode.querySelector(".chatContainer");
	if( !!chatContentElem )
		chatContentElem = chatContentElem.parentNode;

	var playersContentElem = this.parentNode.parentNode.querySelector(".playersContainer");
	if( !!playersContentElem )
		playersContentElem = playersContentElem.parentNode;

	var youContentElem = this.parentNode.parentNode.querySelector(".youContainer");
	if( !!youContentElem )
		youContentElem = youContentElem.parentNode;


	var propsContentElem = this.parentNode.parentNode.querySelector(".propsContainer");
	if( !!propsContentElem )
		propsContentElem = propsContentElem.parentNode;

	var shortcutsContentElem = this.parentNode.parentNode.querySelector(".shortcutsContainer");
	if( !!shortcutsContentElem )
		shortcutsContentElem = shortcutsContentElem.parentNode;

	if( targetContentElem === itemContentElem || targetContentElem === modelContentElem || targetContentElem === viewerContentElem )
	{
		if( targetContentElem === itemContentElem )
			targetContentElem.style.display = "block";
		else
			itemContentElem.style.display = "none";

		if( targetContentElem === modelContentElem )
			targetContentElem.style.display = "block";
		else
			modelContentElem.style.display = "none";

		if( targetContentElem === viewerContentElem )
			targetContentElem.style.display = "block";
		else
			viewerContentElem.style.display = "none";
	}
	else if(targetContentElem === youContentElem || targetContentElem === playersContentElem || targetContentElem === chatContentElem )
	{
		if( targetContentElem === youContentElem )
			targetContentElem.style.display = "block";
		else
			youContentElem.style.display = "none";

		if( targetContentElem === playersContentElem )
			targetContentElem.style.display = "block";
		else
			playersContentElem.style.display = "none";

		if( targetContentElem === chatContentElem )
			targetContentElem.style.display = "block";
		else
			chatContentElem.style.display = "none";
	}
	else
	{
		if( targetContentElem === propsContentElem )
			targetContentElem.style.display = "block";
		else
			propsContentElem.style.display = "none";

		if( targetContentElem === shortcutsContentElem )
			targetContentElem.style.display = "block";
		else
			shortcutsContentElem.style.display = "none";
	}

	this.classList.add("activeTab");
};

SessionManager.prototype.addAlertMsg = function(msg, vars)//chatVar
{
	if( !g_rdyForMsgs )
		return;

	// TODO: This method needs to be expanded to take a msg AND an optional metaverse object to embed in the alert msg.
	// This is because the msg part gets turned into a TEXT NODE now.

/*
	var chatEntryContainerElem = document.createElement("div");
	chatEntryContainerElem.className = "chatAlertContainer";

	var chatEntryContentElem = document.createElement("div");
	chatEntryContentElem.className = "chatAlertContent";
	chatEntryContentElem.innerText = msg;

	chatEntryContainerElem.appendChild(chatEntryContentElem);

	var chatLogContainerElem = document.querySelector(".chatLogContainer");
	chatLogContainerElem.appendChild(chatEntryContainerElem);

	chatLogContainerElem.scrollTo(0, chatLogContainerElem.scrollHeight);
*/
	this.speak(msg);

	this.addChatMsg("", msg, vars);
};

SessionManager.prototype.addChatMsg = function(userId, msg, vars)
{
	if( !g_rdyForMsgs )
		return;

	// TODO: This method needs to be expanded to take a msg AND an optional metaverse object to embed in the alert msg.
	// This is because the msg part gets turned into a TEXT NODE now.
	// Also need to define a class for these different msg types. (BOT text, YOU indicator, etc.)
	// ...
	// how about "User $0 has selected <div>$1</div>." -style syntax?? possible?
	// hmmmm....
	// Variables that'd go into dolla sign vars:
	/*
		DISPLAY NAME A
		DISPLAY NAME B
		ITEM TITLE
	*/

	var avatarUrl;
	var displayName;
	if( userId === this.metaverse.localUser.id )
	{
		displayName = g_webUserName;
		avatarUrl = g_avatarUrl;
	}
	else if(userId === "")
	{
		displayName = "";
		avatarUrl = "iconAArcade.png";
		msg = "<font style='font-style: italic; color: rgb(70, 70, 70);'>" + msg + "</font>";
	}
	else
	{
		var user = this.metaverse.users[userId];
		if( !!!user )
			return;

		displayName = user.session.displayName;
		avatarUrl = user.session.avatar.url;
	}

	if( avatarUrl === "" )
		avatarUrl = "noavatar.jpg";

	var chatTR;
	var chatTableElem = document.querySelector("#chatTable");
	var bottomChatTR = chatTableElem.lastElementChild;
	if( !!!bottomChatTR || bottomChatTR.getAttribute("userId") !== userId )
	{
		// create a new chat row
		chatTR = document.createElement("tr");
		chatTR.className = "chatRow";
		chatTR.setAttribute("userId", userId);

		var chatAvatarTD = document.createElement("td");
		chatAvatarTD.style.width = "1%";
		chatAvatarTD.align = "right";

		var chatAvatarContainerElem = document.createElement("div");
		chatAvatarContainerElem.className = "avatarContainer";

		var testerImageElem = document.createElement("img");
		testerImageElem.src = avatarUrl;

		var safeAvatarUrl = testerImageElem.src;
		testerImageElem = null;

		var chatAvatarImageElem = document.createElement("img");
		chatAvatarImageElem.className = "chatAvatarImage playerAvatarImage";
		chatAvatarImageElem.setAttribute("userId", userId);
		chatAvatarImageElem.src = safeAvatarUrl;

		var chatAvatarDisplayNameContainerElem = document.createElement("div");
		var chatAvatarDisplayNameElem = document.createElement("div");
		chatAvatarDisplayNameElem.className = "playerDisplayName chatAvatarDisplayName";
		chatAvatarDisplayNameElem.setAttribute("userId", userId);

		var safeDisplayNameNode = document.createTextNode(displayName);
		//chatAvatarDisplayNameElem.innerHTML = displayName;

		var youElem;
		if(userId === this.metaverse.localUser.id)
		{
			youElem = document.createElement("div");
			youElem.style.cssText = "text-align: center; display: inline;";
			youElem.innerHTML = "(YOU)";
		}

		var chatContentTD = document.createElement("td");
		chatContentTD.align = "left";

		var chatContentContainerElem = document.createElement("div");
		chatContentContainerElem.className = "chatContentContainer";

		// compose
		chatTR.appendChild(chatAvatarTD);
		chatAvatarTD.appendChild(chatAvatarContainerElem);
		chatAvatarContainerElem.appendChild(chatAvatarImageElem);
		chatAvatarContainerElem.appendChild(chatAvatarDisplayNameContainerElem);
		chatAvatarDisplayNameContainerElem.appendChild(chatAvatarDisplayNameElem);
		chatAvatarDisplayNameElem.appendChild(safeDisplayNameNode);
		if( !!youElem )
			chatAvatarDisplayNameContainerElem.appendChild(youElem);

		chatTR.appendChild(chatContentTD);
		chatContentTD.appendChild(chatContentContainerElem);

		chatTableElem.appendChild(chatTR);
	}
	else
		chatTR = bottomChatTR;

	var chatContentElem = document.createElement("div");
	//var safeMsg = document.createTextNode(msg);
	chatContentElem.innerHTML = msg;

	chatTR.querySelector(".chatContentContainer").appendChild(chatContentElem);

	// now rekt the varialbes in chatContentElem
	if( !!vars )
	{
		var variableElems = chatContentElem.querySelectorAll(".chatVar");
		var variableElem;
		for( var i = 0; i < variableElems.length; i++ )
		{
			variableElem = variableElems[i];

			var index = parseInt(variableElem.getAttribute("varIndex"));
			if( !!vars[index] )
			{
				var safeVar = document.createTextNode(vars[index]);
				variableElem.appendChild(safeVar);
			}
		}
	}

	var chatParentElem = chatTR.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
	chatParentElem.scrollTo(0, chatParentElem.scrollHeight);

	// overview chat entry...
	var overviewChatEntriesElem = document.querySelector("#overviewChatEntries");
	var overviewChatEntryContainerElem = document.createElement("div");
	overviewChatEntryContainerElem.className = "overviewChatEntryContainer";

	setTimeout(function()
	{
		this.style.opacity = 0;
		setTimeout(function()
		{
			this.parentNode.removeChild(this);
		}.bind(this), 1000);
	}.bind(overviewChatEntryContainerElem), 6000);


	var overviewChatEntryNameElem = document.createElement("div");
	overviewChatEntryNameElem.className = "overviewChatEntryName";
	var safeDisplayNameNode;
	if( userId !== "" )
	{
		//overviewChatEntryNameElem.innerHTML = displayName;
		safeDisplayNameNode = document.createTextNode(displayName);
	}

	var overviewChatEntryContentElem = document.createElement("div");
	overviewChatEntryContentElem.className = "overviewChatEntryContent";
	//var safeMsg = document.createTextNode(msg);
	overviewChatEntryContentElem.innerHTML = msg;

	// compose
	overviewChatEntriesElem.appendChild(overviewChatEntryContainerElem);
	overviewChatEntryContainerElem.appendChild(overviewChatEntryNameElem);
	if( !!safeDisplayNameNode)
		overviewChatEntryNameElem.appendChild(safeDisplayNameNode);
	overviewChatEntryContainerElem.appendChild(overviewChatEntryContentElem);

	// now rekt the varialbes in overviewChatEntryContentElem
	if( !!vars )
	{
		var variableElems = overviewChatEntryContentElem.querySelectorAll(".chatVar");
		var variableElem;
		for( var i = 0; i < variableElems.length; i++ )
		{
			variableElem = variableElems[i];

			var index = parseInt(variableElem.getAttribute("varIndex"));
			if( !!vars[index] )
			{
				var safeVar = document.createTextNode(vars[index]);
				variableElem.appendChild(safeVar);
			}
		}
	}

	//overviewChatEntryContainerElem.appendChild(safeMsg);
};

SessionManager.prototype.speak = function(originalText)
{
	var text = originalText;

	// replace feat. with featuring
	text = text.replace(/\bfeat\./, ' featuring');

	// replace ft. with featuring
	text = text.replace(/\bft\./, ' featuring');

	// replace all underscores with spaces
	text = text.replace(/_/g, ' ');

	// remove all tilde
	text = text.replace(/~/g, '');

	// replace all dashes with spaces
	text = text.replace(/\s-\s/g, ' ~ ');	// we wanna preserve [space]-[space]
	text = text.replace(/-/g, ' ');
	text = text.replace(/\s~\s/g, ' - ');	// restore [space]-[space]

	// Drop any string that has both text & numbers mixed in it
	text = text.replace(/\b[a-zA-Z]+[0-9]+[a-zA-Z0-9]*\b/g, ' ');
	text = text.replace(/\b[0-9]+[a-zA-Z]+[a-zA-Z0-9]*\b/g, ' ');

	// Drop any string that is a cluster of numbers longer than 3
	text = text.replace(/\b[0-9]{3,}\b/g, ' ');

	// drop anything after the last dot (kills file extensions)
	text = text.replace(/\.[^\.]*$/, '');

	// drop any (YEAR) at the end of the text
	text = text.replace(/\([0-9]{4}\)$/, ' ');

	text = text.trim();

	//if( text !== "" )
	//	responsiveVoice.speak(text);
};

SessionManager.prototype.stopFollowingPlayer = function()
{
	var selectedPlayerEntryContainerElem = document.querySelector(".selectedPlayerEntryContainer");
	if( !!!selectedPlayerEntryContainerElem )
		return;

	var playerShowcaseContainerElem = document.querySelector("#playerShowcaseContainer");
	playerShowcaseContainerElem.style.display = "none";

	selectedPlayerEntryContainerElem.classList.remove("selectedPlayerEntryContainer");
			
	var oldPlayerMarkerElem = document.querySelector(".playerMarker[userId='" + selectedPlayerEntryContainerElem.getAttribute("userId") + "']");
	oldPlayerMarkerElem.classList.remove("selectedPlayerMarker");

	var oldUser = sessionManager.metaverse.users[selectedPlayerEntryContainerElem.getAttribute("userId")];
	sessionManager.addAlertMsg("Stopped following <div class='chatVar' varIndex='0'></div>.", [oldUser.session.displayName]);
};

SessionManager.prototype.entryClick = function(e)
{
	var sessionManager =window.sessionManager;

	if( !!!this.getAttribute )
		return;

	var userId = this.getAttribute("userId");
	if( userId )
	{
		var selectedEntryContainerElem = document.querySelector(".selectedEntryRow");

		// player list stuff
		var selectedPlayerEntryContainerElem = document.querySelector(".selectedPlayerEntryContainer");
		if( !!selectedPlayerEntryContainerElem )
		{
			if( selectedPlayerEntryContainerElem.getAttribute("userId") === userId )
			{
				//activateModule("media");
				var user = sessionManager.metaverse.users[userId];
				tuneToObject(user.session.object.id);
				return;
			}

			sessionManager.stopFollowingPlayer();

			//if( selectedPlayerEntryContainerElem.getAttribute("userId") === userId )
			//	return;
		}

		this.classList.add("selectedPlayerEntryContainer");

		// player marker stuff
		var playerMarkerElem = document.querySelector(".playerMarker[userId='" + userId + "']");
		playerMarkerElem.classList.add("selectedPlayerMarker");

		var user = sessionManager.metaverse.users[userId];

		sessionManager.addAlertMsg("Started following <div class='chatVar' varIndex='0'></div>.", [user.session.displayName]);

		var playerShowcaseContainerElem = document.querySelector("#playerShowcaseContainer");
		playerShowcaseContainerElem.style.display = "block";

		var playerShowcaseAvatarImageElem = document.querySelector(".playerShowcaseAvatarImage");
		var goodAvatarUrl = user.session.avatar.url;
		if( goodAvatarUrl === "" )
			goodAvatarUrl = "noavatar.jpg";

		var testerImageElem = document.createElement("img");
		testerImageElem.src = goodAvatarUrl;

		var safeAvatarUrl = testerImageElem.src;
		testerImageElem = null;

		playerShowcaseAvatarImageElem.src = safeAvatarUrl;

		var playerShowcaseDisplayNameElem = document.querySelector(".playerShowcaseDisplayName");
		var safeDisplayNameNode = document.createTextNode(user.session.displayName);
		while( !!playerShowcaseDisplayNameElem.firstChild )
			playerShowcaseDisplayNameElem.firstChild.parentNode.removeChild(playerShowcaseDisplayNameElem.firstChild);
		playerShowcaseDisplayNameElem.appendChild(safeDisplayNameNode);
		//playerShowcaseDisplayNameElem.innerHTML = user.session.displayName;

		if( !!user && !!user.session && !!user.session.object )
		{
			var objectId = user.session.object.id;
			// tune right now
			if( objectId === "" )
			{
				if( !!selectedEntryContainerElem )
				{
					var selectedEntryObjectId = selectedEntryContainerElem.getAttribute("objectId");
					if( !!selectedEntryContainerElem )
					{
						var sessionManager = window.sessionManager;
						sessionManager.entryClick.call(selectedEntryContainerElem, null);
					}
				}
			}
			else
			{
				var targetEntryContainerElem = document.querySelector(".entryRow[objectId='" + objectId + "']");
				if( !!targetEntryContainerElem )
				{
					if( targetEntryContainerElem !== selectedEntryContainerElem )
					{
						var sessionManager = window.sessionManager;
						sessionManager.entryClick.call(targetEntryContainerElem, null);
					}
					else
						activateModule("media");
				}
			}
		}
	}
	else
	{
		var oldSelectedElem = document.querySelector(".selectedEntryRow");
		if( !!oldSelectedElem )
		{
			deselect();

			if( oldSelectedElem === this )
				return;
		}

		this.classList.add("selectedEntryRow");

		var shortcutContainerElem = sessionManager.overviewCanvasElem.querySelector("div[objectId='" + this.getAttribute("objectId") + "']");
		sessionManager.shortcutMouseOver.call(shortcutContainerElem);

		// set item showcase
		var itemId = this.getAttribute("itemId");
		var item = (!!sessionManager.metaverse.library.items[itemId]) ? sessionManager.metaverse.library.items[itemId].current : undefined;
		if( !!item )
		{
			SetShowcase(item);

			// auto-tune media
			setModuleEnabled("media", true);
			activateModule("media");

			var url = "autoInspectItem.html?title=" + encodeURIComponent(item.title) + "&preview=" + encodeURIComponent(item.preview) + "&file=" + encodeURIComponent(item.file) + "&screen=" + encodeURIComponent(item.screen) + "&marquee=" + encodeURIComponent(item.marquee);
			sessionManager.viewerElem.src = url;

			g_ignoreNextTuneAlert = false;	// always show tune alert, for now.
			if( g_ignoreNextTuneAlert )
				g_ignoreNextTuneAlert = false;
			else
			{
				var objectId = this.getAttribute("objectId");
				if( !!objectId )
				{
					var msg = "<font style='font-weight: 900;'>YOU</font> tuned into <div class='objectChatLink' onclick='tuneToObject(\"" + objectId + "\");'><img src='chatIconObject.png' class='chatIcon' /><div class='objectChatLinkTitle'><div class='chatVar' varIndex='0'></div></div></div>";
					sessionManager.addAlertMsg(msg, [item.title]);
				}
			}
		}
		else
			deselect();
	}
};

SessionManager.prototype.userEntryClick = function(e)
{
	var sessionManager = window.sessionManager;

	var userId = this.getAttribute("userId");
	if( userId === sessionManager.metaverse.localUser.id )
		return;

	var entryContainerElem = document.querySelector(".playerCard[userId='" + userId + "']");
	sessionManager.entryClick.call(entryContainerElem);
};

SessionManager.prototype.addBoxEntry = function(options, entriesContainerElem)
{
	// migrate to the new hotness...
	if( !!options.userId )
	{
		var userId;
		var userDisplayName;
		var userAvatarUrl;

		var user = this.metaverse.users[options.userId];
		if( !!user )
		{
			userId = options.userId;
			userDisplayName = user.session.displayName;
			userAvatarUrl = user.session.avatar.url;
		}
		else
		{
			userId = this.metaverse.localUser.id;
			userDisplayName = g_webUserName;//this.metaverse.localUser.session.displayName;
			userAvatarUrl = g_avatarUrl;
		}

		if( !!userId )		
		{
			var playerCardElem = document.createElement("div");
			playerCardElem.className = "playerCard";
			playerCardElem.setAttribute("userId", userId);
			playerCardElem.addEventListener(g_touchEvent, function(e)
			{
				if( !!e.target && e.target.classList.contains("playerCardUnfollow") )
					return;

				sessionManager.userEntryClick.call(this, e);
			}.bind(playerCardElem), true);

			var tableElem = document.createElement("table");
			tableElem.cellSpacing = "0";
			tableElem.cellPadding = "0";

			var trElem = document.createElement("tr");
			var tdAvatarElem = document.createElement("td");

			var playerAvatarImageElem = document.createElement("img");
			playerAvatarImageElem.className = "playerAvatarImage";
			playerAvatarImageElem.style.cssText = "max-width: 150px; min-height: 150px; border-top-left-radius: 20px; border-bottom-left-radius: 20px;";
			playerAvatarImageElem.setAttribute("userId", userId);
			var goodUrl = userAvatarUrl;
			if( !!!goodUrl || goodUrl === "" )
				goodUrl = "noavatar.jpg";

			var testerImageElem = document.createElement("img");
			testerImageElem.src = goodUrl;

			var safeAvatarUrl = testerImageElem.src;
			testerImageElem = null;

			playerAvatarImageElem.src = safeAvatarUrl;

			var tdDisplayNameElem = document.createElement("td");
			tdDisplayNameElem.align = "center";
			var playerDisplayNameElem = document.createElement("div");
			playerDisplayNameElem.className = "playerDisplayName";
			playerDisplayNameElem.style.cssText = "padding: 20px; font-family: Arial; font-size: 50px;";
			playerDisplayNameElem.setAttribute("userId", userId);
			var safeDisplayNameNode = document.createTextNode(userDisplayName);
			//playerDisplayNameElem.innerHTML = userDisplayName;

			var unfollowElem = document.createElement("div");
			unfollowElem.className = "playerCardUnfollow";
			unfollowElem.addEventListener(g_touchEvent, unfollow, true);
			unfollowElem.innerHTML = '<img src="iconClose.png" style="vertical-align: middle; height: 24px;" /> UNFOLLOW';
//			var nameHTML = userDisplayName;
//			nameHTML += '<br /><div class="playerCardUnfollow" onclick="unfollow();"><img src="iconClose.png" style="vertical-align: middle; height: 24px;" /> UNFOLLOW</div>';
			/*
				<div class="playerShowcaseClose" onclick="unfollow();"><img src="iconClose.png" style="vertical-align: middle; height: 24px;" /> UNFOLLOW</div>
			*/
		//	playerDisplayNameElem.innerHTML = nameHTML;

			// compose
			playerCardElem.appendChild(tableElem);
			tableElem.appendChild(trElem);
			trElem.appendChild(tdAvatarElem);
			tdAvatarElem.appendChild(playerAvatarImageElem);
			trElem.appendChild(tdDisplayNameElem);
			tdDisplayNameElem.appendChild(playerDisplayNameElem);
			playerDisplayNameElem.appendChild(safeDisplayNameNode);
			tdDisplayNameElem.appendChild(unfollowElem);

			var playersTableContainerElem = document.querySelector("#playersTableContainer");
			playersTableContainerElem.appendChild(playerCardElem);
/*
			playersTableContainerElem.querySelector(".playerCardUnfollow").addEventListener(g_touchEvent, function(e)
			{
				unfollow();
				e.preventDefault();
				return true;
			}, true);*/
		}
/*

					<div class="playerCard">
						<table cellspacing="0" cellpadding="0">
							<tr>
								<td>
									<img src="https://pbs.twimg.com/profile_images/475603693379649536/fF1SNB3U.png" class="playerAvatarImage" />
								</td>
								<td>
									<div class="playerDisplayName">SM Sith Lord</div>
								</td>
							</tr>
						</table>
					</div>
*/
	}
	else if( !!!options.userId )
	{
		if( !!options.itemId )
		{
			var entryRowElem = document.createElement("tr");
			entryRowElem.className = "entryRow";

			if( !!options.objectId )
				entryRowElem.setAttribute("objectId", options.objectId);

			if( !!options.itemId )
				entryRowElem.setAttribute("itemId", options.itemId);

			if( !!options.modelId)
				entryRowElem.setAttribute("modelId", options.modelId);

			if( !!options.userId)
				entryRowElem.setAttribute("userId", options.userId);

			var entryTypeCellElem = document.createElement("td");
			entryTypeCellElem.style.width = "1%";
			entryTypeCellElem.style.paddingLeft = "50px";
			entryTypeCellElem.align = "right";

			var entryTypeElem = document.createElement("div");
			entryTypeElem.className = "entryType";

			if( !!options.itemId )
				entryTypeElem.setAttribute("itemId", options.itemId);

			var entryTitleCellElem = document.createElement("td");

			var entryTitleElem = document.createElement("div");
			entryTitleElem.className = "entryTitle";

			if( !!options.itemId )
				entryTitleElem.setAttribute("itemId", options.itemId);
			entryTitleElem.innerHTML = options.itemId;

			// compose
			entryRowElem.appendChild(entryTypeCellElem);
			entryTypeCellElem.appendChild(entryTypeElem);
			entryRowElem.appendChild(entryTitleCellElem);
			entryTitleCellElem.appendChild(entryTitleElem);
			document.querySelector("#inventoryTable").appendChild(entryRowElem);

			if( !!options.modelId && options.itemId !== options.modelId )
			{
				entryRowElem.addEventListener(g_touchEvent, function(e)
				{
					if( !this.classList.contains("selectedEntryRow") )
						sessionManager.entryClick.call(this, e);
					else
						deselect();
				}.bind(entryRowElem), true);
			}
		}
	}
};

SessionManager.prototype.shortcutMouseOver = function(e)
{
	var sessionManager = window.sessionManager;

	var shortcutContainerElem = (!!e && !!e.target) ? e.target.parentNode : this;
	var objectSlateElem = shortcutContainerElem.querySelector(".objectSlate");

	if( shortcutContainerElem.style.width === "100%" )
		return;

	var shortcutElem = shortcutContainerElem.querySelector(".shortcut");
	shortcutElem.style.transform = "scale(2.0)";
	shortcutElem.oldZ = shortcutElem.style.zIndex;
	shortcutContainerElem.style.zIndex = 50;

	//var shortcutContainerElem = e.target.parentNode;
	//var shortcutElem = shortcutContainerElem.querySelector(".shortcut");
	//if( shortcutElem.classList.contains("prop") )
	//	return;

	var objectSlateElem = shortcutContainerElem.querySelector(".objectSlate");

	if( objectSlateElem.style.width !== "100%" )
	{
		objectSlateElem.style.width = "100%";
		//objectSlateElem.style.transform = "scale(1.0)";
		//objectSlateElem.style.height = "50px";
		//shortcutElem.style.zIndex = 100;

		var itemId = shortcutContainerElem.getAttribute("itemId");
		var modelId = shortcutContainerElem.getAttribute("modelId");

		var shortcutTitle = "Untitled Shortcut";
		var item = (!!sessionManager.metaverse.library.items[itemId]) ? sessionManager.metaverse.library.items[itemId].current : undefined;
		if( !!item )
		{
			shortcutTitle = item.title;

			if( !!e )
			{
				var bestItemImageElem = document.querySelector("#mediaTipImage");
				bestItemImageElem.parentNode.style.display = "block";
				bestItemImageElem.style.display = "none";
				bestItemImageElem.style.opacity = 0;
				sessionManager.loadItemBestImage(bestItemImageElem, item, function()
				{
					this.style.display = "block";
					this.offsetWidth;
					this.style.opacity = 1.0;
				}.bind(bestItemImageElem));
			}
		}
		else
		{
			var model = (!!sessionManager.metaverse.library.models[modelId]) ? sessionManager.metaverse.library.models[modelId].current : undefined;
			if( !!model )
				shortcutTitle = model.title;
		}

		var shortcutTitleElem = shortcutContainerElem.querySelector(".shortcutTitle");
		if( shortcutTitle === "" )
			shortcutTitle = "Untitled Shortcut";

		shortcutTitleElem.innerHTML = shortcutTitle;

		shortcutContainerElem.style.zIndex = 100;
		objectSlateElem.style.opacity = 1.0;
	}
	//else
	//{
	//	sessionManager.shortcutMouseOut.call(shortcutContainerElem);
	//}
};

SessionManager.prototype.convertPageCoordsToWorldCoords = function(starterX, starterY)
{
	var overviewCanvasElem = document.querySelector("#overviewCanvas");

		//console.log(starterX + " and " + starterY);
	if( starterX < 0 || starterY < 0 )
	{
		// otherwise, position it at the center of the image rect
		console.log("FIX ME: OBSOLETE!");
		/*
		var overviewRect = overviewCanvasElem.getBoundingClientRect();
		var rectCenter=[overviewRect.width/2, overviewRect.height/2];
		starterX = overviewRect.left + rectCenter[0];
		starterY = overviewRect.top + rectCenter[1];
		sessionManager.clientXLocalUser = starterX;
		sessionManager.clientYLocalUser = starterY;
		*/
	}

	//starterX /= sessionManager.uberScale;

	var zoom = parseFloat(overviewCanvasElem.style.zoom);
	var overviewContainerLeft = parseFloat(overviewContainerElem.style.left) * zoom;
	var overviewContainerTop = parseFloat(overviewContainerElem.style.top) * zoom;

	var x = (starterX - overviewContainerLeft) / zoom;
	x += (sessionManager.overviewInfo.pos_x * sessionManager.uberScale);

	var y = -(starterY - overviewContainerTop) / zoom;
	y += (sessionManager.overviewInfo.pos_y * sessionManager.uberScale);

	return {"x": x / sessionManager.uberScale, "y": y / sessionManager.uberScale};
}

// https://stackoverflow.com/questions/19618745/css3-rotate-transition-doesnt-take-shortest-way
SessionManager.prototype.specialRotate = function(elem, nR)
{
	if( nR < 0 )
		nR = nR + 360;

	var aR;
	elem.rot = elem.rot || 0;
	aR = elem.rot % 360;
	if ( aR < 0 ) { aR += 360; }
	if ( aR < 180 && (nR > (aR + 180)) ) { elem.rot -= 360; }
	if ( aR >= 180 && (nR <= (aR - 180)) ) { elem.rot += 360; }
	elem.rot += (nR - aR);

	elem.style.transform = "rotate(" + elem.rot + "deg)";
};

SessionManager.prototype.localUserUpdate = function(e, shouldSync)
{
	var playerMarkerElem = document.querySelector(".localPlayerMarker");
	if( !!!playerMarkerElem )
		return;

	var sessionManager = window.sessionManager;

	//var starterX = (!!e) ? e.offsetX : sessionManager.clientXLocalUser;
	//var starterY = (!!e) ? e.offsetY : sessionManager.clientYLocalUser;
	var starterX = sessionManager.clientXLocalUser;
	var starterY = sessionManager.clientYLocalUser;

	var results = sessionManager.convertPageCoordsToWorldCoords(starterX, starterY);
	var x = results.x;
	var y = results.y;
//console.log(x);
//console.log(y);
	// rotation
	var viewConeContainerElem = playerMarkerElem.querySelector(".userLookConeContainer");
	var transform = viewConeContainerElem.style.transform;// = "rotate(" + angles.y + "deg)";
	var regex = /rotate\((.+)deg\)/i;
	var regexResults = transform.match(regex);
	var yaw = (regexResults !== null) ? parseFloat(regexResults[1]) * (-1.0) : 0;
	yaw = yaw % 360;
	if( yaw < 0 )
		yaw = 360 + yaw;

	var objectId = "";
	var itemId = "";
	//var modelId;

	// Selected objectId
	var selectedEntryContainerElem = document.querySelector(".selectedEntryRow");
	if( !!selectedEntryContainerElem )
	{
		objectId = selectedEntryContainerElem.getAttribute("objectId");
		itemId = selectedEntryContainerElem.getAttribute("itemId");
		//modelId = selectedEntryContainerElem.getAttribute("modelId");
	}

	// Web
	var url = sessionManager.viewerElem.src;
	if( url.indexOf("nopreview.html") === url.length-14 )
		url = "";
	url = "";	// always mute, for now.

	// Say
	var say = g_localUserSay;

	// Do the local movement.
	var sessionUpdateData = {
		"instance": sessionManager.instance,
		"displayName": g_webUserName,
		"item":
		{
			"id": itemId
		},
		"object":
		{
			"id": objectId
		},
		"say":
		{
			"text": say
		},
		"transform":
		{
			"body":
			{
				"origin": x + " " + y + " 0",
				"angles": "0 " + yaw + " 0"
			},
			"head":
			{
				"origin": "-0.0000000437 1.0000000000 -0.0000000000",	// same as default HL2 player
				"angles": "0 0 0"
			}
		},
		"mouse":
		{
			"x": 0,
			"y": 0
		},
		"web":
		{
			"url": url
		},
		"avatar":
		{
			"url": g_avatarUrl
		}
	};

	sessionManager.onUserSessionUpdated(sessionManager.metaverse.localUser.id, sessionUpdateData);

	// And sync us to the firebase...
	// FIXME: This should only happen 3 times a second max!!
	//(instance, say, bodyOrigin, bodyAngles, headOrigin, headAngles, item, object, mouseX, mouseY, webURL, avatarURL)
	if( shouldSync )
		sessionManager.metaverse.sendInstanceUserUpdate(sessionUpdateData.instance, sessionUpdateData.say.text, sessionUpdateData.transform.body.origin, sessionUpdateData.transform.body.angles, sessionUpdateData.transform.head.origin, sessionUpdateData.transform.head.angles, sessionUpdateData.item.id, sessionUpdateData.object.id, sessionUpdateData.mouse.x, sessionUpdateData.mouse.y, sessionUpdateData.web.url, sessionUpdateData.avatar.url, sessionUpdateData.displayName);
};

// kodi crc code originally from: http://forum.kodi.tv/showthread.php?tid=58389
Number.prototype.unsign = function(bytes)
{
	return this >= 0 ? this : Math.pow(256, bytes || 4) + this;
};

// kodi crc code originally from: http://forum.kodi.tv/showthread.php?tid=58389
SessionManager.prototype.generateCRC = function(data_in)
{
	var data = data_in.toLowerCase();
	data = data.replace(/\//g,"\\");

    var CRC = 0xffffffff;
    data = data.toLowerCase();
    for ( var j = 0; j < data.length; j++) {
        var c = data.charCodeAt(j);
        CRC ^= c << 24;
        for ( var i = 0; i < 8; i++) {
            if (CRC.unsign(8) & 0x80000000) {
                CRC = (CRC << 1) ^ 0x04C11DB7;
            } else {
                CRC <<= 1;
            }
        }
    }
    if (CRC < 0)
        CRC = CRC >>> 0;
    var CRC_str = CRC.toString(16);
    while (CRC_str.length < 8) {
        CRC_str = '0' + CRC_str;
    }

    return CRC_str;
};

SessionManager.prototype.onEntryRemoved = function(mode, val)
{
	if( mode === "Object" )
	{
		// new hotness
		if( true )
		{
			var entryRowElem = document.querySelector(".entryRow[objectId='" + val.info.id + "']");
			if( !!entryRowElem )
				entryRowElem.parentNode.removeChild(entryRowElem);
		}

		var oldSelectedEntryContainerElem = document.querySelector(".selectedEntryRow");

		var shortcutContainerElem = document.querySelector(".shortcutContainer[objectId='" + val.info.id + "']");

		var entryContainerElem = document.querySelector(".entryContainer[objectId='" + val.info.id + "']");
		if( !!entryContainerElem )
		{
			if( entryContainerElem === oldSelectedEntryContainerElem )
			{
				deselect();
				// Remove the old selected entry fx
				//oldSelectedEntryContainerElem.classList.remove("selectedEntryContainer");

				// Remove the old selected shortcut fx
				//var oldShortcutContainerElem = this.overviewCanvasElem.querySelector(".shortcutContainer[objectId='" + oldSelectedEntryContainerElem.getAttribute("objectId") + "']");
				//if( !!oldShortcutContainerElem )
				//	this.shortcutMouseOut.call(oldShortcutContainerElem);

				// Remove the item panel stuff
				//var bestItemImageElem = document.querySelector(".bestItemImage");
				//bestItemImageElem.style.display = "none";
				//var panelElem = bestItemImageElem.parentNode.parentNode.parentNode.parentNode;
				//var noEntryElem = bestItemImageElem.parentNode.parentNode.parentNode.querySelector(".noEntry");
				//noEntryElem.style.display = "block";

				// Remove the model panel stuff
				//var bestModelImageElem = document.querySelector(".bestModelImage");
				//bestModelImageElem.style.display = "none";
				//var panelElem = bestModelImageElem.parentNode.parentNode.parentNode.parentNode;
				//var noEntryElem = bestModelImageElem.parentNode.parentNode.parentNode.querySelector(".noEntry");
				//noEntryElem.style.display = "block";

				// Clear the view screen
				//sessionManager.viewerElem.parentNode.parentNode.style.display = "none";
				//var url = "nopreview.html";
				//this.viewerElem.src = url;
			}

			entryContainerElem.parentNode.removeChild(entryContainerElem);
		}

		var outerContainerElem = shortcutContainerElem.parentNode;
		if( !!outerContainerElem )
			outerContainerElem.parentNode.removeChild(outerContainerElem);
	}
};

var g_testerSwitch = false;
SessionManager.prototype.onEntryChanged = function(mode, val, fields, isNewEntry)
{
	if( mode === "Item" )
	{
		if( isNewEntry )
		{
			// Check if it's used in the entries list somewhere...
			var entriesContainerElem = document.querySelector(".shortcutsContainer");
			var usedEntryContainerElems = entriesContainerElem.querySelectorAll(".entryContainer[itemId='" + val.info.id + "']");

			var usedEntryContainerElem;
			var usedEntryElem;
			for( var i = 0; i < usedEntryContainerElems.length; i++ )
			{
				usedEntryContainerElem = usedEntryContainerElems[i];
				usedEntryElem = usedEntryContainerElem.querySelector(".entry");

				usedEntryElem.innerHTML = val.title;
			}

			// Check if it's used in the entries list somewhere...
			var entryTitleElems = document.querySelectorAll(".entryTitle[itemId='" + val.info.id + "']");
			for( var i = 0; i < entryTitleElems.length; i++ )
				entryTitleElems[i].innerHTML = val.title;

			// Check if it's used in the entries list somewhere...
			var entryTypeElems = document.querySelectorAll(".entryType[itemId='" + val.info.id + "']");
			for( var i = 0; i < entryTypeElems.length; i++ )
			{
				entryTypeElems[i].setAttribute("typeId", val.type);

				if( !!this.metaverse.library.types[val.type] )
					entryTypeElems[i].innerHTML = this.metaverse.library.types[val.type].current.title;
			}
		}
	}
	else if( mode === "Type" )
	{
		// Check if it's used in the entries list somewhere...
		var entryTypeElems = document.querySelectorAll(".entryType[typeId='" + val.info.id + "']");
		for( var i = 0; i < entryTypeElems.length; i++ )
			entryTypeElems[i].innerHTML = val.title;
	}
	else if( mode === "Model" )
	{
		if( isNewEntry )
		{
			// Check if it's used in the entries list somewhere...
			var entriesContainerElem = document.querySelector(".propsContainer");
			var usedEntryContainerElems = entriesContainerElem.querySelectorAll(".entryContainer[modelId='" + val.info.id + "']");

			var usedEntryContainerElem;
			var usedEntryElem;
			for( var i = 0; i < usedEntryContainerElems.length; i++ )
			{
				usedEntryContainerElem = usedEntryContainerElems[i];
				usedEntryElem = usedEntryContainerElem.querySelector(".entry");

				usedEntryElem.innerHTML = val.title;
			}
		}
	}
	else if( mode === "Object" )
	{
		// check if we need to add this to the Shortcuts or Props boxes.
		if( isNewEntry )
		{
			// add to the shortcuts boxes
			var entriesContainerElem;
			if( val.item !== "" )
			{
				entriesContainerElem = document.querySelector(".shortcutsContainer");
				this.addBoxEntry({"text": val.info.id, "objectId": val.info.id, "itemId": val.item, "modelId": val.model}, entriesContainerElem);
			}
			else if( val.model !== "" )
			{
				entriesContainerElem = document.querySelector(".propsContainer");
				this.addBoxEntry({"text": val.info.id, "objectId": val.info.id, "itemId": val.item, "modelId": val.model}, entriesContainerElem);
			}
		}

		if( !!fields.origin )
		{
			var shortcutContainerElem;
			if( isNewEntry )
			{
				var containerOuter = document.createElement("div");
				containerOuter.style.position = "absolute";

				shortcutContainerElem = document.createElement("div");
				shortcutContainerElem.addEventListener(g_touchStartEvent, function(e)
				{
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					return true;
				}, true);

				shortcutContainerElem.className = "shortcutContainer";
				shortcutContainerElem.setAttribute("objectId", val.info.id);
				shortcutContainerElem.setAttribute("itemId", val.item);
				shortcutContainerElem.setAttribute("modelId", val.model);
				shortcutContainerElem.style.position = "relative";

				//var containerInner = document.createElement("div");
				//containerInner.style.position = "absolute";

				var shortcutElem = document.createElement("div");
				// width & height *must* be defined here, not in the CSS.
				shortcutElem.style.width = "40px";
				shortcutElem.style.height = "40px";

				//var dynamicWidth = this.overviewWidth * 0.007;
				//var dynamicHeight = this.overviewWidth * 0.007;
				//var dynamicBorderWidth = this.overviewWidth * 0.001;
				//shortcutElem.style.width = parseInt(Math.ceil(dynamicWidth)) + "px";
				//shortcutElem.style.height = parseInt(Math.ceil(dynamicHeight)) + "px";
				//shortcutElem.style.borderWidth = parseInt(Math.ceil(dynamicBorderWidth)) + "px";

				if( val.item !== "" )
				{
					shortcutElem.className = "shortcut";
					shortcutElem.style.zIndex = 3;
				}
				else
				{
					shortcutElem.className = "shortcut prop";
					shortcutElem.style.zIndex = 2;
					//shortcutContainerElem.style.pointerEvents = "none";
				}

				shortcutElem.addEventListener("mouseover", this.shortcutMouseOver.bind(this));

				shortcutElem.addEventListener("mouseout", this.shortcutMouseOut.bind(this));
/*
				shortcutElem.addEventListener(g_touchStartEvent, function(e)
				{
					//e.preventDefault();
					e.stopPropagation();
					return false;
				}, true);*/
/*
				shortcutElem.addEventListener(g_touchEvent, function(e)
				{
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					return false;
				}, true);*/

				shortcutElem.addEventListener(g_touchEvent, function(e)
				{
					var sessionManager = window.sessionManager;
					var shortcutContainerElem = e.target.parentNode;
					
					// only if we are not ALREADY the selected entry
					var oldSelectedEntryContainerElem = document.querySelector(".selectedEntryRow");//[objectId='" + oldSelectedElem.getAttribute("objectId") + "']");
					if( !!oldSelectedEntryContainerElem )
					{
						if( oldSelectedEntryContainerElem.getAttribute("objectId") === shortcutContainerElem.getAttribute("objectId") )
						{
							activateModule("media");
							return;
						}

						// Remove the old selected entry fx
						oldSelectedEntryContainerElem.classList.remove("selectedEntryRow");

						// Remove the old selected shortcut fx
						var oldShortcutContainerElem = sessionManager.overviewCanvasElem.querySelector(".shortcutContainer[objectId='" + oldSelectedEntryContainerElem.getAttribute("objectId") + "']");
						if( !!oldShortcutContainerElem )
							sessionManager.shortcutMouseOut.call(oldShortcutContainerElem);

						// Clear the view screen
						var url = "nopreview.html";
						sessionManager.viewerElem.src = url;

						if( oldSelectedEntryContainerElem.getAttribute("objectId") !== shortcutContainerElem.getAttribute("objectId") )
							oldSelectedEntryContainerElem = undefined;

						ClearShowcase();
					}

					if( !!!oldSelectedEntryContainerElem )
					{
						/*
						// Switch to the right tab
						if( shortcutContainerElem.getAttribute("itemId") )
							sessionManager.switchToTab.call(document.querySelector("#shortcutsTab"), document.querySelector(".shortcutsContainer").parentNode);
						else
							sessionManager.switchToTab.call(document.querySelector("#propsTab"), document.querySelector(".propsContainer").parentNode);
*/

						// Select the new entry
						var entryContainerElem = document.querySelector(".entryRow[objectId='" + shortcutContainerElem.getAttribute("objectId") + "']");
						sessionManager.entryClick.call(entryContainerElem);

										/*
						// now auto-scroll the list to this element

						var parent = entryContainerElem;
						var entryTop = 0;
						while( parent.id !== "inventoryTableContainer" )
						{
							entryTop += parent.offsetTop;
							parent = parent.parentNode;
						}

entryContainerElem.querySelector("div").style.border = "10px solid red";
						var rowRect = entryContainerElem.querySelector("div").getBoundingClientRect();
						var entryTop = rowRect.top;
						console.log(rowRect);
						entryContainerElem.parentNode.parentNode.scrollTop = entryTop;
						*/
					}


					//sessionManager.shortcutMouseOut.call(oldShortcutContainerElem);

					//this.classList.add("selectedEntryContainer");

					//var shortcutContainerElem = this.sessionManager.overviewCanvasElem.querySelector("div[objectId='" + this.getAttribute("objectId") + "']");
					//sessionManager.shortcutMouseOver.call(shortcutContainerElem);
				}.bind(this), true);

				// SLATE
				var objectSlateContainerElem = document.createElement("div");
				objectSlateContainerElem.className = "objectSlateContainer";

				var objectSlateElem = document.createElement("div");
				objectSlateElem.className = "objectSlate";
				//objectSlateElem.style.top = -parseInt(Math.ceil(dynamicHeight/2)) + "px";

				//var shortcutTitleContainerElem = document.createElement("div");
				//shortcutTitleContainerElem.className = "shortcutTitleContainer";

				var shortcutTitleElem = document.createElement("div");
				if( val.item !== "" || val.model !== "" )
					shortcutTitleElem.className = "shortcutTitle";

				if( val.item === "" )
					shortcutTitleElem.classList.add("propTitle");

/*
				var dynamicShortcutTitleFontSize = parseInt(Math.ceil(this.overviewWidth * 0.01));
				shortcutTitleElem.style.fontSize = dynamicShortcutTitleFontSize + "px";
				shortcutTitleElem.style.padding = parseInt(Math.ceil(this.overviewWidth * 0.003));
				shortcutTitleElem.style.paddingLeft = parseInt(Math.ceil(this.overviewWidth * 0.025));
				shortcutTitleElem.style.paddingRight = parseInt(Math.ceil(this.overviewWidth * 0.01));
				*/
				shortcutTitleElem.innerHTML = "";

				objectSlateElem.appendChild(shortcutTitleElem);
				objectSlateContainerElem.appendChild(objectSlateElem);


				
				shortcutContainerElem.appendChild(objectSlateContainerElem);
				shortcutContainerElem.appendChild(shortcutElem);
				containerOuter.appendChild(shortcutContainerElem);
/*
				shortcutContainerElem.appendChild(objectSlateContainerElem);
				shortcutContainerElem.appendChild(shortcutElem);
				*/
			}
			else
			{
				shortcutContainerElem = this.overviewCanvasElem.querySelector(".shortcutContainer[objectId='" + val.info.id + "']");//.createElement("div");
				//shortcutContainerElem = shortcutElem.parentNode;
			}

			var splitOrigin = fields.origin.trim().split(" ");
			var origin = {
				"x": parseFloat(splitOrigin[0]),
				"y": parseFloat(splitOrigin[1]),
				"z": parseFloat(splitOrigin[2])
			};
			
			var shortcutElem = shortcutContainerElem.querySelector(".shortcut");

			var position = this.adjustOrigin(origin);
			var size = parseInt(shortcutElem.style.width);
			var newTop = (parseInt(position.y) - (size / 2.0)) + "px";
			var newLeft = (parseInt(position.x) - (size / 2.0)) + "px";
			shortcutContainerElem.style.top = newTop;
			shortcutContainerElem.style.left = newLeft;

			if( isNewEntry )
				this.overviewCanvasElem.insertBefore(shortcutContainerElem.parentNode, this.overviewCanvasElem.firstChild);
		}
	}
};

SessionManager.prototype.onInstanceChanged = function(instanceId)
{
	console.log("onInstanceChanged: " + instanceId);
};

SessionManager.prototype.onInstanceUserRemoved = function(victim)
{
	console.log(victim.session.displayName + " has LEFT the session.");
	this.addAlertMsg("<div class='chatVar' varIndex='0'></div> has LEFT the session.", [victim.session.displayName]);

	var entryContainerElem = document.querySelector(".playerCard[userId='" + victim.id + "']");
	entryContainerElem.parentNode.removeChild(entryContainerElem);

	var playerMarkerElem = this.overviewCanvasElem.querySelector(".playerMarker[userId='" + victim.id + "']");
	var playerMarkerContainerElem = playerMarkerElem.parentNode;
	playerMarkerContainerElem.parentNode.removeChild(playerMarkerContainerElem);

	delete this.playerMarkerElems[victim.id];
};

SessionManager.prototype.onInstanceUserAdded = function(userId, session, isLocalUser)//, sessionId)
{
	if( !isLocalUser )
		this.addAlertMsg("<div class='chatVar' varIndex='0'></div> has JOINED the session.", [session.displayName]);

	if( !!!this.playerMarkerElems[userId] )
	{
		var displayName = (isLocalUser) ? "YOU" : session.displayName;

		// create a player marker for them on the minimap
		var playerMarkerContainerElem = document.createElement("div");
		playerMarkerContainerElem.style.cssText = "position: absolute; pointer-events: none;";
		playerMarkerContainerElem.className = "alwaysSeen";

		var playerMarkerElem = document.createElement("div");
		playerMarkerElem.setAttribute("userId", userId);

		if( isLocalUser )
		{
			playerMarkerElem.className = "alwaysSeen playerMarker localPlayerMarker";
			playerMarkerElem.style.zIndex = 11;
		}
		else
			playerMarkerElem.className = "alwaysSeen playerMarker";

		if( isLocalUser )
		{
			document.addEventListener(g_touchMoveEvent, function(e)
			{
				if( g_localIsBeingDragged )
					return;

				var eventTarget;
				var eventPageX;
				var eventPageY;
				if( !!!e.changedTouches )
				{
					eventTarget = e.target;
					eventPageX = e.pageX;
					eventPageY = e.pageY;
					eventOffsetX = e.offsetX;
					eventOffsetY = e.offsetY;
				}
				else
				{
					if( e.touches.length > 1 )
					{
						//console.log("Handle pinch & zoom...");
						// get the mid-point
						// set mid-point as the zoom focus X & Y
						// get the distance
						// zoom by the delta distance compared to lastPinchDist
						// fin

						var rect = e.target.getBoundingClientRect();
						var x1 = e.touches[0].pageX - rect.left;
						var x2 = e.touches[1].pageX - rect.left;
						var y1 = e.touches[0].pageY - rect.top;
						var y2 = e.touches[1].pageY - rect.top;

						var midX = (x1 + x2) / 2.0;
						var midY = (y1 + y2) / 2.0;

						var xDif = x2 - x1;
						var yDif = y2 - y1;
						var dist = Math.sqrt((xDif*xDif)+(yDif*yDif));

						if( !!!window.lastPinchDist )
							window.lastPinchDist = dist;

						var deltaDist = window.lastPinchDist - dist;
						//sessionManager.clientXLocalUser = midX;
						//sessionManager.clientYLocalUser = midY;

						var offsetX = sessionManager.clientXLocalUser;
						var offsetY = sessionManager.clientYLocalUser;
						var delta = (deltaDist > 0) ? 0.1: -0.1;
						doZoom(offsetX, offsetY, delta);

						window.lastPinchDist = dist;
						return;
					}

					eventTarget = e.target;
					eventPageX = e.changedTouches[0].pageX;
					eventPageY = e.changedTouches[0].pageY;

					var rect = e.target.getBoundingClientRect();
					eventOffsetX = e.changedTouches[0].pageX - rect.left;
					eventOffsetY = e.changedTouches[0].pageY - rect.top;
					//eventOffsetX /= parseFloat(overviewCanvasElem.style.zoom);
					/*var pos = normalizePosition(e, e.target);
					eventOffsetX = pos.x;
					eventOffsetY = pos.y;*/
				}

					//console.log(parseFloat(overviewCanvasElem.style.zoom));
				// visually set it locally for us with no lag...
				var viewConeContainerElem = this.querySelector(".userLookConeContainer");

				var rect = viewConeContainerElem.getBoundingClientRect();
				var scrollTop = 0;
				var scrollLeft = 0;
				var rectCenter=[(rect.left + scrollLeft)+rect.width/2, (rect.top + scrollTop)+rect.height/2];

				var zoom = parseFloat(overviewCanvasElem.style.zoom);
				var xDif = (eventPageX / zoom) - rectCenter[0];
				var yDif = (eventPageY / zoom) - rectCenter[1];
				var dist = Math.sqrt((xDif*xDif)+(yDif*yDif));

				if( dist > 40 || (!!document.querySelector(".isMovingPlayer") && dist > 10) )
				{
					var angle = Math.atan2(xDif, -yDif) * (180/Math.PI);
					//console.log(angle);
					angle -= 90;
					window.sessionManager.specialRotate(viewConeContainerElem, angle);
				}
			}.bind(playerMarkerElem), true);
		}

		playerMarkerContainerElem.appendChild(playerMarkerElem);

		var userLookConeContainerContainerElem = document.createElement("div");
		userLookConeContainerContainerElem.style.cssText = "position: absolute;";
		userLookConeContainerContainerElem.className = "alwaysSeen";

		var userLookConeContainerElem = document.createElement("div");
		userLookConeContainerElem.className = "alwaysSeen userLookConeContainer";

		var userLookConeElem = document.createElement("div");
		userLookConeElem.className = "alwaysSeen userLookCone";
		userLookConeContainerElem.appendChild(userLookConeElem);
		userLookConeContainerContainerElem.appendChild(userLookConeContainerElem);

		var userOriginDotContainerElem = document.createElement("div");
		userOriginDotContainerElem.style.cssText = "position: absolute;";
		userOriginDotContainerElem.className = "alwaysSeen";

		var userOriginDotElem = document.createElement("div");
		userOriginDotElem.className = "alwaysSeen userOriginDot playerAvatarImage";
		userOriginDotElem.setAttribute("userId", userId);
		var avatarUrl = g_avatarUrl;
		if( !isLocalUser )
		{
			if( !!session.avatar )
				avatarUrl = session.avatar.url;
			else
				avatarUrl = "noavatar.jpg";
		}

		userOriginDotElem.style.backgroundImage = "url('" + avatarUrl + "')";
		userOriginDotElem.style.backgroundSize = "cover";

		// width & height *must* be assinged here, not in the CSS.
		userOriginDotElem.style.width = "60px";
		userOriginDotElem.style.height = "60px";

		if( !isLocalUser )
		{
			userOriginDotElem.addEventListener(g_touchStartEvent, function(e)
			{
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				return true;
			}, true);

			userOriginDotElem.addEventListener(g_touchEvent, function(e)
			{
				var sessionManager = window.sessionManager;
				
				// Switch to the right tab (if needed)
				//if( !playerMarkerElem.classList.contains("selectedPlayerMarker") )
				//	sessionManager.switchToTab.call(document.querySelector("#playersTab"), document.querySelector(".playersContainer").parentNode);

				// Select the player entry
				sessionManager.userEntryClick.call(this);
			}.bind(playerMarkerElem), true);
		}
		else
		{
			if( !g_isMobile )
			{
				userOriginDotElem.addEventListener(g_touchStartEvent, function(e)
				{
					userOriginDotElem.style.pointerEvents = "none";
					overviewCanvasElem.classList.add("isMovingPlayer");
					overviewCanvasElem.addEventListener(g_touchMoveEvent, localMouseMove, true);
					//overviewCanvasElem.style.cursor = "-webkit-grabbing";
					document.addEventListener(g_touchEndEvent, function(e)
					{
						overviewCanvasElem.classList.remove("isMovingPlayer");
						//overviewCanvasElem.style.cursor = "-webkit-grab";
						userOriginDotElem.style.pointerEvents = "all";
						overviewCanvasElem.removeEventListener(g_touchMoveEvent, localMouseMove, true);
					}, true);

					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					return true;
				}, true);
			}
			else
			{
				userOriginDotElem.addEventListener(g_touchStartEvent, function(e)
				{
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					return true;
				}, true);
			}
		}

		userOriginDotContainerElem.appendChild(userOriginDotElem);

		var userNameContainerElem = document.createElement("div");
		userNameContainerElem.style.cssText = "position: absolute;";
		userNameContainerElem.className = "alwaysSeen";

		var userNameElem = document.createElement("div");
		userNameElem.className = "alwaysSeen userName";	// should be displayName
		var safeDisplayNameNode = document.createTextNode(displayName);
		//userNameElem.innerHTML = displayName;
		userNameElem.appendChild(safeDisplayNameNode);
		userNameContainerElem.appendChild(userNameElem);

		//playerMarkerElem.appendChild(playerMarkerContainerElem);
		playerMarkerElem.appendChild(userLookConeContainerContainerElem);
		playerMarkerElem.appendChild(userOriginDotContainerElem);
		playerMarkerElem.appendChild(userNameContainerElem);

		this.overviewCanvasElem.insertBefore(playerMarkerContainerElem, this.overviewCanvasElem.firstChild);
		this.playerMarkerElems[userId] = playerMarkerElem;

		// Add to the player list
		var entriesContainerElem;
		entriesContainerElem = document.querySelector(".playersTableContainer");
//console.log(entriesContainerElem);
		var nameForList = (isLocalUser) ? session.displayName + " (YOU)" : session.displayName;
		this.addBoxEntry({"text": nameForList, "userId": userId, "objectId": "", "itemId": "", "modelId": ""}, entriesContainerElem);
///*

		//playerMarkerElem.style.left = x + "px";
		//playerMarkerElem.style.top = y + "px";
//*/
/*
		if( isLocalUser )
		{
			console.log("FIX ME: Obsolete 3");
			var overviewCanvasElem = document.querySelector("#overviewCanvas");
			var overviewRect = overviewCanvasElem.getBoundingClientRect();
			var rectCenter=[overviewRect.width/2, overviewRect.height/2];
			var starterX = overviewRect.left + rectCenter[0];
			var starterY = overviewRect.top + rectCenter[1];


			starterX = sessionManager.overviewInfo.pos_x;
			starterY = sessionManager.overviewInfo.pos_y;

			sessionManager.clientXLocalUser = starterX;
			sessionManager.clientYLocalUser = starterY;

			var results = sessionManager.convertPageCoordsToWorldCoords(starterX, starterY);
			var x = results.x;
			var y = results.y;
			//this.localUserUpdate(null, false);
		}*/
	}
};

SessionManager.prototype.updateAvatarUrl = function(userId, avatarUrl)
{
	if( !g_rdyForMsgs )
		return;

	var testerImageElem = document.createElement("img");
	testerImageElem.src = avatarUrl;

	var safeAvatarUrl = testerImageElem.src;
	testerImageElem = null;

	var playerAvatarImageElems = document.querySelectorAll(".playerAvatarImage[userId='" + userId + "']");
	var elem;
	for( var i = 0; i < playerAvatarImageElems.length; i++ )
	{
		var elem = playerAvatarImageElems[i];
		if( elem.tagName === "IMG" )
			elem.src = safeAvatarUrl;
		else
			elem.style.backgroundImage = "url('" + safeAvatarUrl + "')";
	}

	if( userId !== sessionManager.metaverse.localUser.id )
	{
		/*
		var playerMarkerElem = document.querySelector(".playerMarker[userId='" + userId + "']");
		var playerMarkerNameElem = playerMarkerElem.querySelector(".userName");
		playerMarkerNameElem.innerText = displayName;
		*/
	}
}

SessionManager.prototype.updateUserDisplayName = function(userId, displayName)
{
	if( !g_rdyForMsgs )
		return;

	//var sessionManager = window.sessionManager;
	
	//var playerEntryContainerElem = document.querySelector(".playerEntryContainer[userId='" + userId + "']");
	//playerEntryContainerElem.innerText = displayName + " (YOU)";
	//var goodName = displayName;
	//if( userId === sessionManager.metaverse.localUser.id )
	//	goodName = "YOU";

	var playerDisplayNameElems = document.querySelectorAll(".playerDisplayName[userId='" + userId + "']");
	for( var i = 0; i < playerDisplayNameElems.length; i++ )
	{
		//playerDisplayNameElems[i].innerHTML = displayName;
		var safeDisplayNameNode = document.createTextNode(displayName);
		while( !!playerDisplayNameElems[i].firstChild )
			playerDisplayNameElems[i].firstChild.parentNode.removeChild(playerDisplayNameElems[i].firstChild);
		playerDisplayNameElems[i].appendChild(safeDisplayNameNode);
	}

	if( userId !== sessionManager.metaverse.localUser.id )
	{
		var playerMarkerElem = document.querySelector(".playerMarker[userId='" + userId + "']");
		var playerMarkerNameElem = playerMarkerElem.querySelector(".userName");

		if( !!playerMarkerNameElem )
		{
			var safeDisplayNameNode = document.createTextNode(displayName);
			while( !!playerMarkerNameElem.firstChild )
				playerMarkerNameElem.firstChild.parentNode.removeChild(playerMarkerNameElem.firstChild);
			playerMarkerNameElem.appendChild(safeDisplayNameNode);
			//playerMarkerNameElem.innerText = displayName;
		}
	}
	//console.log("Display name change detected (" + userId + "): " + displayName);
}

SessionManager.prototype.onUserSessionUpdated = function(userId, userSession, oldUserSession, fields)
{
	// NOTE: fields = undefiend means this is a local visual call only.	
	// TODO: Utilize the fact that fields is given to us.
	// FIXME: This was NOT the case when you originally wrote this method!! :) :)

	//if( !!fields )
		//console.log(fields);

	if( !!oldUserSession && !!oldUserSession.instance && oldUserSession.instance !== "" && !!userSession.instance && userSession.instance !== "" && userSession.instance !== oldUserSession.instance )
	{
		window.location = "mapChange.html?universe=" + this.universe + "&instance=" + userSession.instance;
		return;
	}

	if( !!userSession.transform )
	{
		var splitOrigin = userSession.transform.body.origin.trim().split(" ");
		var origin = {
			"x": parseFloat(splitOrigin[0]),
			"y": parseFloat(splitOrigin[1]),
			"z": parseFloat(splitOrigin[2])
		};

		var playerMarkerElem = this.playerMarkerElems[userId];
		var userOriginDotElem = playerMarkerElem.querySelector(".userOriginDot");
		var size = parseInt(userOriginDotElem.style.width);

		var position = this.adjustOrigin(origin);
		var newTop = (parseInt(position.y) - (size / 2.0)) + "px";
		var newLeft = (parseInt(position.x) - (size / 2.0)) + "px";
		//newLeft = "400px";

		if( !!playerMarkerElem )
		{
			if( playerMarkerElem.style.top !== newTop ||  playerMarkerElem.style.left !== newLeft )
			{
				if( playerMarkerElem.style.top !== "" && playerMarkerElem.style.left !== "" )
				{
					var payload = {
						"top": parseInt(playerMarkerElem.style.top) + 7 + "px",
						"left": parseInt(playerMarkerElem.style.left) + 7 + "px",
						"playerMarkerElem": playerMarkerElem,
						"isLocalBread": false,
						"isSelectedBread": playerMarkerElem.classList.contains("selectedPlayerMarker")
					};

					function makeBread()
					{
						var containerElem = document.createElement("div");
						containerElem.style.position = "absolute";

						var breadCrumbContainerElem = document.createElement("div");
						breadCrumbContainerElem.className = "breadCrumbContainer";
						breadCrumbContainerElem.style.top = payload.top;
						breadCrumbContainerElem.style.left = payload.left;

						var breadCrumbElem = document.createElement("div");
						if( this.isSelectedBread )
							breadCrumbElem.className = "breadCrumb selectedBreadCrumb";
						else if( this.isLocalBread )
							breadCrumbElem.className = "breadCrumb localBreadCrumb";
						else
							breadCrumbElem.className = "breadCrumb";

						containerElem.appendChild(breadCrumbContainerElem);
						breadCrumbContainerElem.appendChild(breadCrumbElem);
						this.playerMarkerElem.parentNode.appendChild(containerElem);

						breadCrumbElem.offsetWidth;
						breadCrumbElem.style.opacity = 0;
						breadCrumbElem.style.transform = "scale(0.01)";

						var delay = 30000;
						if( this.isLocalBread )
						{
							delay /= 3.0;
							breadCrumbElem.style.webkitTransition = "all 10s";
							breadCrumbElem.style.transition = "all 10s";
							//-webkit-transition: all 30s;
							//transition: all 30s;
						}

						setTimeout(function()
						{
							this.parentNode.removeChild(this);
						}.bind(containerElem), delay);
					}

					if( !playerMarkerElem.classList.contains("localPlayerMarker") )
					{
						setTimeout(makeBread.bind(payload), 300);
					}
					else
					{
						payload.isLocalBread = true;
						makeBread.call(payload);
					}
				}

				playerMarkerElem.style.top = newTop;
				playerMarkerElem.style.left = newLeft;
			}

			// angles
			var splitAngles = userSession.transform.body.angles.trim().split(" ");
			var angles = {
				"x": parseInt(Math.round(parseFloat(splitAngles[0]))),
				"y": -parseInt(Math.round(parseFloat(splitAngles[1]))),
				"z": parseInt(Math.round(parseFloat(splitAngles[2])))
			};

			if( userId !== this.metaverse.localUser.id )
			{
				if( (!!userSession && !!userSession.say && !!userSession.say.text && userSession.say.text !== "" ) && (!!!oldUserSession || !!!oldUserSession.say || oldUserSession.say.text !== userSession.say.text) )
					this.addChatMsg(userId, "<div class='chatVar' varIndex='0'></div>", [userSession.say.text]);
			}
			else
			{
				if( g_localUserSay !== g_oldLocalUserSay && g_localUserSay !== "" )
				{
					this.addChatMsg(userId, "<div class='chatVar' varIndex='0'></div>", [g_localUserSay]);
					g_oldLocalUserSay = g_localUserSay;
				}
			}

			if( userId !== this.metaverse.localUser.id )
			{
				if( !!!oldUserSession || oldUserSession.displayName !== userSession.displayName )
				{
					this.updateUserDisplayName(userId, userSession.displayName);
				}

				if( !!!oldUserSession || !!!oldUserSession.avatar || oldUserSession.avatar.url !== userSession.avatar.url )
				{
					this.updateAvatarUrl(userId, userSession.avatar.url);
				}

				var viewConeContainerElem = playerMarkerElem.querySelector(".userLookConeContainer");
				//viewConeContainerElem.style.transform = "rotate(" + angles.y + "deg)";
				window.sessionManager.specialRotate(viewConeContainerElem, angles.y);

				var selectedPlayerMarkerElem = document.querySelector(".selectedPlayerMarker");
				if( !!selectedPlayerMarkerElem )
				{
					if( !!!oldUserSession || oldUserSession.object.id !== userSession.object.id )
					{
						if( userSession.object.id === "" )
						{
							var selectedEntryContainerElem = document.querySelector(".selectedEntryRow");
							if( selectedEntryContainerElem )
							{
								var selectedEntryObjectId = selectedEntryContainerElem.getAttribute("objectId");
								if( !!selectedEntryContainerElem && selectedEntryObjectId === oldUserSession.object.id )
								{
									deselect();
									//var sessionManager = window.sessionManager;
									//sessionManager.entryClick.call(selectedEntryContainerElem, null);

									// Clear the view screen
									//sessionManager.viewerElem.parentNode.parentNode.style.display = "none";
									//var url = "nopreview.html";
									//if( sessionManager.viewerElem.src.indexOf(url) < 0 )
									//	sessionManager.viewerElem.src = url;
								}
							}
						}
						else
						{
							var selectedEntryContainerElem = document.querySelector(".selectedEntryRow");
							var targetEntryContainerElem = document.querySelector(".entryRow[objectId='" + userSession.object.id + "']");
							
							if( !!targetEntryContainerElem && (!!!selectedEntryContainerElem || selectedEntryContainerElem.getAttribute("objectId") !== userSession.object.id) )
							{
								var sessionManager = window.sessionManager;
								sessionManager.entryClick.call(targetEntryContainerElem, null);

								// Switch to the right tab
								if( targetEntryContainerElem.getAttribute("itemId") )
									sessionManager.switchToTab.call(document.querySelector("#shortcutsTab"), document.querySelector(".shortcutsContainer").parentNode);
								else
									sessionManager.switchToTab.call(document.querySelector("#propsTab"), document.querySelector(".propsContainer").parentNode);

								// now auto-scroll the list to this element
								var entryTop = targetEntryContainerElem.offsetTop;
								targetEntryContainerElem.parentNode.scrollTop = entryTop;
							}
						}
					}
				}
			}
		}

		// web url
		/* DISABLED until a player following system is added to the web client!!
		if( !!!oldUserSession || oldUserSession.web.url !== userSession.web.url )
		{
			if( userSession.web.url.toLowerCase().indexOf("http://") === 0 || userSession.web.url.toLowerCase().indexOf("https://") === 0 )
			{
				var url = userSession.web.url;
				var searchString = "smarcade.net/dlcv2/view_youtube.php";
				var foundIndex = url.indexOf(searchString);
				if( foundIndex >= 0 )
					url = "http://www.anarchyarcade.com/youtube_player.php" + url.substring(foundIndex + searchString.length);

				//console.log(g_viewerWidth + " , " + g_viewerHeight);
				if( url.indexOf("youtube_player.php") >= 0 )
				{
					url += "&width=" + this.viewerWidth + "&height=" + this.viewerHeight;
					//url = "&width=1920&height=1080";
				}
				this.viewerElem.src = url;
			}
			else
				this.viewerElem.src = "nopreview.html";//userSession.web.url;
		}
		*/

		// g_playerCursorElem

		/* DISABLED until a player following system is added to the web client!!
		if( !!!oldUserSession || oldUserSession.mouse.x !== userSession.mouse.x )
		{
			var mousePosition = {
				"x": this.viewerWidth * userSession.mouse.x,
				"y":this.viewerHeight * userSession.mouse.y,
			};

			this.playerCursorElem.style.top = parseInt(Math.round(mousePosition.y)) + "px";
			this.playerCursorElem.style.left = parseInt(Math.round(mousePosition.x)) + "px";
		}
		*/
	}

//if( !!fields )
//console.log(fields.object);
	if( !!fields && !!fields.object )
	{
		if( g_ignoreNextTuneAlert )
			g_ignoreNextTuneAlert = false;
		else
		{
			var objectId = fields.object.id;
			var object = this.metaverse.library.objects[objectId];
			if( !!object )
			{
				object = object.current;

				var item = this.metaverse.library.items[object.item];
				if( !!item )
				{
					item = item.current;

					var msg = "<font style='font-weight: 900;'><div class='chatVar' varIndex='0'></div></font> tuned into <div class='objectChatLink' onclick='tuneToObject(\"" + objectId + "\");'><img src='chatIconObject.png' class='chatIcon' /><div class='objectChatLinkTitle'><div class='chatVar' varIndex='1'></div></div></div>";
					this.addAlertMsg(msg, [userSession.displayName, item.title]);

					var selectedPlayerEntryContainerElem = document.querySelector(".selectedPlayerEntryContainer");
					if( !!selectedPlayerEntryContainerElem && userId !== this.metaverse.localUser.id && selectedPlayerEntryContainerElem.getAttribute("userId") === userId )
						tuneToObject(objectId);
				}
			}
		}
	}

	if( !!fields && !!fields.displayName && !!oldUserSession )
	{
		var msg = "<div class='chatVar' varIndex='0'></div> changed their name to <div class='chatVar' varIndex='1'></div>.";
		this.addAlertMsg(msg, [oldUserSession.displayName, fields.displayName]);
	}
};