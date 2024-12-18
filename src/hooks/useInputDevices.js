import { useState, useEffect, useCallback } from 'react';
import Soundfont from 'soundfont-player';
import MidiParser from 'midi-parser-js';

function useInputDevices() {
  const [gamepads, setGamepads] = useState([]);
  const [gamepadButtonStates, setGamepadButtonStates] = useState({});
  const [keyboardActive, setKeyboardActive] = useState(false);
  const [mouseActive, setMouseActive] = useState(false);
  const [lastKeyPressed, setLastKeyPressed] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [lastClickPosition, setLastClickPosition] = useState({ x: 0, y: 0 });
  const [audioContext, setAudioContext] = useState(null);
  const [player, setPlayer] = useState(null);
  const [activeNotes, setActiveNotes] = useState({});
  const [midiFile, setMidiFile] = useState(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

  const initializeAudio = useCallback(() => {
    if (!audioInitialized) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
      loadInstrument('acoustic_grand_piano', ctx);
      setAudioInitialized(true);
    }
  }, [audioInitialized]);

  const loadInstrument = useCallback((instrumentName, context) => {
    const ctx = context || audioContext;
    if (ctx) {
      Soundfont.instrument(ctx, instrumentName).then(newPlayer => {
        setPlayer(newPlayer);
      });
    }
  }, [audioContext]);

  const playNote = useCallback((midiNumber) => {
    if (player && !activeNotes[midiNumber]) {
      const note = player.play(midiNumber);
      setActiveNotes(prev => ({ ...prev, [midiNumber]: note }));
    }
  }, [player, activeNotes]);

  const stopNote = useCallback((midiNumber) => {
    if (activeNotes[midiNumber]) {
      activeNotes[midiNumber].stop();
      setActiveNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[midiNumber];
        return newNotes;
      });
    }
  }, [activeNotes]);

  const loadMidiFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const midiArray = new Uint8Array(e.target.result);
      const midiData = MidiParser.parse(midiArray);
      setMidiFile(midiData);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const playMidiFile = useCallback(() => {
    if (!player || !midiFile || !audioContext) return;

    const now = audioContext.currentTime;
    midiFile.track.forEach(track => {
      let currentTime = 0;
      track.event.forEach(event => {
        if (event.type === 9) { // Note on event
          const note = event.data[0];
          const velocity = event.data[1];
          const startTime = now + currentTime;
          player.play(note, startTime, { gain: velocity / 127 });
        }
        currentTime += event.deltaTime / 1000; // Convert delta time to seconds
      });
    });
  }, [player, midiFile, audioContext]);

  useEffect(() => {
    const handleGamepadConnected = (event) => {
      setGamepads(prev => [...prev, event.gamepad]);
    };

    const handleGamepadDisconnected = (event) => {
      setGamepads(prev => prev.filter(gamepad => gamepad.index !== event.gamepad.index));
      setGamepadButtonStates(prev => {
        const newState = {...prev};
        delete newState[event.gamepad.index];
        return newState;
      });
    };

    const handleKeyDown = (event) => {
      setKeyboardActive(true);
      setLastKeyPressed(event.key);
    };

    const handleMouseMove = (event) => {
      setMouseActive(true);
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    const handleClick = (event) => {
      setLastClickPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    const updateGamepadState = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
      
      const newButtonStates = {};
      for (let gamepad of gamepads) {
        if (gamepad) {
          newButtonStates[gamepad.index] = gamepad.buttons.map((button, index) => {
            const midiNumber = 60 + index;
            if (button.pressed) {
              playNote(midiNumber);
            } else {
              stopNote(midiNumber);
            }
            return button.pressed;
          });
        }
      }
      setGamepadButtonStates(newButtonStates);
    };

    const gamepadPolling = setInterval(updateGamepadState, 100);

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      clearInterval(gamepadPolling);
    };
  }, [playNote, stopNote]);

  return { 
    gamepads, 
    gamepadButtonStates,
    keyboardActive, 
    mouseActive, 
    lastKeyPressed, 
    mousePosition, 
    lastClickPosition,
    loadInstrument,
    loadMidiFile,
    playMidiFile,
    midiFile,
    initializeAudio,
    audioInitialized
  };
}

export default useInputDevices;