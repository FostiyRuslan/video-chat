var PeerConnection = function(communicator) {
    var pc, localSignalingChannel;
    var constraints = {video: true, audio: true},
        mediaConstraints = {
            'mandatory': {
                'OfferToReceiveAudio':true,
                'OfferToReceiveVideo':true
            }
        },
        ice = {
            iceServers: [
                {url: 'turn:turn.anyfirewall.com:443?transport=tcp'}
            ]
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
    this.init = function(localStream) {
        pc = new RTCPeerConnection(ice, optional);
        localSignalingChannel = pc.createDataChannel("sendDataChannel", {reliable: false});
        initEvents.apply(this);
        pc.addStream(localStream);
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
