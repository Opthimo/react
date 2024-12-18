// src/components/BLE3DVisualization.js
import React, { useRef, useEffect, useContext } from 'react';
import * as THREE from 'three';
import { BLEContext } from './BLEContext';

const CubeVisualization = () => {
  const { orientationData } = useContext(BLEContext);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cubeRef = useRef(null);
  const frameIdRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mountNode = mountRef.current;

    // Set up scene
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0x222222); // Dunklerer Hintergrund
    
    // Verbesserte Kamera-Einstellungen
    cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true }); // Anti-aliasing für glattere Kanten
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.shadowMap.enabled = true; // Schatten aktivieren
    rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap; // Weichere Schatten
    mountNode.appendChild(rendererRef.current.domElement);

    // Beleuchtung einrichten
    const ambientLight = new THREE.AmbientLight(0x404040, 1); // Schwaches Umgebungslicht
    sceneRef.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    sceneRef.current.add(directionalLight);

    const pointLight = new THREE.PointLight(0x3366ff, 1, 10);
    pointLight.position.set(-2, 2, 2);
    sceneRef.current.add(pointLight);

    // Verbesserter Würfel mit physikalisch basiertem Material
    const geometry = new THREE.BoxGeometry(1, 1, 5);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      metalness: 0.7,
      roughness: 0.2,
      envMapIntensity: 1,
    });

    // Umgebungs-Mapping für Reflexionen
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const envMap = cubeTextureLoader.load([
      'px.jpg', 'nx.jpg',
      'py.jpg', 'ny.jpg',
      'pz.jpg', 'nz.jpg'
    ]);
    sceneRef.current.environment = envMap;
    material.envMap = envMap;

    cubeRef.current = new THREE.Mesh(geometry, material);
    cubeRef.current.castShadow = true;
    cubeRef.current.receiveShadow = true;
    sceneRef.current.add(cubeRef.current);

    // Boden hinzufügen für Schatten
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x808080,
      metalness: 0.0,
      roughness: 0.8
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    sceneRef.current.add(plane);

    cameraRef.current.position.set(3, 3, 5);
    cameraRef.current.lookAt(0, 0, 0);

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
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
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (mountNode && rendererRef.current) {
        mountNode.removeChild(rendererRef.current.domElement);
      }
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (planeGeometry) planeGeometry.dispose();
      if (planeMaterial) planeMaterial.dispose();
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (cubeRef.current && orientationData) {
      cubeRef.current.rotation.x = THREE.MathUtils.degToRad(orientationData.roll);
      cubeRef.current.rotation.y = THREE.MathUtils.degToRad(orientationData.heading);
      cubeRef.current.rotation.z = THREE.MathUtils.degToRad(orientationData.pitch);
    }
  }, [orientationData]);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default CubeVisualization;