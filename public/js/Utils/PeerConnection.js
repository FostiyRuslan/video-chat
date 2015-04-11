var PeerConnection = function(communicator) {
    var pc, localSignalingChannel, stream;
    var constraints = {video: true, audio: true},
        mediaConstraints = {
            'mandatory': {
                'OfferToReceiveAudio':true,
                'OfferToReceiveVideo':true
            }
        },
        optional = {
            optional: [
                {
                    RtpDataChannels: true
                }
            ]
        },
        messageHandlers = {
            offer: offer.bind(this),
            candidate: createIceCandidate.bind(this),
            answer: answer.bind(this),
            resolutionChanged: resolutionChanged.bind(this),
            bye: close.bind(this)
        };

    /*********************************************************************/
    /*private methods*/
    /********************************************************************/

    function errorCallback(error){
        console.error(error);
    }

    function onRemoteStreamAdded(event) {
        this.emit('got remote stream', event);
    }

    function setLocalAndSendMessage(sessionDescription) {
        pc.setLocalDescription(sessionDescription);
        communicator.send(sessionDescription);
    }

    function addIceCandidate(evt) {
        if (!evt.candidate) return;

        communicator.send({
            type: "candidate",
            sdpMLineIndex: evt.candidate.sdpMLineIndex,
            sdpMid: evt.candidate.sdpMid,
            candidate: evt.candidate.candidate
        });
    }

    function createIceCandidate(options) {
        var candidate = new IceCandidate({
            sdpMLineIndex: options.sdpMLineIndex,
            sdpMid: options.sdpMid,
            candidate: options.candidate
        });
        pc.addIceCandidate(candidate);
    }

    function answer(options) {
        pc.setRemoteDescription(new SessionDescription(options));
    }

    function offer(options) {
        pc.setRemoteDescription(new SessionDescription(options), function () {
            pc.createAnswer(setLocalAndSendMessage, errorCallback, mediaConstraints);
        }, errorCallback);
    }

    function resolutionChanged() {
        this.emit('resolutionChanged');
    }

    function onMessage(evt) {
        var handler = messageHandlers[evt.type];
        handler(evt);
    }

    function dataChannelConnect(event) {
        localSignalingChannel = event.channel;
        localSignalingChannel.onmessage = function(event){
            pc.emit('message', event.data);
        };
    }

    function onNegotiationNeeded() {
        return arguments;
    }

    function initEvents() {
        //communicator events
        communicator.on('message', onMessage.bind(this));
        //room events
        pc.addEventListener('icecandidate', addIceCandidate.bind(this), false);
        pc.addEventListener("addstream", onRemoteStreamAdded.bind(this), false);
        pc.addEventListener("datachannel", dataChannelConnect);
    }

    function detachEvents() {
        pc.removeEventListener('icecandidate', addIceCandidate.bind(this), false);
        pc.removeEventListener("addstream", onRemoteStreamAdded.bind(this), false);
        pc.removeEventListener("datachannel", dataChannelConnect);
    }

    function close() {
        detachEvents();
        pc.close();
        communicator.disconnect();
    }
    /*********************************************************************/
    /*public methods*/
    /********************************************************************/
    this.init = function(localStream, iceServers) {
        pc = new RTCPeerConnection(iceServers, optional);
        localSignalingChannel = pc.createDataChannel("sendDataChannel", {reliable: false});
        initEvents.apply(this);
        stream = localStream;
        pc.addStream(localStream);
        return this;
    };

    this.updateStream = function (localStream) {
        pc.getLocalStreams().forEach(function (stream) {
            pc.removeStream(stream);
        });
        pc.addStream(localStream);
        stream = localStream;
        communicator.send({
            type: 'resolutionChanged'
        });
        this.offer();
        return this;
    };

    this.offer = function() {
        pc.createOffer(setLocalAndSendMessage, errorCallback, mediaConstraints);
        return this;
    };

    this.answer = function (options) {
        pc.createAnswer(options);
        return this;
    };

    this.stop = function() {
        close();
        return this;
    };
};

PeerConnection.prototype = new EventEmitter();
