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

  async clearSocketTestStream() {
    await cacheService.trimStreamMessages(SOCKETS_KEY, Date.now());
  }

  async handleSocketTestMessage(
    { x, y, duration }: Dot,
    publisher: WebSocketWithId,
  ) {
    // TODO: Remove when done testing
    if (!publisher.id) {
      console.log('handleSocketTestMessage:', {
        userId: publisher.id,
        x: x.toString(),
        y: y.toString(),
        duration: duration.toString(),
      });
      console.log('publisher:', publisher);
    }

    await cacheService.addStreamMessage(SOCKETS_KEY, {
      userId: publisher.id,
      x: x.toString(),
      y: y.toString(),
      duration: duration.toString(),
    });
  }
}

const interactionsService = new InteractionsService();
export default interactionsService;
