from flask import Flask, jsonify
import zmq
import json
import threading

app = Flask(__name__)

# Initialize ZeroMQ context and socket
context = zmq.Context()
socket = context.socket(zmq.SUB)
socket.connect('tcp://localhost:33406')
socket.setsockopt_string(zmq.SUBSCRIBE, '')

# Data storage to hold the latest skeleton and face data
latest_data = {
    "skeleton": None,
    "face": None
}

def zmq_listener():
    while True:
        # Receive the message
        message = socket.recv_string()
        
        # Check the type of message (skeleton, face, etc.)
        if "skeleton" in message:
            try:
                # Extract JSON part of the message
                data = json.loads(message.split(" ", 1)[1])
                # Access specific parts of the skeleton data, e.g., position of the SpineBase
                spine_base = data["72057594037934399"]["SpineBase"]["Position"]
                latest_data["skeleton"] = spine_base
                print(f"SpineBase Position: X: {spine_base['X']}, Y: {spine_base['Y']}, Z: {spine_base['Z']}")
            except (json.JSONDecodeError, KeyError) as e:
                print(f"Error parsing skeleton data: {e}")
        
        elif "face" in message:
            try:
                # Extract JSON part of the message
                data = json.loads(message.split(" ", 1)[1])
                # Access face expression data, e.g., 'happy' state
                face_state = data["72057594037933472"]["happy"]
                latest_data["face"] = face_state
                print(f"Face happy state: {face_state}")
            except (json.JSONDecodeError, KeyError) as e:
                print(f"Error parsing face data: {e}")

# Define an endpoint to get the latest data
@app.route('/data', methods=['GET'])
def get_data():
    return jsonify(latest_data)

if __name__ == '__main__':
    # Start the ZeroMQ listener in a separate thread
    zmq_thread = threading.Thread(target=zmq_listener)
    zmq_thread.daemon = True
    zmq_thread.start()

    # Run the Flask server
    app.run(port=5000)
