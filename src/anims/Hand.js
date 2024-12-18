// src/components/Hand.js
import React, { useState, useEffect } from 'react';

const Hand = ({ svgRef, position, onMove, onRelease }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    // Berechne die Mausposition relativ zum SVG
    const svg = svgRef.current;
    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    const mouseX = (e.clientX - CTM.e) / CTM.a;
    const mouseY = (e.clientY - CTM.f) / CTM.d;
    // Setze den Offset korrekt als Differenz zwischen Handposition und Mausposition
    setOffset({
      x: position.x - mouseX,
      y: position.y - mouseY,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const svg = svgRef.current;
    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    const mouseX = (e.clientX - CTM.e) / CTM.a;
    const mouseY = (e.clientY - CTM.f) / CTM.d;
    // Berechne die neue Position der Hand basierend auf Mausposition und Offset
    onMove({ x: mouseX + offset.x, y: mouseY + offset.y });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onRelease();
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <circle
      cx={position.x}
      cy={position.y}
      r="10"
      fill="red"
      onMouseDown={handleMouseDown}
      style={{ cursor: 'pointer' }}
    />
  );
};

export default Hand;
