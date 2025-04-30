import dotenv from 'dotenv';
import {DataSource, DataSourceOptions} from 'typeorm';
import path from 'path';

dotenv.config();

// Production-safe fallback
const isProd = process.env.NODE_ENV === 'production';

const options: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: isProd
        ? [path.join(__dirname, '/entities/*.js')] // 👈 fallback for compiled Vercel build
        : [require('./entities').Product, require('./entities').Collection, require('./entities').ProductImage], // local dev: classes directly
} as DataSourceOptions;

export const DB = new DataSource(options);

let initializing: Promise<void> | null = null;
let initialized = false;

async function initDB() {
    if (!initialized && !initializing) {
        initializing = DB.initialize()
            .then(() => {
                initialized = true;
                console.log('✅ DB initialized');
            })
            .catch((err) => {
                console.error('❌ DB init failed:', err);
                throw err;
            });
    }

    return initializing;
}

initDB().catch(() => {
    // fail silently
});
