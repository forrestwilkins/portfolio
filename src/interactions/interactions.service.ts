import cacheService from '../cache/cache.service';
import { WebSocketWithId } from '../pub-sub/pub-sub.models';

const SOCKETS_KEY = 'interactions:sockets';

interface Dot {
  x: number;
  y: number;
  duration: number;
}

class InteractionsService {
  async getSocketTestStream() {
    return cacheService.getStreamMessages(SOCKETS_KEY);
  }

  async handleSocketTestMessage(message: Dot, publisher: WebSocketWithId) {
    await cacheService.addStreamMessage(SOCKETS_KEY, {
      userId: publisher.id,
      x: message.x.toString(),
      y: message.y.toString(),
      duration: message.duration.toString(),
    });
  }
}

const interactionsService = new InteractionsService();
export default interactionsService;
