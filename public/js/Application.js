var Application = function (selectors) {
    var peerConnections = {};
    var globalCommunicator = null;
    var localPeer = null;
    var User = null;
    var resizeWidget,
        messageWidget,
        controlPanelWidget;

    function init() {
        globalCommunicator = Communicator.getCommunicator('');
        initWidgets();
        attachEvents();
    }

    function getLocalVideoStream() {
        localPeer = new RTCPeerConnection({ iceServers: [] });

        getUserMedia({video: true, audio: true}, function (stream) {
            localPeer.addStream(stream);
            var video = $(selectors.localStream);
            video.attr('src', window.URL.createObjectURL(stream));
            video.get(0).play();
            globalCommunicator.emit('participants');
        }, function (error) {
            console.error(error);
        });
    }

    function createConnection(communicator, id) {
        var peer = new PeerConnection(communicator).init( localPeer.getLocalStreams()[0] );

        peer.on('got remote stream', function (event) {
            var video = $('<video></video>');
            var currentPeer = peer;

            video.attr('id', id);
            video.attr('width', 640);
            video.attr('height', 480);
            video.attr("src", window.URL.createObjectURL(event.stream));
            $(selectors.removeStreamContainer).append(video);
            video.get(0).play();
        });

        window.addEventListener('unload', peer.stop);

        return peer;
    }

    function onConnect() {
        var username = new Date().valueOf().toString();

        globalCommunicator.emit('add user', username);
    }

    function added(user) {
        User = user;
        sessionStorage.setItem('user', user);
        getLocalVideoStream();
    }

    function addParticipant(id) {
        var communicator = Communicator.getCommunicator(id);

        communicator.on('connect', function () {
            var participantId = id.split('==')[1];
            var peer = createConnection(communicator, participantId);
            peerConnections[participantId] = peer;
        });
        communicator.on('remove stream', removeParticipant);
    }

    function createPeers(room, user) {
        room.forEach(function (participant) {
            createChannel(participant.id, user);
        });
    }

    function createChannel(participant, user) {
        user = typeof User === 'object' ? User.id : user;
        var channelId = [user, participant].join('==');
        globalCommunicator.emit('create channel', channelId);
    }

    function updateList(room) {
        $(selectors.participates).empty();
        $(selectors.participatesAmount).text(room.length);
        room.forEach(function (user) {
            var participateItem = $('<li></li>');

            participateItem.addClass(user.id).addClass('list-group-item').text(user.name);
            $(selectors.participates).append(participateItem);
        });
    }

    function removeParticipant(id) {
        var peer = peerConnections[id];

        if (peer) {
            peer.stop();
            $('#' + id).remove();
        }
        delete peerConnections[id];
    }

    function onMessage(message) {
        messageWidget.emit('message', message);
    }

    function attachEvents() {
        $(selectors.startVideo).on('click', function () {
            for (var peer in peerConnections) {
                if (peerConnections.hasOwnProperty(peer)) {
                    peerConnections[peer].offer();
                }
            }
        });

        messageWidget.on('send', function(message) {
            globalCommunicator.send(message);
        });

        globalCommunicator.on('connect', onConnect);
        globalCommunicator.on('added', added);
        globalCommunicator.on('participants', createPeers);
        globalCommunicator.on('update room', updateList);
        globalCommunicator.on('channel created', addParticipant);
        globalCommunicator.on('new user', createChannel);
        globalCommunicator.on('message', onMessage);
    }

    function initWidgets() {
        resizeWidget = new ResizeVideoWidget({
            selector: 'local-stream',
            big: 'size_big',
            middle: 'size_middle',
            small: 'size_small'
        });

        messageWidget = new MessageWidget({
            container: '.chat-container',
            messagesContainer: '.messages',
            message: '#message-text'
        });

        controlPanelWidget = new ControlPanelWidget();

    }

    return {
        init: init
    }
};
