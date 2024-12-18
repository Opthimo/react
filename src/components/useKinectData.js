import { useEffect, useState } from 'react';

const useKinectData = () => {
    const [skeletonData, setSkeletonData] = useState({});
    const [handStates, setHandStates] = useState({});
    const [handPositions, setHandPositions] = useState({});
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');

    useEffect(() => {
        console.log('Initializing connection to Flask server...');

        const eventSource = new EventSource('https://192.168.188.95:5000/data', {
          rejectUnauthorized: false
      });

        eventSource.onopen = () => {
            console.log('Connection to Flask server established');
            setConnectionStatus('Connected');
        };

        eventSource.onerror = (error) => {
            console.error('Connection error:', error);
            setConnectionStatus('Disconnected'); // Update to 'Disconnected' on error
        };

        eventSource.onmessage = (event) => {
            try {
                //console.log('Raw event data:', event.data);
                if (!event.data) {
                    console.error('Empty event data received');
                    return;
                }
                const receivedData = JSON.parse(event.data);
                //console.log('Parsed data:', receivedData);
                if (receivedData.type === 'skeleton') {
                    //console.log('Skeleton data:', receivedData.data);
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
        
                                if (newHandState && newHandState !== 'Unknown' && newHandState !== 'NotTracked') {
                                    newHandStates[bodyId][hand] = newHandState;
                                } else if (!currentHandState || currentHandState === 'Unknown' || currentHandState === 'NotTracked') {
                                    newHandStates[bodyId][hand] = newHandState;
                                }
        
                                const handPosition = bodyData[handKey]?.Position;
                                if (handPosition) {
                                    newHandPositions[bodyId][hand] = {
                                        X: handPosition.X,
                                        Y: handPosition.Y,
                                        Z: handPosition.Z,
                                    };
                                }
                            });
                        });
                        setHandPositions(newHandPositions);
                        return newHandStates;
                    });
                }
            } catch (error) {
                console.error('Error processing event:', error);
            }
        };

        return () => {
            console.log('Closing connection to Flask server');
            eventSource.close();
            setConnectionStatus('Disconnected'); // Ensure status is updated on cleanup
        };
    }, []);

    return { skeletonData, handStates, handPositions, connectionStatus };
};

export default useKinectData;