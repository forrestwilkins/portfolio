import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import appRouter from './app.routes';
import PubSubManager from './pub-sub/pub-sub.manager';
import { WebSocketServerWithIds } from './pub-sub/pub-sub.models';

dotenv.config();

const app = express();
const server = createServer(app);
const webSocketServer = new WebSocketServerWithIds({ path: '/ws', server });
const pubSubManager = new PubSubManager();

app.use(cors());

// Serve static files and API routes
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, './view')));
app.use('/api', appRouter);

// Catch-all route to serve index.html for SPA routing
app.get(/(.*)/, (_, res) => {
  res.sendFile(join(__dirname, './view', 'index.html'));
});

// Handle web socket connections with pub-sub manager
webSocketServer.on('connection', (webSocket) => {
  webSocket.id = uuidv4();
  webSocket.on('message', (data) =>
    pubSubManager.handleMessage(webSocket, data),
  );
  webSocket.on('error', console.error);
});

server.listen(process.env.SERVER_PORT);
console.log(`Server running at http://localhost:${process.env.SERVER_PORT} 🚀`);
