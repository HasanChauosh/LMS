import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks } from './controllers/webhooks.js'

// load env first
dotenv.config()

// initialize Express
const app = express()

// middleware
app.use(cors())
app.use(express.json())

// connect to database
connectDB()

// routes
app.get('/', (req, res) => {
    res.send('API is running')
})

app.post('/clerk',express.json(),clerkWebhooks)
// port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
