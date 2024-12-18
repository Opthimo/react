from flask import Flask, json, Response
from flask_cors import CORS
import time
import random

app = Flask(__name__)
CORS(app)

@app.route('/data', methods=['GET'])
def stream_data():
    def generate_data():
        while True:
            time.sleep(1)  # Warte 1 Sekunde
            data = {"value": random.randint(1, 100)}  # Generiere zufällige Daten
            # Manuelle JSON-Konvertierung
            json_data = json.dumps(data)
            yield f"data: {json_data}\n\n"  # Sende die Daten als Server-Sent Event (SSE)
    
    return Response(generate_data(), content_type='text/event-stream')

if __name__ == '__main__':
    app.run(debug=True)
