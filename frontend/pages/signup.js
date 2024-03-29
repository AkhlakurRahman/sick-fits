import styled from 'styled-components';

import Signup from '../components/Signup';
import Signin from '../components/Signin';
import ResetRequest from '../components/ResetRequest';

const Column = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;

const SignupPage = props => {
  return (
    <Column>
      <Signup />
      <Signin />
      <ResetRequest />
    </Column>
  );
};

export default SignupPage;
