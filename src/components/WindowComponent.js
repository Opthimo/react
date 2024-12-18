import React, { forwardRef, useImperativeHandle, useRef } from 'react';

const WindowComponent = forwardRef(({ track, channel }, ref) => {
  const visualizationRef = useRef(null);

  useImperativeHandle(ref, () => ({
    renderNotes(track) {
      if (!visualizationRef.current) return;

      const { events, lowest_note, highest_note } = track;
      const noteOnEvents = events.filter(event => event.event_type === 144 && event.data2 > 0);
      const totalWidth = visualizationRef.current.offsetWidth;
      const totalHeight = visualizationRef.current.offsetHeight;

      const noteWidth = totalWidth / (highest_note - lowest_note + 1);

      visualizationRef.current.innerHTML = '';

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

        setTimeout(() => {
          noteElement.style.transform = `translateY(${totalHeight + height}px)`;
        }, event.time);
      });
    },
    stopNotes() {
        if (visualizationRef.current) {
          visualizationRef.current.innerHTML = '';
        }
      }
    }));

  const findNoteEndTime = (startEvent, events) => {
    const noteOffEvent = events.find(
      event =>
        event.time > startEvent.time &&
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

  return (
    <div className="p-4 bg-white shadow-md rounded-lg border-8 border-black" style={{ width: '100%', height: '100%' }}>
      <h3 className="text-center mb-2">
        {track.instrument_name} (Kanal {channel + 1})
      </h3>
      <div className="note-visualization" ref={visualizationRef} style={{ position: 'relative', width: '100%', height: 'calc(100% - 2rem)' }}>
        {/* Hier werden die Noten visualisiert */}
      </div>
    </div>
  );
});

export default WindowComponent;

