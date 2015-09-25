/**
 * @constructor
 */
main.taskHandler = function() {
    this.iconFrom = 'static/imgs/icon-marker-a_2x.png';
    this.iconTo = 'static/imgs/icon-marker-b@2x.png';
    this.map = null;
    this.tasks = ko.observableArray([]);
    this.selectedTask = ko.observable();
}

/**
 * initialize google map
 */
main.taskHandler.prototype.init = function() {
    var  _mapOptions = {
            zoom: 4,
            center: null,
            gridSize: 50,
            maxZoom: 20,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        _canvas = document.getElementById('map-canvas');

    this.getTasks()
        .done(function(){
            this.createTasks();

            _mapOptions.center = this.getPosition(this.tasks()[0].locationFrom.lat, this.tasks()[0].locationFrom.lng);
            this.map = new google.maps.Map(_canvas, _mapOptions);

            this.selectedTask(this.tasks()[0]);
            this.getDirections(this.selectedTask().locationFrom, this.selectedTask().locationTo);

            ko.applyBindings(this);
        }.bind(this));

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

main.taskHandler.prototype.getNextTask = function() {
    var _next = this.selectTask().index + 1,
        _index = _next === 0 ? this.tasks().length : _next;

    this.selectTask(_index);
}

main.taskHandler.prototype.getPrevTask = function() {
    var _prev = this.selectTask().index - 1,
        _index = _prev < 0 ? this.tasks().length : _prev;

    this.selectTask(_index);
}

main.taskHandler.prototype.selectTask = function(index) {
    this.selectedTask(this.tasks()[index]);
}

/**
 * track is responsible for centering the user when moving
 * notified by coordinates and map initialized
 */
main.taskHandler.prototype.getTasks = function() {
    return $.get('tasks.json')
        .done(function(resp) {
            this.tasks(eval(resp));
        }.bind(this));
}

/**
 * create tasks
 */
main.taskHandler.prototype.createTasks = function() {
    var _taskFrom,
        _taskTo,
        _data;

    this.tasks().forEach(function (task, index) {
        _taskFrom = this.getPosition(task.locationFrom.lat, task.locationFrom.lng);
        _taskTo = this.getPosition(task.locationTo.lat, task.locationTo.lng);
        _data = task;
        _data.locationFrom = _taskFrom;
        _data.locationTo = _taskTo;
        _data.index = index;
        _data.distance = this.calcDistance(_taskFrom, _taskTo) + 'km';
    }, this);

};


/**
 * Get directions to the store
 * from your current location
 */
main.taskHandler.prototype.getDirections = function(pos1, pos2) {
    var _directionsService = new google.maps.DirectionsService(),
        _directionsDisplay = new google.maps.DirectionsRenderer(),
        _request = {
            origin: pos1,
            destination: pos2,
            travelMode: google.maps.TravelMode.DRIVING
        };

    _directionsDisplay = new google.maps.DirectionsRenderer({
        polylineOptions: {
            strokeColor: "#d67770"
        }
    });
    _directionsDisplay.setMap(this.map);

    _directionsService.route(_request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            _directionsDisplay.setDirections(response);
        }
    });
}



