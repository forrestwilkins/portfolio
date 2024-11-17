import cacheService from '../cache/cache.service';
import { WebSocketWithId } from '../pub-sub/pub-sub.models';
import pubSubService from '../pub-sub/pub-sub.service';

const SOCKETS_STREAM_KEY = 'interactions:sockets';
const SOCKETS_CLEAR_CHANNEL = 'sockets:clear';
const SOCKETS_CHANNEL = 'sockets';

interface Dot {
  x: number;
  y: number;
}

class InteractionsService {
  constructor() {
    pubSubService.registerChannelHandler(
      SOCKETS_CHANNEL,
      this.handleSocketTestMessage.bind(this),
    );
  }

  async getSocketTestStream() {
    return cacheService.getStreamMessages(SOCKETS_STREAM_KEY);
  }

  async clearSocketTestStream() {
    await cacheService.trimStreamMessages(SOCKETS_STREAM_KEY, Date.now());
    await pubSubService.publish(SOCKETS_CLEAR_CHANNEL, { clear: true });
  }

  async handleSocketTestMessage({ x, y }: Dot, publisher: WebSocketWithId) {
    await cacheService.addStreamMessage(SOCKETS_STREAM_KEY, {
      userId: publisher.id,
      x: x.toString(),
      y: y.toString(),
    });
  }
}

const interactionsService = new InteractionsService();
export default interactionsService;
