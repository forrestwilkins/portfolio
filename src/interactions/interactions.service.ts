import cacheService from '../cache/cache.service';
import { WebSocketWithId } from '../pub-sub/pub-sub.models';

const SOCKETS_KEY = 'interactions:sockets';

interface Dot {
  x: number;
  y: number;
  duration: number;
  canvasWidth: number;
  canvasHeight: number;
}

class InteractionsService {
  async getSocketTestStream() {
    return cacheService.getStreamMessages(SOCKETS_KEY);
  }

  async handleSocketTestMessage(
    { x, y, duration, canvasWidth, canvasHeight }: Dot,
    publisher: WebSocketWithId,
  ) {
    await cacheService.addStreamMessage(SOCKETS_KEY, {
      userId: publisher.id,
      x: x.toString(),
      y: y.toString(),
      duration: duration.toString(),
      canvasWidth: canvasWidth.toString(),
      canvasHeight: canvasHeight.toString(),
    });
  }
}

const interactionsService = new InteractionsService();
export default interactionsService;
