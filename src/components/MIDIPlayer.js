// MIDIPlayer.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import LayoutWrapper from './LayoutWrapper';

const MIDIPlayer = () => {
  const [midiOutputs, setMidiOutputs] = useState([]);
  const [selectedMidiOutId, setSelectedMidiOutId] = useState(null);
  const [midiOut, setMidiOut] = useState(null);
  const [isMidiConnected, setIsMidiConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Warte auf MIDI-Verbindung...");
  const [midiData, setMidiData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [resumeTime, setResumeTime] = useState(0);
  const [pausedNotes, setPausedNotes] = useState([]);
  const visualizationRef = useRef(null);
  const activeNotes = useRef([]);
  const midiTimeouts = useRef([]);

  const onMIDISuccess = useCallback((midiAccess) => {
    const outputs = Array.from(midiAccess.outputs.values());
    setMidiOutputs(outputs);

    if (outputs.length > 0 && !selectedMidiOutId) {
      setSelectedMidiOutId(outputs[0].id);
    }

    midiAccess.onstatechange = (event) => {
      const updatedOutputs = Array.from(midiAccess.outputs.values());
      setMidiOutputs(updatedOutputs);

      if (!updatedOutputs.find(out => out.id === selectedMidiOutId)) {
        setSelectedMidiOutId(updatedOutputs.length > 0 ? updatedOutputs[0].id : null);
      }
    };
  }, [selectedMidiOutId]);

  const onMIDIFailure = () => {
    setStatusMessage("Zugriff auf die Web MIDI API fehlgeschlagen.");
  };

  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
      setStatusMessage("Web MIDI API wird von diesem Browser nicht unterstützt.");
    }
  }, [onMIDISuccess]);

  useEffect(() => {
    if (selectedMidiOutId && midiOutputs.length > 0) {
      const output = midiOutputs.find(out => out.id === selectedMidiOutId);
      if (output) {
        setMidiOut(output);
        setIsMidiConnected(true);
        setStatusMessage(`Verbunden mit ${output.name}!`);
      } else {
        setMidiOut(null);
        setIsMidiConnected(false);
        setStatusMessage("Ausgewählter MIDI-Ausgang nicht gefunden.");
      }
    }
  }, [selectedMidiOutId, midiOutputs]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const jsonData = JSON.parse(e.target.result);
      setMidiData(jsonData);
    };
    reader.readAsText(file);
  };

  const renderNotes = (data) => {
    if (!visualizationRef.current) return;
  
    const { events, lowest_note, highest_note } = data;
    const noteOnEvents = events.filter(event => event.event_type === 144 && event.data2 > 0);
    const totalWidth = visualizationRef.current.offsetWidth;
    const totalHeight = visualizationRef.current.offsetHeight;
  
    const noteWidth = totalWidth / (highest_note - lowest_note + 1);
  
    visualizationRef.current.innerHTML = '';
    activeNotes.current = [];
  
    noteOnEvents.forEach(event => {
      const noteElement = document.createElement('div');
      noteElement.className = 'note';
  
      const notePosition = event.data1 - lowest_note;
      const left = notePosition * noteWidth;
      const endTime = findNoteEndTime(event, events);
      const duration = endTime - event.time;
  
      const height = duration;
      noteElement.style.left = `${left}px`;
      noteElement.style.width = `${noteWidth}px`;
      noteElement.style.height = `${height}px`;
      noteElement.style.transform = `translateY(-${height}px)`;
      noteElement.style.transitionDuration = `${totalHeight}ms`;
  
      noteElement.style.backgroundColor = getRainbowColor(event.data1, lowest_note, highest_note);
  
      visualizationRef.current.appendChild(noteElement);
      activeNotes.current.push({ element: noteElement, event });

      setTimeout(() => {
        noteElement.style.transform = `translateY(${totalHeight + height}px)`;
      }, event.time - resumeTime);
    });
  };

  const findNoteEndTime = (startEvent, events) => {
    const noteOffEvent = events.find(
      event => event.time > startEvent.time && 
               ((event.event_type === 128 && event.data1 === startEvent.data1) || 
                (event.event_type === 144 && event.data1 === startEvent.data1 && event.data2 === 0))
    );
    return noteOffEvent ? noteOffEvent.time : startEvent.time + 500;
  };

  const getRainbowColor = (note, lowestNote, highestNote) => {
    const noteRange = highestNote - lowestNote;
    const hue = ((note - lowestNote) / noteRange) * 360;
    return `hsl(${hue}, 100%, 50%)`;
  };

  const playMIDI = () => {
    if (midiData && midiOut) {
      setIsPlaying(true);
      setIsPaused(false);
      const { events, instrument } = midiData;
      midiOut.send([0xC0, instrument]);

      const startTime = performance.now();
      setCurrentTime(startTime);

      renderNotes(midiData);

      events.forEach(event => {
        const delay = event.time - resumeTime;
        if (delay >= 0) {
          const timeoutId = setTimeout(() => {
            if (midiOut) {
              midiOut.send([event.event_type, event.data1, event.data2]);
            }
          }, delay);
          midiTimeouts.current.push(timeoutId);
        }
      });
    }
  };

  const pauseMIDI = () => {
    setIsPaused(true);
    setIsPlaying(false);

    const currentPlayTime = performance.now();
    setResumeTime(currentPlayTime - currentTime);

    midiTimeouts.current.forEach(clearTimeout);
    midiTimeouts.current = [];

    const updatedPausedNotes = activeNotes.current.map(({ element, event }) => {
      const computedStyle = window.getComputedStyle(element);
      const matrix = new DOMMatrix(computedStyle.transform);
      const remainingTime = parseFloat(computedStyle.transitionDuration) - (currentPlayTime - currentTime);
      element.style.transitionDuration = '0s';
      element.style.transform = `translateY(${matrix.m42}px)`;
      return { element, event, remainingTime };
    });

    setPausedNotes(updatedPausedNotes);
  };

  const resumeMIDI = () => {
    setIsPlaying(true);
    setIsPaused(false);

    pausedNotes.forEach(({ element, remainingTime }) => {
      element.style.transitionDuration = `${remainingTime}ms`;
      element.style.transform = `translateY(${visualizationRef.current.offsetHeight + parseFloat(element.style.height)}px)`;
    });

    playMIDI();
  };

  const stopMIDI = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setResumeTime(0);
    visualizationRef.current.innerHTML = '';

    midiTimeouts.current.forEach(clearTimeout);
    midiTimeouts.current = [];

    if (midiOut) {
      activeNotes.current.forEach(({ event }) => {
        midiOut.send([144, event.data1, 0]);
      });
    }

    activeNotes.current = [];
    setPausedNotes([]);
  };

  const handleMidiOutputChange = (event) => {
    const newSelectedId = event.target.value;
    setSelectedMidiOutId(newSelectedId);
  };

  return (
    <LayoutWrapper>
      <div className="midi-player">
        <h1 className="text-2xl font-bold mb-4">MIDI Visualizer</h1>
        <p className="mb-4">Status: {statusMessage}</p>

        <div className="controls mb-4">
          <label htmlFor="fileUpload" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer mr-2">
            Upload MIDI JSON
          </label>
          <input
            id="fileUpload"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />

          {midiOutputs.length > 0 && (
            <select
              value={selectedMidiOutId || ''}
              onChange={handleMidiOutputChange}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded mr-2"
            >
              {midiOutputs.map(output => (
                <option key={output.id} value={output.id}>
                  {output.name}
                </option>
              ))}
            </select>
          )}

          {isMidiConnected && midiData && !isPlaying && (
            <button onClick={isPaused ? resumeMIDI : playMIDI} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
              {isPaused ? 'Resume MIDI' : 'Play MIDI'}
            </button>
          )}

          {isPlaying && !isPaused && (
            <button onClick={pauseMIDI} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2">
              Pause
            </button>
          )}

          {isPlaying && (
            <button onClick={stopMIDI} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2">
              Stop
            </button>
          )}
        </div>

        <div className="note-visualization" ref={visualizationRef}></div>
      </div>
    </LayoutWrapper>
  );
};

export default MIDIPlayer;