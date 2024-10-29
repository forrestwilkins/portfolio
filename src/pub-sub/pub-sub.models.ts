import { WebSocket, WebSocketServer } from 'ws';

export interface PubSubMessage {
  channel: string;
  message: unknown;
  request: 'PUBLISH' | 'SUBSCRIBE';
}

export class WebSocketWithId extends WebSocket {
  id!: string;
}

export class WebSocketServerWithIds extends WebSocketServer<
  typeof WebSocketWithId
> {}

export interface PubSubChannel {
  subscribers: WebSocketWithId[];
}
