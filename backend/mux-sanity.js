import dotenv from 'dotenv';
import Mux from '@mux/mux-node';
import jwt from 'jsonwebtoken';

dotenv.config();

const {
  MUX_TOKEN_ID,
  MUX_TOKEN_SECRET,
  MUX_SIGNING_KEY_ID,
  MUX_SIGNING_KEY_PRIVATE,
  MUX_WEBHOOK_SECRET,
  FRONTEND_URL,
} = process.env;

// 1. Are all vars present?
const missing = Object.entries({
  MUX_TOKEN_ID, MUX_TOKEN_SECRET,
  MUX_SIGNING_KEY_ID, MUX_SIGNING_KEY_PRIVATE,
  MUX_WEBHOOK_SECRET, FRONTEND_URL,
}).filter(([_, v]) => !v).map(([k]) => k);

if (missing.length) {
  console.error('❌ Missing env vars:', missing.join(', '));
  process.exit(1);
}
console.log('✅ All env vars present');

// 2. Can we call the Mux API?
(async () => {
  try {
    const mux = new Mux({ tokenId: MUX_TOKEN_ID, tokenSecret: MUX_TOKEN_SECRET });
    const res = await mux.video.assets.list({ limit: 1 });
    console.log(`✅ Mux API reachable (assets found: ${res.data.length})`);
  } catch (e) {
    console.error('❌ Mux API call failed:', e.message);
    process.exit(1);
  }

  // 3. Can we sign a JWT with the signing key?
  try {
    const privateKey = Buffer.from(MUX_SIGNING_KEY_PRIVATE, 'base64').toString('ascii');
    const token = jwt.sign(
      { sub: 'fake-playback-id', aud: 'v', exp: Math.floor(Date.now() / 1000) + 60 },
      privateKey,
      { algorithm: 'RS256', keyid: MUX_SIGNING_KEY_ID }
    );
    console.log(`✅ JWT signed OK (length: ${token.length} chars)`);
  } catch (e) {
    console.error('❌ JWT signing failed:', e.message);
    console.error('   Most likely cause: MUX_SIGNING_KEY_PRIVATE is not the raw base64 blob Mux gave you.');
    process.exit(1);
  }

  console.log('\n🎉 All checks passed. You are ready to build.');
})();