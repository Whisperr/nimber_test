/**
 * @constructor
 */
main.taskHandler = function() {
    this.viewPosition = ko.observable();

    this.map = null;
    this.markers = [];
    this.serverResponse = [];
    this.tasks = ko.observableArray([]);
    this.selectedTask = ko.observable();
}

/**
 * initialize google map
 */
main.taskHandler.prototype.init = function() {
    var  _mapOptions = {
            zoom: 4,
            center: this.viewPosition(),
            gridSize: 50,
            maxZoom: 20,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        _canvas = document.getElementById('map-canvas');

    this.map = new google.maps.Map(_canvas, _mapOptions);

    this.track();

    ko.applyBindings(this);
}


/**
 * calculates distance between two points in km's
 * @param p1
 * @param p2
 * @returns {string}
 */
main.taskHandler.prototype.calcDistance = function(p1, p2) {
    return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
}

main.taskHandler.prototype.getPosition = function(lat, lng) {
    return new google.maps.LatLng(lat, lng);
}

main.taskHandler.prototype.getCoordsFromAddress = function(address) {
    return $.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + address);

}

/**
 * set selected store
 */
main.taskHandler.prototype.selectStore = function(task) {
    this.selectedTask(task);
}

/**
 * track is responsible for centering the user when moving
 * notified by coordinates and map initialized
 */
main.taskHandler.prototype.track = function() {
    $.get('tasks.json')
        .done(function(resp) {
            this.serverResponse = eval(resp);
            //set extra info that are needed in the
            this.getListInfo();
        }.bind(this));
}

/**
 * Remove all stores from them map.
 */
main.taskHandler.prototype.getListInfo = function() {
    var _taskFrom,
        _taskFromPosition,
        _taskTo,
        _taskToPosition,
        _data,
        _tempArray = [],
        _tempTask;

    /**
     * fill stores arrays (for displaying stores list)
     * and markers array
     */
    this.serverResponse.forEach(function (task) {
        _taskFrom = this.getCoordsFromAddress(task.Picked_up_from);
        _taskTo = this.getCoordsFromAddress(task.Delivered_to);
        _data = task;

        _taskFrom.done(function(resp) {
            console.log(resp);
            _taskFromPosition = resp.results[0].geometry.location;
        });

        _taskTo.done(function(resp) {
            _taskToPosition = resp.results[0].geometry.location;
        });

        $.when(_taskFrom, _taskTo)
            .done(function(){
                _data.distance = this.calcDistance(_taskFrom, _taskTo) + 'km';
                _tempTask = new main.Task(_data);
                _tempArray.push(_tempTask);
                new google.maps.Marker({
                    position: _taskFromPosition,
                    title: task.description,
                    map: this.map,
                    icon: this.defaultIcon
                });
                new google.maps.Marker({
                    position: _taskFromPosition,
                    title: task.description,
                    map: this.map,
                    icon: this.defaultIcon
                });
            }.bind(this));

    }, this);

    this.tasks(_tempArray);
}

/**
 * @param data
 * @constructor
 */
main.Task = function(data) {
    for(var key in data){
        this[key] = data[key];
    }
}


/**
 * Get directions to the store
 * from your current location
 */
main.taskHandler.prototype.getDirections = function() {
    var _currentPos = this.currentPos,
        _panel = document.getElementById('directions-panel'),
        _storePos = this.position,
        _directionsService = new google.maps.DirectionsService(),
        _directionsDisplay = new google.maps.DirectionsRenderer(),
        _request = {
            origin: _currentPos,
            destination: _storePos,
            travelMode: google.maps.TravelMode.DRIVING
        };
    //clear panel before initializing google directions
    _directionsDisplay.setPanel(_panel);

    _directionsService.route(_request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            _directionsDisplay.setDirections(response);
            //todo: create function in app
            $('html, body').stop().animate({
                scrollTop: $(_panel).offset().top
            }, 500, 'linear');
        }
    });
}



