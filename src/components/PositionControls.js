// PositionControls.js
import React from 'react';

export default function PositionControls({ scales, offsets, onScaleChange, onOffsetChange }) {
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Position Controls</h3>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">X Scale: {scales.x}</label>
          <input 
            type="range" 
            min="1" 
            max="200" 
            value={scales.x}
            onChange={(e) => onScaleChange({...scales, x: Number(e.target.value)})}
            className="w-full"
          />
        </div>
        <div>
          <label className="block mb-2">Y Scale: {scales.y}</label>
          <input 
            type="range" 
            min="-200" 
            max="200" 
            value={scales.y}
            onChange={(e) => onScaleChange({...scales, y: Number(e.target.value)})}
            className="w-full"
          />
        </div>
        <div>
          <label className="block mb-2">X Offset: {offsets.x}</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1"
            value={offsets.x}
            onChange={(e) => onOffsetChange({...offsets, x: Number(e.target.value)})}
            className="w-full"
          />
        </div>
        <div>
          <label className="block mb-2">Y Offset: {offsets.y}</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1"
            value={offsets.y}
            onChange={(e) => onOffsetChange({...offsets, y: Number(e.target.value)})}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}