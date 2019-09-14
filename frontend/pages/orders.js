import PleaseSignin from '../components/PleaseSignin';
import OrderList from '../components/OrderList';

const OrdersPage = () => {
  return (
    <PleaseSignin>
      <OrderList />
    </PleaseSignin>
  );
};

export default OrdersPage;
