import { pubSubService } from '../pub-sub/pub-sub.service';

class HealthService {
  async getHealth(token: string) {
    const payload = {
      status: 'healthy',
      timestamp: new Date().toLocaleString(),
    };
    pubSubService.publish(token, 'health', payload);
    return payload;
  }
}

export default HealthService;
