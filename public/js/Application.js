var Application = function (selectors) {
    var peerConnections = {};
    var globalCommunicator = null;
    var localPeer = null;
    var User = null;
    var iceServers = null;
    var localStream = null;
    var resizeWidget,
        messageWidget,
        sendMailWidget,
        constraintsWidget,
        controlPanelWidget;

    function init() {
        globalCommunicator = Communicator.getCommunicator('');
        initWidgets();
        attachEvents();
    }

    function getIceServers() {
        var data = {
            ident: "rfos",
            secret: "678ec252-b450-4595-b4d7-511a5fdef401",
            domain: "www.diploma-video-chat.com",
            application: "diploma-video-chat",
            room: "default",
            secure: 1
        };
        return $.ajax({
            type: "POST",
            url: "https://api.xirsys.com/getIceServers",
            data: data,
            success: function (resp, status) {
                var data = JSON.parse(resp);
                iceServers = data.d;
            }
        });
    }

    function getLocalStream(constraints) {
        try {
            getUserMedia(constraints, function (stream) {
                var video = document.querySelector(selectors.localStream);
                video.src = window.URL.createObjectURL(stream);
                video.muted = true;
                localStream = stream;
                localPeer.addStream(stream);
                updatePeersLocalStream(stream);
                globalCommunicator.emit('participants');
                globalCommunicator.emit('messages');
            }, onError);
        } catch (e) {
            AlertWidget.show('error', "At least one of audio and video must be requested.");
            setTimeout(function(){
                constraintsWidget.showModal();
            }, 1000);
        }

    }

    function createLocalPeer() {
        localPeer = new RTCPeerConnection({ iceServers: [] });
        constraintsWidget.showModal();
    }

    function onError(error) {
        AlertWidget.show('error', error.name);
    }

    function createConnection(communicator, id) {
        var peer = new PeerConnection(communicator).init( localPeer.getLocalStreams()[0], iceServers );

        peer.on('got remote stream', function (event) {
            var video = document.createElement('video');

            video.id = id;
            video.width = 640;
            video.height = 480;
            video.autoplay = true;
            video.src = window.URL.createObjectURL(event.stream);
            $(selectors.streamsContainer).append(video);
        });
        peer.on('resolutionChanged', function () {
            $('#' + id).remove();
        });

        peer.on('progress', function (progress) {
            messageWidget.emit('progress', progress);
        });

        window.addEventListener('unload', peer.stop);

        return peer;
    }

    function onConnect() {
        var loggedInUser = JSON.parse(sessionStorage.getItem('user'));
        if (loggedInUser) {
            globalCommunicator.emit('add user', [loggedInUser.firstname, loggedInUser.lastname].join(' '));
            return;
        }
        bootbox.prompt("What is your name?", function(name) {
            if (!name) {
                globalCommunicator.emit('add user', 'Anonymous');
                return;
            }
            globalCommunicator.emit('add user', name);
        });
    }

    function toggleVideo(id) {
        $('#' + id).toggle();
    }

    function added(user) {
        User = user;
        sessionStorage.setItem('participant', JSON.stringify(User));
        getIceServers()
            .done(createLocalPeer)
            .fail(onError);
    }

    function addParticipant(id) {
        var communicator = Communicator.getCommunicator(id);
        var participantId = id.split('==')[1];

        communicator.on('connect', function () {
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
        user = User ? User.id : user;
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
        if (message.type === 'message') {
            messageWidget.emit('message', message.message);
        } else if (message.type === 'action'){
            switch(message.action) {
                case 'toggleVideoStream': {
                    toggleVideo(message.sender);
                    break;
                }
                default:
                    break;
            }
        }
    }

    function switchVoice(status) {
        var audioTracks = localStream.getAudioTracks();

        if (audioTracks[0]) {
            audioTracks[0].enabled = status;
        }
        if (status && !audioTracks[0]) {
            getLocalStream({
                audio: true,
                video: constraintsWidget.getConstraints().video
            });
        }
        $(selectors.voiceOff).toggle();
        $(selectors.voiceOn).toggle();
    }

    function switchVideo(status) {
        var videoTracks = localStream.getVideoTracks();

        if (videoTracks[0]) {
            videoTracks[0].enabled = status;
        }
        if (status && !videoTracks[0]) {
            getLocalStream({
                audio: constraintsWidget.getConstraints().audio,
                video: true
            });
        }
        $(selectors.videoOff).toggle();
        $(selectors.videoOn).toggle();
        globalCommunicator.send({
            type: 'action',
            action: 'toggleVideoStream'
        });
    }

    function voiceOn() {
        switchVoice(true);
    }

    function voiceOff() {
        switchVoice(false);
    }

    function videoOn() {
        $(selectors.localStream).show();
        switchVideo(true);
    }

    function videoOff() {
        $(selectors.localStream).hide();
        switchVideo(false);
    }

    function join() {
        for (var peer in peerConnections) {
            if (peerConnections.hasOwnProperty(peer)) {
                peerConnections[peer].offer();
            }
        }
    }

    function leave() {
        for (var peer in peerConnections) {
            if (peerConnections.hasOwnProperty(peer)) {
                peerConnections[peer].stop();
                delete peerConnections[peer];
            }
        }
        $(selectors.streamsContainer).empty();
        globalCommunicator.emit('participants');
        globalCommunicator.emit('messages');
    }

    function changeResolution() {
        var constraints = {
            audio: true,
            video: {
                mandatory: {
                    maxWidth: +($(this).data('width')),
                    maxHeight: +($(this).data('height'))
                }
            }
        };
        localPeer.getLocalStreams().forEach(function (stream) {
            stream.stop();
            localPeer.removeStream(stream);
        });
        getLocalStream(constraints);
    }

    function updatePeersLocalStream(stream) {
        for (var peer in peerConnections) {
            if (peerConnections.hasOwnProperty(peer)) {
                peerConnections[peer].updateStream(stream);
            }
        }
    }

    function getMessages(messages) {
        messageWidget.emit('restore', messages);
    }

    function onEmailSearch(query, emails) {
        sendMailWidget.emit('found', query, emails);
    }

    function attachEvents() {
        $(selectors.join).on('click', join);
        $(selectors.leave).on('click', leave);
        $(selectors.voiceOn).on('click', voiceOn);
        $(selectors.voiceOff).on('click', voiceOff);
        $(selectors.videoOn).on('click', videoOn);
        $(selectors.videoOff).on('click', videoOff);
        $('body').on('click', selectors.resolution, changeResolution);

        messageWidget.on('send', function(message) {
            globalCommunicator.send({
                type: 'message',
                message: message
            });
        });

        messageWidget.on('file', function (file) {
            for (var peer in peerConnections) {
                if (peerConnections.hasOwnProperty(peer)) {
                    peerConnections[peer].sendFile(file);
                }
            }
        });

        sendMailWidget.on('search', function (query) {
            globalCommunicator.emit('search', query);
        });

        constraintsWidget.on('constraints', getLocalStream);

        globalCommunicator.on('connect', onConnect);
        globalCommunicator.on('added', added);
        globalCommunicator.on('participants', createPeers);
        globalCommunicator.on('messages', getMessages);
        globalCommunicator.on('update room', updateList);
        globalCommunicator.on('channel created', addParticipant);
        globalCommunicator.on('new user', createChannel);
        globalCommunicator.on('message', onMessage);
        globalCommunicator.on('search', onEmailSearch);
        globalCommunicator.on('Error', onError);
    }

    function initWidgets() {

        messageWidget = new MessageWidget({
            selectors: {
                container: '.chat-container',
                messagesContainer: '.messages',
                message: '#message-text',
                sendFile: '.send-file',
                showMessageIcon: '.show-chat'
            },
            messageSound:'/static/sounds/message.mp3'
        });

        sendMailWidget = new SendMailWidget({
            container: '#send-offer',
            form: '#data-mail-form',
            sendButton: '#send-mail-button'
        });

        controlPanelWidget = new ControlPanelWidget();

        constraintsWidget = new ConstraintsWidget({
            modal: '#constraints',
            form: '#constraints-form',
            videoConstraints: '#video-constraints',
            audioConstraints: '#audio-constraints',
            screenConstraints: '#screen-constraints',
            sendButton: '.constraints-submit',
            closeButton: '.constraints-close'
        });

    }

    return {
        init: init
    }
};
