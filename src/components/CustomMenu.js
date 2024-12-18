// CustomMenu.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BLEContext } from './BLEContext'; // Importieren Sie den Kontext
import { menuItems } from '../MenuConfig';
import backgroundImage from '../pics/rainbow-bg.jpg';

const MenuItem = ({ icon, label, requiresBLE, isConnectedBLE, path }) => {
  const navigate = useNavigate();
  const isDisabled = requiresBLE && !isConnectedBLE;

  const handleClick = () => {
    if (isDisabled) {
      return;
    }
    navigate(path);
  };

  return (
    <div className="relative flex justify-center items-center">
      <button
        disabled={isDisabled}
        onClick={handleClick}
        className={`relative z-10 flex flex-col items-center justify-center bg-white border-8 border-black rounded-2xl p-4 hover:bg-gray-100 transition-colors duration-300 w-full h-full ${
          isDisabled ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        <img src={icon} alt={label} className="w-1/2 h-1/2 object-contain" />
        <span className="mt-4 text-2xl font-bold text-center">{label}</span>
      </button>
      {isDisabled && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center text-black font-bold rounded-2xl">
          Nicht verbunden
        </div>
      )}
    </div>
  );
};

const CustomMenu = () => {
  const { isConnected: isConnectedBLE } = useContext(BLEContext);

  return (
    <div
      className="flex justify-center items-center min-h-screen w-full bg-cover bg-center relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6 rounded-xl border-8 border-black bg-white bg-opacity-20 backdrop-blur-md"
        style={{ width: '90vw', height: '80vh' }}
      >
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            icon={item.icon}
            label={item.label}
            requiresBLE={item.requiresBLE}
            isConnectedBLE={isConnectedBLE}
            path={item.path}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomMenu;
