var config = require('./config');
var express = require('express');
var path = require('path');
var app = express();
var server = app.listen(process.env.PORT || config.port);
var socketConnection = require('socket.io')(server);
var communicator = require('./server/communication/Communicator')( socketConnection );
var clientLocation = path.join(__dirname, '/public');
var dbConnection = require('./server/DbConnection');
var router = require('./server/Router');
var passport = require('passport');


app.use(express.static(clientLocation));
app.set('views', clientLocation);
app.engine('html', require('ejs').renderFile);
app.use(express.cookieParser('secret'));
app.use(express.cookieSession());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);


dbConnection(function (err) {
    if (err) {
        console.error(err);
        return;
    }
    var roleManager = require('./server/RolesManager');
    app.use(roleManager.middleware());
    console.log('connected to db');
    router(app);
});

/* exports */
module.exports = app;