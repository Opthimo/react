import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { LAYOUT_TYPES, DEFAULT_SETTINGS } from './ThpaceTypes';
import ThpaceSettingsModal from './ThpaceSettingsModal';
import ThpaceControls from './ThpaceControls';

const ThpaceVisualizer = () => {
  const [midiData, setMidiData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const noteMeshesRef = useRef([]);
  const animationFrameRef = useRef(null);

  const getRainbowColor = useCallback((position) => {
    const hue = position * 360;
    return new THREE.Color(`hsl(${hue}, 100%, 50%)`);
  }, []);

  const calculateNotePosition = useCallback((note, index, total, data) => {
    const radius = settings.radius === 'auto' ? 5 : settings.radius;
    
    switch (settings.layout) {
      case LAYOUT_TYPES.LINE: {
        const x = ((note.data1 - data.lowest_note) / 
          (data.highest_note - data.lowest_note)) * 8 - 4;
        return { x, y: 1, z: -note.time / 1000 };
      }
      
      case LAYOUT_TYPES.SEMICIRCLE:
      case LAYOUT_TYPES.ARC: {
        const angle = settings.layout === LAYOUT_TYPES.SEMICIRCLE ? Math.PI :
          (settings.angle * Math.PI / 180);
        const pos = settings.useUniqueNotes ? 
          (index / (total - 1)) : 
          ((note.data1 - data.lowest_note) / 
            (data.highest_note - data.lowest_note));
        
        // Starte bei PI (unten) und gehe nach 0 (oben)
        const startAngle = Math.PI;
        const theta = startAngle - pos * angle;
        
        // x und y für korrekten Bogen oben
        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta) + radius; // Verschiebung nach oben
        
        return { x, y, z: -note.time / 1000 };
      }
      
      default:
        return { x: 0, y: 1, z: -note.time / 1000 };
    }
  }, [settings]);

  const initializeVisualization = useCallback((data) => {
    if (!mountRef.current || !data) return;
    
    // Komplett neue Szene erstellen
    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    // Neue Szene erstellen
    sceneRef.current = new THREE.Scene();
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    cameraRef.current = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const defaultRadius = settings.radius === 'auto' ? 5 : settings.radius;
    
    if (settings.layout === LAYOUT_TYPES.LINE) {
      cameraRef.current.position.set(0, -2, 8);
      cameraRef.current.lookAt(0, 0, 0);
    } else {
      // Bessere Position für Bogenansicht
      cameraRef.current.position.set(0, 0, 12);
      cameraRef.current.lookAt(0, defaultRadius, 0);
    }
    cameraRef.current.lookAt(0, settings.layout === LAYOUT_TYPES.LINE ? 0 : defaultRadius, 0);

    // Renderer neu einrichten
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setSize(width, height);
    
    // Canvas erneuern
    if (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(rendererRef.current.domElement);

    // Beleuchtung
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 5);
    sceneRef.current.add(ambientLight);
    sceneRef.current.add(directionalLight);

    // Noten erstellen
    noteMeshesRef.current = [];
    
    let uniqueNotes = new Set();
    data.events.forEach(note => uniqueNotes.add(note.data1));
    const uniqueNotesArray = Array.from(uniqueNotes).sort((a, b) => a - b);

    data.events.forEach((note, index) => {
      const geometry = new THREE.CylinderGeometry(
        settings.noteSize,
        settings.noteSize,
        note.duration / 1000
      );

      const position = settings.useUniqueNotes
        ? uniqueNotesArray.indexOf(note.data1) / (uniqueNotesArray.length - 1)
        : (note.data1 - data.lowest_note) / (data.highest_note - data.lowest_note);

      const material = new THREE.MeshPhongMaterial({ 
        color: settings.useRainbow ? getRainbowColor(position) : new THREE.Color(settings.noteColor)
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      
      const pos = calculateNotePosition(note, index, data.events.length, data);
      mesh.position.set(pos.x, pos.y, pos.z);
      
      // Angepasste Rotation für verschiedene Layouts
      if (settings.layout === LAYOUT_TYPES.LINE) {
        mesh.rotation.x = Math.PI / 2;
      } else {
        // Für Bogen: Zuerst zum Zentrum ausrichten, dann Zylinder aufrichten
        mesh.lookAt(0, mesh.position.y, 0);
        mesh.rotateX(-Math.PI / 2);
      }

      sceneRef.current.add(mesh);
      noteMeshesRef.current.push({
        mesh,
        originalZ: pos.z,
        note: note
      });
    });

    sceneRef.current.background = new THREE.Color(settings.backgroundColor);
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [settings, calculateNotePosition, getRainbowColor]);

  const animate = useCallback(() => {
    if (!isPlaying || !sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    noteMeshesRef.current.forEach(({ mesh, originalZ }) => {
      mesh.position.z += settings.noteSpeed;
      if (mesh.position.z > 3) {
        mesh.position.z = originalZ;
      }
    });

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isPlaying, settings.noteSpeed]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Bitte laden Sie eine JSON-Datei hoch.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.events || !Array.isArray(data.events)) {
          setError('Ungültiges MIDI-JSON Format.');
          return;
        }
        setMidiData(data);
        setError(null);
        initializeVisualization(data);
      } catch (err) {
        setError('Fehler beim Parsen der JSON-Datei: ' + err.message);
      }
    };
    reader.onerror = () => setError('Fehler beim Lesen der Datei.');
    reader.readAsText(file);
  };

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, animate]);

  useEffect(() => {
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
      
      if (midiData) {
        initializeVisualization(midiData);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [midiData, initializeVisualization]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
      
      rendererRef.current = null;
      sceneRef.current = null;
      noteMeshesRef.current = [];
    };
  }, []);

  const handleStart = () => setIsPlaying(true);
  
  const handleReset = () => {
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    noteMeshesRef.current.forEach(({ mesh, originalZ }) => {
      mesh.position.z = originalZ;
    });
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    if (midiData) {
      setTimeout(() => {
        initializeVisualization(midiData);
      }, 0);
    }
  };

  return (
    <div className="w-full mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-4">
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 border border-gray-300 rounded p-2 mb-4"
        />
        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}
      </div>

      <div 
        ref={mountRef} 
        className="w-full h-[600px] bg-black"
      />

      <div className="p-4">
        <ThpaceControls
          isPlaying={isPlaying}
          onStart={handleStart}
          onReset={handleReset}
          onOpenSettings={() => setShowSettings(true)}
        />
      </div>

      {showSettings && (
        <ThpaceSettingsModal
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
          onSave={() => {
            if (midiData) {
              initializeVisualization(midiData);
            }
            setShowSettings(false);
          }}
        />
      )}
    </div>
  );
};

export default ThpaceVisualizer;