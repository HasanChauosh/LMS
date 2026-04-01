import {clerkClient} from '@clerk/express'
import Course from '../models/Course.js'
import {v2 as cloudinary} from 'cloudinary'
import {Purchase} from '../models/Purchase.js'
import User from '../models/User.js'


//update role to educator
export const updateRoleToEducator =async(req,res)=>{
    try {
        const userId= req.auth.userId //from clerk
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata:{
                role:'educator'
            }
        })
        res.json({success:true,message:'you can publish a course now'}); 
    } catch (error) {
        res.json({success:false,message:'something went wrong'})
    }
}

//Add new course

export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body
        const imageFile = req.file
        const userId = req.auth.userId

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail Not attached' })
        }

        const parsedCourseData = JSON.parse(courseData)
        
        // 1. Upload to Cloudinary FIRST
        const uploadedImage = await cloudinary.uploader.upload(imageFile.path)

        // 2. Attach the URL and Educator ID to the data object
        parsedCourseData.courseThumbnail = uploadedImage.secure_url
        parsedCourseData.educator = userId

        // 3. Now create the course with all required fields present
        const newCourse = await Course.create(parsedCourseData)

        return res.json({ success: true, message: "Course added successfully", course: newCourse })

    } catch (error) {
        console.error('addCourse error:', error)
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message })
    }
}

//get educator courses

export const getEducatorCourses = async(req,res)=>{
    try {
        const educator = req.auth.userId
        const courses = await Course.find({ educator })
        return res.json({ success: true, courses })
    } catch (error) {
        console.error('getEducatorCourses error:', error)
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message })
    }
}

//get educator dashboard data(total earnings, total students, total courses)

export const educatorDashboard = async(req,res)=>{
    try {
        const educator= req.auth.userId
        const courses = await Course.find({ educator })

        const totalCourses = courses.length
        const courseIds= courses.map((course)=>course._id)
        //find all completed purchases for these courses where status is completed
        const purchases = await Purchase.find({
            CourseID: { $in: courseIds },
            status: 'completed'
        })

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0)

        //collect unique student ids from enrolled students in all courses
        const enrolledStudentsData=[];
        for(const course of courses){
            const students= await User.find({_id:{$in:course.enrolledStudents}
            },'name imageUrl');

            students.forEach(element=>{
                enrolledStudentsData.push({
                    courseTitle:course.courseTitle,
                    studentName:element.name,
                })
            })

        }

        return res.json({ success: true, dashboardData:{totalEarnings, totalCourses, enrolledStudentsData} })

    } catch (error) {
        console.error('educatorDashboard error:', error)
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message })
    }
}

//get enrolled students data with purchase data

export const getEnrolledStudentsWithPurchases = async(req,res)=>{
    try {
        const educator= req.auth.userId
        const courses = await Course.find({ educator })
        
        const courseIds= courses.map((course)=>course._id);
        const purchases = await Purchase.find({
            CourseID: { $in: courseIds },
            status: 'completed'
        }).populate('UserID','name imageUrl').populate('CourseID','courseTitle');

        const enrolledStudentsWithPurchases = purchases.map(purchase=>({
            courseTitle: purchase.CourseID.courseTitle,
            student: purchase.UserID,
            purchaseDate: purchase.createdAt,
        }))
        res.json({ success: true, enrolledStudentsWithPurchases })
    } catch (error) {
        console.error('getEnrolledStudentsWithPurchases error:', error)
        res.status(500).json({ success: false, message: "Internal server error", error: error.message })
    }
}