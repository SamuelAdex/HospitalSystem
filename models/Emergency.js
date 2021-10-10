const mongoose = require('mongoose');


const emergencySchema = new mongoose.Schema({
    Firstname: {
        type: String,
        required: true
    },
    Lastname: {
        type:String,
        required: true
    },
    Age: {
        type: String,
        required: true
    },
    Address: {
        type: String,
        required: true
    },
    Landmark: {
        type: String,
        required: true
    },
    Phone: {
        type: String,
        required: true
    },
    Resolved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('Emergency', emergencySchema)