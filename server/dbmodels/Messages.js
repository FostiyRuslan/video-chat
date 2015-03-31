var ObjectId = require('mongoose-simpledb').Types.ObjectId;

exports.schema = {
    text: { type: String, require: true },
    sender: { type: ObjectId, ref: 'User' },
    chatId: { type: ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
};