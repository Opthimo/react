import React from 'react';

const KaraokeDesign = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">MIDI Karaoke Visualizer</h1>
        
        <div className="mb-6 flex space-x-4">
          <select className="flex-grow border rounded p-2">
            <option>Select a file</option>
            <option>lyrics.json</option>
          </select>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Play
          </button>
          <button className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
            Reset
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block mb-2">
            Tempo: 120
            <input type="range" min="60" max="240" value="120" className="w-full" />
          </label>
        </div>
        
        <div className="mb-6">
          <label className="block mb-2">
            Size Factor: 0.9
            <input type="range" min="0.5" max="2" step="0.1" value="0.9" className="w-full" />
          </label>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 h-64 flex items-center justify-center text-gray-500">
          Lyrics Visualizer Placeholder
        </div>
      </div>
    </div>
  );
};

export default KaraokeDesign;