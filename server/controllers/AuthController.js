var eventEmitter = require('../communication/EventEmitter');
var passport = require('passport');

var AuthController = function(){
    var db = require('mongoose-simpledb').db;
    var UserModel = require('../models/UserModel')(db);

    function authorizationFailed(req, res) {
        res.redirect(401, '/login');
    }

    function showLoginPage(req, res) {
        res.render('login.html');
    }

    function login(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.status(401).end(); }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.json(req.user);
            });
        })(req, res, next);
    }

    function registration(req, res) {
        var user = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: req.body.password
        };

        UserModel.save(user, function (err, user) {
            if (err) {
                res.status(400).end();
                return;
            }
            res.send(user.toJSON());
        });
    }

    return {
        authorizationFailed: authorizationFailed,
        showLoginPage: showLoginPage,
        login: login,
        registration: registration
    }
};

module.exports = AuthController;