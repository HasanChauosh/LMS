
import mongoose from "mongoose";
import dotenv from "dotenv";

// connect to mongodb database/server

const buildMongoUri = (baseUri, dbName = 'lms') => {
    if (!baseUri) throw new Error('MONGODB_URI is not set')
    // If baseUri already contains '/?' (query without a DB), insert the dbName before the query
    if (baseUri.includes('/?')) return baseUri.replace('/?', `/${dbName}?`)
    // If baseUri contains '?' but no path, insert dbName before query
    if (baseUri.includes('?') && !baseUri.includes('/')) return `${baseUri}/${dbName}`
    // If baseUri already has a path (e.g. /mydb), assume it's fine
    if (/(\/[^/]+)(\?|$)/.test(baseUri)) {
        // If it already points to a DB, return as-is
        return baseUri
    }
    // Default: append dbName
    return baseUri.endsWith('/') ? `${baseUri}${dbName}` : `${baseUri}/${dbName}`
}

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log('Mongodb is connected')
    })
    mongoose.connection.on('error', (err) => {
        console.error('Mongodb connection error:', err && err.message ? err.message : err)
    })

    try {
        const uri = buildMongoUri(process.env.MONGODB_URI, 'lms')
        await mongoose.connect(uri)
    } catch (err) {
        // Provide clearer guidance for common SRV/DNS issues
        const msg = err && err.message ? err.message : String(err)
        console.error('Failed to connect to MongoDB:', msg)

        if (err && (err.code === 'ENOTFOUND' || msg.includes('querySrv'))) {
            console.error('\nPossible causes:')
            console.error('- Your machine cannot resolve DNS SRV records (network, VPN, or local DNS server).')
            console.error('- The Atlas cluster host is incorrect or the cluster was deleted.')
            console.error('\nQuick steps to debug:')
            console.error("1) Run: dig +short SRV _mongodb._tcp.<your-cluster-host> or: nslookup -type=SRV _mongodb._tcp.<your-cluster-host>")
            console.error("2) If SRV lookup fails, try the non-SRV connection string from Atlas (replace 'mongodb+srv://' with a standard 'mongodb://' string containing the host:port entries).")
            console.error("3) In Atlas: go to 'Connect' -> 'Connect your application' -> choose 'Standard connection string (old)'.")
            console.error('\nAfter fixing the connection string or network, restart the server.')
        }

        // rethrow so the caller can decide what to do (process exit or retry)
        throw err
    }
}

export default connectDB