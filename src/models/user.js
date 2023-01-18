const {Schema, model} = require('mongoose');

const schema = new Schema({
    email: {type: String, required: true, unique: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
    registrationDate: {type: Date, required: true},
    lastVisit: {type: Date},
    status: {type: Boolean, default: false},
});

module.exports = model('User', schema);
