import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import helloRouter from './routes/hello.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use('/api', helloRouter);

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, '../dist')));

app.listen(process.env.SERVER_PORT);
console.log(`Server running at http://localhost:${process.env.SERVER_PORT}`);
