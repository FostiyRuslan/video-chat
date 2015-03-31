var PeerConnection = function(communicator) {
    var localPC, localSignalingChannel;
    var constraints = {video: true},
        mediaConstraints = {
            'mandatory': {
                'OfferToReceiveAudio':true,
                'OfferToReceiveVideo':true
            }
        },
        ice = {
            iceServers: [
                {url: "stun:global.stun.twilio.com:3478?transport=udp" }
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
        localPC.setLocalDescription(sessionDescription);
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
        localPC.addIceCandidate(candidate);
    }

    function answer(options) {
        localPC.setRemoteDescription(new SessionDescription(options));
    }

    function offer(options) {
        localPC.setRemoteDescription(new SessionDescription(options), function () {
            localPC.createAnswer(setLocalAndSendMessage, errorCallback, mediaConstraints);
        }, errorCallback);
    }

    function onMessage(evt) {
        var handler = messageHandlers[evt.type];
        handler(evt);
    }

    function initEvents() {
        //communicator events
        communicator.on('message', onMessage.bind(this));
        //room events
        localPC.addEventListener('icecandidate', addIceCandidate.bind(this), false);
        localPC.addEventListener("addstream", onRemoteStreamAdded.bind(this), false);
    }

    function detachEvents() {
        localPC.removeEventListener('icecandidate', addIceCandidate.bind(this), false);
        localPC.removeEventListener("addstream", onRemoteStreamAdded.bind(this), false);
    }

    function close() {
        detachEvents();
        localPC.close();
        communicator.disconnect();
    }
    /*********************************************************************/
    /*public methods*/
    /********************************************************************/
    this.init = function(localStream) {
        localPC = new RTCPeerConnection(ice);
        localSignalingChannel = localPC.createDataChannel("sendDataChannel", {reliable: false});
        initEvents.apply(this);
        localPC.addStream(localStream);
        return this;
    };

    this.offer = function() {
        localPC.createOffer(setLocalAndSendMessage, errorCallback, mediaConstraints);
        return this;
    };

    this.answer = function (options) {
        localPC.createAnswer(options);
        return this;
    };

    this.stop = function() {
        close();
        return this;
    };
};

PeerConnection.prototype = new EventEmitter();
