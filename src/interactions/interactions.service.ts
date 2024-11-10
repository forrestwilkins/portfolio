import cacheService from '../cache/cache.service';
import { WebSocketWithId } from '../pub-sub/pub-sub.models';

interface Dot {
  x: number;
  y: number;
  duration: number;
}

class InteractionsService {
  async handleSocketTestMessage(message: Dot, publisher: WebSocketWithId) {
    await cacheService.addStreamMessage('sockets', {
      userId: publisher.id,
      x: message.x.toString(),
      y: message.y.toString(),
      duration: message.duration.toString(),
    });
  }
}

const interactionsService = new InteractionsService();
export default interactionsService;
