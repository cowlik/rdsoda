/*
 *	RdSoda.Trips
 *
 *	@author: Clint Harrison
 */

var RdSoda = RdSoda || {};

RdSoda.Trips = {
	init: function(data, callback) {
		var trips = this;
		
		// check for markers
		if (data.length > 0) {
			var tripsLength = data.length;
			
			trips.elem = document.getElementById('trips');
			trips.trips = []; // array for collecting Trip instances
			trips.docFragment = document.createDocumentFragment();
			trips.callback = callback;
			
			// iterate through trips and add elements
			for (var i = 0; i < tripsLength; i++) {
				trips.trips.push(new trips.Trip(i, data[i]));
			}
			
			// append document fragment to the trips DOM element
			trips.elem.appendChild(trips.docFragment);
			
			// now, iterate through trips again after appending to DOM
			for (var j = 0; j < tripsLength; j++) {
				var trip = trips.trips[j],
					tripBtnElem,
					tripBtnImgElem;
				
				// declare trip element properties
				trip.elem = document.getElementById('trip' + j);
				trip.contentElem = trip.elem.querySelector('.trip-content');
				
				tripBtnElem = trip.elem.querySelector('.trip-btn');
				tripBtnElem.tripId = trip.id;
				
				// add trip btn images
				tripBtnImgElem = tripBtnElem.getElementsByTagName('img');
				tripBtnImgElem[0].src = trip.data.markers[0].image.thumbnail.url;
				tripBtnImgElem[1].src = trip.data.markers[trip.data.markers.length - 1].image.thumbnail.url;
				
				// bind click event to each btn 
				tripBtnElem.addEventListener('click', function(event) {
					var tripId = event.currentTarget.tripId,
						trip = trips.trips[tripId];
					
					if (trip.contentElem.offsetWidth > 0 && trip.contentElem.offsetHeight > 0) {
						trip.closeTrip(true);
					} else {
						trip.openTrip(0);
						RdSoda.trackEvent('Trips', 'Open', 'Trip'); // GA tracking
					}
				});
				
				// add markers, infoBoxs, & polylines to map
				trip.addToMap();
			}
		}
	},
	showTrips: function() {
		var trips = this;
		
		for (var i = 0, tripsLength = trips.trips.length; i < tripsLength; i++) {
			var trip = trips.trips[i],
				delay = i * 300;
			
			setTimeout((function(t) {
				return function() {
					// fade-in trip
					RdSoda.addCSSClass(t.elem, 'ready');
				};
			})(trip), delay);
		}
	},
	currSelection: {
		markerId: null,
		tripId: null
	}
};

RdSoda.Trips.Trip = function(id, data) {
	var trip = this,
		tripDuration = Math.ceil((data.markers[data.markers.length - 1].dateStamp.getTime() - data.dateStart.getTime()) / (1000*60*60*24)),
		shareUrl = 'http://www.rdsoda.com?trip='+ data.name +'&author='+ data.author,
		shareText = 'Follow my trip on RdSoda:';
		
	var rowFluidElem = document.createElement('div');
	rowFluidElem.className = 'row-fluid';
	
	var tripShareLinkElem = document.createElement('a');
	tripShareLinkElem.className = 'share-btn img-rounded';
	tripShareLinkElem.target = '_blank';
	
	var tripBtnImgElem = document.createElement('img');
	tripBtnImgElem.className = 'img-rounded';
	tripBtnImgElem.src = 'imgs/image-placeholder.png';
	tripBtnImgElem.width = 30;
	tripBtnImgElem.height = 30;
	
	var tripElem = document.createElement('div'),
		rowFluidElem1 = rowFluidElem.cloneNode(false),
		tripContentElem = document.createElement('div'),
		rowFluidElem2 = rowFluidElem.cloneNode(false),
		tripDetailsElem = document.createElement('div'),
		tripDetailsRightElem = document.createElement('div'),
		tripShareLinkTwitterElem = tripShareLinkElem.cloneNode(false),
		tripShareLinkFbElem = tripShareLinkElem.cloneNode(false),
		tripShareLinkEmailElem = tripShareLinkElem.cloneNode(false),
		tripShareSpanElem = document.createElement('span'),
		tripShareTxtElem = document.createElement('p'),
		tripNumberOfSpanElem = document.createElement('span'),
		tripNumberOfTxtElem = document.createElement('p'),
		tripDurationSpanElem = document.createElement('span'),
		tripDurationTxtElem = document.createElement('p'),
		tripDepartedSpanElem = document.createElement('span'),
		tripDepartedTxtElem = document.createElement('p'),
		tripAuthorLinkElem = document.createElement('a'),
		tripAuthorImgElem = document.createElement('img'),
		rowFluidElem3 = rowFluidElem.cloneNode(false),
		tripBtnElem = document.createElement('div'),
		tripBtnLabelElem = document.createElement('h4'),
		tripBtnImgElem1 = tripBtnImgElem.cloneNode(false);
	
	
	tripElem.id = 'trip'+ id;
	tripElem.className = 'trip span12';
	tripContentElem.className = 'trip-content span12';
	tripDetailsElem.className = 'trip-details span4';
	tripShareLinkTwitterElem.href = 'http://twitter.com/share?url='+ encodeURIComponent(shareUrl) +'&text='+ encodeURIComponent(shareText);
	//tripShareLinkTwitterElem.onclick = function() { RdSoda.trackEvent('Trips', 'Share', 'Twitter'); };
	tripShareLinkTwitterElem.appendChild(document.createTextNode('t'));
	tripShareLinkFbElem.className += ' share-btn-facebook';
	tripShareLinkFbElem.href = 'http://www.facebook.com/share.php?u='+ encodeURIComponent(shareUrl);
	//tripShareLinkFbElem.onclick = function() { RdSoda.trackEvent('Trips', 'Share', 'Facebook'); };
	tripShareLinkFbElem.appendChild(document.createTextNode('f'));
	tripShareLinkEmailElem.className += ' share-btn-email';
	tripShareLinkEmailElem.href = 'mailto:?body='+ encodeURIComponent(shareUrl) +'&subject='+ encodeURIComponent(shareText);
	//tripShareLinkEmailElem.onclick = function() { RdSoda.trackEvent('Trips', 'Share', 'Email'); };
	tripShareLinkEmailElem.appendChild(document.createTextNode('e'));
	tripShareSpanElem.appendChild(document.createTextNode('Share this:'));
	tripShareTxtElem.appendChild(tripShareSpanElem);
	tripNumberOfSpanElem.appendChild(document.createTextNode('Number of sodas: '));
	tripNumberOfTxtElem.appendChild(tripNumberOfSpanElem);
	tripNumberOfTxtElem.appendChild(document.createTextNode(data.markers.length));
	tripDurationSpanElem.appendChild(document.createTextNode('Days on the road: '));
	tripDurationTxtElem.appendChild(tripDurationSpanElem);
	tripDurationTxtElem.appendChild(document.createTextNode(tripDuration));
	tripDepartedSpanElem.appendChild(document.createTextNode('Departed: '));
	tripDepartedTxtElem.appendChild(tripDepartedSpanElem);
	tripDepartedTxtElem.appendChild(document.createTextNode(RdSoda.formatDate(data.dateStart)));
	tripAuthorLinkElem.href = 'http://instagram.com/' + data.author;
	tripAuthorLinkElem.target = '_blank';
	tripAuthorLinkElem.appendChild(document.createTextNode(data.author));
	tripAuthorImgElem.className = 'img-rounded';
	tripAuthorImgElem.src = data.authorPic;
	tripAuthorImgElem.width = 22;
	tripAuthorImgElem.height = 22;
	tripBtnElem.className = 'trip-btn img-rounded no-selection span12';
	tripBtnElem.style.backgroundColor = data.color;
	tripBtnLabelElem.className = 'trip-btn-label img-rounded';
	tripBtnLabelElem.appendChild(document.createTextNode('#'+ data.name));
	
	tripBtnElem.appendChild(tripBtnImgElem1);
	tripBtnElem.appendChild(tripBtnLabelElem);
	tripBtnElem.appendChild(tripBtnImgElem);
	rowFluidElem3.appendChild(tripBtnElem);
	tripElem.appendChild(rowFluidElem3);
	tripDetailsElem.appendChild(tripAuthorImgElem);
	tripDetailsElem.appendChild(tripAuthorLinkElem);
	tripDetailsElem.appendChild(tripDepartedTxtElem);
	tripDetailsElem.appendChild(tripDurationTxtElem);
	tripDetailsElem.appendChild(tripNumberOfTxtElem);
	tripDetailsElem.appendChild(tripShareTxtElem);
	tripDetailsElem.appendChild(tripShareLinkTwitterElem);
	tripDetailsElem.appendChild(tripShareLinkFbElem);
	tripDetailsElem.appendChild(tripShareLinkEmailElem);
	rowFluidElem2.appendChild(tripDetailsElem);
	for (var i = 0; i < 2; i++) {
		rowFluidElem2.appendChild(trip.getTripMarkerElement(i, data.markers[i]));
	}
	tripContentElem.appendChild(rowFluidElem2);
	rowFluidElem1.appendChild(tripContentElem);
	tripElem.appendChild(rowFluidElem1);
	rowFluidElem.appendChild(tripElem);
	RdSoda.Trips.docFragment.appendChild(rowFluidElem);
				   				   
	// set props
	trip.id = id;			   
	trip.data = data;
	trip.map = {};
	trip.isLoaded = false;
};

RdSoda.Trips.Trip.prototype = {
	getTripMarkerElement: function(id, data) {
		var tripMarkerElem = document.createElement('div'); 
		tripMarkerElem.className = 'trip-marker span4';
		
		if (data != undefined) {
			var regExp = new RegExp('#([^\\s]*)','g'); // to strip out hash tags
			
			var rowFluidElem = document.createElement('div');
			rowFluidElem.className = 'row-fluid';
			
			var divSpan12Elem = document.createElement('div'),
				rowFluidElem1 = rowFluidElem.cloneNode(false),
				tripMarkerDetailsElem = document.createElement('div'),
				tripMarkerDetailsRightElem = document.createElement('div'),
				tripMarkerLabelElem = document.createElement('div'),
				tripMarkerDetailsLeftElem = document.createElement('div'),
				tripMarkerDateElem = document.createElement('p'),
				tripMarkerLocationElem = document.createElement('p'),
				tripMarkerHeaderElem = document.createElement('h5'),
				rowFluidElem2 = rowFluidElem.cloneNode(false),
				tripMarkerImgDivElem = document.createElement('div'),
				tripMarkerImgElem = document.createElement('img');
			
			divSpan12Elem.className = 'span12';
			tripMarkerDetailsElem.className = 'trip-marker-details img-rounded span12';
			tripMarkerDetailsRightElem.className = 'trip-marker-details-right';
			tripMarkerLabelElem.className = 'marker-label-id';
			tripMarkerLabelElem.appendChild(document.createTextNode(id + 1));
			tripMarkerDetailsLeftElem.className = 'trip-marker-details-left';
			tripMarkerDateElem.className = 'date';
			tripMarkerDateElem.appendChild(document.createTextNode(RdSoda.formatDate(data.dateStamp)));
			tripMarkerLocationElem.className = 'location';
			tripMarkerLocationElem.appendChild(document.createTextNode(data.locationName));
			tripMarkerHeaderElem.appendChild(document.createTextNode(data.caption.replace(regExp, '')));
			tripMarkerImgDivElem.className = 'trip-marker-image img-rounded span12';
			tripMarkerImgElem.className = 'img-rounded';
			tripMarkerImgElem.src = 'imgs/image-placeholder.png';
			tripMarkerImgElem.setAttribute('width', '100%');
			tripMarkerImgElem.setAttribute('height', '100%');
			
			tripMarkerImgDivElem.appendChild(tripMarkerImgElem);
			rowFluidElem2.appendChild(tripMarkerImgDivElem);
			divSpan12Elem.appendChild(rowFluidElem2);
			tripMarkerDetailsLeftElem.appendChild(tripMarkerHeaderElem);
			tripMarkerDetailsLeftElem.appendChild(tripMarkerLocationElem);
			tripMarkerDetailsLeftElem.appendChild(tripMarkerDateElem);
			tripMarkerDetailsElem.appendChild(tripMarkerDetailsLeftElem);
			tripMarkerDetailsRightElem.appendChild(tripMarkerLabelElem);
			tripMarkerDetailsElem.appendChild(tripMarkerDetailsRightElem);
			rowFluidElem1.appendChild(tripMarkerDetailsElem);
			divSpan12Elem.appendChild(rowFluidElem1);
			rowFluidElem.appendChild(divSpan12Elem);
			tripMarkerElem.appendChild(rowFluidElem);
		}
		
		return tripMarkerElem;
	},
	addToMap: function() {
		var trip = this;
		
		trip.coords = []; // init coords array
		trip.map.markers = [];
		
		for (j = 0, markersLength = trip.data.markers.length; j < markersLength; j++) {
			// add marker
			trip.map.markers.push(new RdSoda.Map.Marker(trip, j, trip.data.markers[j]));
			// push each marker's coords into one array
			trip.coords.push(trip.data.markers[j].location);
		}
		// add polyline
		trip.map.polyline = new RdSoda.Map.Polyline(trip);
	},
	openTrip: function(markerId) {
		var trip = this,
			currSelection = RdSoda.Trips.currSelection;
		
		if (!trip.data.isLoaded) {
			var counter = 0, // for loading marker images
				docFragment = document.createDocumentFragment();
			
			// add subsequent rows of trip markers		   				   
			for (var i = 0, markersLength = trip.data.markers.length; i < markersLength; i++) {
				if (i % 3 == 0) {
					var rowFluidElem = document.createElement('div');
					rowFluidElem.className = 'row-fluid';
					
					rowFluidElem.appendChild(trip.getTripMarkerElement(i + 2, trip.data.markers[i + 2]));
					rowFluidElem.appendChild(trip.getTripMarkerElement(i + 3, trip.data.markers[i + 3]));
					rowFluidElem.appendChild(trip.getTripMarkerElement(i + 4, trip.data.markers[i + 4]));
					
					docFragment.appendChild(rowFluidElem);
				}
			}
			
			// append document fragment to the trip content DOM element
			trip.contentElem.appendChild(docFragment);
			
			// store marker element collection
			trip.markerElems = trip.contentElem.getElementsByClassName('trip-marker');
			
			// loop over marker DOM elements
			for (var j = 0, markersLength = trip.markerElems.length; j < markersLength; j++) {
				var markerElem = trip.markerElems[j];
				
				// hide blank markers
				if (markerElem.children.length == 0) {
					markerElem.style.display = 'none';
				}
				
				// attach id value
				markerElem.markerId = j;
				
				markerElem.addEventListener('click', function(event) {
					var markerId = event.currentTarget.markerId;
					
					trip.selectMarker(markerId); // trip marker
					RdSoda.Map.slideToMap(trip.data.markers[markerId].location);
					RdSoda.trackEvent('Trips', 'Select', 'Marker'); // GA tracking
				});
			}
			
			// recursive function for sequential image loading
			function loadMarkerImage() {
				var marker = trip.markerElems[counter];
				
				if (trip.data.markers[counter]) {
					// add src attribute and load image
					$(marker).find('.trip-marker-image img').attr('src', trip.data.markers[counter].image.standard_resolution.url).load(function() {
						var img = this;
						// fade-in image
						RdSoda.addCSSClass(img.parentNode, 'loaded');
						// increment counter
						counter++;
						// run method again
						loadMarkerImage();
					});
				} else {
					return;
				}
			};
			
			// init image loading
			loadMarkerImage();
			
			// set flag to true
			trip.data.isLoaded = true;
		}
		
		// check for prev selection
		if (currSelection.tripId != null) {
			var currTrip = RdSoda.Trips.trips[currSelection.tripId];
			currTrip.closeTrip(false);
		}
		
		// check if touch device so we can execute actions after CSS animation
		if (RdSoda.config.App.isMobileDevice) {
			RdSoda.transitionEndListener(trip.elem, function() {
				trip.showTrip(markerId);
			});
		} else {
			trip.showTrip(markerId);
		} 
		
		RdSoda.addCSSClass(trip.elem, 'selected');
		
		// set current trip id
		RdSoda.Trips.currSelection.tripId = trip.id;
	},
	showTrip: function(markerId) {
		var trip = this,
			delay = (RdSoda.config.App.isMobileDevice) ? 300 : 0;
		
		/* Trip actions */
		trip.contentElem.style.display = 'block'; // show selected trip
		trip.selectMarker(markerId); // trip & map marker
		
		// delay sliding to marker on Mobile
		setTimeout(function() {
			trip.slideToMarker(markerId); // slide to trip marker
		}, delay);
	},
	closeTrip: function(isSelf) {
		var trip = this,
			currMarkerId = RdSoda.Trips.currSelection.markerId;
		
		// check if touch device so we can execute actions after CSS animation
		if (RdSoda.config.App.isMobileDevice) {
			RdSoda.transitionEndListener(trip.elem, function() {
				trip.hideTrip(currMarkerId, isSelf);
			});
		} else {
			trip.hideTrip(currMarkerId, isSelf);
		}
		
		RdSoda.removeCSSClass(trip.elem, 'selected');
		
		// set to null
		currSelection.markerId = null;
		currSelection.tripId = null;
	},
	hideTrip: function(markerId, isSelf) {
		var trip = this;
		
		/* Map actions */
		RdSoda.Map.closeTrip(trip);
		
		/* Trip actions */
		trip.contentElem.style.display = 'none'; // hide trip
		trip.deselectMarker(markerId);
		
		// check if all trips are closed
		if (isSelf) {
			RdSoda.Map.resetMap();
		}
	},
	selectMarker: function(markerId) {
		var trip = this;
			marker = trip.map.markers[markerId],
			currSelection = RdSoda.Trips.currSelection;
		
		// check for prev selection
		if (currSelection.markerId != null) {
			var currTrip = RdSoda.Trips.trips[currSelection.tripId];
			currTrip.deselectMarker(currSelection.markerId);
		}
		
		// Map Marker
		marker.disableMarker();
		marker.selectMarker(trip.id);
		
		// Trip Marker
		RdSoda.addCSSClass(trip.markerElems[marker.id], 'selected');
		
		// set prev marker id
		RdSoda.Trips.currSelection.markerId = marker.id;
	},
	deselectMarker: function(markerId) {
		var trip = this,
			marker = trip.map.markers[markerId];
		
		// Map Marker
		marker.deselectMarker();
		marker.enableMarker(trip.id);
		
		// Trip Marker
		RdSoda.removeCSSClass(trip.markerElems[marker.id], 'selected');
	},
	slideToMarker: function(markerId) {
		var trip = this,
			duration = 750,
			delay = (RdSoda.config.App.isMobileDevice) ? duration : 0,
			scrollPos = (markerId > 0) ? $(trip.markerElems[markerId]).offset().top - 15 : $(trip.elem).position().top + 4;
		
		$('html, body').animate({
			scrollTop: scrollPos
		}, duration);
		
		// delay Map actions until sliding has completed
		setTimeout(function() {
			RdSoda.Map.panTo(trip.data.markers[markerId].location); // panTo and center marker on map
			RdSoda.Map.openTrip(trip); // open trip on map
		}, delay);
	}
};



