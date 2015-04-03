var Communicator = (function (io) {
    var communicator = null;
    var production = 'https://secret-anchorage-6322.herokuapp.com/';
    var local = 'http://localhost:3000';

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
