import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());

app.get('/', (_, res) => {
  res.send('Hello World');
});

app.listen(process.env.SERVER_PORT);
console.log(`Server running at http://localhost:${process.env.SERVER_PORT}`);
