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

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req,res)=>{
    const sig =req.headers['stripe-signature'];
    let event;
    try{
        event = Stripe.webhooks.constructEvent(req.body,sig,process.env.STRIPE_WEBHOOK_SECRET);
    }catch(err){
        console.error('Stripe Webhook Error:',err.message);
        return res.status(400).send(`Webhook Error:${err.message}`);
    }
    switch(event.type){
        case 'payment_intent.succeeded':{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });
            const {purchaseId}= session.data[0].metadata;
            const purchaseData = await Purchase.findById(purchaseId);
            const userData= await User.findById(purchaseData.UserID);
            const courseData= await Course.findById(purchaseData.CourseID.toString());

            courseData.enrolledStudents.push(userData);
            await courseData.save();

            userData.enrolledCourses.push(courseData._id);
            await userData.save();

            purchaseData.status='completed';
            await purchaseData.save();
            break;
        }
        case 'payment_intent.payment_failed':{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });
            const {purchaseId}= session.data[0].metadata;
            const purchaseData = await Purchase.findById(purchaseId);
            purchaseData.status='failed';
            await purchaseData.save();
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    res.json({received:true});
}