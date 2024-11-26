const axios = require('axios');

class TestDataSource {
  static async test() {
    try {
      console.log('Fetching from backend:', `${process.env.BACKEND_URL}/test`);
      const response = await axios.get(`${process.env.BACKEND_URL}/test`);
      console.log('Backend response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch data from backend:', {
        message: error.message,
        stack: error.stack,
        config: error.config,
        response: error.response?.data,
      });
      return { error: 'Error fetching data from backend' };
    }
  }
}

module.exports = TestDataSource;