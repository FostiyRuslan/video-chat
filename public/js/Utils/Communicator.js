var Communicator = (function (io) {
    var communicator = null;
    var production = 'https://secret-anchorage-6322.herokuapp.com/';

    function createCommunicator(id) {
        var socket = io.connect(production + id);
        return socket;
    }

    function getCommunicator(id) {
        return createCommunicator(id);

    }

    return {
        getCommunicator: getCommunicator
    }

})(io);
