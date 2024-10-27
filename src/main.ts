import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';
import { WebSocketServerWithIds } from './models/shared.models';
import appRouter from './routes/app.routes';

dotenv.config();

const app = express();
const server = createServer(app);
const webSocketServer = new WebSocketServerWithIds({ path: '/ws', server });

app.use(cors());

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, './view')));
app.use('/api', appRouter);

webSocketServer.on('connection', (webSocket) => {
  webSocket.id = uuidv4();

  webSocket.on('message', (data) => {
    for (const client of webSocketServer.clients) {
      if (client.readyState === WebSocket.OPEN && client.id !== webSocket.id) {
        client.send(data.toString());
      }
    }
  });
  webSocket.on('error', console.error);
});

server.listen(process.env.SERVER_PORT);
console.log(`Server running at http://localhost:${process.env.SERVER_PORT}`);
