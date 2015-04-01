var PeerConnection = function(communicator) {
    var localPC, localSignalingChannel;
    var constraints = {video: true, audio: true},
        mediaConstraints = {
            'mandatory': {
                'OfferToReceiveAudio':true,
                'OfferToReceiveVideo':true
            }
        },
        ice = {
            iceServers: [
                {url:'stun:stun01.sipphone.com'},
                {url:'stun:stun.ekiga.net'},
                {url:'stun:stun.fwdnet.net'},
                {url:'stun:stun.ideasip.com'},
                {url:'stun:stun.iptel.org'},
                {url:'stun:stun.rixtelecom.se'},
                {url:'stun:stun.schlund.de'},
                {url:'stun:stun.l.google.com:19302'},
                {url:'stun:stun1.l.google.com:19302'},
                {url:'stun:stun2.l.google.com:19302'},
                {url:'stun:stun3.l.google.com:19302'},
                {url:'stun:stun4.l.google.com:19302'},
                {url:'stun:stunserver.org'},
                {url:'stun:stun.softjoys.com'},
                {url:'stun:stun.voiparound.com'},
                {url:'stun:stun.voipbuster.com'},
                {url:'stun:stun.voipstunt.com'},
                {url:'stun:stun.voxgratia.org'},
                {url:'stun:stun.xten.com'},
                {
                    url: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                },
                {
                    url: 'turn:192.158.29.39:3478?transport=udp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                },
                {
                    url: 'turn:192.158.29.39:3478?transport=tcp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                },
                {url: "stun:global.stun.twilio.com:3478?transport=tcp" },
                {url: 'turn:turn.anyfirewall.com:443?transport=tcp'},
                {url: 'stun:23.21.150.121'},
                {url: 'stun:stun.services.mozilla.com'},
                {url: 'stun:stun.anyfirewall.com:3478'},
                {url: 'turn:homeo@turn.bistri.com:80'},
                {url: 'turn:turn.bistri.com:80'}
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
