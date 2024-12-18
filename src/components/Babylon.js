import React, { useEffect, useRef } from "react";
import * as BABYLON from "babylonjs";
import "babylonjs-loaders";

const BabylonScene = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = new BABYLON.Engine(canvas, true);

    // Szene erstellen
    const scene = new BABYLON.Scene(engine);

    // Kamera hinzufügen
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 4,
      3,
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    camera.attachControl(canvas, true);

    // Licht hinzufügen
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );

    // Modell laden
    BABYLON.SceneLoader.ImportMesh(
      "",
      "/models/",
      "dummy3.babylon",
      scene,
      (meshes, particleSystems, skeletons) => {
        console.log("Modell geladen:", meshes);
      }
    );

    // Szene rendern
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Cleanup bei Komponentenausfall
    return () => {
      engine.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100vh" }} />;
};

export default BabylonScene;
