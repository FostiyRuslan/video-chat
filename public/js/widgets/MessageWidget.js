var MessageWidget = function (options) {
    var selectors = options.selectors;
    var ENTER_KEY_CODE = 13;
    var self = this;
    var isShown = false;

    function attachEvents() {
        $(selectors.message, selectors.container).on('keypress', sendMessage);
        $(selectors.sendFile, selectors.container).on('change', sendFile);
        $(selectors.showMessageIcon).on('click', function () {
            $('.chat-container').toggle();
            $(this).removeClass('btn-danger');
            isShown = !isShown;
        });

        self.on('message', showMessage);
        self.on('progress', showFileSendingProgress);
        self.on('restore', restoreMessages);
    }

    function showFileSendingProgress(progress) {
        $('.progress', selectors.container).css('visibility', 'visible');
        $('.progress-bar', selectors.container).css({
            width: (progress | 0) + '%'
        });
        if (progress === 100) {
            $('.progress', selectors.container).css('visibility', 'hidden');
        }
    }

    function sendMessage(e) {
        if (e.keyCode === ENTER_KEY_CODE) {
            var $el = $(e.target);
            var date = new Date();
            var text = $el.val();
            var message = {
                text: text,
                user: JSON.parse(sessionStorage.getItem('participant')),
                date: [date.toDateString(), date.toTimeString().split(' ')[0]].join(' ')
            };

            self.emit('send', message);
            message.isOwn = true;
            showMessage(message);
            $el.val('');
        }
    }

    function sendFile() {
        var files = Array.prototype.slice.call(this.files);

        files.forEach(function (file) {
            self.emit('file', file);
        });
        this.value = '';
    }

    function showMessage(message) {
        var $messageContainer = $(selectors.messagesContainer, selectors.container);
        var messageEl = $('<li class="alert message"><div class="date"></div><div class="user"></div><div class="text"></div></li>');
        messageEl.find('.date').text(message.date);
        messageEl.find('.user').text(message.user.name);
        messageEl.find('.text').text(message.text);

        if (!message.isOwn) {
            messageEl.addClass('left alert-danger');
            notify();
        } else {
            messageEl.addClass('right alert-success');
        }
        $messageContainer.append(messageEl);
        $messageContainer.scrollTop($messageContainer[0].scrollHeight);
    }

    function restoreMessages(messages) {
        messages.forEach(function (message) {
            var date = new Date(message.date);
            message.date = [date.toDateString(), date.toTimeString().split(' ')[0]].join(' ');
            showMessage(message);
        });
    }

    function notify() {
        if (!isShown) {
            $(selectors.showMessageIcon).addClass('btn-danger');
        }
        var sound = document.createElement('audio');
        sound.src = options.messageSound;
        sound.play();
    }

    function init() {
        attachEvents();
        $('.chat-container').draggable({
            containment: "window"
        });
    }

    init();
};

MessageWidget.prototype = new EventEmitter();
