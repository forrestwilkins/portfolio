import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import appRouter from './app.routes';
import PubSubService from './pub-sub/pub-sub.service';
import { WebSocketServerWithIds } from './pub-sub/pub-sub.models';

dotenv.config();

const app = express();
const server = createServer(app);
const webSocketServer = new WebSocketServerWithIds({ path: '/ws', server });
const pubSubService = new PubSubService();

app.use(cors());

// Serve static files and API routes
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, './view')));
app.use('/api', appRouter);

// Catch-all route to serve index.html for SPA routing
app.get(/(.*)/, (_, res) => {
  res.sendFile(join(__dirname, './view', 'index.html'));
});

// Handle web socket connections with pub-sub service
webSocketServer.on('connection', (webSocket) => {
  webSocket.on('message', (data) =>
    pubSubService.handleMessage(webSocket, data),
  );
  webSocket.on('error', console.error);
});

server.listen(process.env.SERVER_PORT);
console.log(`Server running at http://localhost:${process.env.SERVER_PORT} 🚀`);
