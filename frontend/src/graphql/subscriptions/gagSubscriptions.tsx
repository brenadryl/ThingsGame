import { gql } from '@apollo/client';

export const GAG_UPDATE_SUBSCRIPTION = gql`
  subscription OnGagUpdate($roundId: ID!) {
    gagUpdate(roundId: $roundId) {
        _id
        text
        guessed
        votes
        player {
            _id
        }
        guesser {
            _id
        }
    }
}
`;