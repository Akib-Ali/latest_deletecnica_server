const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({

    client_name: {
        type: String,
        required:true
    },

    client_email: {
        type: String,
        required:true,
    },
    client_message: {
        type: String,
        required:true
    },
   
    createdAt:{
        type:Date,
        default:Date.now()
    }

})

module.exports = mongoose.model("comments",commentSchema)