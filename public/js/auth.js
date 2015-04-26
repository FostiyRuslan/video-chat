(function($) {
    $(document).ready(function () {
        $('#create-room').on('click', function () {
            var roomId = $('#room-id').val();

            if (roomId) {
                location.replace('/quick/' + roomId);
            }
        });

        $('#registration .registration-submit').on('click', function () {
            var data = {
                'firstname': $('#registration #firstname').val(),
                'lastname': $('#registration #lastname').val(),
                'email': $('#registration #email').val(),
                'password': $('#registration #password').val(),
                'repeatPassword': $('#registration #repeat-password').val()
            };

            if (data.password !== data.repeatPassword) return;

            $.post('/registration', data).done(function (resp) {
                AlertWidget.show('success', 'You have been successfully registered!');
                $('#login').modal('show');
            }).fail(function (err) {
                AlertWidget.show('error', err.statusText);
            }).always(function () {
                $('#registration').modal('hide');
            });
        });
        $('#login .login-submit').on('click', function () {
            var data = {
                'email': $('#login #user-email').val(),
                'password': $('#login #user-password').val()
            };

            $.post('/login', data).done(function (user) {
                sessionStorage.setItem('user', JSON.stringify(user));
                location.replace('/room/' + user.roomId);
            }).fail(function (err) {
                AlertWidget.show('error', err.statusText);
            }).always(function () {
                $('#login').modal('hide');
            });
        });
    });
})(jQuery);