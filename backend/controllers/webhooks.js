import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";
export const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });

        const { data, type } = req.body;

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    name: data.first_name + " " + data.last_name,
                    email: data.email_addresses[0].email_address,
                    imageUrl: data.image_url,
                };
                await User.create(userData); //
                return res.json({ success: true });
            }

            case "user.updated": {
                const userData = {
                    name: data.first_name + " " + data.last_name,
                    email: data.email_addresses[0].email_address,
                    imageUrl: data.image_url,
                };
                await User.findByIdAndUpdate(data.id, userData); //
                return res.json({ success: true });
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                return res.json({ success: true });
            }

            default:
                break;
        }
    } catch (err) {
        console.error("Webhook Error:", err.message);
        return res.status(400).json({ success: false, message: err.message });
    }
}

export const stripeWebhooks = async (req, res) => {
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Must use 'Stripe' class and 'req.body' (raw)
        event = Stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Stripe Webhook Error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // CHANGE: Use checkout.session.completed
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const { purchaseId } = session.metadata; // Directly available here!

            try {
                const purchaseData = await Purchase.findById(purchaseId);
                
                // FIX: Use UserID and CourseID (Matches Purchase.js capitalization)
                if (purchaseData && purchaseData.status !== 'completed') {
                    const userData = await User.findById(purchaseData.UserID); 
                    const courseData = await Course.findById(purchaseData.CourseID);

                    if (userData && courseData) {
                        // FIX: Push IDs, not full objects
                        courseData.enrolledStudents.push(userData._id);
                        await courseData.save();

                        userData.enrolledCourses.push(courseData._id);
                        await userData.save();

                        // Update Status
                        purchaseData.status = 'completed';
                        await purchaseData.save();
                        
                        console.log(`[SUCCESS] Enrollment completed for: ${purchaseId}`);
                    }
                }
            } catch (err) {
                console.error('Database update failed:', err.message);
            }
            break;
        }
        case 'checkout.session.expired': {
            const session = event.data.object;
            const { purchaseId } = session.metadata;
            if (purchaseId) {
                await Purchase.findByIdAndUpdate(purchaseId, { status: 'failed' });
            }
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
}