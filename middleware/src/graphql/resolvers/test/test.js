const { gql } = require('apollo-server-express');
const TestDataSource = require('../../data-sources/test/test.js');

const testTypeDefs = gql`
type PromptData {
  text: String
  promptId: String
}
type Response {
  message: String
  data: [PromptData]
}
type Query {
  test: Response
}
`;

const buildTestResponse = (response) => {
  return {
    message: `FE integrated successfully with Middleware! ${response.message}`,
    data: response.data
  };
}

const testResolvers = {
  Query: {
    test: async () => {
      try {
        const data = await TestDataSource.test();
        console.log('Resolver data:', data);
        if (data.error) {
          throw new Error(data.error);
        }
        return {
          message: 'FE integrated successfully with Middleware!',
          data: data.data || [],
        };
      } catch (error) {
        console.error('Error in test resolver:', error);
        return {
          message: 'Error integrating FE with Middleware',
          data: [],
        };
      }
    },
  },
};

module.exports = { testTypeDefs, testResolvers };