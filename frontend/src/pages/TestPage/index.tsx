import { useQuery } from '@apollo/client';
import React from 'react';
import { GET_TEST_DATA } from '../../graphql/queries/test';
import { GetTestDataQuery } from '../../generated/graphql';

const TestPage: React.FC = () => {
  const { data, error, loading } = useQuery<GetTestDataQuery>(GET_TEST_DATA);

  if (loading) {
    return <p>now loading...</p>;
  }

  return error ? (
    <p>{`There was an error: ${JSON.stringify(error)}`}</p>
  ) : (
    <div>
      <h2>From GraphQL</h2>
      <p>{`Response: ${data?.test?.message}`}</p>
      {data?.test?.data?.length && (
        <ul>
          {data?.test?.data.map((currPromptData, i) => {
            const { text, promptId } = currPromptData!;

            return (
              <li key={i}>
                {`${promptId}: ${text}`}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
export default TestPage;