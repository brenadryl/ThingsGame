const axios = require('axios');

class TestDataSource {
  static async test() {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/test`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch data from backend:', error);
      return 'Error fetching data';
    }
  }
}

module.exports = TestDataSource;