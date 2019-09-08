import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import Form from './styles/Form';
import Error from './ErrorMessage';

const RESET_REQUEST_MUTATION = gql`
  mutation RESET_REQUEST_MUTATION($email: String!) {
    resetRequest(email: $email) {
      message
    }
  }
`;

class ResetRequest extends Component {
  state = {
    email: '',
    password: ''
  };

  handleChange = e => {
    const { name, value } = e.target;

    this.setState({ [name]: value });
  };

  render() {
    return (
      <Mutation mutation={RESET_REQUEST_MUTATION} variables={this.state}>
        {(resetRequest, { error, loading, called }) => {
          return (
            <Form
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                await resetRequest();
                this.setState({ email: '' });
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Enter email to reset password</h2>
                <Error error={error} />
                {!error && !loading && called && (
                  <p>Password reset link was sent to your email.</p>
                )}
                <label htmlFor="email">
                  Email
                  <input
                    type="email"
                    placeholder="email"
                    name="email"
                    onChange={this.handleChange}
                    value={this.state.email}
                  />
                </label>
                <button type="submit">Submit{loading ? 'ing' : ''}</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default ResetRequest;
