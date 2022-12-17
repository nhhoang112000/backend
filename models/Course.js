const mongoose = require("mongoose")
const Schema = mongoose.Schema

const CousreSchema = new Schema({
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
    },
    url:{
        type:String,
        required:true,
    },
    cost:{
        type:Number,
        required:true,
    },
    type:{
        type:String,
        enum:["BA","Tester","Frontend","Backend","Full stack","All"]
    },
    framework:{
        type: String,
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: "users",
    },
    rate:{
        type:Number,
        default:0
    },
    image: {
        data: Buffer,
        contentType: String,
      },
    learner:{
        type: Array,
    
    },

});

module.exports = mongoose.model("courses", CousreSchema);