// src/components/blank.js
import React from 'react';
import backgroundImage from '../pics/rainbow-bg.jpg';

const Tree = () => {
  return (
    <div
      className="flex justify-center items-center min-h-screen w-full bg-cover bg-center relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div
        className="flex justify-center items-center min-h-screen w-full p-6 rounded-xl border-8 border-black bg-white bg-opacity-20 backdrop-blur-md"
        style={{ width: '90vw', height: '80vh' }}
      >
        <div
          className="bg-white rounded-xl p-6 border-8 border-black flex gap-10"
          style={{ width: '80vw', height: '70vh' }}
        >
        </div>
      </div>
    </div>
  );
};

export default Tree;
