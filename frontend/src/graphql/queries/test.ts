import { gql } from "@apollo/client";

export const GET_TEST_DATA = gql`
  query GetTestData {
    test {
      message
      data {
        text
        promptId
      }
    }
  }
`;