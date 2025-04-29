import dotenv from 'dotenv';
import {DataSource, DataSourceOptions} from 'typeorm';
import {Collection, Product, ProductImage} from './entities';

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

// Immediately initialize it
DB.initialize()
    .then(() => {
        console.log('✅ Database initialized');
    })
    .catch((err) => {
        console.error('❌ Error during DB initialization', err);
    });
