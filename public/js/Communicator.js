var Communicator = (function (io) {
    var communicator = null;
    var production = 'https://diploma-video-chat.herokuapp.com/';
    var local = 'http://localhost:3000/';

    function createCommunicator(id) {
        var socket = io.connect(local + id);
        return socket;
    }

    function getCommunicator(id) {
        return createCommunicator(id);

    }

    return {
        getCommunicator: getCommunicator
    }

})(io);
