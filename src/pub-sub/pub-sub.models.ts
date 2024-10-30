import { WebSocket, WebSocketServer } from 'ws';

export interface PubSubMessage<T = unknown> {
  channel: string;
  body: T;
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
