import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import formatMoney from '../lib/formatMoney';

const StyledCartItem = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
  }
  h3,
  p {
    margin: 0;
  }
`;

const CartItem = ({
  cartItem: {
    item: { id, title, price, image },
    quantity
  }
}) => {
  return (
    <StyledCartItem>
      <img width='100' height='100' src={image} alt={title} />
      <div className='cart-item-details'>
        <h3>{title}</h3>
        <p>
          {formatMoney(price * quantity)} - {quantity} &times;{' '}
          {formatMoney(price)} each
        </p>
      </div>
    </StyledCartItem>
  );
};

CartItem.propTypes = {
  cartItem: PropTypes.object.isRequired
};

export default CartItem;
