import mongoose  from "mongoose";

const courseProgressSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    courseId:{type:String,required:true},
    completed:{type:Boolean,default :false}, // percentage of course completed
    lectureCompleted:[]

},{minimize:false,timestamps:true});

export const CourseProgress = mongoose.model('CourseProgress',courseProgressSchema);