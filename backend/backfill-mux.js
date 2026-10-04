import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Mux from '@mux/mux-node'
import Course from './models/Course.js'

dotenv.config()

// Paste the stuck lecture's muxUploadId here:
const MUX_UPLOAD_ID = '44TQKqRKAr5N1hC02ahr3zS4yuUNth9M882Xl35vbv0100'

// Backend connects to the 'lms' database — the raw MONGODB_URI has no db name.
function withLmsDb(baseUri) {
    if (!baseUri) throw new Error('MONGODB_URI is not set')
    if (baseUri.includes('/?')) return baseUri.replace('/?', '/lms?')
    if (baseUri.endsWith('/'))  return baseUri + 'lms'
    return baseUri + '/lms'
}

async function main() {
    const mux = new Mux({
        tokenId: process.env.MUX_TOKEN_ID,
        tokenSecret: process.env.MUX_TOKEN_SECRET,
    })

    const upload = await mux.video.uploads.retrieve(MUX_UPLOAD_ID)
    console.log('Upload status:', upload.status)
    console.log('Asset ID:', upload.asset_id || '(none)')

    if (!upload.asset_id) {
        console.error('❌ No asset created — upload itself failed on Mux.')
        process.exit(1)
    }

    const asset = await mux.video.assets.retrieve(upload.asset_id)
    console.log('Asset status:', asset.status)
    console.log('Duration:', asset.duration, 'seconds')

    const playbackId = asset.playback_ids?.[0]?.id
    if (asset.status !== 'ready' || !playbackId) {
        console.error('❌ Asset not ready yet — status:', asset.status)
        process.exit(1)
    }

    await mongoose.connect(withLmsDb(process.env.MONGODB_URI))
    console.log('✅ Connected to MongoDB (lms db)')

    const result = await Course.updateOne(
        { 'courseContent.chapterContent.muxUploadId': MUX_UPLOAD_ID },
        {
            $set: {
                'courseContent.$[].chapterContent.$[l].muxAssetId':      asset.id,
                'courseContent.$[].chapterContent.$[l].muxPlaybackId':   playbackId,
                'courseContent.$[].chapterContent.$[l].lectureDuration': Math.round(asset.duration || 0),
                'courseContent.$[].chapterContent.$[l].videoStatus':     'ready',
            }
        },
        { arrayFilters: [{ 'l.muxUploadId': MUX_UPLOAD_ID }] }
    )

    console.log('Update result:', result)
    await mongoose.disconnect()
    console.log('✅ Done — refresh your app.')
}

main().catch(e => { console.error(e); process.exit(1) })
