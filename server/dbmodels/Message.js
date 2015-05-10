var ObjectId = require('mongoose-simpledb').Types.ObjectId;

exports.schema = {
    roomId: { type: String, required: true },
    text: { type: String, required: true },
    user: { type: Object, required: true },
    date: { type: Date, required: true }
};
