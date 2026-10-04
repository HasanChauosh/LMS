// controllers/muxController.js
import mux from '../configs/mux.js'
import Course from '../models/Course.js'
import jwt from 'jsonwebtoken'

// POST /mux-webhook  (raw body!)
export const muxWebhook = async (req, res) => {
    try {
        console.log('[MUX WEBHOOK] incoming request')

        // 1. Verify signature — req.body is a Buffer here
        const signature = req.headers['mux-signature']
        try {
            mux.webhooks.verifySignature(
                req.body.toString('utf8'),                    // raw Buffer
                { 'mux-signature': signature },
                process.env.MUX_WEBHOOK_SECRET
            )
        } catch {
            console.error('Mux webhook: bad signature')
            return res.status(400).send('Invalid signature')
        }

        // 2. Now safe to parse
        const event = JSON.parse(req.body.toString('utf8'))
        const { type, data } = event
        console.log('[MUX WEBHOOK]', type)

        // 3. Handle the three events we care about
        switch (type) {

            case 'video.upload.asset_created': {
                // link uploadId -> assetId; move to "processing"
                await Course.updateOne(
                    { 'courseContent.chapterContent.muxUploadId': data.upload_id },
                    {
                        $set: {
                            'courseContent.$[].chapterContent.$[l].muxAssetId': data.id,
                            'courseContent.$[].chapterContent.$[l].videoStatus': 'processing',
                        }
                    },
                    { arrayFilters: [{ 'l.muxUploadId': data.upload_id }] }
                )
                break
            }

            case 'video.asset.ready': {
                const playbackId = data.playback_ids?.[0]?.id
                await Course.updateOne(
                    { 'courseContent.chapterContent.muxAssetId': data.id },
                    {
                        $set: {
                            'courseContent.$[].chapterContent.$[l].muxPlaybackId': playbackId,
                            'courseContent.$[].chapterContent.$[l].lectureDuration': Math.round(data.duration || 0),
                            'courseContent.$[].chapterContent.$[l].videoStatus': 'ready',
                        }
                    },
                    { arrayFilters: [{ 'l.muxAssetId': data.id }] }
                )
                break
            }

            case 'video.asset.errored': {
                const message = data.errors?.[0]?.messages?.join('; ') || 'Unknown error'
                await Course.updateOne(
                    { 'courseContent.chapterContent.muxAssetId': data.id },
                    {
                        $set: {
                            'courseContent.$[].chapterContent.$[l].videoStatus': 'errored',
                            'courseContent.$[].chapterContent.$[l].videoError': message,
                        }
                    },
                    { arrayFilters: [{ 'l.muxAssetId': data.id }] }
                )
                break
            }

            default:
                // Ignore all other events but still ACK them
                break
        }

        return res.sendStatus(200)
    } catch (error) {
        console.error('muxWebhook error:', error)
        // Return 200 anyway so Mux doesn't hammer us with retries during dev.
        // In production you'd want to think harder about retryable vs. permanent errors.
        return res.sendStatus(200)
    }
}

// GET /api/mux/playback-token/:lectureId?courseId=xxx
// Verifies the caller can watch this lecture (enrolled OR free preview),
// then signs a short-lived JWT the Mux player will attach to every segment
// request. Without a valid token, Mux's CDN refuses playback.
export const createPlaybackToken = async (req, res) => {
    try {
        const userId = req.auth?.userId
        const { lectureId } = req.params
        const { courseId } = req.query

        if (!userId)   return res.status(401).json({ success: false, message: 'Unauthorized' })
        if (!courseId) return res.status(400).json({ success: false, message: 'courseId is required' })

        const course = await Course.findById(courseId)
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' })

        // Walk the nested arrays to find the lecture.
        let lecture = null
        for (const chapter of course.courseContent) {
            const found = chapter.chapterContent.find(l => l.lectureId === lectureId)
            if (found) { lecture = found; break }
        }
        if (!lecture) return res.status(404).json({ success: false, message: 'Lecture not found' })

        // YouTube lectures don't use JWTs; the player embeds them directly.
        if (lecture.videoProvider !== 'mux') {
            return res.status(400).json({ success: false, message: 'This lecture is not a Mux video' })
        }

        // Access check: enrolled student OR free preview.
        const isEnrolled = course.enrolledStudents.map(String).includes(userId)
        if (!isEnrolled && !lecture.isPreviewFree) {
            return res.status(403).json({ success: false, message: 'Not enrolled in this course' })
        }

        // Wait for Mux to finish transcoding before we hand out a token.
        if (lecture.videoStatus !== 'ready' || !lecture.muxPlaybackId) {
            return res.status(409).json({ success: false, message: 'Video is still processing' })
        }

        // Sign the JWT.
        // sub = playback id, aud = 'v' (video), exp = 2 hours from now.
        const privateKey = Buffer.from(process.env.MUX_SIGNING_KEY_PRIVATE, 'base64').toString('ascii')
        const token = jwt.sign(
            {
                sub: lecture.muxPlaybackId,
                aud: 'v',
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
            },
            privateKey,
            { algorithm: 'RS256', keyid: process.env.MUX_SIGNING_KEY_ID }
        )

        return res.json({
            success:    true,
            playbackId: lecture.muxPlaybackId,
            token,
        })
    } catch (error) {
        console.error('createPlaybackToken error:', error)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// reconcileMuxLecture
// Queries Mux directly for a given uploadId's asset state and patches the
// matching lecture in MongoDB. This solves the race condition where Mux
// finishes transcoding (and its webhooks fire) BEFORE addCourse has actually
// saved the course document — in that case the webhook handler found nothing
// to update and Mux won't retry.
// Called after Course.create in addCourse. Safe to call anytime.
export const reconcileMuxLecture = async (muxUploadId) => {
    try {
        const upload = await mux.video.uploads.retrieve(muxUploadId)
        if (!upload.asset_id) {
            return { uploadId: muxUploadId, status: 'no_asset_yet' }
        }

        const asset = await mux.video.assets.retrieve(upload.asset_id)

        const set = {
            'courseContent.$[].chapterContent.$[l].muxAssetId': asset.id,
        }

        if (asset.status === 'ready' && asset.playback_ids?.[0]?.id) {
            set['courseContent.$[].chapterContent.$[l].muxPlaybackId']   = asset.playback_ids[0].id
            set['courseContent.$[].chapterContent.$[l].lectureDuration'] = Math.round(asset.duration || 0)
            set['courseContent.$[].chapterContent.$[l].videoStatus']     = 'ready'
        } else if (asset.status === 'errored') {
            set['courseContent.$[].chapterContent.$[l].videoStatus'] = 'errored'
            set['courseContent.$[].chapterContent.$[l].videoError'] =
                asset.errors?.[0]?.messages?.join('; ') || 'Asset errored during processing'
        } else {
            set['courseContent.$[].chapterContent.$[l].videoStatus'] = 'processing'
        }

        const result = await Course.updateOne(
            { 'courseContent.chapterContent.muxUploadId': muxUploadId },
            { $set: set },
            { arrayFilters: [{ 'l.muxUploadId': muxUploadId }] }
        )

        return {
            uploadId: muxUploadId,
            assetStatus: asset.status,
            matched: result.matchedCount,
            modified: result.modifiedCount,
        }
    } catch (error) {
        console.error(`reconcileMuxLecture(${muxUploadId}) failed:`, error.message)
        return { uploadId: muxUploadId, status: 'error', error: error.message }
    }
}

// POST /api/mux/uploads
// Returns a one-time upload URL the browser will PUT the video file to.
export const createMuxUpload = async (req, res) => {
    try {
        const upload = await mux.video.uploads.create({
            cors_origin: process.env.FRONTEND_URL,
            new_asset_settings: {
                playback_policy: ['signed'],   // private — needs JWT to play
                encoding_tier:   'baseline',   // free tier; use 'smart' on paid
            },
        })

        return res.json({
            success: true,
            uploadId:  upload.id,
            uploadUrl: upload.url,
        })
    } catch (error) {
        console.error('createMuxUpload error:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to create Mux upload',
            error:   error.message,
        })
    }
}