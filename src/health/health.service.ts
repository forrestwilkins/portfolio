class HealthService {
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toLocaleString(),
    };
  }
}

const healthService = new HealthService();
export default healthService;
