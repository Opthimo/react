// LyricsController.js
import React, { useState, useEffect } from 'react';
import AdvancedLyricsVisualizer from './AdvancedLyricsVisualizer';

const LyricsController = () => {
  const [lyricsData, setLyricsData] = useState(null);
  const [midiNotes, setMidiNotes] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [sizeFactor, setSizeFactor] = useState(1);

  useEffect(() => {
    let interval;
    if (isPlaying && lyricsData?.lyrics) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) => {
          const nextTime = prevTime + 100;
          if (nextTime > lyricsData.lyrics[lyricsData.lyrics.length - 1].time) {
            setIsPlaying(false);
            return 0;
          }
          return nextTime;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, lyricsData]);

  const handleLocalFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          if (!jsonData.lyrics || !Array.isArray(jsonData.lyrics)) {
            throw new Error('Invalid JSON structure');
          }
          setLyricsData(jsonData);
          setMidiNotes(jsonData.notes || []);
        } catch (error) {
          console.error('Invalid JSON file:', error);
          alert('Die hochgeladene Datei ist keine gültige Lyrics-JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-2">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
              JSON-Datei laden
            </label>
            <input
              type="file"
              id="file-upload"
              accept=".json"
              onChange={handleLocalFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!lyricsData}
                className={`flex-1 py-2 px-4 rounded-md text-white ${
                  !lyricsData 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : isPlaying 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              
              <button
                onClick={() => {
                  setCurrentTime(0);
                  setIsPlaying(false);
                }}
                disabled={!lyricsData}
                className={`flex-1 py-2 px-4 rounded-md text-white ${
                  !lyricsData 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                Reset
              </button>
            </div>

            {/* Tempo Control */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tempo: {tempo}
              </label>
              <input
                type="range"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                min={60}
                max={240}
                step={1}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Size Factor Control */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Größenfaktor: {sizeFactor.toFixed(1)}
              </label>
              <input
                type="range"
                value={sizeFactor * 100}
                onChange={(e) => setSizeFactor(Number(e.target.value) / 100)}
                min={50}
                max={200}
                step={10}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visualization */}
      {lyricsData && midiNotes && (
        <div className="bg-white shadow rounded-lg p-6">
          <AdvancedLyricsVisualizer
            lyricsData={lyricsData}
            currentTime={currentTime}
            midiNotes={midiNotes}
            tempo={tempo}
            sizeFactor={sizeFactor}
          />
        </div>
      )}
    </div>
  );
};

export default LyricsController;