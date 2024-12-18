import React, { useState, useRef, useEffect, useCallback } from 'react';
import WindowComponent from "./WindowComponent";
import LayoutWrapper from "./LayoutWrapper";
import backgroundImage from "../pics/rainbow-bg.jpg";

const Thession = () => {
  const [tracks, setTracks] = useState([]);
  const [midiOutputs, setMidiOutputs] = useState([]);
  const [selectedMidiOutId, setSelectedMidiOutId] = useState(null);
  const [midiOut, setMidiOut] = useState(null);
  const [isMidiConnected, setIsMidiConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Warte auf MIDI-Verbindung...");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const visualizationRefs = useRef([]);
  const midiTimeouts = useRef([]);

  const onMIDIFailure = () => {
    setStatusMessage("Zugriff auf die Web MIDI API fehlgeschlagen.");
  };

  const onMIDISuccess = useCallback((midiAccess) => {
    const outputs = Array.from(midiAccess.outputs.values());
    setMidiOutputs(outputs);

    if (outputs.length > 0) {
      setSelectedMidiOutId(outputs[0].id);
    } else {
      setStatusMessage("Keine MIDI-Ausgänge verfügbar.");
    }
    
    midiAccess.onstatechange = (event) => {
      const updatedOutputs = Array.from(midiAccess.outputs.values());
      setMidiOutputs(updatedOutputs);
      if (!updatedOutputs.find((out) => out.id === selectedMidiOutId)) {
        setSelectedMidiOutId(updatedOutputs.length > 0 ? updatedOutputs[0].id : null);
      }
    };
  }, [selectedMidiOutId]);

  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
      setStatusMessage("Web MIDI API wird von diesem Browser nicht unterstützt.");
    }
  }, [onMIDISuccess]);

  useEffect(() => {
    if (selectedMidiOutId && midiOutputs.length > 0) {
      const output = midiOutputs.find((out) => out.id === selectedMidiOutId);
      if (output) {
        console.log("MIDI-Ausgang gefunden:", output);
        setMidiOut(output);
        setIsMidiConnected(true);
        setStatusMessage(`Verbunden mit ${output.name}!`);
      } else {
        console.log("Ausgewählter MIDI-Ausgang nicht gefunden.");
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
      try {
        const data = JSON.parse(e.target.result);
        console.log("Geladene MIDI-Daten:", data);
        if (data.tracks && Array.isArray(data.tracks)) {
          const nonEmptyTracks = data.tracks.filter(
            (track) => track.events && track.events.length > 0
          );
          console.log("Anzahl der nicht-leeren Tracks:", nonEmptyTracks.length);
          setTracks(nonEmptyTracks);
          nonEmptyTracks.forEach((track, index) => {
            console.log(`Track ${index}:`);
            console.log(`  Instrument: ${track.instrument}`);
            console.log(`  Anzahl der Events: ${track.events.length}`);
            console.log(`  Erste 5 Events:`, track.events.slice(0, 5));
          });
        } else {
          console.error("JSON-Format ist ungültig oder keine Tracks gefunden.");
        }
      } catch (error) {
        console.error("Fehler beim Parsen der JSON-Datei:", error);
      }
    };
    reader.readAsText(file);
  };

  const playMIDI = () => {
    console.log("playMIDI aufgerufen");
    console.log("Anzahl der Tracks:", tracks.length);
    console.log("MIDI-Ausgang verfügbar:", !!midiOut);

    if (tracks.length > 0 && midiOut) {
      setIsPlaying(true);
      setIsPaused(false);

      // Verwenden Sie einen lokalen Flag für den Spielstatus
      let isCurrentlyPlaying = true;

      // Zuerst alle Kanäle zurücksetzen
      for (let i = 0; i < 16; i++) {
        console.log(`Setze Kanal ${i} zurück`);
        midiOut.send([0xb0 + i, 120, 0]); // All Sound Off
        midiOut.send([0xb0 + i, 121, 0]); // Reset All Controllers
        midiOut.send([0xc0 + i, 0]); // Program Change to default instrument
      }

      tracks.forEach((track, index) => {
        console.log(`Verarbeite Track ${index}:`, track);
        const { events, instrument } = track;
        const channel = index % 16;

        console.log(`Setze Instrument ${instrument} auf Kanal ${channel}`);
        midiOut.send([0xc0 + channel, instrument]);

        if (visualizationRefs.current[index]) {
          console.log(`Rendere Noten für Track ${index}`);
          visualizationRefs.current[index].renderNotes(track);
        }

        events.forEach((event) => {
          const timeoutId = setTimeout(() => {
            if (midiOut && isCurrentlyPlaying) {
              let modifiedEventType;

              if (event.event_type >= 0x80 && event.event_type <= 0xef) {
                modifiedEventType = (event.event_type & 0xf0) | channel;
              } else {
                modifiedEventType = event.event_type;
              }

              console.log(
                `Sende MIDI-Event für Track ${index}: [${modifiedEventType}, ${event.data1}, ${event.data2}] auf Kanal ${channel}`
              );
              midiOut.send([modifiedEventType, event.data1, event.data2]);
            } else {
              console.log(
                `MIDI-Event für Track ${index} nicht gesendet: midiOut = ${!!midiOut}, isCurrentlyPlaying = ${isCurrentlyPlaying}`
              );
            }
          }, event.time);
          midiTimeouts.current.push(timeoutId);
        });
      });

      // Funktion zum Stoppen der Wiedergabe
      const stopPlayback = () => {
        isCurrentlyPlaying = false;
        midiTimeouts.current.forEach(clearTimeout);
        midiTimeouts.current = [];
        setIsPlaying(false);
      };

      // Fügen Sie einen Event Listener hinzu, um die Wiedergabe zu stoppen, wenn der Stop-Button geklickt wird
      const stopButton = document.querySelector(".stop-button"); // Fügen Sie diese Klasse zum Stop-Button hinzu
      if (stopButton) {
        stopButton.addEventListener("click", stopPlayback);
      }
    } else {
      console.log("Keine Tracks oder kein MIDI-Ausgang verfügbar");
    }
  };

  const pauseMIDI = () => {
    setIsPaused(true);
    setIsPlaying(false);
    midiTimeouts.current.forEach(clearTimeout);
    midiTimeouts.current = [];
    // Hier könnten Sie die Visualisierung pausieren
  };

  const resumeMIDI = () => {
    setIsPlaying(true);
    setIsPaused(false);
    playMIDI(); // Vereinfacht: Startet die Wiedergabe von Anfang an
  };

  const stopMIDI = () => {
    console.log("stopMIDI aufgerufen");
    setIsPlaying(false);
    setIsPaused(false);
    midiTimeouts.current.forEach(clearTimeout);
    midiTimeouts.current = [];
    if (midiOut) {
      for (let channel = 0; channel < 16; channel++) {
        midiOut.send([0xb0 + channel, 120, 0]); // All Sound Off
        midiOut.send([0xb0 + channel, 123, 0]); // All Notes Off
        midiOut.send([0xb0 + channel, 121, 0]); // Reset All Controllers
      }
    }
    visualizationRefs.current.forEach((ref) => {
      if (ref) ref.stopNotes();
    });
  };

  const handleMidiOutputChange = (event) => {
    setSelectedMidiOutId(event.target.value);
  };

  const calculateGridConfig = (trackCount) => {
    if (trackCount <= 1) return { cols: 1, rows: 1 };
    if (trackCount <= 2) return { cols: 2, rows: 1 };
    if (trackCount <= 4) return { cols: 2, rows: 2 };
    if (trackCount <= 6) return { cols: 3, rows: 2 };
    if (trackCount <= 9) return { cols: 3, rows: 3 };
    const cols = Math.ceil(Math.sqrt(trackCount));
    const rows = Math.ceil(trackCount / cols);
    return { cols, rows };
  };

  const { cols, rows } = calculateGridConfig(tracks.length);

  return (
    <LayoutWrapper>
      <div
        className="flex flex-col justify-center items-center min-h-screen w-full bg-cover bg-center relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="controls w-full flex justify-center mb-6 space-x-4">
          <label
            htmlFor="fileUpload"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
          >
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
              value={selectedMidiOutId || ""}
              onChange={handleMidiOutputChange}
              className="bg-white text-black py-2 px-4 rounded"
            >
              {midiOutputs.map((output) => (
                <option key={output.id} value={output.id}>
                  {output.name}
                </option>
              ))}
            </select>
          )}
          {isMidiConnected && tracks.length > 0 && !isPlaying && (
            <button
              onClick={isPaused ? resumeMIDI : playMIDI}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              {isPaused ? "Resume MIDI" : "Play MIDI"}
            </button>
          )}
          {isPlaying && !isPaused && (
            <button
              onClick={pauseMIDI}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              Pause
            </button>
          )}
          {(isPlaying || isPaused) && (
            <button
              onClick={stopMIDI}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded stop-button"
            >
              Stop
            </button>
          )}
        </div>

        <p className="mb-4 text-white">{statusMessage}</p>

        <div
          className="grid gap-4 p-6 rounded-xl border-8 border-gray-800 bg-white bg-opacity-20 backdrop-blur-md"
          style={{
            width: "80vw",
            height: "80vh",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {tracks.map((track, index) => (
            <WindowComponent
              key={index}
              ref={(el) => (visualizationRefs.current[index] = el)}
              track={track}
              channel={index % 16}
            />
          ))}
        </div>
      </div>
    </LayoutWrapper>
  );
};

export default Thession;
