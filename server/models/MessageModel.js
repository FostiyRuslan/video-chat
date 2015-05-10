var MessageModel = function(db) {

    var getMessages = function (query, callback) {
        db.Message.find(query, callback);
    };

    var create = function (params, callback) {
        var message = new db.Message(params);
        message.save(callback);
    };

    var remove = function (query, callback) {
        db.Message.remove(query, callback);
    };

    return {
        getMessages: getMessages,
        create: create,
        remove: remove
    }
};

module.exports = MessageModel;