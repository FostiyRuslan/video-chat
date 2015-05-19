var SendMailWidget = function (selectors) {

    var self = this;

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

    function debounce(func, time) {
        var timer = null;

        return function () {
            var args = Array.prototype.slice.call(arguments);
            clearTimeout(timer);
            timer = setTimeout(function () {
                func.apply(this, args);
            }, time);
        }
    }

    function searchEmails(evt) {
        var value = $('#to', selectors.container).val();

        if (value.indexOf(',') > -1) {
            value = value.split(',');
            value = value[value.length - 1];
        }

        if (!value || value.length < 2) return;

        self.emit('search', value);
    }

    function attachEvents() {
        $(selectors.sendButton, selectors.container).on('click', sendMail);
        $('#to', selectors.container).on('input', debounce(searchEmails, 1000));
        $('input', selectors.container).not('#to').on('focus blur', function () {
            $('#search-result', selectors.container).hide();
        });
        $('#to', selectors.container).on('focus', function () {
            if ($('#search-result', selectors.container).is(':empty') ||
                $('#search-result', selectors.container).find('.not-found').length ||
                !$('#to', selectors.container).val()) return;
            $('#search-result', selectors.container).show();
        });
        $(selectors.container).on('click', '.list-group-item', function (evt) {
            var value = $(evt.target).text();
            var query = $(evt.target).data('query');
            var previousEmails = $('#to', selectors.container).val();
            $('#search-result', selectors.container).hide();

            if (previousEmails.indexOf(',') > -1) {
                previousEmails = previousEmails.replace(new RegExp(query + '$'), value + ',');
            } else {
                previousEmails = value + ',';
            }
            $('#to', selectors.container).val(previousEmails);
        });

        self.on('found', foundEmails);
    }

    function foundEmails(query, emails) {
        $('#search-result', selectors.container).empty().show();
        if (!emails.length) {
            $('#search-result', selectors.container).append(
                $('<a href="#" class="list-group-item not-found"></a>').text('Not found')
            );
            return;
        }
        emails.forEach(function (item) {
            $('<a href="#" class="list-group-item"></a>')
                .text(item.email)
                .data('query', query)
                .appendTo($('#search-result', selectors.container));
        });
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
            $.post('/sendOffer', data)
                .done(onSuccess)
                .fail(onError);
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

SendMailWidget.prototype = new EventEmitter();