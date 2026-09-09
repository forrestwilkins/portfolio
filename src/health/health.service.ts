class HealthService {
  getHealth() {
    return {
      status: 'healthy',
      // ISO, not a formatted string. Formatting here would bake in the
      // server's timezone, which is UTC in the container.
      timestamp: new Date().toISOString(),
    };
  }
}

const healthService = new HealthService();
export default healthService;
