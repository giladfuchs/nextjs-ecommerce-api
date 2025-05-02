import 'reflect-metadata';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import routes from "./routes";
import {initDBMiddleware} from "./db";

const app = express();
// app.use(cors({ credentials: true}));
app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: [
            'http://localhost:3000',
            'https://yaara-store.vercel.app/',
            'https://yaara-tau.vercel.app'
        ],
        credentials: true
    })
);

app.use(initDBMiddleware);
app.use('/', routes);

export default app