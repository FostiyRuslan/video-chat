var SendMailWidget = function (selectors) {

    function init() {
        attachEvents();
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
            bootbox.alert("Some field is empty!", function () {
                $(selectors.container).modal('show');
            });
        }
    }

    function onSuccess(resp) {
        bootbox.alert("Offer has been sent");
    }

    function onError(resp) {
        bootbox.alert("Sending error!");
    }

    init();
};