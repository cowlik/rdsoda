/*
 *	RdSoda.Map
 *
 *	@author: Clint Harrison
 */

var RdSoda = RdSoda || {};

RdSoda.Map = {
	init: function(callback) {
		var map = this,
			mapConfig = RdSoda.config.Map,
			mapStyles = [
			{
				stylers: [
					{ visibility: 'on' }, 
					{ saturation: -40 },
					{ lightness: 30 }
				]
			},{ 
				featureType: 'landscape.natural',
				elementType: 'labels',
				stylers: [
					{ visibility: 'off' } 
				]
			},{ 
				featureType: 'landscape.natural.terrain',
				stylers: [
					{ visibility: 'off' } 
				]
			},{ 
				featureType: 'poi', 
				stylers: [ 
					{ visibility: 'off' } 
				] 
			},{ 
				featureType: 'administrative.country', 
				elementType: 'geometry.stroke', 
				stylers: [ 
					{ visibility: 'on' },
					{ lightness: 70 }
				] 
			},{ 
				featureType: 'administrative',
				elementType: 'labels',
				stylers: [ 
					{ visibility: 'on' },
					{ weight: 2 },
					{ color: '#666666' },
					{ lightness: 65 }
				] 
			},{ 
				featureType: 'administrative',
				elementType: 'labels.text.stroke',
				stylers: [ 
					{ visibility: 'off' }
				] 
			},{ 
				featureType: 'administrative',
				elementType: 'labels.icon',
				stylers: [ 
					{ visibility: 'off' }
				] 
			},{ 
				featureType: 'administrative',
				elementType: 'geometry',
				stylers: [ 
					{ visibility: 'on' }
				] 
			},{ 
				featureType: 'administrative',
				elementType: 'geometry.fill',
				stylers: [ 
					{ visibility: 'on' }
				] 
			},{
				featureType: 'road',
				elementType: 'all', 
				stylers: [ 
					{ visibility: 'off' } 
				] 
			},{
				featureType: 'road.highway',
				elementType: 'geometry', 
				stylers: [ 
					{ visibility: 'on' },
					{ color: '#ff8800' },
					{ lightness: 65 } 
				] 
			},{
				featureType: 'transit',
				elementType: 'all', 
				stylers: [ 
					{ visibility: 'off' } 
				] 
			},{ 
				featureType: 'water', 
				stylers: [
					{ visibility: 'on' },
					{ lightness: 20 }
				]
			},{ 
				featureType: 'water',
				elementType: 'labels',
				stylers: [ 
					{ visibility: 'on' } ,
					{ weight: 2 },
					{ color: '#666666' },
					{ lightness: 60 }
				] 
			},{ 
				featureType: 'water',
				elementType: 'labels.text.stroke',
				stylers: [ 
					{ visibility: 'off' }
				] 
			}
		],
		mapOptions = {
			backgroundColor: '#eee',
			center: new google.maps.LatLng(47.6062095, -122.3320708), // Seattle, WA
			disableDefaultUI: true,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scrollwheel: false,
			styles: mapStyles,
			zoom: mapConfig.ZOOM_DEFAULT
		};
				
		function onGoogleMapReady(Map) {
			map.Map = Map;
			
			RdSoda.config.Map.centerDefault = map.Map.getCenter(); // replace String w/ LatLng
			
			// Wait for all map tiles to load
			google.maps.event.addListenerOnce(map.Map.GoogleMap, 'tilesloaded', function() {
				if (RdSoda.config.App.isTouchDevice) {
					// init for scrolling over the map container on Touch devices
					map.Map.scrollMapContainer();
				}
				
				callback(); // callback once GoogleMap is finished loading
			});
		}
		
		// add Google Map object
		new Cowlik.GoogleMaps.Map(document.getElementById('map'), mapOptions, new Cowlik.GoogleMaps.Geocoder(), onGoogleMapReady);
	},
	slideToMap: function(markerLocation) {
		var map = this,
			duration = 750;
		
		$('html, body').animate({
			scrollTop: $(map.Map.containerElem).position().top
		}, duration);
		
		// delay Map actions until sliding has completed
		setTimeout(function() {
			// panTo and center marker on map
			RdSoda.Map.panTo(markerLocation);
		}, duration);
	},
	resetMap: function() {
		var map = this;
		// set default map properties
		map.Map.setZoom(RdSoda.config.Map.ZOOM_DEFAULT);
		map.panTo(RdSoda.config.Map.centerDefault);
	},
	panTo: function(location) {
		var map = this;
		map.Map.panTo(location);
	},
	openTrip: function(trip) {
		var map = this;
		
		if (!trip.map.polyline.isVisible()) {
			// show polyline
			trip.map.polyline.show();
			
			// iterate through all the trip's markers
			for (var i = 0, markersLength = trip.map.markers.length; i < markersLength; i++ ) {
				var markers = trip.map.markers[i];
				// Markers
				markers.Marker.setOptions({
					icon: {
						path: google.maps.SymbolPath.CIRCLE,
						scale: 3,
						strokeColor: trip.data.color,
						strokeOpacity: 0.8,
						strokeWeight: 3
					},
					labelVisible: true
				});
				// InfoBox
				markers.InfoBox.setOptions({
					pixelOffset: new google.maps.Size(-18, -21)
				});
			}
		}
	},
	closeTrip: function(trip) {
		var map = this;
		
		// hide polyline
		trip.map.polyline.hide();
		
		// iterate through all the trip's markers
		for (var i = 0, markersLength = trip.map.markers.length; i < markersLength; i++ ) {
			var markers = trip.map.markers[i];
			// Markers
			markers.Marker.setOptions({
				icon: marker.markerStyle,
				labelClass: 'marker-label-id',
				labelVisible: false
			});
			// InfoBox
			markers.InfoBox.setOptions({
				visible: false,
				boxClass: 'map-marker-infoBox',
				pixelOffset: new google.maps.Size(-18, -6)
			});
		}
	}
};

RdSoda.Map.Marker = function(trip, id, data) {
	var marker = this,
		map = RdSoda.Map.Map.GoogleMap,
		markerCoords = data.location;
		
	marker.markerStyle = {
		path: google.maps.SymbolPath.CIRCLE,
		scale: 4,
		fillColor: trip.data.color,
		fillOpacity: 0.8,
		strokeWeight: 0
	};
	marker.Marker = new Cowlik.GoogleMaps.Marker({
		icon: marker.markerStyle,
		position: markerCoords,
		map: map,
		labelContent: id + 1,
		labelAnchor: new google.maps.Point(8, 20),
		labelClass: 'marker-label-id', // the CSS class for the label
		labelVisible: false
	});
	marker.InfoBox = new Cowlik.GoogleMaps.InfoBox({ // add corresponding marker "infoBox"
		alignBottom: true,
		closeBoxURL: '',
		disableAutoPan: true, // IMPORTANT: if set to false, map will auto-pan/center to infoBox's position 
		position: markerCoords,
		pixelOffset: new google.maps.Size(-18, -6),
		visible: false
	});
	
	// store props
	marker.id = id;
	marker.thumbnail = data.image.thumbnail.url;
	marker.isLoaded = false;
	
	// enable map marker mouseevents
	marker.enableMarker(trip.id);
	
	// listen to see when infobox's are added to the DOM
	marker.InfoBox.addEventListener('domready', function(event) {
		// check to see if all map elements have been added
		if (trip.id === RdSoda.Trips.trips.length - 1 && id === trip.data.markers.length - 1) {
			RdSoda.Trips.callback();
		}
	});
	
	// initially open infoBox and hide
	marker.InfoBox.open(map);
};

RdSoda.Map.Marker.prototype = {
	enableMarker: function(tripId) {
		var marker = this,
			Marker = marker.Marker,
			InfoBox = marker.InfoBox,
			trip = RdSoda.Trips.trips[tripId];
		
		Marker.addEventListener('mouseover', function(event) {
			marker.selectMarker(trip.id);
		});
		
		Marker.addEventListener('mouseout', function(event) {
			marker.deselectMarker();
		});
		
		Marker.clearListeners('click');
		Marker.addEventListener('click', function(event) {
			// check if trip is already open
			if (trip.contentElem.offsetWidth > 0 && trip.contentElem.offsetHeight > 0) {
				trip.selectMarker(marker.id); // trip & map marker
				trip.slideToMarker(marker.id); // scroll to trip marker
				RdSoda.trackEvent('Map', 'Select', 'Marker'); // GA tracking
			} else {
				trip.openTrip(marker.id);
				RdSoda.trackEvent('Map', 'Open', 'Trip'); // GA tracking
			}
		});
	},
	disableMarker: function() {
		var Marker = this.Marker;
		
		Marker.clearListeners('mouseover');
		Marker.clearListeners('mouseout');
		//Marker.clearListeners('click');
	},
	selectMarker: function(tripId) {
		var marker = this;
		
		marker.Marker.setOptions({
			labelClass: 'marker-label-id selected',
			zIndex: google.maps.Marker.MAX_ZINDEX++ // place marker at the top of the stack
		});
		
		marker.loadInfoBox(tripId);
	},
	deselectMarker: function() {
		var marker = this;
		
		marker.Marker.setOptions({
			labelClass: 'marker-label-id'
		});
		
		// hide infoBox
		marker.InfoBox.setOptions({
			visible: false,
			boxClass: 'map-marker-infoBox'
		});
		
		marker.InfoBox.setVisible(false);
	},
	loadInfoBox: function(tripId) {
		var marker = this,
			InfoBox = marker.InfoBox;
		
		if (!marker.isLoaded) {
			var infoBoxName = 'trip'+ tripId +'-map-marker-infoBox'+ marker.id;
			
			InfoBox.setOptions({
				boxClass: 'map-marker-infoBox '+ infoBoxName +'',
				content: '<img src="'+ marker.thumbnail +'" class="img-rounded" width="36" height="36" />'
			});
			
			// listen for fully loaded img
			$('.'+ infoBoxName).find('img').load(function() {
				marker.isLoaded = true;
				marker.showInfoBox();
			});
		} else {
			marker.showInfoBox();
		}
	},
	showInfoBox: function() {
		this.InfoBox.setOptions({
			visible: true,
			boxClass: 'map-marker-infoBox selected'
		});
	}
}

RdSoda.Map.Polyline = function(trip) {
	var polyline = this;
	
	polyline.Polyline = new Cowlik.GoogleMaps.Polyline({
		map: RdSoda.Map.Map.GoogleMap,
		path: trip.coords,
		strokeColor: trip.data.color,
		strokeOpacity: 0.8,
		strokeWeight: 1,
		visible: false 
	});
};

RdSoda.Map.Polyline.prototype = {
	show: function() {
		var polyline = this;
		polyline.Polyline.setVisible(true);
	},
	hide: function() {
		var polyline = this;
		polyline.Polyline.setVisible(false);
	},
	isVisible: function() {
		var polyline = this;
		return polyline.Polyline.getVisible();
	}
};



