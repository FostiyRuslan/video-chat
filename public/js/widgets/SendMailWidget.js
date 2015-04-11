var SendMailWidget = function (selectors) {

    function init() {
        attachEvents();
        initWidgets();
    }

    function initWidgets() {
        $('[type=datetime]', selectors.container).bootstrapMaterialDatePicker({
            format: 'dddd DD MMMM YYYY - HH:mm',
            weekStart: 1
        });
    }

    function attachEvents() {
        $(selectors.sendButton, selectors.container).on('click', sendMail);
    }

    function getDataFromForm() {
        var form = $(selectors.form, selectors.container).get(0);
        var data = {
            to: form.elements.to.value,
            subject: form.elements.subject.value,
            datetime: form.elements.datetime.value,
            text: form.elements.text.value
        };
        return data;
    }

    function sendMail() {
        var data = getDataFromForm();

        if (data.to && data.subject && data.text) {
            $.post('/sendOffer', data, onSuccess, onError);
        } else {
            AlertWidget.show('error', "Some field is empty!");
            $(selectors.container).modal('show');
        }
    }

    function onSuccess(resp) {
        AlertWidget.show('success', "Offer has been sent");
    }

    function onError(resp) {
        AlertWidget.show('error', "Sending error!");
    }

    init();
};