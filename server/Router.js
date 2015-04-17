var passport = require('passport');
var eventEmitter = require('./communication/EventEmitter');

var Router = function(app) {
    var AuthController = require('./controllers/AuthController')(eventEmitter);
    var Controller = require('./controllers/Controller')(eventEmitter);
    var roleManager = require('./RolesManager');

    app.get('/', AuthController.showLoginPage);

    app.post('/registration', AuthController.registration);

    app.post('/login', AuthController.login);
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

    app.post('/sendOffer',
        roleManager.can('authenticated'),
        Controller.sendOffer
    );
};

module.exports = Router;