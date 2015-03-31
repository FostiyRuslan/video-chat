var Communicator = (function (io) {
    var communicator = null;

    function createCommunicator(id) {
        var socket = io.connect('http://localhost:3000/' + id);
        return socket;
    }

    function getCommunicator(id) {
        return createCommunicator(id);

    }

    return {
        getCommunicator: getCommunicator
    }

})(io);
