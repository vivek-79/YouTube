
import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const videoSchema =new Schema({
    videoFile:{
        type:String,//cloudnary
        required:true,
    },
    thumbnail:{
        type:String,//cloudinary url
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duraton:{
        type:Number,//cloudinary
        required:true
    },
    views:{
        type:Number,//cloudinary
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }
},{timestamps:true})

export const Video = mongoose.model("Video",videoSchema)