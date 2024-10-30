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

// TODO: Convert subscribers to a map keyed by subscriber ID
export interface PubSubChannel {
  subscribers: WebSocketWithId[];
}
