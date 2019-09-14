import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import { format } from 'date-fns';
import gql from 'graphql-tag';
import Head from 'next/head';

import Error from './ErrorMessage';
import OrderStyles from './styles/OrderStyles';
import formatMoney from '../lib/formatMoney';

const ORDER_QUERY = gql`
  query ORDER_QUERY($id: ID!) {
    order(id: $id) {
      id
      total
      charge
      createdAt
      user {
        id
      }
      items {
        id
        title
        description
        price
        image
        quantity
      }
    }
  }
`;

class Order extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  };
  render() {
    return (
      <Query query={ORDER_QUERY} variables={{ id: this.props.id }}>
        {({ data, error, loading }) => {
          if (error) return <Error error={error} />;
          if (loading) return <p>Loading...</p>;
          const order = data.order;
          return (
            <OrderStyles>
              <Head>
                <title>Sick Fits - Order</title>
              </Head>
              <p>
                <span>Order ID:</span>
                <span>{order.id}</span>
              </p>
              <p>
                <span>Date:</span>
                <span>
                  {format(order.createdAt, `MMMM d, YYYY`)} at{' '}
                  {format(order.createdAt, 'h:mm a')}
                </span>
              </p>
              <p>
                <span>Total Items:</span>
                <span>{order.items.length}</span>
              </p>
              <p>
                <span>Order Total:</span>
                <span>{formatMoney(order.total)}</span>
              </p>
              <div className='items'>
                {order.items.map(item => (
                  <div className='order-item' key={item.id}>
                    <img src={item.image} alt={item.title} />
                    <div className='item-details'>
                      <h2>{item.title}</h2>
                      <p>Qty: {item.quantity}</p>
                      <p>Each: {formatMoney(item.price)}</p>
                      <p>SubTotal: {formatMoney(item.price * item.quantity)}</p>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </OrderStyles>
          );
        }}
      </Query>
    );
  }
}

export default Order;
