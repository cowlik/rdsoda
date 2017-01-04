/*
 *	Cowlik.Instagram
 *
 *	Wrapper Class for the Instagram Javascript API:
 *	http://instagram.com/developer/
 *
 *	@version 1.0 [08/20/2012]
 *	@author: Clint Harrison
 *
 *	Dependencies:
 *	jQuery - <script src="https://ajax.googleapis.com/ajax/libs/jquery/JQUERY_VERSION/jquery.min.js"></script>
 */

var Cowlik = Cowlik || {}; // Cowlik Namespace

Cowlik.Instagram = {};

/*
 *	API Class
 *
 *	Params:
 *		@clientID:String - Your Instagram-issued application ID
 */
Cowlik.Instagram.API = function(clientID) {
	var base = this;
	
	base.BASE_URI = 'https://api.instagram.com/';
	base.VERSION_URI = 'v1/';
	base.clientID = clientID;
};

/*
 *	Public Method requestEndpointData
 *
 *	Returns Instagram API endpoint data in JSON format
 *	http://instagram.com/developer/endpoints/
 *
 *	Params:
 *		@url:String - URI snippet of the endpoint you are requesting (automatically appended to the BASE_URI string)
 *				ex: 'tags/seattle/media/recent/'
 *					- or -
 *				URL of the entire request. ex: 'https://api.instagram.com/v1/...' 
 *		@callback:Function - method called after the endpoint data is successfully retrieved
 *		@opts:Object - collection of additional props/values
 */
Cowlik.Instagram.API.prototype.requestEndpointData = function(url, callback, opts) {
	var base = this,
		reqURL = base.BASE_URI + base.VERSION_URI + url +'?client_id='+ base.clientID +'&callback=?';
	
	// check for an absolute URL
	if (url.substr(0, 4) == 'http') { reqURL = url; }
	
	$.get(reqURL, function(data) {
		callback(data, opts);
	}, 'jsonp');
};


