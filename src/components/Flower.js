import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';

const Flower = () => {
  const [isOpen, setIsOpen] = useState(false);

  const animation = useSpring({
    transform: isOpen ? 'scale(1)' : 'scale(0)',
    opacity: isOpen ? 1 : 0,
  });

  return (
    <animated.div
      style={{
        width: 100,
        height: 100,
        background: 'pink',
        borderRadius: '50%',
        ...animation,
      }}
      onClick={() => setIsOpen(!isOpen)}
    />
  );
};

export default Flower;