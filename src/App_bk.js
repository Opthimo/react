// App.js 
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { BLEProvider } from "./components/BLEContext";
import { AuthProvider } from "./components/AuthContext";
import { SocketProvider } from './components/SocketContext';
//import { menuItems } from "./MenuConfig";
import "./index.css";
import CustomMenu from "./components/CustomMenu";
import LEDControlPage from "./components/LEDControlPage";
import MIDIControlPage from "./components/MIDIControlPage";
import MIDIPlayer from "./components/MIDIPlayer";
import KinectSocket from "./components/KinectSocket";
import Thession from "./components/Thession";
import Tree from "./components/Tree";
import Header from "./components/Header";
import BLE3DVisualization from "./components/BLE3DVisualization";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Chat from "./components/ChatRoom";
import Bluez from './components/Bluez';
import Move from './components/Move';
import MIDIRoute from './components/MIDIRoute';
import Preferences from './components/Preferences';
import CubeVisualization from './components/CubeVisualization';
import MultiTouchSimulation from './components/MultiTouchSimulation';
import Thpace from './components/ThpaceVisualizer';
import Thinging from './components/LyricsVisualizer';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceCharacteristic] = useState(null);
  //const [midiCharacteristic, setMidiCharacteristic] = useState(null);

  return (
    <AuthProvider>
      <BLEProvider>
       <SocketProvider>
          <Router>
            <div className="App">
              <Header />
              <div className="pt-16 flex justify-center items-center min-h-screen">
                <Routes>
                  <Route path="/" element={<CustomMenu />} />
                  <Route path="/thinging" element={<Thinging />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/preferences" element={<Preferences />}/>
                  <Route path="/ble3d" element={<BLE3DVisualization />} />
                  <Route path="/kinect" element={<MultiTouchSimulation/>} />
                  <Route path="/thpace" element={<Thpace />} />
                  {/* Geschützte Routen */}
                  <Route path="/thord" element={<ProtectedRoute><LEDControlPage  deviceCharacteristic={deviceCharacteristic}/></ProtectedRoute>} />
                  <Route path="/midi" element={<ProtectedRoute><MIDIControlPage /></ProtectedRoute>} />
                  <Route path="/notenregen" element={<ProtectedRoute><MIDIPlayer /></ProtectedRoute>} />
                  <Route path="/thession" element={<ProtectedRoute><Thession /></ProtectedRoute>} />
                  <Route path="/tree" element={<ProtectedRoute><Tree /></ProtectedRoute>} />                  
                  <Route path="/bluez" element={<ProtectedRoute><Bluez /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                  <Route path="/move" element={<ProtectedRoute><Move /></ProtectedRoute>} />
                  <Route path="/midiroute" element={<ProtectedRoute><MIDIRoute /></ProtectedRoute>} />
                  <Route path="/threeD" element={<ProtectedRoute><MIDIRoute /></ProtectedRoute>} />
                  <Route path="/cube" element={<ProtectedRoute><CubeVisualization /></ProtectedRoute>} />
                  
                </Routes>
              </div>
            </div>
          </Router>
      </SocketProvider>
      </BLEProvider>
    </AuthProvider>
  );
}

export default App;
