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