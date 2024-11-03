import WebSocket from 'ws';
import {
  PubSubChannel,
  PubSubMessage,
  WebSocketWithId,
} from './pub-sub.models';

class PubSubService {
  private channels: Record<string, PubSubChannel>;

  constructor() {
    this.channels = {};
  }

  handleMessage(webSocket: WebSocketWithId, data: WebSocket.RawData) {
    const { channel, body, request, token }: PubSubMessage = JSON.parse(
      data.toString(),
    );
    if (request === 'PUBLISH') {
      this.publish(channel, body, webSocket);
    }
    if (request === 'SUBSCRIBE') {
      this.subscribe(channel, token, webSocket);
    }
  }

  publish(channel: string, message: unknown, publisher?: WebSocketWithId) {
    if (!this.channels[channel]) {
      console.error(`Channel ${channel} does not exist.`);
      return;
    }
    for (const subscriber of this.channels[channel].subscribers) {
      if (subscriber.id === publisher?.id) {
        continue;
      }
      subscriber.send(
        JSON.stringify({
          channel: channel,
          body: message,
        }),
      );
    }
  }

  subscribe(channel: string, token: string, subscriber: WebSocketWithId) {
    if (!this.channels[channel]) {
      // Create the channel if it doesn't exist
      this.channels[channel] = { subscribers: [] };
    }

    subscriber.id = token;
    this.channels[channel].subscribers.push(subscriber);

    // Remove subscriber on disconnect
    subscriber.on('close', () => {
      const filtered = this.channels[channel].subscribers.filter(
        (sub) => sub.id !== subscriber.id,
      );
      this.channels[channel].subscribers = filtered;
    });
  }
}

export const pubSubService = new PubSubService();
export default PubSubService;
