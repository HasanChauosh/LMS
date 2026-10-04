import express from 'express'
import mongoose from 'mongoose'

const lectureSchema = new mongoose.Schema({
    lectureId:      { type: String,  required: true },
    lectureTitle:   { type: String,  required: true },
    lectureOrder:   { type: Number,  required: true },
    isPreviewFree:  { type: Boolean, required: true },

    // duration is now filled in by the Mux webhook (was: required)
    lectureDuration:{ type: Number,  default: 0 },

    // --- video source ---
    videoProvider: {
        type: String,
        enum: ['youtube', 'mux'],
        default: 'mux',
        required: true
    },

    // used only when videoProvider === 'youtube' (legacy courses)
    lectureUrl:     { type: String, default: '' },

    // used only when videoProvider === 'mux'
    muxUploadId:    { type: String, default: '' },   // known first, from create-upload
    muxAssetId:     { type: String, default: '' },   // filled in by asset_created webhook
    muxPlaybackId:  { type: String, default: '' },   // filled in by asset_ready webhook

    videoStatus: {
        type: String,
        enum: ['pending', 'uploading', 'processing', 'ready', 'errored'],
        default: 'pending'
    },
    videoError:     { type: String, default: '' }
}, { _id: false })

const chapterSchema = new mongoose.Schema({
    chapterId:{type:String,required : true},
    chapterOrder:{type:Number,required : true},
    chapterTitle:{type :String , required : true},
    chapterContent:[lectureSchema],
},{_id : false})

const courseSchema = new mongoose.Schema({
    courseTitle:{type :String , required : true},
    courseDescription:{type :String , required : true},
    courseThumbnail:{type :String , required : true},
    coursePrice:{type :Number , required : true},
    isPublished:{type :Boolean , default : true},
    discount:{type :Number , default : 0,min:0,max:100},
    courseContent:[chapterSchema],
    courseRatings:[
        {userId:{type:String},rating:{type:Number,min:1,max:5}}
    ],
    educator:{type:String,ref:'User',required : true},
    enrolledStudents:[{type:String,ref:'User'}],
},{timestamps : true,minimize : false})

const Course = mongoose.model('Course',courseSchema)

export default Course;