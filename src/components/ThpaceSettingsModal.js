// ThpaceSettingsModal.js
import React from 'react';
import ThpaceSettingsPreview from './ThpaceSettingsPreview';
import { LAYOUT_TYPES } from './ThpaceTypes';

const ThpaceSettingsModal = ({ 
  settings, 
  onSettingsChange, 
  onClose, 
  onSave 
}) => {
  const handleChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      {/* Frosted glass backdrop */}
      <div 
        className="absolute inset-0 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Visualisierungs-Einstellungen</h2>
        
        {/* Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Vorschau:</label>
          <ThpaceSettingsPreview settings={settings} />
        </div>
        
        {/* Layout Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Layout:</label>
          <select 
            value={settings.layout}
            onChange={(e) => handleChange('layout', e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value={LAYOUT_TYPES.LINE}>Linie</option>
            <option value={LAYOUT_TYPES.SEMICIRCLE}>Halbkreis</option>
            <option value={LAYOUT_TYPES.ARC}>Kreisausschnitt</option>
          </select>
        </div>
        
        {/* Angle Slider (only for ARC) */}
        {settings.layout === LAYOUT_TYPES.ARC && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Winkel: {settings.angle}°
            </label>
            <input
              type="range"
              min="1"
              max="360"
              value={settings.angle}
              onChange={(e) => handleChange('angle', Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
        
        {/* Radius */}
        <div className="mb-4">
          <label className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium">Radius:</span>
            <input
              type="checkbox"
              checked={settings.radius === 'auto'}
              onChange={(e) => handleChange('radius', e.target.checked ? 'auto' : 5)}
              className="ml-2"
            />
            <span className="text-sm">Auto</span>
          </label>
          {settings.radius !== 'auto' && (
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={settings.radius}
              onChange={(e) => handleChange('radius', Number(e.target.value))}
              className="w-full"
            />
          )}
        </div>
        
        {/* Other Settings */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Notenfarbe:</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={settings.noteColor}
                onChange={(e) => handleChange('noteColor', e.target.value)}
                className="h-8 w-16"
                disabled={settings.useRainbow}
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.useRainbow}
                  onChange={(e) => handleChange('useRainbow', e.target.checked)}
                />
                <span className="text-sm">Rainbow</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Hintergrund:</label>
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="h-8 w-16"
            />
          </div>
        </div>
        
        {/* Speed and Size */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Geschwindigkeit:
            </label>
            <input
              type="range"
              min="0.01"
              max="0.2"
              step="0.01"
              value={settings.noteSpeed}
              onChange={(e) => handleChange('noteSpeed', Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Notengröße:
            </label>
            <input
              type="range"
              min="0.05"
              max="0.3"
              step="0.01"
              value={settings.noteSize}
              onChange={(e) => handleChange('noteSize', Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Abbrechen
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThpaceSettingsModal;