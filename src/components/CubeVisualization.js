import { useRef, useEffect, useContext, useState } from 'react';
import * as THREE from 'three';
import { BLEContext } from './BLEContext';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext'; // Importiere den AuthContext

const CubeVisualization = () => {
  const { user } = useAuth(); // Zugriff auf den aktuellen Benutzer
  const { orientationData: bleOrientationData } = useContext(BLEContext);
  const socket = useSocket();
  const [orientationData, setOrientationData] = useState(null);
  const [username, setUsername] = useState(user?.username || ''); // Initialisiere username mit user.username
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cubeRef = useRef(null);
  const orientationDataRef = useRef();

  // Aktualisiere das Ref, wenn sich orientationData ändert
  useEffect(() => {
    orientationDataRef.current = orientationData;
    console.log('orientationDataRef aktualisiert:', orientationDataRef.current);
  }, [orientationData]);

  useEffect(() => {
    if (!mountRef.current) return;

    const mountNode = mountRef.current;

    // Set up the scene and renderer
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0x222222);

    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    mountNode.appendChild(rendererRef.current.domElement);

    // Cube setup
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cubeRef.current = new THREE.Mesh(geometry, material);
    sceneRef.current.add(cubeRef.current);

    cameraRef.current.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      if (cubeRef.current && orientationDataRef.current) {
        console.log('Aktualisiere Würfelrotation mit:', orientationDataRef.current);
        // Update cube rotation based on orientationData
        cubeRef.current.rotation.x = THREE.MathUtils.degToRad(
          orientationDataRef.current.roll
        );
        cubeRef.current.rotation.y = THREE.MathUtils.degToRad(
          orientationDataRef.current.heading
        );
        cubeRef.current.rotation.z = THREE.MathUtils.degToRad(
          orientationDataRef.current.pitch
        );
      } else {
        console.log('cubeRef.current oder orientationDataRef.current ist nicht definiert');
      }
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        if (mountNode && mountNode.contains(rendererRef.current.domElement)) {
          mountNode.removeChild(rendererRef.current.domElement);
        }
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      geometry.dispose();
      material.dispose();
    };
  }, []); // Leeres Abhängigkeitsarray

  useEffect(() => {
    console.log('CubeVisualization: Überprüfe Socket-Verbindung:', socket);
    if (socket) {
      console.log('CubeVisualization: Socket ist definiert');
      socket.on('connect', () => {
        console.log('WebSocket connected:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      socket.on('orientationData', (data) => {
        console.log('WebSocket orientation data received:', data);
        setOrientationData(data);
        setUsername(data.username || 'Remote User');
      });
    } else {
      console.log('CubeVisualization: Socket ist undefined');
    }

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('orientationData');
      }
    };
  }, [socket]);

  useEffect(() => {
    if (bleOrientationData) {
      setOrientationData(bleOrientationData);
      setUsername(user?.username || 'Local BLE Device'); // Setze username für BLE-Daten, falls verfügbar
      // Sende die BLE-Daten an den Server
      if (socket && socket.connected) {
        console.log('Sende orientationData über Socket:', bleOrientationData);
        socket.emit('orientationData', {
          ...bleOrientationData,
          username: user?.username || 'Local BLE Device',
        });
      } else {
        console.log('Socket ist nicht verbunden, kann orientationData nicht senden');
      }
    }
  }, [bleOrientationData, user, socket]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100vh', position: 'relative' }}
    >
      {username && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            color: 'white',
            fontSize: '18px',
          }}
        >
          Benutzer: {username}
        </div>
      )}
      {orientationData && (
        <div
          style={{
            position: 'absolute',
            top: '30px',
            left: '10px',
            color: 'white',
            fontSize: '14px',
          }}
        >
          <p>Roll: {orientationData.roll}</p>
          <p>Pitch: {orientationData.pitch}</p>
          <p>Heading: {orientationData.heading}</p>
        </div>
      )}
    </div>
  );
};

export default CubeVisualization;
