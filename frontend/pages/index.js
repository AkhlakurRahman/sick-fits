import Items from '../components/Items';

const Index = ({ query }) => {
  return (
    <div>
      <Items page={+query.page || 1} />
    </div>
  );
};

export default Index;
