import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type PromptData = {
  __typename?: 'PromptData';
  promptId?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  test?: Maybe<Response>;
};

export type Response = {
  __typename?: 'Response';
  data?: Maybe<Array<Maybe<PromptData>>>;
  message?: Maybe<Scalars['String']['output']>;
};

export type GetTestDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTestDataQuery = { __typename?: 'Query', test?: { __typename?: 'Response', message?: string | null, data?: Array<{ __typename?: 'PromptData', text?: string | null, promptId?: string | null } | null> | null } | null };


export const GetTestDataDocument = gql`
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

/**
 * __useGetTestDataQuery__
 * try this brennah
 * To run a query within a React component, call `useGetTestDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTestDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTestDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTestDataQuery(baseOptions?: Apollo.QueryHookOptions<GetTestDataQuery, GetTestDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTestDataQuery, GetTestDataQueryVariables>(GetTestDataDocument, options);
      }
export function useGetTestDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTestDataQuery, GetTestDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTestDataQuery, GetTestDataQueryVariables>(GetTestDataDocument, options);
        }
export function useGetTestDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTestDataQuery, GetTestDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTestDataQuery, GetTestDataQueryVariables>(GetTestDataDocument, options);
        }
export type GetTestDataQueryHookResult = ReturnType<typeof useGetTestDataQuery>;
export type GetTestDataLazyQueryHookResult = ReturnType<typeof useGetTestDataLazyQuery>;
export type GetTestDataSuspenseQueryHookResult = ReturnType<typeof useGetTestDataSuspenseQuery>;
export type GetTestDataQueryResult = Apollo.QueryResult<GetTestDataQuery, GetTestDataQueryVariables>;