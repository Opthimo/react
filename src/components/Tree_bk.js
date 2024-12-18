// src/components/Tree.js
import React from 'react';
import backgroundImage from '../pics/rainbow-bg.jpg';
import TreeSVG from '../icons/TreeSVG';
import StickFigure from '../anims/StickFigure'; // Importiere die StickFigure-Komponente

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
          {/* Bereich für TreeSVG und StickFigure */}
          <div className="w-1/2 h-full flex items-center justify-center">
            <TreeSVG />
          </div>
          <div className="w-1/2 h-full flex items-center justify-center">
            <StickFigure />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tree;
