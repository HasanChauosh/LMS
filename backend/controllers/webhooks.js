import { Webhook } from "svix";
import User from "../models/User.js";

//Api controller function to manage clerk user with database
//Clerk stores user in Clerk’s cloud, not in your MongoDB.so when the user is created, updated or deleted in Clerk,
// Clerk sends a webhook to your backend.
export const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        // Verify the webhook signature 
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });

        const { data, type } = req.body;
        switch (type) {
            case "user.created":{
                const userData = await User.create({
                    _id: data.id,
                    name: data.first_name + " " + data.last_name,
                    email: data.email_addresses[0].email_address,
                    imageUrl: data.image_url,
                })
                await User.create(userData)
                res.json({ message: "success" })
                break;
            }
            case "user.updated": {
                const userData = await User.create({
                    name: data.first_name + " " + data.last_name,
                    email: data.email_address[0].email_address,
                    imageUrl: data.image_url,
                })
                await User.findByIdAndUpdate(data.id, userData)
                res.json({ message: "success" })
                break;
            }
            case "user.deleted": {
                await User.findByIdAndDelete(data.id)
                res.json({ message: "success" })
                break;
            }
            default: {
                break;
            }

        }
    }
    catch (err) {
        res.json({ message:err.message })
        console.log(err)
    }
}