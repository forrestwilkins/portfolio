import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import appRouter from './routes/app.routes';
import { createServer } from 'http';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ path: '/ws', server });

app.use(cors());

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, './view')));
app.use('/api', appRouter);

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    console.log('received: %s', data);
    ws.send(`'Hello from server - ${new Date().toLocaleString()}'`);
  });
  ws.on('error', console.error);
});

server.listen(process.env.SERVER_PORT);
console.log(`Server running at http://localhost:${process.env.SERVER_PORT}`);
