import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

const AnimationStyles = styled.span`
  position: relative;
  .count {
    position: relative;
    display: block;
    transition: all 0.4s;
    backface-visibility: hidden;
  }
  .count-enter {
    transform: rotateX(0.5turn);
  }
  .count-enter-active {
    transform: rotateX(0);
  }
  .count-exit {
    top: 0;
    position: absolute;
    transform: rotateX(0);
  }
  .count-exit-active {
    transform: rotateX(0.5turn);
  }
`;

const Dot = styled.div`
  background: ${props => props.theme.red};
  color: #fff;
  border-radius: 50%;
  padding: 0.3rem;
  line-height: 2rem;
  min-width: 3rem;
  margin-left: 1rem;
  font-weight: 100;
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
`;

const CartCount = ({ count }) => {
  return (
    <AnimationStyles>
      <TransitionGroup>
        <CSSTransition
          className='count'
          classNames='count'
          key={count}
          unmountOnExit
          timeout={{ enter: 400, exit: 400 }}
        >
          <Dot>{count}</Dot>
        </CSSTransition>
      </TransitionGroup>
    </AnimationStyles>
  );
};

CartCount.propTypes = {
  count: PropTypes.number.isRequired
};

export default CartCount;
