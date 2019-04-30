/*
 *	RdSoda.Data
 *
 *	@author: Clint Harrison
 */

var RdSoda = RdSoda || {};

RdSoda.Data = function (callback) {
    var data = this,
        counter = 0,
        tripConfig = RdSoda.config.Trips,
        instagramConfig = RdSoda.config.Instagram,
        results = [];

    data.trips = [];
    data.Instagram = new Cowlik.Instagram.API(instagramConfig.CLIENT_ID); // Instagram API

    function init() {
        $.ajaxSetup({
            // catch global AJAX errors
            error: function (xhr, status, error) {
                RdSoda.Modal.showError();
            }
        });

        instagramConfig.accessToken = data.Instagram.getAccessToken(); // access token

        if (instagramConfig.accessToken != '') {
            RdSoda.Modal.setLabel('Loading Trips');
            // begin gathering Instagram tag data
            data.Instagram.requestEndpointData('users/self/media/recent?' + instagramConfig.accessToken, onInstagramDataReady);
        } else {
            RdSoda.Modal.setLabel('Update 06.2016: Instagram has changed their <a href="https://www.instagram.com/developer/" target="_blank">API platform</a>. ' +
                'RdSoda will now serve as a proof-of-concept into the unforeseeable future. ' +
                'For viewing, <a href="mailto:hello@rdsoda.com">contact me</a> for an invite.<br><br>' +
                '<a class="img-rounded" href="https://api.instagram.com/oauth/authorize/?client_id=' + instagramConfig.CLIENT_ID + '&redirect_uri=' + instagramConfig.REDIRECT_URI + '&response_type=token&scope=public_content">Log in to Instagram</a><br>');
        }
    }

    function onInstagramDataReady(instagramData) {
        if (instagramData.data.length > 0) {
            var nextReqURL = instagramData.pagination.next_url;

            collectResults(instagramData.data);

            // increment count
            counter++;

            // check for URL availablity
            if (nextReqURL != undefined) {
                // check for amount of requests reached
                if (counter <= instagramConfig.MAX_API_REQS) {
                    // make new API request
                    data.Instagram.requestEndpointData(nextReqURL + '?' + instagramConfig.accessToken, onInstagramDataReady);
                } else {
                    sortResults();
                }
            } else { // one set of results returned
                sortResults();
            }
        } else {
            // no results
            RdSoda.Modal.setLabel('No Trips Found');
        }
    }

    function collectResults(instagramData) {
        for (i = 0; i < instagramData.length; i++) {
            var result = instagramData[i],
                location = result.location;

            // strip out non-location results
            if (location != null) {
                // IMPORTANT: check to see if there are Lat/Long coords
                if (location.latitude != undefined) {
                    result.caption = (result.caption != null) ? result.caption : { text: "" }; // check for caption
                    location.name = (location.name != undefined) ? location.name : ""; // check for location name
                    results.push(result);
                }
            }
        }
    }

    function sortResults() {
        // check for default query tag
        if (instagramConfig.tag === instagramConfig.TAG_DEFAULT) {
            sortResultsByTrip();
        } else {
            // trip query exists
            sortResultsByAuthor();
        }

        // sort array alphabetically
        RdSoda.sortArrayByProp(results, 'sort_query');

        groupResults();
    }

    function sortResultsByTrip() {
        // find & create trip name
        for (var i = 0, resultsLength = results.length; i < resultsLength; i++) {
            var result = results[i];

            for (var j = 0, tagsLength = result.tags.length; j < tagsLength; j++) {
                var tag = results[i].tags[j];

                for (var k = 0, keywordsLength = tripConfig.TRIP_NAME_KEYWORDS.length; k < keywordsLength; k++) {
                    // compare tag with keywords to determine trip_name
                    if (tag.indexOf(tripConfig.TRIP_NAME_KEYWORDS[k]) > -1) {
                        result.sort_query = result.trip_name = tag; // sort by trip name
                    }
                }
            }
        }
    }

    function sortResultsByAuthor() {
        var author = RdSoda.getQueryValue('author'), // get author query
            authorResults = [];

        for (var i = 0, resultsLength = results.length; i < resultsLength; i++) {
            var result = results[i];

            result.sort_query = result.user.username; // sort by username
            result.trip_name = instagramConfig.tag;

            // check if author query exists
            if (author != '') {
                // compare usernames with author query
                if (author === result.user.username) {
                    authorResults.push(result);
                }
            }
        }

        // check for author results
        if (authorResults.length > 0) {
            results = authorResults;
        }
    }

    function groupResults() {
        var trips = [];

        counter = 0; // reset counter
        trips[counter] = []; // create initial trip

        // group trips by comparing filter queries
        for (var i = 0, resultsLength = results.length; i < resultsLength; i++) {

            trips[counter].push(results[i]);

            if (results[i + 1]) {
                if (results[i].sort_query != results[i + 1].sort_query) {
                    counter++;
                    trips[counter] = [];
                }
            }
        }

        // create trip object
        for (var j = 0, tripsLength = trips.length; j < tripsLength; j++) {
            // each trip must have a certain amount of markers
            if (trips[j].length >= tripConfig.TRIP_MARKER_MIN_AMOUNT) {
                var result = trips[j][0],
                    trip = {
                        name: result.trip_name,
                        author: result.user.username,
                        authorPic: result.user.profile_picture,
                        color: RdSoda.getRandomColor(),
                        markers: []
                    };

                for (var k = 0, tripLength = trips[j].length; k < tripLength; k++) {
                    trip.markers.push(getMarkerData(trips[j][k]));
                }

                // sort trips from newest to oldest
                RdSoda.sortArrayByDate(trip.markers, ['dateStamp']);
                // reverse array so markers are chronological
                trip.markers.reverse();

                // add dateStart so we can sort trips
                trip.dateStart = trip.markers[0].dateStamp;

                // add to global collection
                data.trips.push(trip);
            }
        }

        // sort trips from newest to oldest
        RdSoda.sortArrayByDate(data.trips, ['dateStart']);

        callback();
    }

    function getMarkerData(result) {
        var marker = {
            dateStamp: new Date(parseInt(result.created_time) * 1000),
            caption: result.caption.text,
            location: new google.maps.LatLng(result.location.latitude, result.location.longitude),
            locationName: result.location.name,
            image: result.images
        }

        return marker;
    }

    init();
};


