import React from 'react';

const Stickman = ({ armRotation = 0 }) => (
  <svg width="100" height="100" viewBox="0 0 100 100">
    {/* Kopf */}
    <circle cx="50" cy="20" r="10" fill="none" stroke="black" strokeWidth="2" />
    
    {/* Körper */}
    <line x1="50" y1="30" x2="50" y2="70" stroke="black" strokeWidth="2" />
    
    {/* Beine */}
    <line x1="50" y1="70" x2="40" y2="90" stroke="black" strokeWidth="2" />
    <line x1="50" y1="70" x2="60" y2="90" stroke="black" strokeWidth="2" />
    
    {/* Arme */}
    <line x1="50" y1="40" x2="30" y2="50" stroke="black" strokeWidth="2" />
    <line 
      x1="50" y1="40" 
      x2="70" y2="50" 
      stroke="black" 
      strokeWidth="2"
      transform={`rotate(${armRotation}, 50, 40)`}
    />
  </svg>
);

export default Stickman;