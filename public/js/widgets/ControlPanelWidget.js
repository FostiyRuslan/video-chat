var ControlPanelWidget = function () {
    function initZeroClipboard() {
        $("#copy-link").attr('data-clipboard-text', location.href);
        new ZeroClipboard( document.getElementById("copy-link") );
    }

    function init() {
        initZeroClipboard();
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="popover"]').popover({
            html: true,
            content: function() {
                return $('#resolutions').html();
            }
        });
    }

    init();
};

ControlPanelWidget.prototype = new EventEmitter();
