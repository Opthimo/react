import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BluetoothScan = () => {
    const [devices, setDevices] = useState([]);
    const [connectedDevice, setConnectedDevice] = useState(null);
    const [error, setError] = useState('');
    const [connectionError, setConnectionError] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);

    useEffect(() => {
        let interval;
        if (isScanning) {
            interval = setInterval(() => {
                setScanProgress((prevProgress) => {
                    if (prevProgress >= 100) {
                        stopScan();
                        return 100;
                    }
                    return prevProgress + 1;
                });
                fetchScanStatus();
            }, 300);
        }
        return () => clearInterval(interval);
    }, [isScanning]);

    const fetchScanStatus = async () => {
        try {
            const response = await axios.get('https://192.168.188.95:4000/bluetooth/api/scan-status');
            setDevices(response.data.devices);
            setConnectedDevice(response.data.connectedDevice);
        } catch (err) {
            console.error('Error fetching scan status:', err);
            setError('Error fetching scan status: ' + err.message);
        }
    };

    const startScan = async () => {
        setIsScanning(true);
        setError('');
        setScanProgress(0);
        setDevices([]);
        try {
            await axios.get('https://192.168.188.95/bluetooth/api/start-scan');
        } catch (err) {
            setError('Error starting Bluetooth scan: ' + err.message);
            setIsScanning(false);
        }
    };

    const stopScan = async () => {
        setIsScanning(false);
        try {
            await axios.get('https://192.168.188.95/bluetooth/api/stop-scan');
        } catch (err) {
            setError('Error stopping Bluetooth scan: ' + err.message);
        }
    };

    const connectToDevice = async (mac) => {
        setConnectionError('');
        try {
            const response = await axios.post('https://192.168.188.95/bluetooth/api/connect', { mac });
            setConnectedDevice(response.data.device);
        } catch (err) {
            console.error('Connection error:', err.response ? err.response.data : err.message);
            setConnectionError(err.response ? err.response.data.message : err.message);
        }
    };

    const disconnectDevice = async () => {
        try {
            await axios.post('https://192.168.188.95/bluetooth/api/disconnect');
            setConnectedDevice(null);
        } catch (err) {
            setError('Error disconnecting device: ' + err.message);
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Bluetooth Scan</h1>
            
            <div className="mb-6">
                <button 
                    onClick={isScanning ? stopScan : startScan}
                    className={`py-2 px-4 rounded font-bold text-white ${
                        isScanning ? 'bg-red-500 hover:bg-red-700' : 'bg-blue-500 hover:bg-blue-700'
                    }`}
                >
                    {isScanning ? 'Stop Scan' : 'Start Scan'}
                </button>
                
                {isScanning && (
                    <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{width: `${scanProgress}%`}}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{scanProgress}% complete</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                    Error: {error}
                </div>
            )}

            {connectionError && (
                <div className="mb-4 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                    Connection Error: {connectionError}
                </div>
            )}

            {connectedDevice && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded">
                    <h2 className="text-xl font-semibold text-green-800">Connected Device:</h2>
                    <p className="text-green-700">{connectedDevice.name} ({connectedDevice.mac})</p>
                    <button 
                        onClick={disconnectDevice}
                        className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                        Disconnect
                    </button>
                </div>
            )}

            <h2 className="text-2xl font-semibold mb-4">Discovered Devices:</h2>
            {devices.length === 0 ? (
                <p className="text-gray-500">No devices found. Start a scan to discover nearby Bluetooth devices.</p>
            ) : (
                <ul className="space-y-2">
                    {devices.map((device) => (
                        <li key={device.mac} className="bg-gray-100 p-3 rounded-lg shadow flex justify-between items-center">
                            <div>
                                <strong className="text-lg">
                                    {device.name !== 'Unknown' ? device.name : device.mac}
                                </strong>
                                {device.name !== 'Unknown' && (
                                    <span className="ml-2 text-sm text-gray-500">({device.mac})</span>
                                )}
                                {device.rssi && (
                                    <span className="ml-2 text-sm text-gray-500">RSSI: {device.rssi}</span>
                                )}
                            </div>
                            {!connectedDevice && (
                                <button 
                                    onClick={() => connectToDevice(device.mac)}
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
                                >
                                    Connect
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default BluetoothScan;