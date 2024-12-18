// ThpaceControls.js
import React from 'react';

const ThpaceControls = ({ 
  isPlaying, 
  onStart, 
  onReset,
  onOpenSettings
}) => {
  return (
    <div className="flex justify-center items-center space-x-4">
      <button
        onClick={onStart}
        disabled={isPlaying}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        Start
      </button>
      <button
        onClick={onReset}
        disabled={!isPlaying}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
      >
        Reset
      </button>
      <button
        onClick={onOpenSettings}
        className="p-2 hover:bg-gray-100 rounded"
        title="Einstellungen"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/>
          <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
          <path d="M12 2v2"/>
          <path d="M12 20v2"/>
          <path d="m4.93 4.93 1.41 1.41"/>
          <path d="m17.66 17.66 1.41 1.41"/>
          <path d="M2 12h2"/>
          <path d="M20 12h2"/>
          <path d="m6.34 17.66-1.41 1.41"/>
          <path d="m19.07 4.93-1.41 1.41"/>
        </svg>
      </button>
    </div>
  );
};

export default ThpaceControls;