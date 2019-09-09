import CreateItem from '../components/CreateItem';
import PleaseSignin from '../components/PleaseSignin';

const Sell = () => {
  return (
    <div>
      <PleaseSignin>
        <CreateItem />
      </PleaseSignin>
    </div>
  );
};

export default Sell;
