var nodeMailer = require('nodemailer');
var ejs = require('ejs');
var fs = require('fs');
var config = require('../config').email;
var smtpTransport = nodeMailer.createTransport({
    service: config.service,
    auth: {
        user: config.user,
        pass: config.password
    }
});

var template = fs.readFileSync(config.template, config.encode);

var Sender = function (options, success, error) {
    smtpTransport.sendMail({
        from: options.from, // sender address
        to: options.to, // comma separated list of receivers
        subject: options.subject, // Subject line
        html: ejs.render(template, options.data)
    }, function(error, response){
        if(error){
            error();
        }else{
            success(response);
        }
    });
};

module.exports = Sender;
