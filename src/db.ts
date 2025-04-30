import dotenv from 'dotenv';
import {DataSource, DataSourceOptions} from 'typeorm';
import {Product, Collection, ProductImage} from './entities';

dotenv.config();

export const DB = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [Product, Collection, ProductImage],
} as DataSourceOptions);

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

// Automatically trigger initialization (cold start)
initDB().catch(() => {
    /* Fail silently in dev. Vercel will retry */
});
