// AdvancedLyricsVisualizer.js
import React, { useRef, useEffect } from 'react';

const AdvancedLyricsVisualizer = ({
  lyricsData,
  currentTime,
  midiNotes,
  tempo,
  sizeFactor = 1,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Hilfsfunktionen
    const getColorFromPitch = (pitch) => {
      return `hsl(${(pitch - 60) * 3 + 180}, 100%, 50%)`;
    };

    const getYPositionFromPitch = (pitch) => {
      return height / 2 - (pitch - 60) * 4;
    };

    const drawLyricBlock = (lyric, note, x, y, width, height) => {
      // Skaliere die Blockbreite mit dem sizeFactor
      const scaledWidth = width * sizeFactor;
      const scaledHeight = height * sizeFactor;
      
      ctx.fillStyle = getColorFromPitch(note.note);
      ctx.fillRect(x, y - scaledHeight / 2, scaledWidth, scaledHeight);
      
      // Schriftgröße und Position anpassen
      const fontSize = Math.max(16, 18 * sizeFactor);
      ctx.fillStyle = 'black';
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lyric.text, x + scaledWidth / 2, y);
    };

    const drawProgressBar = () => {
      const totalDuration = lyricsData.lyrics[lyricsData.lyrics.length - 1].time;
      const progress = currentTime / totalDuration;
      ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
      ctx.fillRect(0, height - 10, width * progress, 10);
    };

    const drawHorizontalLines = () => {
      for (let i = 0; i < 8; i++) {
        const y = getYPositionFromPitch(60 + i * 12);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.stroke();
      }
    };

    const draw = () => {
      if (!lyricsData || !lyricsData.lyrics) return;

      // Canvas leeren
      ctx.clearRect(0, 0, width, height);

      // Marker-Position anpassen
      const markerX = width * 0.3; // Position des vertikalen Markers
      ctx.beginPath();
      ctx.moveTo(markerX, 0);
      ctx.lineTo(markerX, height);
      ctx.strokeStyle = 'red';
      ctx.stroke();

      // Hilfslinien zeichnen
      drawHorizontalLines();

      // Angepasste Pixelberechnung
      const basePixelsPerMs = (tempo / 60000) * 100;
      const pixelsPerMs = basePixelsPerMs * Math.max(1, sizeFactor * 0.8); // Skalierung gedämpft

      // Lyrics zeichnen
      lyricsData.lyrics.forEach((lyric, index) => {
        if (!midiNotes[index]) return;
        
        const note = midiNotes[index];
        const baseWidth = note.duration * basePixelsPerMs;
        const x = markerX + (lyric.time - currentTime) * pixelsPerMs;
        const y = getYPositionFromPitch(note.note);

        // Minimale Blockbreite festlegen
        const minBlockWidth = Math.max(50, baseWidth);

        // Nur zeichnen, wenn im sichtbaren Bereich
        if (x + minBlockWidth > 0 && x < width) {
          drawLyricBlock(lyric, note, x, y, minBlockWidth, 30);
        }
      });

      // Fortschrittsleiste zeichnen
      drawProgressBar();
    };

    // Animations-Loop
    let animationFrameId;
    const animate = () => {
      draw();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup bei Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [lyricsData, currentTime, midiNotes, tempo, sizeFactor]);

  return (
    <div className="w-full overflow-hidden rounded-lg shadow-inner bg-white">
      <canvas 
        ref={canvasRef} 
        width={1800} 
        height={800}
        className="w-full h-full"
      />
    </div>
  );
};

export default AdvancedLyricsVisualizer;