import { PubSubChannel, WebSocket } from './pub-sub.models';

class PubSubManager {
  private channels: Record<string, PubSubChannel>;

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
