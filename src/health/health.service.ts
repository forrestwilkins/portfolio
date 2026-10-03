class HealthService {
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}

const healthService = new HealthService();
export default healthService;
