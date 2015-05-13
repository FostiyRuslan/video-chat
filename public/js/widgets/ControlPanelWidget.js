var ControlPanelWidget = function () {
    function initZeroClipboard() {
        new ZeroClipboard( document.getElementById("copy-link") ).on("aftercopy", function( event ) {
            AlertWidget.show('info', "Copied text to clipboard: " + event.data["text/plain"]);
        });
        $("#copy-link").attr('data-clipboard-text', location.href);
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
        $('.collapse-button').on('click', function () {
            $('.participate-frame').toggle();
        });
    }

    init();
};

ControlPanelWidget.prototype = new EventEmitter();
