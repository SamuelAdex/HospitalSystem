const mongoose = require('mongoose');

const appointSchema = new mongoose.Schema({
    Firstname: {
        type: String,
        required: true
    },
    Lastname: {
        type: String,
        required: true
    },
    Age: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    timeType: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    condition: {
        type: String,
        required: true
    },
    cleared: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('Appointment', appointSchema)