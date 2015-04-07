var ControlPanelWidget = function () {
    function attachEvents() {
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
