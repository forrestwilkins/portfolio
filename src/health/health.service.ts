class HealthService {
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toLocaleString(),
    };
  }
}

export default HealthService;
