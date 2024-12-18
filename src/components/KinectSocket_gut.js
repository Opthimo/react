import React, { useEffect, useState } from 'react';

const SimplifiedKinectVisualization = () => {
    const [skeletonData, setSkeletonData] = useState({});
    const [faceData, setFaceData] = useState({});
    const [handStates, setHandStates] = useState({});
    const [handPositions, setHandPositions] = useState({});
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

    useEffect(() => {
        console.log('Initializing connection to Flask server...');

        const eventSource = new EventSource('http://localhost:5000/data');

        eventSource.onopen = () => {
            console.log('Connection to Flask server established');
            setConnectionStatus('Connected');
        };

        eventSource.onerror = (error) => {
            console.error('Connection error:', error);
            setConnectionStatus('Error');
        };

        eventSource.onmessage = (event) => {
            const receivedData = JSON.parse(event.data);
            console.log('Received data:', receivedData);
            if (receivedData.type === 'skeleton') {
                console.log('Updating skeleton data:', receivedData.data);
                setSkeletonData(receivedData.data);
                // Update hand states and positions
                setHandStates((prevHandStates) => {
                    const newHandStates = { ...prevHandStates };
                    const newHandPositions = { ...handPositions };
                    Object.entries(receivedData.data).forEach(([bodyId, bodyData]) => {
                        if (!newHandStates[bodyId]) newHandStates[bodyId] = {};
                        if (!newHandPositions[bodyId]) newHandPositions[bodyId] = {};

                        ['leftHand', 'rightHand'].forEach((hand) => {
                            const handKey = hand === 'leftHand' ? 'LeftHand' : 'RightHand';
                            const newHandState = bodyData[handKey]?.HandState;
                            const currentHandState = newHandStates[bodyId][hand];

                            // Update hand state logic
                            if (newHandState && newHandState !== 'Unknown' && newHandState !== 'NotTracked') {
                                newHandStates[bodyId][hand] = newHandState;
                            } else if (!currentHandState || currentHandState === 'Unknown' || currentHandState === 'NotTracked') {
                                newHandStates[bodyId][hand] = newHandState;
                            }
                            // Else, keep the current valid hand state

                            // Update hand positions
                            const handPosition = bodyData[handKey]?.Position;
                            if (handPosition) {
                                newHandPositions[bodyId][hand] = {
                                    X: handPosition.X,
                                    Y: handPosition.Y,
                                    Z: handPosition.Z,
                                };
                            }
                        });

                        console.log(`Received hand states for body ${bodyId}:`, 
                            `Left: ${bodyData.LeftHand?.HandState}`, 
                            `Right: ${bodyData.RightHand?.HandState}`);
                    });
                    console.log('Updated handStates:', newHandStates);
                    setHandPositions(newHandPositions);
                    return newHandStates;
                });
            } else if (receivedData.type === 'face') {
                console.log('Updating face data:', receivedData.data);
                setFaceData(receivedData.data);
            }
            setLastUpdateTime(new Date());
        };

        return () => {
            console.log('Closing connection to Flask server');
            eventSource.close();
        };
    }, []);

    const getValueOrUnknown = (value) => value !== undefined && value !== null ? value : 'unknown';

    const renderPosition = (position, label) => {
        if (!position) return null;
        return (
            <div>
                <h4>{label}:</h4>
                <p>X: {position.X.toFixed(4)}</p>
                <p>Y: {position.Y.toFixed(4)}</p>
                <p>Z: {position.Z.toFixed(4)}</p>
            </div>
        );
    };

    const renderHandData = (handData, label, bodyId) => {
        if (!handData) return null;
        const handState = handStates[bodyId] ? handStates[bodyId][label] : 'unknown';
        return (
            <div>
                <h4>{label}:</h4>
                {renderPosition(handData.Position, "Position")}
                <p>Hand State: {getValueOrUnknown(handState)}</p>
            </div>
        );
    };

    const renderSkeletonData = (data, bodyId) => {
        if (!data) return <p>No skeleton data available for this body</p>;
        return (
            <div>
                {renderPosition(data.SpineBase?.Position, "SpineBase Position")}
                {renderHandData(data.LeftHand, "leftHand", bodyId)}
                {renderHandData(data.RightHand, "rightHand", bodyId)}
            </div>
        );
    };

    const renderFaceData = (data) => {
        if (!data) return <p>No face data available for this body</p>;
        return (
            <div>
                <p>Happy: {getValueOrUnknown(data.happy)}</p>
                <p>Engaged: {getValueOrUnknown(data.engaged)}</p>
                <p>Wearing Glasses: {getValueOrUnknown(data.wearingglasses)}</p>
                <p>Left Eye Closed: {getValueOrUnknown(data.lefteyeclosed)}</p>
            </div>
        );
    };

    const renderBody = (bodyId) => {
        return (
            <div key={bodyId} style={{ backgroundColor: '#e0e0e0', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
                <h3>Body ID: {bodyId}</h3>
                <div>
                    <h4>Skeleton Data:</h4>
                    {renderSkeletonData(skeletonData[bodyId], bodyId)}
                </div>
                <div>
                    <h4>Face Data:</h4>
                    {renderFaceData(faceData[bodyId])}
                </div>
            </div>
        );
    };

    const renderHandCircles = (bodyId) => {
        const bodyHandPositions = handPositions[bodyId];
        const bodyHandStates = handStates[bodyId];

        if (!bodyHandPositions || !bodyHandStates) return null;

        const handCircles = [];

        ['leftHand', 'rightHand'].forEach((hand) => {
            const position = bodyHandPositions[hand];
            const state = bodyHandStates[hand];

            if (position) {
                // Konvertieren der Positionen in Pixelkoordinaten
                const x = (position.X * 400) + 400; // Skalierung und Zentrierung
                const y = (position.Y * -300) + 300; // Y invertieren, da SVG von oben nach unten geht

                // Farbe basierend auf dem Handzustand
                let color = 'gray'; // Standardfarbe
                if (state === 'Open') {
                    color = 'green';
                } else if (state === 'Closed') {
                    color = 'red';
                }

                handCircles.push(
                    <circle
                        key={`${bodyId}-${hand}`}
                        cx={x}
                        cy={y}
                        r={20}
                        fill={color}
                        stroke="black"
                    >
                        <title>{`${hand} - State: ${state}`}</title>
                    </circle>
                );
            }
        });

        return handCircles;
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>Kinect Data Visualization</h1>
            <p style={{ textAlign: 'center' }}>Connection status: {connectionStatus}</p>
            {Object.keys(skeletonData).length > 0 ? (
                Object.keys(skeletonData).map(renderBody)
            ) : (
                <p>Waiting for skeleton data...</p>
            )}
            <p style={{ textAlign: 'center' }}>Last update: {lastUpdateTime.toLocaleTimeString()}</p>

            {/* SVG-Fläche für Handpositionen */}
            <svg
                width="1000"
                height="600"
                style={{ border: '1px solid #ccc', display: 'block', margin: '20px auto' }}
            >
                {Object.keys(handPositions).map((bodyId) => renderHandCircles(bodyId))}
            </svg>
        </div>
    );
};

export default SimplifiedKinectVisualization;
