const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNum: { type: String },
    IIN: { type: String },
    profilePicture: { type: String },
    school: { type: String },
    class: { type: String },
    readingGoal: { type: Number, default: 10 },
    courses: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course',
        required: false 
    }], 
    createdAt: { type: Date, default: Date.now },
    who: { type: String, default: 'student' },
});

module.exports = mongoose.model('User', UserSchema);