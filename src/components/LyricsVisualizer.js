// LyricsVisualizer.js
import React from 'react';
import LyricsController from './LyricsController';

const LyricsVisualizer = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Lyrics Visualizer
            </h1>
            <p className="mt-2 text-gray-600">
              Laden Sie eine JSON-Datei mit Lyrics und Timing-Informationen
            </p>
          </div>
          
          <div className="flex justify-center">
            <LyricsController />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LyricsVisualizer;