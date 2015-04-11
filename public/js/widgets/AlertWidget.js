var AlertWidget = (function (alerts) {

    var alertWidget = {};

    function init() {
        attachEvents();
    }

    function attachEvents() {
        $('.alert .close').on('click', function () {
           $(this).closest('.alert').hide();
        });
    }

    alertWidget.show = function (type, message) {
        alerts[type].find('.message').text(message);
        alerts[type].show();

        if (type !== 'error') {
            setTimeout(function () {
                alertWidget.hide(type);
            }, 5000);
        }
    };

    alertWidget.hide = function (type) {
        alerts[type]
            .hide();
    };

    init();

    return alertWidget;

})({
    info: $('body > .alert-info'),
    success: $('body > .alert-success'),
    error: $('body > .alert-danger')
});