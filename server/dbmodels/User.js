var ObjectId = require('mongoose-simpledb').Types.ObjectId;
var md5 = require('MD5');

exports.schema = {
    firstname: { type: String, required: true },
    lastname: { type:String, required: true },
    email: { type: String, required: true, unique : true },
    date: { type: Date, default: Date.now },
    password: { type: String, required: true },
    roomId: String
};

exports.methods = {
  generateUniqueRoomId: function() {
      this.roomId = md5(this.firstname + this.lastname + this.date.valueOf);
      return this;
  },

  setPassword: function() {
      this.password = md5(this.password);
      return this;
  }
};