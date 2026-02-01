import Course from "../models/Course.js";
//get all courses
export const getAllCourses = async(req,res)=>{
    try {
        const courses= await Course.find({
            isPublished:true
        }).select(['-courseContent','-enrolledStudents']).populate({path:'educator'})
        res.json({success:true,courses})
    } catch (error) {
        console.error('getAllCourses error:', error)
        res.status(500).json({ success: false, message: "Internal server error", error: error.message })
    }
}

//get course by id
export const getCourseId = async(req,res)=>{
    const {id}= req.params;
    try {
        const courseData= await Course.findById(id).populate({path:'educator'});
        //remove lecture url if isPreview is false
        courseData.courseContent.forEach(chapter=>{
            chapter.chapterContent.forEach(lecture=>{
                if(!lecture.isPreviewFree){
                    lecture.lectureUrl= null;
                }
            });
        });
        res.json({success:true,courseData})
    } catch (error) {
        console.error('getCourseId error:', error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}
