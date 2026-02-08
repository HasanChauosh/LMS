import User from "../models/User.js";
import Course from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";
import Stripe from "stripe";
import { getAuth } from "@clerk/express";

// Get user data
export const getUserData = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const user = await User.findOne({ _id: userId }).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error('getUserData error:', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Get user enrolled courses
export const userEnrolledCourses = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const userData = await User.findOne({ _id: userId }).populate('enrolledCourses');
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.json({ success: true, courses: userData.enrolledCourses });
    } catch (error) {
        console.error('userEnrolledCourses error:', error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

// Purchase courses logic
export const purchaseCourses = async (req, res) => {
    try {
        const { courseId } = req.body;
        const { origin } = req.headers;
        const { userId } = getAuth(req);

        // Debug logging
        console.log(`[PURCHASE] Processing request for User: ${userId}`);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: No session found" });
        }

        // Use findOne for the User String ID
        const userData = await User.findOne({ _id: userId });
        const courseData = await Course.findById(courseId);

        // Specific error messages for debugging
        if (!userData) {
            return res.status(404).json({ success: false, message: "User profile not found in database. Please re-login or check webhooks." });
        }
        if (!courseData) {
            return res.status(404).json({ success: false, message: "Course not found. Check the courseId provided." });
        }

        const finalAmount = (courseData.coursePrice - (courseData.coursePrice * (courseData.discount / 100))).toFixed(2);

        const purchaseData = {
            CourseID: courseData._id,
            UserID: userData._id,
            amount: finalAmount,
        }

        const newPurchase = await Purchase.create(purchaseData);

        // Stripe gateway integration
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
        const currency = (process.env.CURRENCY || 'usd').toLowerCase();

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(finalAmount * 100), // convert to cents
            },
            quantity: 1,
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString(),
            }
        })

        res.json({ success: true, session_url: session.url })
    } catch (error) {
        console.error('purchaseCourses error:', error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

//update user course progress

export const updateUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { courseId, lectureId } = req.body;
        const progressData = await CourseProgress.findOne({ userId, courseId });
        if (progressData) {
            //check if the lecture is already marked as completed
            if (progressData.lecutureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: "Lecture already marked as completed" })
            }

            progressData.lectureCompleted.push(lectureId);
            await progressData.save();
            return res.json({ success: true, message: "Lecture marked as completed" })
        } else {
            await CourseProgress.create({ userId, courseId, lectureCompleted: [lectureId] });
            return res.json({ success: true, message: "Lecture marked as completed" })
        }
        res.json({ success: true, message: "Course progress updated" })
    } catch (error) {
        console.error('updateUserCourseProgress error:', error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

//get user course progress

export const getUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { courseId } = req.body;
        const progressData = await CourseProgress.findOne({ userId, courseId });
        res.json({ success: true, progressData })
    } catch (error) {
        console.error('getUserCourseProgress error:', error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

//add user ratings to courses

export const addUserRating = async (req, res) => {
    const userId = req.auth.userId;
    const { courseId, rating } = req.body;
    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: "Invalid input" })
    }
    try {
        const courseData = await Course.findById(courseId);
        if (!courseData) {
            return res.status(404).json({ success: false, message: "Course not found" })
        }
        const user = await User.findById(userId);
        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.status(404).json({ success: false, message: "User not enrolled in this course" })
        }
        const existingRatingIndex = courseData.courseRatings.findIndex(r => r.userId.toString() === userId);
        if (existingRatingIndex > -1) {
            courseData.courseRatings[existingRatingIndex].rating = rating;
        } else {
            courseData.courseRatings.push({ userId, rating });
        }
        await courseData.save();
        res.json({ success: true, message: "Rating added successfully" })
    } catch (error) {
        console.error('addUserRating error:', error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}
