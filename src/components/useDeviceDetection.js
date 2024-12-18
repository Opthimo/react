import { useState, useEffect } from 'react';

const useDeviceDetection = () => {
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        const checkTouchDevice = () => {
            setIsTouchDevice(
                'ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                navigator.msMaxTouchPoints > 0
            );
        };

        checkTouchDevice();
    }, []);

    return { isTouchDevice };
};

export default useDeviceDetection;