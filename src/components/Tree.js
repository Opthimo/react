import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

const ApplePickingSimulation = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter;

    const engine = Engine.create();
    const world = engine.world;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: '#87CEEB',
      },
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Boden
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 60, { 
      isStatic: true,
      render: { fillStyle: '#228B22' },
    });

    // Baum
    const trunk = Bodies.rectangle(200, window.innerHeight - 230, 60, 400, { 
      isStatic: true,
      render: { fillStyle: '#8B4513' },
    });
    const leaves = Bodies.circle(200, window.innerHeight - 450, 150, { 
      isStatic: true,
      render: { fillStyle: '#228B22' },
    });

    // Korb
    const basketLeft = Bodies.rectangle(window.innerWidth - 250, window.innerHeight - 60, 20, 100, { 
      isStatic: true,
      render: { fillStyle: '#8B4513' },
    });
    const basketRight = Bodies.rectangle(window.innerWidth - 50, window.innerHeight - 60, 20, 100, { 
      isStatic: true,
      render: { fillStyle: '#8B4513' },
    });
    const basketBottom = Bodies.rectangle(window.innerWidth - 150, window.innerHeight - 10, 200, 20, { 
      isStatic: true,
      render: { fillStyle: '#8B4513' },
    });

    // Strichmännchen
    const stickmanX = window.innerWidth - 350;
    const stickmanY = window.innerHeight - 100;
    const head = Bodies.circle(stickmanX, stickmanY - 60, 20, { isStatic: true });
    const body = Bodies.rectangle(stickmanX, stickmanY, 5, 80, { isStatic: true });
    const leftLeg = Bodies.rectangle(stickmanX - 15, stickmanY + 55, 5, 50, { isStatic: true, angle: Math.PI / 12 });
    const rightLeg = Bodies.rectangle(stickmanX + 15, stickmanY + 55, 5, 50, { isStatic: true, angle: -Math.PI / 12 });
    const leftArm = Bodies.rectangle(stickmanX - 20, stickmanY - 15, 5, 50, { isStatic: true, angle: Math.PI / 6 });
    const rightArm = Bodies.rectangle(stickmanX + 30, stickmanY, 5, 60, { isStatic: true, angle: -Math.PI / 4 });
    const hand = Bodies.circle(stickmanX + 55, stickmanY + 20, 10, { isStatic: true });

    // Äpfel
    const apples = [];
    for (let i = 0; i < 10; i++) {
      const apple = Bodies.circle(
        200 + Math.random() * 200 - 100,
        window.innerHeight - 450 - Math.random() * 100,
        15,
        {
          isStatic: true,
          restitution: 0.3,
          render: { fillStyle: '#FF0000' },
        }
      );
      apples.push(apple);
    }

    Composite.add(world, [
      ground, trunk, leaves, basketLeft, basketRight, basketBottom,
      head, body, leftLeg, rightLeg, leftArm, rightArm, hand,
      ...apples,
    ]);

    // Maus-Steuerung
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    let heldApple = null;

    // Event-Listener für das Pflücken und Halten der Äpfel
    Events.on(mouseConstraint, 'mousedown', (event) => {
      const mousePosition = event.mouse.position;
      apples.forEach((apple) => {
        const distance = Matter.Vector.magnitude(Matter.Vector.sub(mousePosition, apple.position));
        if (distance < 20 && apple.isStatic) {
          Matter.Body.setStatic(apple, false);
        }
      });
    });

    Events.on(engine, 'afterUpdate', () => {
      apples.forEach((apple) => {
        if (!apple.isStatic) {
          const distanceToHand = Matter.Vector.magnitude(Matter.Vector.sub(apple.position, hand.position));
          if (distanceToHand < 30) {
            if (!heldApple) {
              heldApple = apple;
              Matter.Body.setStatic(apple, true);
            }
          }
        }
      });

      if (heldApple) {
        Matter.Body.setPosition(heldApple, hand.position);
      }
    });

    // Fenster-Größenanpassung
    const handleResize = () => {
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;
      Matter.Body.setPosition(ground, Matter.Vector.create(window.innerWidth / 2, window.innerHeight));
    };

    window.addEventListener('resize', handleResize);

    // Cleanup bei Komponentendemontage
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={sceneRef} style={{ width: '100vw', height: '100vh', backgroundColor: '#87CEEB' }} />;
};

export default ApplePickingSimulation;
