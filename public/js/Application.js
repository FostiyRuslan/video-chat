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

    function getLocalVideoStream(options) {
        var constraints = options.constraints || {video: true, audio: true};
        getUserMedia(constraints, function (stream) {
            localStream = stream;
            localPeer.addStream(stream);
            var video = document.querySelector(selectors.localStream);
            video.src = window.URL.createObjectURL(stream);
            video.muted = true;
            video.play();
            updatePeersLocalStream(stream);
            options.onSuccess && options.onSuccess();
        }, onError);
    }

    function createLocalPeer() {
        localPeer = new RTCPeerConnection({ iceServers: [] });
        getLocalVideoStream({
            onSuccess: function () {
                globalCommunicator.emit('participants');
            }
        });
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
            video.src = window.URL.createObjectURL(event.stream);
            $(selectors.streamsContainer).append(video);
            video.play();
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
        $(selectors.voiceOff).toggle();
        $(selectors.voiceOn).toggle();
    }

    function switchVideo(status) {
        var videoTracks = localStream.getVideoTracks();

        if (videoTracks[0]) {
            videoTracks[0].enabled = status;
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
        getLocalVideoStream({
            constraints: constraints
        });
    }

    function updatePeersLocalStream(stream) {
        for (var peer in peerConnections) {
            if (peerConnections.hasOwnProperty(peer)) {
                peerConnections[peer].updateStream(stream);
            }
        }
    }

    function attachEvents() {
        $(selectors.join).on('click', join);
        $(selectors.voiceOn).on('click', voiceOn);
        $(selectors.voiceOff).on('click', voiceOff);
        $(selectors.videoOn).on('click', videoOn);
        $(selectors.videoOff).on('click', videoOff);
        $('body').on('click', selectors.resolution, changeResolution);
        $('.collapse-button').on('click', function () {
            var $frame = $('.participate-frame');

            $frame.toggleClass('tiny');
            if ($frame.hasClass('tiny')) {
                $frame.find('.frame-content').hide();
                $frame.css({ maxWidth: 50 })
            } else {
                $frame.css({ maxWidth: 270 });
                setTimeout(function () {
                    $frame.find('.frame-content').show();
                }, 1000);
            }
        });

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

        globalCommunicator.on('connect', onConnect);
        globalCommunicator.on('added', added);
        globalCommunicator.on('participants', createPeers);
        globalCommunicator.on('update room', updateList);
        globalCommunicator.on('channel created', addParticipant);
        globalCommunicator.on('new user', createChannel);
        globalCommunicator.on('message', onMessage);
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

    }

    return {
        init: init
    }
};
