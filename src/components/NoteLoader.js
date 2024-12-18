import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Import der vorherigen NoteVisualization Komponente
import Thpase from './Thpace';

const NoteLoader = () => {
  const [noteData, setNoteData] = useState(null);
  const [error, setError] = useState(null);
  const [colors, setColors] = useState({
    note: '#ff0000',
    background: '#000000'
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Überprüfe Dateiendung
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Bitte laden Sie eine JSON-Datei hoch.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        // Validiere das JSON-Format
        if (!data.events || !Array.isArray(data.events)) {
          setError('Ungültiges Dateiformat. Die JSON-Datei muss ein "events"-Array enthalten.');
          return;
        }
        setNoteData(data);
        setError(null);
      } catch (err) {
        setError('Fehler beim Parsen der JSON-Datei: ' + err.message);
      }
    };
    reader.onerror = () => {
      setError('Fehler beim Lesen der Datei.');
    };
    reader.readAsText(file);
  };

  const handleColorChange = (colorType, value) => {
    setColors(prev => ({
      ...prev,
      [colorType]: value
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>MIDI Noten Visualisierung</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              JSON-Datei auswählen:
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-500 file:text-white
                hover:file:bg-blue-600"
            />
            {error && (
              <div className="text-red-500 text-sm mt-1">
                {error}
              </div>
            )}
          </div>

          {/* Color Settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Notenfarbe:
              </label>
              <input
                type="color"
                value={colors.note}
                onChange={(e) => handleColorChange('note', e.target.value)}
                className="h-8 w-16"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Hintergrundfarbe:
              </label>
              <input
                type="color"
                value={colors.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="h-8 w-16"
              />
            </div>
          </div>

          {/* Visualization */}
          {noteData && (
            <div className="mt-6">
              <NoteVisualization
                notes={noteData.events}
                colors={colors}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteLoader;