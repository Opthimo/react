// ./components/Header.js
import React, { useState, useContext } from 'react';
import { BLEContext } from './BLEContext';
import { useAuth } from './AuthContext';
import { MdBluetoothConnected, MdOutlineTouchApp } from 'react-icons/md';
import { Switch } from '@headlessui/react';
import { Link } from 'react-router-dom';
import useDeviceDetection from './useDeviceDetection';
//import useKinectData from './useKinectData';

const Header = () => {
  const { deviceName, isConnected, connectToDevice } = useContext(BLEContext);
  //const { connectionStatus } = useKinectData();
  //const [kinectConnected, setKinectConnected] = useState(false);
  const { user, logout } = useAuth();
  const { isTouchDevice } = useDeviceDetection();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="bg-white bg-opacity-50 backdrop-blur-md p-4 fixed w-full flex items-center justify-between shadow-md">
      <h1 className="text-xl font-bold">
        <Link to="/">Mellowee</Link>
      </h1>
      <div className="flex items-center space-x-4">
        {isTouchDevice && (
          <div className="flex items-center space-x-2">
            <MdOutlineTouchApp className="text-blue-500" size={24} />
          </div>
        )}
        {deviceName && (
          <div className="flex items-center space-x-2">
            <MdBluetoothConnected className="text-blue-500" size={24} />
            <span>{deviceName}</span>
          </div>
        )}
        <Switch
          checked={isConnected}
          onChange={connectToDevice}
          className={`${
            isConnected ? 'bg-blue-600' : 'bg-gray-300'
          } relative inline-flex items-center h-6 rounded-full w-11`}
        >
          <span className="sr-only">Enable BLE</span>
          <span
            className={`${
              isConnected ? 'translate-x-6' : 'translate-x-1'
            } inline-block w-4 h-4 transform bg-white rounded-full transition`}
          />
        </Switch>
        {user ? (
          <div className="flex items-center space-x-4">
            <span>Willkommen, {user.username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-blue-500">
              Login
            </Link>
            <Link to="/register" className="text-blue-500">
              Registrieren
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;