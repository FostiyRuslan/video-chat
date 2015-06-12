var ConstraintsWidget = function (selectors) {

    var self = this;
    var constraints = {
        video: true,
        audio: true
    };
    var screenSharingConstraints = null;
    //is Chrome
    if (navigator.webkitGetUserMedia) {
        screenSharingConstraints = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'screen',
                    maxWidth: 1280,
                    maxHeight: 720
                },
                optional: []
            }
        };
    //firefox
    } else {
        screenSharingConstraints = {
            video: {
                mediaSource: "screen"
            }
        };
    }

    function init() {
        attachEvents();
    }

    function attachEvents() {
        $(selectors.sendButton, selectors.container).on('click', getConstraints);
        $(selectors.closeButton, selectors.container).on('click', getDefaultConstraints);
    }

    function getDataFromForm() {
        var form = $(selectors.form, selectors.container);

        if (form.find(selectors.screenConstraints).is(':checked')) {
            return screenSharingConstraints;
        }
        constraints = {
            video: form.find(selectors.videoConstraints).is(':checked'),
            audio: form.find(selectors.audioConstraints).is(':checked')
        };
        return constraints;
    }

    function getConstraints() {
        var data = getDataFromForm();
        self.emit('constraints', data);
        self.hideModal();
    }

    function getDefaultConstraints() {
        self.emit('constraints', constraints);
    }

    this.showModal = function() {
        $(selectors.modal).modal('show');
    };

    this.hideModal = function() {
        $(selectors.modal).modal('hide');
    };

    this.getConstraints = function () {
        return constraints;
    };

    this.getScreenSharingConstraints = function () {
        return screenSharingConstraints;
    };

    init();
};

ConstraintsWidget.prototype = new EventEmitter();