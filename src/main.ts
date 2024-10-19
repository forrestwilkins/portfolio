import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import { join } from 'path';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.static(join(__dirname, 'view')));

app.get('/', (_, res) => {
  res.send('Hello World');
});

app.listen(process.env.SERVER_PORT);
console.log(`Server running at http://localhost:${process.env.SERVER_PORT}`);
