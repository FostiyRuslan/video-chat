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
                $('#registration').modal('show');
                $('#login').modal('show');
            }).fail(function (err) {
                alert('error ' + err)
            }).always(function () {
                
            });
        });
        $('#login .login-submit').on('click', function () {
            var data = {
                'email': $('#login #user-email').val(),
                'password': $('#login #user-password').val()
            };

            $.post('/login', data).done(function (resp) {
                location.replace('/room');
            }).fail(function (err) {
                alert(err);
            }).always(function () {
                
            });
        });
    });
})(jQuery);