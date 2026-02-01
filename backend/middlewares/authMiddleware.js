import { clerkClient } from "@clerk/express";

export const protectEducator = async (req, res, next) => {
    try {
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const { publicMetadata } = await clerkClient.users.getUser(userId);

        if (publicMetadata?.role !== 'educator') {
            return res.status(403).json({ success: false, message: 'You are not an educator' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};