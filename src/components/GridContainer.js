import React, { useEffect, useState } from 'react';
import WindowComponent from './WindowComponent';  // Die Fenster-Komponente, die wir erstellen werden

function GridContainer() {
  const [jsonData, setJsonData] = useState(null);

  useEffect(() => {
    // JSON laden (du kannst hier den Pfad zu deiner JSON-Datei verwenden)
    fetch('/path/to/your.json')
      .then((response) => response.json())
      .then((data) => setJsonData(data))
      .catch((error) => console.error('Error loading JSON:', error));
  }, []);

  if (!jsonData) {
    return <div>Laden...</div>;  // Fallback, während die JSON geladen wird
  }

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <WindowComponent key={index} jsonData={jsonData} />
      ))}
    </div>
  );
}

export default GridContainer;