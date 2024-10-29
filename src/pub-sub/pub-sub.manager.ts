import WebSocket from 'ws';
import { PubSubChannel, WebSocketWithId } from './pub-sub.models';

class PubSubManager {
  private channels: Record<string, PubSubChannel>;

  constructor() {
    this.channels = {};
  }

  handleMessage(webSocket: WebSocketWithId, data: WebSocket.RawData) {
    const json = JSON.parse(data.toString());
    const request = json.request;
    const message = json.message;
    const channel = json.channel;

    if (request === 'PUBLISH') {
      this.publish(channel, message);
    }

    if (request === 'SUBSCRIBE') {
      this.subscribe(webSocket, channel);
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

  publish(channel: string, message: string): void {
    if (!this.channels[channel]) {
      console.log(`Channel ${channel} does not exist.`);
    }

    console.log(`Publishing message to ${channel}: ${message}`);
    for (const subscriber of this.channels[channel].subscribers) {
      subscriber.send(
        JSON.stringify({
          channel: channel,
          message: message,
        }),
      );
    }
  }
}

export default PubSubManager;
