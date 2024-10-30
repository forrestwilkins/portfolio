import { WebSocket, WebSocketServer } from 'ws';

export interface PubSubMessage<T = unknown> {
  request: 'PUBLISH' | 'SUBSCRIBE';
  channel: string;
  body?: T;
}

// TODO: Convert subscribers to a map keyed by subscriber ID
export interface PubSubChannel {
  subscribers: WebSocketWithId[];
}

export class WebSocketWithId extends WebSocket {
  id!: string;
}

export class WebSocketServerWithIds extends WebSocketServer<
  typeof WebSocketWithId
> {}
