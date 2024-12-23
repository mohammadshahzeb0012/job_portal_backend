const mongoose = require("mongoose")

const saveForLaterSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job"
    }
}, { timestamps: true }, { strict: false })

module.exports = mongoose.model("saveForLater", saveForLaterSchema)