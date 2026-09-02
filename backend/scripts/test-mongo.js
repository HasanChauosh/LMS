import mongoose from 'mongoose'
import 'dotenv/config'

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI is not set. Copy .env.example -> .env and update it.')
  process.exit(1)
}

console.log('Testing MongoDB connection...')
;(async () => {
  try {
    await mongoose.connect(uri, { dbName: 'lms' })
    console.log('✅ MongoDB connected successfully')
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('❌ MongoDB connection failed:')
    if (err && err.message) console.error(err.message)
    else console.error(err)
    // print stack for deeper debugging
    console.error(err.stack)
    process.exit(1)
  }
})()
