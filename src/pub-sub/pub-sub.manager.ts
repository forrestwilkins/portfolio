// pubsub.ts

import { WebSocket } from 'ws';

interface Channel {
  subscribers: WebSocket[];
}

class PubSubManager {
  private channels: Record<string, Channel>;

  constructor() {
    this.channels = {};
  }

  subscribe(subscriber: WebSocket, channel: string): void {
    console.log(`Subscribing to ${channel}`);
    if (!this.channels[channel]) {
      // Create the channel if it doesn't exist
      this.channels[channel] = { subscribers: [] };
    }
    this.channels[channel].subscribers.push(subscriber);

    // Remove subscriber on disconnect
    subscriber.on('close', () => {
      console.log(`Subscriber disconnected from ${channel}`);
      this.channels[channel].subscribers = this.channels[
        channel
      ].subscribers.filter((sock) => sock !== subscriber);
    });
  }

  publish(channel: string, message: string): void {
    const channelObj = this.channels[channel];
    if (channelObj) {
      console.log(`Publishing message to ${channel}: ${message}`);
      channelObj.subscribers.forEach((subscriber) => {
        subscriber.send(
          JSON.stringify({
            channel: channel,
            message: message,
          }),
        );
      });
    } else {
      console.log(`Channel ${channel} does not exist.`);
    }
  }
}

export default PubSubManager;
