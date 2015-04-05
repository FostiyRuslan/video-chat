var ControlPanelWidget = function () {
    function attachEvents() {
        $('.audio-off').on('click', function() {
            var video = document.getElementById('local-stream');
            video.muted = true;
            $(this).hide();
            $('.audio-on').show();
        });

        $('.audio-on').on('click', function() {
            var video = document.getElementById('local-stream');
            video.muted = false;
            $(this).hide();
            $('.audio-off').show();
        });

        $('.show-chat').on('click', function () {
            $('.chat-container').toggle();
        });
    }

    function initZeroClipboard() {
        $("#copy-link").attr('data-clipboard-text', location.href);
        new ZeroClipboard( document.getElementById("copy-link") );
    }

    function init() {
        attachEvents();
        initZeroClipboard();
    }

    init();
};

ControlPanelWidget.prototype = new EventEmitter();
