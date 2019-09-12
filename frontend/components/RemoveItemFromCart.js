import React from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { CURRENT_USER_QUERY } from './User';
import Error from './ErrorMessage';

const REMOVE_ITEM_FROM_CART_MUTATION = gql`
  mutation REMOVE_ITEM_FROM_CART_MUTATION($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

const DeleteButton = styled.button`
  font-size: 3rem;
  background: none;
  border: none;
  outline: none;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
  &:active {
    outline: none;
    transform: scale(1.05);
  }
`;

class RemoveItemFromCart extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  };

  // This function gets called as soon as we get a response back from server after a mutation is performed
  update = (cache, payload) => {
    // Read data from cache
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });

    // Remove that specific item from cart
    const removedCartItemId = payload.data.removeFromCart.id;
    data.me.cart = data.me.cart.filter(
      cartItem => cartItem.id !== removedCartItemId
    );

    // Write it back to cache
    cache.writeQuery({ query: CURRENT_USER_QUERY, data });
  };

  render() {
    return (
      <Mutation
        mutation={REMOVE_ITEM_FROM_CART_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
        optimisticResponse={{
          __typename: 'Mutation',
          removeFromCart: {
            __typename: 'CartItem',
            id: this.props.id
          }
        }}
      >
        {(removeFromCart, { loading, error }) => (
          <>
            <Error error={error} />
            <DeleteButton
              onClick={() => {
                removeFromCart().catch(error => alert(error.message));
              }}
              title='Delete Item'
              disabled={loading}
            >
              &times;
            </DeleteButton>
          </>
        )}
      </Mutation>
    );
  }
}

export default RemoveItemFromCart;
