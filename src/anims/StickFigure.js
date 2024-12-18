// src/components/StickFigure.js
import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from 'react-spring';

const StickFigure = () => {
  const svgRef = useRef(null);
  const [handPosition, setHandPosition] = useState({ x: 200, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isStanding, setIsStanding] = useState(false);

  const shoulder = { x: 150, y: 100 };
  const armLength = 50;

  const [{ x, y }, api] = useSpring(() => ({
    x: handPosition.x,
    y: handPosition.y,
    config: { tension: 300, friction: 30 },
  }));

  useEffect(() => {
    if (!isDragging) {
      // Optional: Animation zurück zur Ausgangsposition
      api.start({
        x: shoulder.x + armLength,
        y: shoulder.y,
        onRest: () => {
          setHandPosition({ x: shoulder.x + armLength, y: shoulder.y });
          setIsStanding(false);
        },
      });
    }
  }, [isDragging, shoulder.x, shoulder.y, armLength, api]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const svg = svgRef.current;
      const CTM = svg.getScreenCTM();
      if (!CTM) return;

      // Konvertiere Mausposition zu SVG-Koordinaten
      const mouseX = (e.clientX - CTM.e) / CTM.a;
      const mouseY = (e.clientY - CTM.f) / CTM.d;

      // Berechne Vektor von Schulter zur Maus
      const dx = mouseX - shoulder.x;
      const dy = mouseY - shoulder.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Begrenze die Position auf die Armreichweite
      let newX, newY;
      if (distance > armLength) {
        const ratio = armLength / distance;
        newX = shoulder.x + dx * ratio;
        newY = shoulder.y + dy * ratio;
      } else {
        newX = mouseX;
        newY = mouseY;
      }

      // Aktualisiere die Handposition
      setHandPosition({ x: newX, y: newY });

      // Aktualisiere den Zustand basierend auf der y-Position
      const standingThreshold = shoulder.y - 20; // Passe den Schwellenwert nach Bedarf an
      if (newY < standingThreshold) {
        setIsStanding(true);
      } else {
        setIsStanding(false);
      }

      // Aktualisiere die Animation
      api.start({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, shoulder.x, shoulder.y, armLength, api]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <svg ref={svgRef} width="300" height="300" style={{ border: '1px solid black' }}>
      {/* Kopf */}
      <circle cx="150" cy="30" r="20" stroke="black" strokeWidth="2" fill="none" />
      {/* Körper */}
      <line x1="150" y1="50" x2="150" y2="150" stroke="black" strokeWidth="2" />
      {/* Beine */}
      <line x1="150" y1="150" x2="130" y2="200" stroke="black" strokeWidth="2" />
      <line x1="150" y1="150" x2="170" y2="200" stroke="black" strokeWidth="2" />
      {/* Arme */}
      {/* Linker Arm (fixiert) */}
      <line x1="150" y1="100" x2="100" y2="150" stroke="black" strokeWidth="2" />
      {/* Rechter Arm (verbunden mit der Hand) */}
      <line
        x1={shoulder.x}
        y1={shoulder.y}
        x2={handPosition.x}
        y2={handPosition.y}
        stroke="black"
        strokeWidth="2"
      />
      {/* Hand */}
      <animated.circle
        cx={x}
        cy={y}
        r="10"
        fill="red"
        style={{ cursor: 'pointer' }}
        onMouseDown={handleMouseDown}
      />
      {/* Zustand anzeigen */}
      <text x="10" y="290" fill="black">
        {isStanding ? "Stehend" : "Sitzend"}
      </text>
    </svg>
  );
};

export default StickFigure;
