import { Pool, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

// WebSocket is needed for the Neon serverless driver in Node.js
// In serverless environments (Vercel), this is handled automatically
if (typeof WebSocket === 'undefined') {
    neonConfig.webSocketConstructor = ws as unknown as typeof WebSocket;
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export default pool;
