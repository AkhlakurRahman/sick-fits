import ResetPassword from '../components/ResetPassword';

const Reset = ({ query: { resetToken } }) => {
  return (
    <div>
      <ResetPassword resetToken={resetToken} />
    </div>
  );
};

export default Reset;
