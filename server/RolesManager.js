var ConnectRoles = require('connect-roles');
var md5 = require('MD5');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var RolesManager = function () {
    var db = require('mongoose-simpledb').db;
    var UserModel = require('./models/UserModel')(db);
    var roleManager = new ConnectRoles({
        failureHandler: function (req, res) {
            res.redirect(401, '/');
        }
    });

    roleManager.use('authenticated', function (req, action) {
        if (req.isAuthenticated()) {
            return true;
        }
    });

    passport.use(new LocalStrategy(
        {
            usernameField: 'email'
        },
        function(email, password, done) {
            UserModel.getUser({ email: email }, function (err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                if (user.password !== md5(password)) { return done(null, false); }
                return done(null, user);
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        db.User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    return roleManager
};


module.exports = RolesManager();