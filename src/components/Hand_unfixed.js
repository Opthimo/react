import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs'; // Importiere TensorFlow.js
import '@tensorflow/tfjs-backend-webgl'; // Importiere das WebGL-Backend
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import backgroundImage from '../pics/rainbow-bg.jpg'; // Optionales Hintergrundbild

const HandPoseComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModelLoaded, setModelLoaded] = useState(false);
  let detector = null;

  // Initialisiere das WebGL-Backend
  const initBackend = async () => {
    try {
      await tf.setBackend('webgl'); // Setze das TensorFlow.js-Backend auf WebGL
      await tf.ready(); // Warte, bis das Backend bereit ist
      console.log(`TensorFlow.js backend: ${tf.getBackend()}`); // Logge das aktive Backend
    } catch (error) {
      console.error('Fehler bei der Initialisierung des Backends:', error);
    }
  };

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      const video = videoRef.current;
      video.srcObject = stream;

      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play(); // Starte die Wiedergabe des Videos
          console.log(`Videoabmessungen: ${video.videoWidth}x${video.videoHeight}`);
          resolve(video);
        };
      });
    } catch (error) {
      console.error('Fehler beim Zugriff auf die Kamera:', error);
    }
  };

  const loadHandposeModel = async () => {
    try {
      console.log('Lade Handpose-Modell...');
      detector = await handPoseDetection.createDetector(handPoseDetection.SupportedModels.MediaPipeHands, {
        runtime: 'tfjs',
        modelType: 'full', // Verwende 'full' für bessere Genauigkeit
        maxHands: 1,       // Erkenne eine Hand
      });
      setModelLoaded(true);
      console.log('Handpose-Modell erfolgreich geladen.');
      // Entferne detectHands() von hier
    } catch (error) {
      console.error('Fehler beim Laden des Handpose-Modells:', error);
    }
  };

  const detectHands = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Setze die Größe des Canvas entsprechend dem Video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const detectLoop = async () => {
      try {
        const hands = await detector.estimateHands(video, { flipHorizontal: true }); // Setze flipHorizontal auf true

        // Lösche das Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (hands.length > 0) {
          // console.log(`Erkannte ${hands.length} Hand/Hände.`);
          hands.forEach((hand) => {
            if (hand.keypoints && hand.keypoints.length > 0) {
              drawHand(hand, ctx);
              const handState = isHandOpen(hand);
              // console.log(`Hand ist ${handState ? 'offen' : 'geschlossen'}.`);
              displayHandState(handState, ctx);
            } else {
              console.log("Keine Schlüsselpunkte erkannt.");
              ctx.font = '20px Arial';
              ctx.fillStyle = 'red';
              ctx.fillText('Keine Hand erkannt', 10, 30);
            }
          });
        } else {
          // console.log('Keine Hände erkannt.');
          ctx.font = '20px Arial';
          ctx.fillStyle = 'red';
          ctx.fillText('Keine Hände erkannt', 10, 30);
        }

        requestAnimationFrame(detectLoop);
      } catch (error) {
        console.error('Fehler bei der Handerkennung:', error);
        requestAnimationFrame(detectLoop); // Setze die Schleife fort, auch bei Fehlern
      }
    };

    detectLoop();
  };

  const drawHand = (hand, ctx) => {
    const landmarks = hand.keypoints;

    // Skalierungsfaktoren (falls erforderlich)
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    const canvasWidth = canvasRef.current.width;
    const canvasHeight = canvasRef.current.height;

    const scaleX = canvasWidth / videoWidth;
    const scaleY = canvasHeight / videoHeight;

    // Zeichne Punkte
    landmarks.forEach((point, index) => {
      const x = point.x * scaleX;
      const y = point.y * scaleY;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    });

    // Zeichne Linien zwischen den Landmarks für jeden Finger
    const fingers = {
      thumb: [0, 1, 2, 3, 4],
      indexFinger: [5, 6, 7, 8],
      middleFinger: [9, 10, 11, 12],
      ringFinger: [13, 14, 15, 16],
      pinky: [17, 18, 19, 20],
    };

    Object.keys(fingers).forEach((finger) => {
      const points = fingers[finger].map((idx) => {
        const point = landmarks[idx];
        return { x: point.x * scaleX, y: point.y * scaleY };
      });
      drawPath(points, false, ctx);
    });
  };

  const drawPath = (points, closePath, ctx) => {
    if (points.length === 0) return;

    const region = new Path2D();
    region.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      region.lineTo(points[i].x, points[i].y);
    }
    if (closePath) {
      region.closePath();
    }
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke(region);
  };

  const isHandOpen = (hand) => {
    const landmarks = hand.keypoints;

    const fingerTips = [4, 8, 12, 16, 20];
    const fingerPIPs = [3, 7, 11, 15, 19];

    let openFingers = 0;

    for (let i = 0; i < fingerTips.length; i++) {
      const tip = landmarks[fingerTips[i]];
      const pip = landmarks[fingerPIPs[i]];

      if (tip && pip && !isNaN(tip.y) && !isNaN(pip.y)) {
        // Da die y-Koordinate nach unten wächst, ist ein kleinerer y-Wert höher
        if (tip.y < pip.y) {
          openFingers += 1;
        }
      }
    }

    return openFingers > 2;
  };

  const displayHandState = (handState, ctx) => {
    ctx.font = '20px Arial';
    ctx.fillStyle = handState ? 'green' : 'orange';
    ctx.fillText(`Hand ist ${handState ? 'offen' : 'geschlossen'}`, 10, 30);
  };

  useEffect(() => {
    // Verwenden Sie eine asynchrone Initialisierungsfunktion
    const initialize = async () => {
      await initBackend();
      await setupCamera();
      await loadHandposeModel();
      detectHands(); // Starten Sie die Handerkennung erst, nachdem alles initialisiert ist
    };
    initialize();
  }, []);

  return (
    <div
      className="flex justify-center items-center min-h-screen w-full bg-cover bg-center relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div
        className="flex justify-center items-center min-h-screen w-full p-6 rounded-xl border-8 border-black bg-white bg-opacity-20 backdrop-blur-md"
        style={{ width: '90vw', height: '90vh' }}
      >
        <div
          className="bg-white rounded-xl p-6 border-8 border-black flex gap-10 relative"
          style={{ width: '80vw', height: '80vh' }}
        >
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-cover"
            style={{ display: isModelLoaded ? 'block' : 'none' }}
            autoPlay
            playsInline
            muted
          ></video>
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          ></canvas>
          {!isModelLoaded && <p>Loading Handpose Model...</p>}
        </div>
      </div>
    </div>
  );
};

export default HandPoseComponent;

