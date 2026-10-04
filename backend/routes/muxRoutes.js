// routes/muxRoutes.js
import express from 'express'
import { createMuxUpload, createPlaybackToken } from '../controllers/muxController.js'
import { protectEducator } from '../middlewares/authMiddleware.js'

const muxRouter = express.Router()

// Educator uploads a lecture video — needs educator role.
muxRouter.post('/uploads', protectEducator, createMuxUpload)

// Student watches a lecture — needs auth, enrollment check is inside the handler.
muxRouter.get('/playback-token/:lectureId', createPlaybackToken)

export default muxRouter