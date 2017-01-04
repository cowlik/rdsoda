/*
 *	Cowlik.GoogleMaps
 *
 *	Wrapper Class for the GoogleMaps Javascript API V3:
 *	https://developers.google.com/maps/documentation/javascript/
 *
 *	@version 1.0 [08/20/2012]
 *	@author: Clint Harrison
 *
 *	Dependencies:
 *	Loading the Google Maps API (Place in <head>)
 *	<script src="http://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&sensor=SET_TO_TRUE_OR_FALSE"></script>
 *
 *	Use the 'Google Maps API Styled Map Wizard' for customizing & generating map styles:
 *	http://gmaps-samples-v3.googlecode.com/svn/trunk/styledmaps/wizard/index.html
 */

var Cowlik = Cowlik || {}; // Cowlik Namespace

Cowlik.GoogleMaps = {};

/*
 *	Map Class
 *
 *	https://developers.google.com/maps/documentation/javascript/reference#Map
 *
 *	Params:
 *		@mapContainerElem:Node - DOM element node that will contain the map
 *		@mapOptions:Object - set of initial Map properties
 *			see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
 *		@geocoder:Object - instance of the Geocoder Wrapper class (below)
 *		@callback:Function - method called after the Map object has been instantiated
 *		@callbackOptions:Object - collection of additional props/values
 */
Cowlik.GoogleMaps.Map = function(mapContainerElem, mapOptions, geocoder, callback, callbackOptions) {
	var base = this;
		
	base.containerElem = mapContainerElem;
	
	function init() {
		base.GoogleMap = new google.maps.Map(base.containerElem, mapOptions);
		callback(base);
	}
	
	function setInitMapCenter(data) {
		mapOptions.center = data[0].geometry.location;
		init();
	}
	
	// does "center" property need to be geocoded?
	if (typeof mapOptions.center == 'string') {
		geocoder.geocodeAddress({ 'address': mapOptions.center }, setInitMapCenter); // async call
	} else {
		init();
	}
};

/*
 * Public Methods
 */
Cowlik.GoogleMaps.Map.prototype.setOptions = function(opts) {
	this.GoogleMap.setOptions(opts);
};

Cowlik.GoogleMaps.Map.prototype.getCenter = function() {
	return this.GoogleMap.getCenter();
};

Cowlik.GoogleMaps.Map.prototype.setCenter = function(latLng) {
	this.GoogleMap.setCenter(latLng);
};

Cowlik.GoogleMaps.Map.prototype.getZoom = function() {
	return this.GoogleMap.getZoom();
};

Cowlik.GoogleMaps.Map.prototype.setZoom = function(zoom) {
	this.GoogleMap.setZoom(zoom);
};

Cowlik.GoogleMaps.Map.prototype.panTo = function(latLng) {
	this.GoogleMap.panTo(latLng);
};

Cowlik.GoogleMaps.Map.prototype.resizeMap = function() {
	google.maps.event.trigger(this.GoogleMap, 'resize');
};

/*
 *	Google Map method for touch devices, overrides
 *	map 'dragging' (panning) on mobile browsers.
 */
Cowlik.GoogleMaps.Map.prototype.scrollMapContainer = function() {
	var base = this,
		container = base.containerElem,
		isScrolling = false,
		touchStart = 0,
		touchEnd = 0;
	
	// turn map dragging off
	base.setOptions({ draggable: false });
	
	container.addEventListener('touchstart', function(event) {
		isScrolling = true;
		touchStart = event.touches[0].pageY;
	});
	
	container.addEventListener('touchend', function(event) {
		isScrolling = false;
	});
	
	container.addEventListener('touchmove', function(event) {
		if (!isScrolling) {
			return;
		}
		touchEnd = event.touches[0].pageY;
		window.scrollBy(0, (touchStart - touchEnd));
	});
};


/*
 *	Geocoder Class
 *
 *	https://developers.google.com/maps/documentation/javascript/geocoding
 */
Cowlik.GoogleMaps.Geocoder = function() {
	this.GoogleGeocoder = new google.maps.Geocoder();
};

/*
 *	Public Method geocodeAddress
 *
 *	Converts Address into Geographic Coordinates via the Google Maps API:
 *	https://developers.google.com/maps/documentation/javascript/geocoding
 *
 *	Params:
 *		@query:Object - contains either an 'address' string or a 'latLng' object
 *				ex: { 'address': 'Seattle } or 
 *					{ 'latLng': new google.maps.LatLng(-34.397, 150.644) } (reverse geocode)
 *		@callback:Function - method called after the geocoding request is successful
 *		@opts:Object - collection of additional props/values
 */
Cowlik.GoogleMaps.Geocoder.prototype.geocodeAddress = function(query, callback, opts) {
	this.GoogleGeocoder.geocode(query, function(data, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			callback(data, opts);
		} else {
			// console.log(status);
		}
	});
};


/*
 *	Distance Matrix Service Class
 *
 *	https://developers.google.com/maps/documentation/javascript/distancematrix
 */
Cowlik.GoogleMaps.DistanceMatrixService = function() {
	this.DistanceMatrixService = new google.maps.DistanceMatrixService();
};

/*
 *	Public Method getDistanceMatrix
 *
 *	Converts Address into Geographic Coordinates via the Google Maps API:
 *	https://developers.google.com/maps/documentation/javascript/geocoding
 *
 *	Params:
 *		@origins:Array - array containing one or more address strings and/or google.maps.LatLng objects, from which to calculate distance and time
 *		@destinations:Array - array containing one or more address strings and/or google.maps.LatLng objects, to which to calculate distance and time.
 *		@callback:Function - method called after the request is successful
 *		@opts:Object - collection of additional props/values
 */
Cowlik.GoogleMaps.DistanceMatrixService.prototype.getDistanceMatrix = function(origins, destinations, callback, opts) {
	this.GoogleDistanceMatrixService.getDistanceMatrix(
		{
			origins: origins,
			destinations: destinations,
			travelMode: google.maps.TravelMode.DRIVING,
			unitSystem: google.maps.UnitSystem.IMPERIAL,
			avoidHighways: true,
			avoidTolls: true
		}, onDistanceMatrixDataReady);
		
	function onDistanceMatrixDataReady(data, status) {
		if (status == google.maps.DistanceMatrixStatus.OK) {
			callback(data, opts);
		} else {
			console.log(status);
		}
	};
};


/*
 *	Marker / MarkerWithLabel Class
 *
 *	MarkerWithLabel extends the Google Maps JavaScript API V3 google.maps.Marker class.
 *
 *	Dependencies:
 *	http://google-maps-utility-library-v3.googlecode.com/svn/tags/markerwithlabel/1.1.7/src/
 *
 *	References:
 *	https://developers.google.com/maps/documentation/javascript/reference#Marker
 *	http://google-maps-utility-library-v3.googlecode.com/svn/tags/markerwithlabel/1.1.7/docs/reference.html
 *
 *
 *	Params:
 *		@markerOptions:Object - properties for the Marker object
 *			see: https://developers.google.com/maps/documentation/javascript/reference#MarkerOptions
 *				 http://google-maps-utility-library-v3.googlecode.com/svn/tags/markerwithlabel/1.1.7/docs/reference.html#MarkerWithLabelOptions
 */
Cowlik.GoogleMaps.Marker = function(markerOptions) {
	this.GoogleMarker = new MarkerWithLabel(markerOptions);
};

/* 
 *	Public Methods
 */
Cowlik.GoogleMaps.Marker.prototype.addEventListener = function(eventName, handler) {
	google.maps.event.addListener(this.GoogleMarker, eventName, handler);
};

Cowlik.GoogleMaps.Marker.prototype.clearListeners = function(eventName) {
	google.maps.event.clearListeners(this.GoogleMarker, eventName);
};

Cowlik.GoogleMaps.Marker.prototype.clearInstanceListeners = function() {
	google.maps.event.clearInstanceListeners(this.GoogleMarker);
};

Cowlik.GoogleMaps.Marker.prototype.setOptions = function(opts) {
	this.GoogleMarker.setOptions(opts);
};


/*
 *	InfoBox Class
 *
 *	An InfoBox behaves like a google.maps.InfoWindow, but it supports several
 *	additional properties for advanced styling. An InfoBox can also be used as a map label. 
 *
 *	Dependencies:
 *	http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/src/
 *
 *	Reference:
 *	http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/docs/reference.html
 *
 *	Params:
 *		@infoBoxOptions:Object - properties for the Marker object
 *			see: http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/docs/reference.html#InfoBoxOptions
 */
Cowlik.GoogleMaps.InfoBox = function(opts) {
	this.GoogleInfoBox = new InfoBox(opts);
};

/* 
 *	Public Methods
 */
Cowlik.GoogleMaps.InfoBox.prototype.open = function(map) {
	this.GoogleInfoBox.open(map);
};

Cowlik.GoogleMaps.InfoBox.prototype.setVisible = function(isVisible) {
	this.GoogleInfoBox.setVisible(isVisible);
};

Cowlik.GoogleMaps.InfoBox.prototype.setOptions = function(opts) {
	this.GoogleInfoBox.setOptions(opts);
};

Cowlik.GoogleMaps.InfoBox.prototype.addEventListener = function(eventName, handler) {
	google.maps.event.addListener(this.GoogleInfoBox, eventName, handler);
};


/*
 *	Polyline Class
 *
 *	https://developers.google.com/maps/documentation/javascript/reference#Polyline
 *
 *	Params:
 *		@infoBoxOptions:Object - properties for the Marker object
 *			see: http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/docs/reference.html#InfoBoxOptions
 */
Cowlik.GoogleMaps.Polyline = function(opts) {
	this.GooglePolyline = new google.maps.Polyline(opts);
};

/* 
 *	Public Methods
 */
Cowlik.GoogleMaps.Polyline.prototype.setVisible = function(isVisible) {
	this.GooglePolyline.setVisible(isVisible);
};

Cowlik.GoogleMaps.Polyline.prototype.getVisible = function() {
	return this.GooglePolyline.getVisible();
};
 