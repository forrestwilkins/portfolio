import WebSocket from 'ws';
import {
  PubSubChannel,
  PubSubMessage,
  WebSocketWithId,
} from './pub-sub.models';

class PubSubManager {
  private channels: Record<string, PubSubChannel>;

  constructor() {
    this.channels = {};
  }

  handleMessage(webSocket: WebSocketWithId, data: WebSocket.RawData) {
    const { channel, body, request }: PubSubMessage = JSON.parse(
      data.toString(),
    );
    if (request === 'PUBLISH') {
      this.publish(channel, body);
    }
    if (request === 'SUBSCRIBE') {
      this.subscribe(webSocket, channel);
    }
  }

  publish(channel: string, message: unknown): void {
    if (!this.channels[channel]) {
      console.error(`Channel ${channel} does not exist.`);
      return;
    }

    console.log(`Publishing message to ${channel}: ${message}`);
    for (const subscriber of this.channels[channel].subscribers) {
      subscriber.send(
        JSON.stringify({
          channel: channel,
          body: message,
        }),
      );
    }
  }

  subscribe(subscriber: WebSocketWithId, channel: string): void {
    console.log(`Subscribing to ${channel}`);
    if (!this.channels[channel]) {
      // Create the channel if it doesn't exist
      this.channels[channel] = { subscribers: [] };
    }
    this.channels[channel].subscribers.push(subscriber);

    // Remove subscriber on disconnect
    subscriber.on('close', () => {
      console.log(`Subscriber disconnected from ${channel}`);
      const filtered = this.channels[channel].subscribers.filter(
        (sub) => sub !== subscriber,
      );
      this.channels[channel].subscribers = filtered;
    });
  }
}

export default PubSubManager;
