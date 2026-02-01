// server.js
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import { clerkMiddleware, getAuth } from '@clerk/express'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoute.js'
import userRouter from './routes/userRoutes.js'

dotenv.config()
const app = express()

// Middleware Order Matters!
app.use(cors())

// Stripe webhook needs the raw body to verify the signature so parese before other middlewares since it has secret key verification(encrptying )
app.post('/stripe',express.raw({type:'application/json'}),stripeWebhooks)

app.use(express.json()) // Must be global
app.use(clerkMiddleware()) // Must come after json

// Debugging: Check your VS Code terminal for this log!
app.use((req, res, next) => {
    const { userId } = getAuth(req);
    console.log(`[DEBUG] ${req.method} ${req.path} | UserID: ${userId || 'NOT_LOGGED_IN'}`);
    next();
});

connectDB()
await connectCloudinary()

app.get('/', (req, res) => res.send('API is running'))
app.post('/clerk', clerkWebhooks)

// Simplified Routes
app.use('/api/educator', educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)
//exprss.raw is used to parse the raw body for stripe webhook verification and application/json is the content type

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))