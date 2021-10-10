const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    Firstname: {
        type: String,
        required: true
    },
    Lastname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        unique: true,
        required: true
    },
    position: {
        type: String,
        default: "Senior Doctor",
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    profile:{
        type: String,
        default: '/uploads/pix.jpeg',
        required: true
    },
    role: {
        type: String,
        default: "doctor"
    },
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model("Doctor", doctorSchema)