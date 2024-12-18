// ThpaceSettingsPreview.js
import React, { useEffect, useRef } from 'react';
import { LAYOUT_TYPES } from './ThpaceTypes';

const ThpaceSettingsPreview = ({ settings, width = 200, height = 150 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Calculate preview dimensions
    const centerX = width / 2;
    const centerY = height * 0.75; // Position at 3/4 height
    const radius = Math.min(width, height) * 0.35;
    
    // Draw points based on layout
    const points = 12; // Number of preview points
    
    for (let i = 0; i < points; i++) {
      let x, y;
      const color = settings.useRainbow 
        ? `hsl(${(i / (points - 1)) * 360}, 100%, 50%)`
        : settings.noteColor;
        
      switch (settings.layout) {
        case LAYOUT_TYPES.LINE: {
          x = (i / (points - 1)) * width * 0.8 + width * 0.1;
          y = centerY;
          break;
        }
          
        case LAYOUT_TYPES.SEMICIRCLE:
        case LAYOUT_TYPES.ARC: {
          const angle = settings.layout === LAYOUT_TYPES.SEMICIRCLE 
            ? Math.PI 
            : (settings.angle * Math.PI / 180);
          
          // Start at PI (bottom) and go to 0 (top)
          const pos = i / (points - 1);
          const startAngle = Math.PI;
          const theta = startAngle - pos * angle;
          
          x = centerX + Math.cos(theta) * radius;
          y = centerY - Math.sin(theta) * radius; // Minus weil Y nach unten wächst
          break;
        }
        
        default: {
          x = centerX;
          y = centerY;
        }
      }
      
      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
    
    // Draw center point if not LINE layout
    if (settings.layout !== LAYOUT_TYPES.LINE) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#888';
      ctx.fill();
    }
    
  }, [settings, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      className="border rounded"
    />
  );
};

export default ThpaceSettingsPreview;