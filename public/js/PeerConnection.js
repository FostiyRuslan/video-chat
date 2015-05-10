var PeerConnection = function(communicator) {
    var self = this;
    var chunkLength = 512;
    var pc,
        dataChannel,
        stream,
        arrayToStoreChunks = [];
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
            offer: offer,
            candidate: createIceCandidate,
            answer: answer,
            resolutionChanged: resolutionChanged,
            bye: close
        };

    /*********************************************************************/
    /*private methods*/
    /********************************************************************/

    function errorCallback(error){
        console.error(error);
    }

    function onRemoteStreamAdded(event) {
        self.emit('got remote stream', event);
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
        self.emit('resolutionChanged');
    }

    function onMessage(evt) {
        var handler = messageHandlers[evt.type];
        handler(evt);
    }

    function dataChannelConnect(event) {
        dataChannel.onmessage = receiveFile;
    }

    function onReadAsDataURL(evt, text) {
        var data = {};

        if (evt) {
            onReadAsDataURL.size = evt.target.result.length;
            onReadAsDataURL.step = 1;
            text = evt.target.result;
            data.first = true;
            data.size = onReadAsDataURL.size;
        }

        if (text.length > chunkLength) {
            data.message = text.slice(0, chunkLength);
            self.emit('progress', ((onReadAsDataURL.step * chunkLength) / onReadAsDataURL.size) * 100);
        } else {
            data.message = text;
            data.last = true;
            data.name = onReadAsDataURL.fileName;
            self.emit('progress', 100);
        }
        onReadAsDataURL.step++;
        dataChannel.send(JSON.stringify(data));
        var remainingDataURL = text.slice(data.message.length);
        if (remainingDataURL.length) setTimeout(function () {
            onReadAsDataURL(null, remainingDataURL); // continue transmitting
        }, 500)
    }

    function receiveFile(event) {
        var data = JSON.parse(event.data);

        arrayToStoreChunks.push(data.message);
        if (data.first) {
            receiveFile.step = 1;
            receiveFile.size = data.size;
        }
        self.emit('progress', ((receiveFile.step * chunkLength) / receiveFile.size) * 100);
        receiveFile.step++;
        if (data.last) {
            saveToDisk(arrayToStoreChunks.join(''), data.name);
            arrayToStoreChunks = [];
            self.emit('progress', 100);
        }
    }

    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, {type: contentType});
    }

    function saveToDisk(fileUrl, fileName) {
        var contentType = fileUrl.split(',')[0];
        var blob = b64toBlob(fileUrl.replace(contentType + ',', ''), contentType);
        var save = document.createElement('a');
        save.href = window.URL.createObjectURL(blob);
        save.target = '_blank';
        save.download = fileName || fileUrl;

        var event = document.createEvent('Event');
        event.initEvent('click', true, true);
        save.dispatchEvent(event);
    }

    function onNegotiationNeeded() {
        return arguments;
    }

    function initEvents() {
        //communicator events
        communicator.on('message', onMessage);
        //room events
        pc.addEventListener('icecandidate', addIceCandidate, false);
        pc.addEventListener("addstream", onRemoteStreamAdded, false);
        dataChannel.addEventListener("open", dataChannelConnect);
    }

    function detachEvents() {
        pc.removeEventListener('icecandidate', addIceCandidate, false);
        pc.removeEventListener("addstream", onRemoteStreamAdded, false);
        dataChannel.removeEventListener("open", dataChannelConnect);
    }

    function close() {
        detachEvents();
        //can be already closed
        try { pc.close(); } catch (e) {}
        communicator.disconnect();
    }
    /*********************************************************************/
    /*public methods*/
    /********************************************************************/
    this.init = function(localStream, iceServers) {
        pc = new RTCPeerConnection(iceServers, optional);
        dataChannel = pc.createDataChannel("sendDataChannel", {reliable: false});
        initEvents();
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
        self.offer();
        return this;
    };

    this.sendFile = function (file) {
        var reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = function(evt) {
            onReadAsDataURL.fileName = file.name;
            onReadAsDataURL(evt);
        };
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
