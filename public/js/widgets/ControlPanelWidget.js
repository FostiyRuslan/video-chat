var ControlPanelWidget = function () {
    function initZeroClipboard() {
        $("#copy-link").attr('data-clipboard-text', location.href);
        new ZeroClipboard( document.getElementById("copy-link") );
    }

    function init() {
        initZeroClipboard();
    }

    init();
};

ControlPanelWidget.prototype = new EventEmitter();
