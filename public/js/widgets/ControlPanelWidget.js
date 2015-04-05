var ControlPanelWidget = function () {
    $('.audio-off').on('click', function() {
        var video = document.getElementById('local-stream');
        video.muted = true;
        $(this).hide();
        $('.audio-on').show();
    });

    $('.audio-on').on('click', function() {
        var video = document.getElementById('local-stream');
        video.muted = false;
        $(this).hide();
        $('.audio-off').show();
    });

    $('.show-chat').on('click', function () {
        $('.chat-container').toggle();
    });
};
