import PleaseSignin from '../components/PleaseSignin';
import Order from '../components/Order';

const OrderPage = ({ query }) => {
  return (
    <PleaseSignin>
      <Order id={query.id} />
    </PleaseSignin>
  );
};

export default OrderPage;
