import {
  WebSocket as WebSocketDefault,
  WebSocketServer as WebSocketServerDefault,
} from 'ws';

export class WebSocket extends WebSocketDefault {
  id!: string;
}

export class WebSocketServer extends WebSocketServerDefault<typeof WebSocket> {}

export interface PubSubChannel {
  subscribers: WebSocket[];
}
