import React from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { CURRENT_USER_QUERY } from './User';

const USER_SIGN_OUT_MUTATION = gql`
  mutation USER_SIGN_OUT_MUTATION {
    signout {
      message
    }
  }
`;

const Signout = () => (
  <Mutation
    mutation={USER_SIGN_OUT_MUTATION}
    refetchQueries={[{ query: CURRENT_USER_QUERY }]}
  >
    {singout => <button onClick={singout}>Sign Out</button>}
  </Mutation>
);

export default Signout;
