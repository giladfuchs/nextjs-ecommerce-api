import express  from 'express';
import cors from 'cors';
import routes from "./routes";
import {initDBMiddleware} from "./db";

const app = express();
app.use(cors());
// app.use(
//     cors({
//         origin: [
//             'http://localhost:3000',
//             'https://yaara-tau.vercel.app'
//         ],
//         credentials: true
//     })
// );

app.use(initDBMiddleware);
app.use('/', routes);

export default app