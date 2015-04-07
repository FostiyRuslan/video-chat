var eventEmitter = require('../communication/EventEmitter');

var AuthController = function(){
    var db = require('mongoose-simpledb').db;
    var UserModel = require('../models/UserModel')(db);

    function authorizationFailed(req, res) {
        res.redirect('/');
    }

    function showLoginPage(req, res) {
        res.render('login.html');
    }

    function login(req, res) {
        res.json(req.user.toJSON());
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