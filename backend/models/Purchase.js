import mongoose from "mongoose";
import Course from "./Course.js";

const PurchaseSchema = new mongoose.Schema({
    CourseID: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    UserID: { type: String, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });

export const Purchase = mongoose.model('Purchase', PurchaseSchema);
