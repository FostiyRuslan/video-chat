var MessageWidget = function (selectors) {
    var ENTER_KEY_CODE = 13;
    var self = this;
    var isShown = false;

    function attachEvents() {
        $(selectors.message, selectors.container).on('keypress', sendMessage);
        $(selectors.showMessageIcon).on('click', function () {
            $('.chat-container').toggle();
            $('.show-chat').removeClass('btn-danger');
            isShown = !isShown;
        });

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
        var $messageContainer = $(selectors.messagesContainer, selectors.container);
        var messageEl = $('<li class="alert message"><div class="date"></div><div class="user"></div><div class="text"></div></li>');
        messageEl.find('.date').text(message.date);
        messageEl.find('.user').text(message.user.name);
        messageEl.find('.text').text(message.text);
        isCreator ?
            messageEl.addClass('alert-success') :
            messageEl.addClass('alert-danger');

        if ($messageContainer.find('li:last').hasClass('alert-danger')) {
            messageEl.addClass('left');
        } else {
            messageEl.addClass('right');
        }
        if (!isCreator && !isShown){
            $(selectors.showMessageIcon).addClass('btn-danger');
        }
        $messageContainer.append(messageEl);
    }

    function init() {
        attachEvents();
        $('.chat-container').draggable();
    }

    init();
};

MessageWidget.prototype = new EventEmitter();
