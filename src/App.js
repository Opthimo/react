import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { BLEProvider } from "./components/BLEContext";
import { AuthProvider } from "./components/AuthContext";
import { SocketProvider } from './components/SocketContext';
import "./index.css";

// Components
import CustomMenu from "./components/CustomMenu";
import Header from "./components/Header";
import LoadingSpinner from "./components/LoadingSpinner"; // Sie müssen diese Komponente erstellen

// Lazy loading für bessere Performance
const Thinging = React.lazy(() => import('./components/LyricsVisualizer'));
const Login = React.lazy(() => import('./components/Login'));
const Register = React.lazy(() => import('./components/Register'));
const Preferences = React.lazy(() => import('./components/Preferences'));
const BLE3DVisualization = React.lazy(() => import('./components/BLE3DVisualization'));
const MultiTouchSimulation = React.lazy(() => import('./components/MultiTouchSimulation'));
const Thpace = React.lazy(() => import('./components/ThpaceVisualizer'));
const LEDControlPage = React.lazy(() => import('./components/LEDControlPage'));
const MIDIControlPage = React.lazy(() => import('./components/MIDIControlPage'));
const MIDIPlayer = React.lazy(() => import('./components/MIDIPlayer'));
const Thession = React.lazy(() => import('./components/Thession'));
const Tree = React.lazy(() => import('./components/Tree'));
const Bluez = React.lazy(() => import('./components/Bluez'));
const Chat = React.lazy(() => import('./components/ChatRoom'));
const Move = React.lazy(() => import('./components/Move'));
const MIDIRoute = React.lazy(() => import('./components/MIDIRoute'));
const Babylon = React.lazy(() => import('./components/Babylon'));
const FileManager = React.lazy(() => import('./components/FileManagerPage'));

// LoadingSpinner Komponente als Fallback
const LoadingWrapper = ({ children }) => (
  <React.Suspense fallback={
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  }>
    {children}
  </React.Suspense>
);

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };

    init();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BLEProvider>
        <SocketProvider>
          <Router>
            <div className="flex flex-col min-h-screen w-full bg-black"> {/* Geändert */}
              <Header className="fixed top-0 left-0 right-0 z-50" /> {/* Geändert */}
              <main className="flex-1 w-full mt-16"> {/* Geändert */}
                <Routes>
                  <Route path="/" element={<LoadingWrapper><CustomMenu /></LoadingWrapper>} />
                  <Route path="/thinging" element={<LoadingWrapper><Thinging /></LoadingWrapper>} />
                  <Route path="/login" element={<LoadingWrapper><Login /></LoadingWrapper>} />
                  <Route path="/register" element={<LoadingWrapper><Register /></LoadingWrapper>} />
                  <Route path="/preferences" element={<LoadingWrapper><Preferences /></LoadingWrapper>} />
                  <Route path="/ble3d" element={<LoadingWrapper><BLE3DVisualization /></LoadingWrapper>} />
                  <Route path="/kinect" element={<LoadingWrapper><MultiTouchSimulation /></LoadingWrapper>} />
                  <Route path="/thpace" element={<LoadingWrapper><Thpace /></LoadingWrapper>} />
                  <Route path="/thord" element={<LoadingWrapper><LEDControlPage /></LoadingWrapper>} />
                  <Route path="/midi" element={<LoadingWrapper><MIDIControlPage /></LoadingWrapper>} />
                  <Route path="/notenregen" element={<LoadingWrapper><MIDIPlayer /></LoadingWrapper>} />
                  <Route path="/thession" element={<LoadingWrapper><Thession /></LoadingWrapper>} />
                  <Route path="/tree" element={<LoadingWrapper><Tree /></LoadingWrapper>} />
                  <Route path="/file" element={<LoadingWrapper><FileManager /></LoadingWrapper>} />
                  <Route path="/chat" element={<LoadingWrapper><Chat /></LoadingWrapper>} />
                  <Route path="/move" element={<LoadingWrapper><Move /></LoadingWrapper>} />
                  <Route path="/midiroute" element={<LoadingWrapper><MIDIRoute /></LoadingWrapper>} />
                  <Route path="/babylon" element={<LoadingWrapper><Babylon /></LoadingWrapper>} />
                </Routes>
              </main>
            </div>
          </Router>
        </SocketProvider>
      </BLEProvider>
    </AuthProvider>
  );
}

export default App;