/*
 *	RdSoda
 *	www.rdsoda.com
 *
 *	@version: 1.0
 *	@date: 07/14/2013
 *	@author: Clint Harrison
 */

var RdSoda = RdSoda || {};

RdSoda = {
    config: {
        App: {
            hasTransitionSupport: false,
            isMobileDevice: false,
            isTouchDevice: false
        },
        GoogleMaps: {
            JS_FILE_PATHS: ['http://maps.googleapis.com/maps/api/js?v=3.36&key=AIzaSyB8rXYk1TYgLCBlCZPTeXoshZa1Uur3m1s',
                'js/GoogleMaps/infobox-1.1.12.min.js',
                'js/GoogleMaps/markerwithlabel-1.1.9.min.js']
        },
        Instagram: {
            TAG_DEFAULT: 'rdsoda',
            CLIENT_ID: '8ea60a95676d4ef3bc6e280654accaa0',
            REDIRECT_URI: 'http://www.rdsoda.com',
            MAX_API_REQS: 10,
            accessToken: '',
            tag: ''
        },
        Map: {
            ZOOM_DEFAULT: 8,
            centerDefault: null
        },
        Trips: {
            TRIP_NAME_KEYWORDS: ['adventure', 'tour', 'trip', 'vacation', 'viaje', 'xmas'],
            TRIP_MARKER_MIN_AMOUNT: 1
        }
    },
    init: function () {
        var base = this,
            googleMapsConfig = RdSoda.config.GoogleMaps,
            counter = 0;

        // check for mobile device
        if (base.isMobileDevice()) {
            base.config.App.isMobileDevice = true;
        }

        // check if browser supports touch events
        (!base.isTouchDevice()) ? base.addCSSClass(document.body, 'no-touch-support') : base.config.App.isTouchDevice = true;

        // check if browser supports 3d transforms
        if (base.has3dSupport()) {
            base.addCSSClass(document.body, 'supports-3d');
        }

        if (base.hasTransitionSupport()) {
            base.config.App.hasTransitionSupport = true;
        }

        // hide mobile address bar
        window.scrollTo(0, 1);

		/*
		 * Modal
		 */
        base.Modal = new RdSoda.Modal();
        base.Modal.setLabel('Loading Map');
        base.Modal.openModal();

		/*
		 * Info
		 */
        base.Info = new RdSoda.Info();

        window.onJSFileLoadComplete = function () {
            // check if done loading files
            if (counter < googleMapsConfig.JS_FILE_PATHS.length - 1) {
                // increment counter
                counter++;
                // load next file
                base.loadJSFile(googleMapsConfig.JS_FILE_PATHS[counter], onJSFileLoadComplete, counter + 2);
            } else {
                // init resize event
                base.resizeApp();
                // init Map object
                base.Map.init(onMapReady);
            }
        };

        function onMapReady() {
            // set Instagram tag
            base.config.Instagram.tag = base.getInstagramTag();
            // init Data object
            base.Data = new RdSoda.Data(onDataReady);
        }

        function onDataReady() {
            // init Trips object
            base.Trips.init(base.Data.trips, onTripsReady);
        }

        function onTripsReady() {
            // hide Modal
            base.Modal.closeModal(onModalClosed);
        }

        function onModalClosed() {
            base.Trips.showTrips();
        }

		/*
		 * For optimization purposes:
		 * Load Google Maps API then corresponding JS files dynamically
		 */
        base.loadJSFile(googleMapsConfig.JS_FILE_PATHS[counter] + '&callback=onJSFileLoadComplete', null, counter + 2);
    },
    loadJSFile: function (url, callback, index) {
        var script = document.createElement('script');

        if (callback) {
            if (script.readyState) {  // IE
                script.onreadystatechange = function () {
                    if (script.readyState == 'loaded' || script.readyState == 'complete') {
                        script.onreadystatechange = null;
                        callback();
                    }
                };
            } else {  // other browsers
                script.onload = function () {
                    callback();
                };
            }
        }

        script.src = url;
        var elem = document.getElementsByTagName('script')[index];
        elem.parentNode.insertBefore(script, elem);
    },
    addCSSClass: function (elem, className) {
        elem.className += ' ' + className;
    },
    removeCSSClass: function (elem, className) {
        elem.className = elem.className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), '');
    },
    hasCSSClass: function (elem, className) {
        return elem.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    },
    toggleCSSClass: function (elem, className) {
        (RdSoda.hasCSSClass(elem, className)) ? RdSoda.removeCSSClass(elem, className) : RdSoda.addCSSClass(elem, className);
    },
    getRandomColor: function () {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    },
    getInstagramTag: function () {
        var base = this,
            tag = base.getQueryValue('trip'); // get trip query

        if (tag === '') {
            tag = RdSoda.config.Instagram.TAG_DEFAULT;
        }

        return tag;
    },
    getQueryValue: function (query) {
        query = query.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');

        var regexS = '[\\?&]' + query + '=([^&#]*)',
            regex = new RegExp(regexS),
            results = regex.exec(window.location.search);

        if (results == null) {
            return '';
        } else {
            return decodeURIComponent(results[1].replace(/\+/g, ''));
        }
    },
    isTouchDevice: function () {
        return !!('ontouchstart' in window) // works on most browsers 
            || !!('onmsgesturechange' in window); // works on IE10
    },
    isMobileDevice: function () {
        return !!('orientation' in window);
    },
    has3dSupport: function () {
		/*
     	 * check if browser supports CSS 3D Transforms
     	 */
        var elem = document.createElement('p'),
            has3d,
            transforms = {
                'webkitTransform': '-webkit-transform',
                'OTransform': '-o-transform',
                'msTransform': '-ms-transform',
                'MozTransform': '-moz-transform',
                'transform': 'transform'
            };

        // Add it to the body to get the computed style
        document.body.insertBefore(elem, null);

        for (var t in transforms) {
            if (elem.style[t] !== undefined) {
                elem.style[t] = 'translate3d(1px,1px,1px)';
                has3d = window.getComputedStyle(elem).getPropertyValue(transforms[t]);
            }
        }

        document.body.removeChild(elem);

        return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
    },
    hasTransitionSupport: function () {
		/*
     	 * check if browser supports CSS Transitions
     	 */
        var s = document.createElement('p').style, // 's' for style. better to create an element if body yet to exist
            v = ['ms', 'O', 'Moz', 'Webkit']; // 'v' for vendor

        if (s['transition'] == '') return true; // check first for prefeixed-free support
        while (v.length) // now go over the list of vendor prefixes and check support until one is found
            if (v.pop() + 'Transition' in s)
                return true;
        return false;
    },
    transitionEndListener: function (elem, callback) {
        var base = this,
            transitionEvent = base.getTransitionEvent();

		/*
     	 * listener for onComplete CSS transitions
     	 */
        if (base.config.App.hasTransitionSupport) {
            function onTransitionComplete(event) {
                elem.removeEventListener(transitionEvent, onTransitionComplete, false);
                callback();
            }

            elem.addEventListener(transitionEvent, onTransitionComplete, false);
        } else {
            callback();
        }
    },
    getTransitionEvent: function () {
        var t,
            elem = document.createElement('fake-elem'),
            transitions = {
                'transition': 'transitionend',
                'OTransition': 'oTransitionEnd',
                'MozTransition': 'transitionend',
                'WebkitTransition': 'webkitTransitionEnd'
            };

        for (t in transitions) {
            if (elem.style[t] !== undefined) {
                return transitions[t];
            }
        }
    },
    formatDate: function (date) {
        var formattedDate,
            monthObj = date.getMonth() + 1,
            dateObj = date.getDate(),
            monthInt = (monthObj < 10) ? '0' + monthObj.toString() : monthObj.toString(),
            dateInt = (dateObj < 10) ? '0' + dateObj.toString() : dateObj.toString(),
            yearObj = date.getFullYear();

        formattedDate = monthInt + '/' + dateInt + '/' + yearObj;

        return formattedDate;
    },
    sortArrayByProp: function (array, prop) {
        array.sort(function (a, b) {
            var a_prop = a && a[prop] || "",
                b_prop = b && b[prop] || "";
            return a_prop.localeCompare(b_prop);
        });
    },
    sortArrayByDate: function (array, date) {
        array.sort(function (a, b) {
            return b[date] - a[date];
        });
    },
    resizeApp: function () {
        var base = this;

        window.onresize = function (event) {
            var map = base.Map.Map;
            // resize & center map
            if (map) {
                var mapCenter = map.getCenter();
                map.resizeMap();
                map.setCenter(mapCenter);
            }
            // resize Modal
            base.Modal.resizeModal();
        };
    },
    trackEvent: function (category, action, label) {
		/*
     	 * Google Analyics event tracking
     	 */
        _gaq.push(['_trackEvent', category, action, label]);
    }
};

$(function () {
    // init RdSoda
    RdSoda.init();
});