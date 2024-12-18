// src/components/MultiTouchSimulation.js
import React, { useEffect, useRef } from 'react';
import useKinectData from './useKinectData';

const MultiTouchSimulation = () => {
    const { handStates, handPositions } = useKinectData();
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Iterate over all bodies
        Object.keys(handPositions).forEach((bodyId) => {
            const positions = handPositions[bodyId];
            const states = handStates[bodyId];

            ['leftHand', 'rightHand'].forEach((hand) => {
                const position = positions[hand];
                const state = states[hand];

                if (position && state === 'Closed') {
                    // Convert position to canvas coordinates
                    const x = (position.X * 100) + canvas.width / 2;
                    const y = (position.Y * -100) + canvas.height / 2;

                    // Simulate touch event
                    handleTouch({ x, y }, hand);
                }
            });
        });
    });

    const handleTouch = (position, hand) => {
        // Implement your touch logic here
        // For example, check if the touch collides with a cloud and move it
    };

    return (
        <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid black' }}>
            Your browser does not support the HTML canvas tag.
        </canvas>
    );
};

export default MultiTouchSimulation;