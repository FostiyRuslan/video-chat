var Communicator = (function (io) {
    var communicator = null;

    function createCommunicator(id) {
        var socket = io.connect('https://secret-anchorage-6322.herokuapp.com/' + id);
        return socket;
    }

    function getCommunicator(id) {
        return createCommunicator(id);

    }

    return {
        getCommunicator: getCommunicator
    }

})(io);
