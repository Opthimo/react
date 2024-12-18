import React, { useState, useEffect } from 'react';

const GradientEditor = ({ onChange, initialColors = ['#ff0000', '#00ff00'] }) => {
  const [colors, setColors] = useState(initialColors);
  const [activeColorIndex, setActiveColorIndex] = useState(null);

  useEffect(() => {
    onChange(colors);
  }, [colors, onChange]);

  const addColor = () => {
    if (colors.length < 8) {
      setColors([...colors, '#ffffff']);
    }
  };

  const removeColor = (index) => {
    if (colors.length > 2) {
      const newColors = colors.filter((_, i) => i !== index);
      setColors(newColors);
      setActiveColorIndex(null);
    }
  };

  const updateColor = (index, newColor) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    setColors(newColors);
  };

  const gradientStyle = {
    background: `linear-gradient(to right, ${colors.join(', ')})`,
    height: '30px',
    borderRadius: '15px',
    marginBottom: '10px'
  };

  return (
    <div className="gradient-editor">
      <div style={gradientStyle}></div>
      <div className="color-stops flex justify-between mt-2">
        {colors.map((color, index) => (
          <div key={index} className="color-stop">
            <input
              type="color"
              value={color}
              onChange={(e) => updateColor(index, e.target.value)}
              className="w-8 h-8 rounded-full cursor-pointer"
            />
            {colors.length > 2 && (
              <button 
                onClick={() => removeColor(index)}
                className="ml-1 text-red-500 font-bold"
              >
                X
              </button>
            )}
          </div>
        ))}
      </div>
      {colors.length < 8 && (
        <button 
          onClick={addColor}
          className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
        >
          Farbe hinzufügen
        </button>
      )}
    </div>
  );
};

export default GradientEditor;