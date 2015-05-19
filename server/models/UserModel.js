var UserModel = function(db) {

    var getUser = function (query, callback) {
        db.User.findOne(query, callback);
    };

    var getUsers = function (query, callback) {
        db.User.find(query, callback);
    };

    var searchEmails = function (query, options, callback) {
        db.User.find(query, options).exec(callback);
    };

    var save = function (params, callback) {
        var user = new db.User(params);

        user.generateUniqueRoomId().setPassword();
        user.save(callback);
    };

    var update = function (query, params, callback) {
        db.User.where(query).update(params, callback);
    };

    var remove = function (query, callback) {
        db.User.remove(query, callback);
    };

    return {
        getUser: getUser,
        getUsers: getUsers,
        save: save,
        update: update,
        remove: remove,
        searchEmails: searchEmails
    }
};

module.exports = UserModel;