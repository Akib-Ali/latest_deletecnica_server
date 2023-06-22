const mongoose = require("mongoose");

const SiteMapSchema = new mongoose.Schema({


    getSitemapblog:{
        type:String,
        // required:true
    },
    
    priority:{
        type:Number,
        required:true
    },
    blog_slug: {
        type: String,
        // required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model("sitemaps", SiteMapSchema)