var MessageWidget = function (selectors) {
    var ENTER_KEY_CODE = 13;
    var self = this;

    function attachEvents() {
        $(selectors.message, selectors.container).on('keypress', sendMessage);
        self.on('message', showMessage);
    }

    function sendMessage(e) {
        if (e.keyCode === ENTER_KEY_CODE) {
            var $el = $(e.target);
            var date = new Date();
            var text = $el.val();
            var message = {
                text: text,
                user: sessionStorage.getItem('user'),
                date: [date.toDateString(), date.toTimeString().split(' ')[0]].join(' ')
            };

            self.emit('send', message);
            showMessage(message, true);
            $el.val('');
        }
    }

    function showMessage(message, isCreator) {
        var messageEl = $('<li class="message"><div class="date"></div><div class="user"></div><div class="text"></div></li>');
        messageEl.find('.date').text(message.date);
        messageEl.find('.user').text(message.user.name);
        messageEl.find('.text').text(message.text);
        if (isCreator) {
            messageEl.addClass('own-message');
        }
        $(selectors.messagesContainer, selectors.container).append(messageEl);
    }

    function init() {
        attachEvents();

        $('.chat-container').draggable();
    }

    init();
};

MessageWidget.prototype = new EventEmitter();
