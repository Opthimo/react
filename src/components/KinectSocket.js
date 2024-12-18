import React, { useEffect, useRef, useState } from 'react';
import useKinectData from './useKinectData';
import useDeviceDetection from './useDeviceDetection';
import PositionControls from './PositionControls';
import cloudImageSrc from '../icons/cloud.svg';

const KinectSocket = () => {
    const { handStates, handPositions, connectionStatus } = useKinectData();
    const { isTouchDevice } = useDeviceDetection();
    const canvasRef = useRef(null);
    const cloudsRef = useRef([
        { id: 1, x: 200, y: 300 },
        { id: 2, x: 600, y: 300 },
    ]);
    const draggingHandsRef = useRef({});
    const draggingMouseRef = useRef(null);
    const animationFrameIdRef = useRef(null);
    const cloudImageRef = useRef(null);
    const [scales, setScales] = useState({ x: 100, y: -100 });
    const [offsets, setOffsets] = useState({ x: 0.5, y: 0.5 });

    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            cloudImageRef.current = img;
        };
        img.onerror = () => {
            console.error('Fehler beim Laden des Wolkenbildes.');
        };
        img.src = cloudImageSrc;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const resizeCanvas = () => {
            canvas.width = window.innerWidth * 0.9;
            canvas.height = window.innerHeight * 0.9;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let isMounted = true;

        const render = () => {
            if (!isMounted) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw clouds
            cloudsRef.current.forEach((cloud) => {
                drawCloud(ctx, cloud.x, cloud.y);
            });

            if (connectionStatus === 'Connected') {
                Object.keys(handPositions).forEach((bodyId) => {
                    const positions = handPositions[bodyId];
                    const states = handStates[bodyId];

                    ['leftHand', 'rightHand'].forEach((hand) => {
                        const position = positions[hand];
                        const state = states[hand];
                        const handId = `${bodyId}-${hand}`;

                        if (position) {
                            // Use controlled position calculations
                            const x = (position.X * scales.x) + (canvas.width * offsets.x);
                            const y = (position.Y * scales.y) + (canvas.height * offsets.y);

                            drawHand(ctx, x, y, state);

                            if (state === 'Closed') {
                                if (!draggingHandsRef.current[handId]) {
                                    cloudsRef.current.forEach((cloud) => {
                                        if (isColliding({ x, y }, cloud)) {
                                            draggingHandsRef.current[handId] = cloud.id;
                                            cloud.offsetX = x - cloud.x;
                                            cloud.offsetY = y - cloud.y;
                                        }
                                    });
                                } else {
                                    const cloudId = draggingHandsRef.current[handId];
                                    const cloud = cloudsRef.current.find((c) => c.id === cloudId);
                                    if (cloud) {
                                        cloud.x = x - (cloud.offsetX || 0);
                                        cloud.y = y - (cloud.offsetY || 0);
                                    }
                                }
                            } else {
                                delete draggingHandsRef.current[handId];
                            }
                        } else {
                            delete draggingHandsRef.current[handId];
                        }
                    });
                });
            }

            if (draggingMouseRef.current) {
                const { cloudId, offsetX, offsetY } = draggingMouseRef.current;
                const cloud = cloudsRef.current.find((c) => c.id === cloudId);
                if (cloud) {
                    cloud.x = draggingMouseRef.current.x - offsetX;
                    cloud.y = draggingMouseRef.current.y - offsetY;
                }
            }

            animationFrameIdRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            isMounted = false;
            cancelAnimationFrame(animationFrameIdRef.current);
        };
    }, [handPositions, handStates, connectionStatus, scales, offsets]);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (isTouchDevice) {
            const handleTouchStart = (e) => {
                e.preventDefault();
                const touches = e.changedTouches;
                for (let i = 0; i < touches.length; i++) {
                    const touch = touches[i];
                    const touchId = touch.identifier;
                    const rect = canvas.getBoundingClientRect();
                    const x = touch.clientX - rect.left;
                    const y = touch.clientY - rect.top;

                    cloudsRef.current.forEach((cloud) => {
                        if (isColliding({ x, y }, cloud)) {
                            draggingHandsRef.current[`touch-${touchId}`] = {
                                cloudId: cloud.id,
                                offsetX: x - cloud.x,
                                offsetY: y - cloud.y,
                            };
                        }
                    });
                }
            };

            const handleTouchMove = (e) => {
                e.preventDefault();
                const touches = e.changedTouches;
                for (let i = 0; i < touches.length; i++) {
                    const touch = touches[i];
                    const touchId = touch.identifier;
                    const dragData = draggingHandsRef.current[`touch-${touchId}`];
                    if (dragData) {
                        const rect = canvas.getBoundingClientRect();
                        const x = touch.clientX - rect.left;
                        const y = touch.clientY - rect.top;
                        const cloud = cloudsRef.current.find((c) => c.id === dragData.cloudId);
                        if (cloud) {
                            cloud.x = x - dragData.offsetX;
                            cloud.y = y - dragData.offsetY;
                        }
                    }
                }
            };

            const handleTouchEnd = (e) => {
                e.preventDefault();
                const touches = e.changedTouches;
                for (let i = 0; i < touches.length; i++) {
                    const touch = touches[i];
                    const touchId = touch.identifier;
                    delete draggingHandsRef.current[`touch-${touchId}`];
                }
            };

            canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
            canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

            return () => {
                canvas.removeEventListener('touchstart', handleTouchStart);
                canvas.removeEventListener('touchmove', handleTouchMove);
                canvas.removeEventListener('touchend', handleTouchEnd);
                canvas.removeEventListener('touchcancel', handleTouchEnd);
            };
        }
    }, [isTouchDevice]);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!isTouchDevice) {
            const handleMouseDown = (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                cloudsRef.current.forEach((cloud) => {
                    if (isColliding({ x, y }, cloud)) {
                        draggingMouseRef.current = {
                            cloudId: cloud.id,
                            offsetX: x - cloud.x,
                            offsetY: y - cloud.y,
                        };
                    }
                });
            };

            const handleMouseMove = (e) => {
                if (draggingMouseRef.current) {
                    const rect = canvas.getBoundingClientRect();
                    draggingMouseRef.current.x = e.clientX - rect.left;
                    draggingMouseRef.current.y = e.clientY - rect.top;
                }
            };

            const handleMouseUp = () => {
                draggingMouseRef.current = null;
            };

            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);

            return () => {
                canvas.removeEventListener('mousedown', handleMouseDown);
                canvas.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isTouchDevice]);

    const drawCloud = (ctx, x, y) => {
        const img = cloudImageRef.current;
        const width = 500;
        const height = 500;
        if (img) {
            ctx.drawImage(img, x - width / 2, y - height / 2, width, height);
        } else {
            ctx.beginPath();
            ctx.fillStyle = 'gray';
            ctx.arc(x, y, 50, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    const drawHand = (ctx, x, y, state) => {
        ctx.beginPath();
        let color = 'blue';
        if (state === 'Open') {
            color = 'green';
        } else if (state === 'Closed') {
            color = 'red';
        }
        ctx.fillStyle = color;
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
    };

    const isColliding = (point, cloud) => {
        const width = 500;
        const height = 500;
        const left = cloud.x - width / 2;
        const right = cloud.x + width / 2;
        const top = cloud.y - height / 2;
        const bottom = cloud.y + height / 2;

        return (
            point.x >= left &&
            point.x <= right &&
            point.y >= top &&
            point.y <= bottom
        );
    };

    return (
        <div className="flex gap-4">
            <PositionControls 
                scales={scales}
                offsets={offsets}
                onScaleChange={setScales}
                onOffsetChange={setOffsets}
            />
            <canvas
                ref={canvasRef}
                style={{ border: '1px solid black', width: '90%', height: '90%' }}
            >
                Your browser does not support the HTML canvas tag.
            </canvas>
        </div>
    );
};

export default KinectSocket;