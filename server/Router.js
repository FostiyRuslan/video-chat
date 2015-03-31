var passport = require('passport');

var Router = function(app, eventEmitter, roleManager) {
    var AuthController = require('./controllers/AuthController')(eventEmitter);
    var Controller = require('./controllers/Controller')(eventEmitter);

    app.get('/', AuthController.showLoginPage);
    app.post('/registration', AuthController.registration);
    app.post('/login',
        passport.authenticate('local', { failureRedirect: '/login' }),
        AuthController.login
    );
    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    app.get('/quick/:id',
        Controller.quickMeeting
    );

    app.get('/room/:room',
        roleManager.can('authenticated'),
        Controller.showRoom
    );
};

module.exports = Router;