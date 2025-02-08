import { gql } from "@apollo/client";
import { Prompt } from "../../types";

export const GET_RANDOM_PROMPTS = gql`
  query GetRandomPrompts {
    getRandomPrompts {
        _id
        promptId
        text
    }
  }
`;

export const GET_PROMPTS = gql`
  query GetPrompts {
    prompts {
        _id
        promptId
        text
    }
  }
`;

export interface GetRandomPromptsData {
    getRandomPrompts: Prompt[];
}
export interface GetRandomPromptsData {
    prompts: Prompt[];
}