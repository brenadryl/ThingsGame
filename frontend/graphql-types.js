require('dotenv').config();

const { generate } = require('@graphql-codegen/cli');

async function generateTypes() {
  const options = {
    overwrite: true,
    schema: process.env.REACT_APP_GRAPHQL_ENDPOINT,
    documents: 'src/graphql/queries/*',
    generates: {
      'src/generated/graphql.tsx': {
        plugins: [
          'typescript',
          'typescript-operations',
          'typescript-react-apollo'
        ],
        config: {
          withHooks: true,
          withHOC: false,
          withComponent: false,
        }
      }
    }
  };

  try {
    await generate(options, true); // true here means to print generation logs
  } catch (error) {
    console.error('Error during code generation', error);
  }
}

generateTypes();