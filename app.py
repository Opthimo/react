# app.py
import logging
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import os

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback_secret_key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://username:password@localhost/Melowee')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager(app)
bcrypt = Bcrypt(app)
CORS(app, resources={r"/*": {"origins": ["https://192.168.188.95:3000", "http://localhost:3000"]}}, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*")

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def get_id(self):
        return str(self.user_id)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))  # Hier ist user_id korrekt

@app.route('/api/register', methods=['POST'])
def register():
    app.logger.debug(f"Received registration request. Raw data: {request.data}")
    
    data = request.get_json()
    app.logger.debug(f"Parsed JSON data: {data}")
    
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    app.logger.debug(f"Extracted data - Username: {username}, Email: {email}, Password: {'*' * len(password) if password else None}")

    if not username or not email or not password:
        app.logger.warning(f"Missing required fields. Username: {username}, Email: {email}, Password: {'set' if password else 'not set'}")
        return jsonify({'message': 'Username, Email und Passwort sind erforderlich'}), 400

    user = User.query.filter_by(email=email).first()
    if user:
        app.logger.warning(f"Registration attempt with existing email: {email}")
        return jsonify({'message': 'Benutzer existiert bereits'}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    app.logger.debug(f"Creating new User object with Username: {username}, Email: {email}")
    new_user = User(username=username, email=email, password=hashed_password)
    
    app.logger.debug(f"Created new User object - Username: {new_user.username}, Email: {new_user.email}")
    
    try:
        app.logger.debug("Attempting to add new user to session")
        db.session.add(new_user)
        app.logger.debug("User added to session, attempting to commit")
        db.session.commit()
        app.logger.info(f"Successfully committed new user to database: {email}")
        login_user(new_user)
        return jsonify({'message': 'Benutzer erstellt'}), 201
    except Exception as e:
        app.logger.error(f"Error during user registration: {str(e)}")
        app.logger.error(f"Error type: {type(e).__name__}")
        db.session.rollback()
        return jsonify({'message': 'Ein Fehler ist aufgetreten'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        login_user(user)
        return jsonify({'message': 'Logged in successfully'}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/check_auth', methods=['GET'])
def check_auth():
    if current_user.is_authenticated:
        return jsonify({'user': current_user.email}), 200
    else:
        return jsonify({'user': None}), 200

@socketio.on('join_room')
@login_required
def handle_join_room(data):
    room = data['room']
    join_room(room)
    emit('user_joined', {'user': current_user.email}, room=room)

@socketio.on('leave_room')
@login_required
def handle_leave_room(data):
    room = data['room']
    leave_room(room)
    emit('user_left', {'user': current_user.email}, room=room)

@socketio.on('send_message')
@login_required
def handle_send_message(data):
    room = data['room']
    message = data['message']
    emit('receive_message', {'user': current_user.email, 'message': message}, room=room)

@app.route('/api/check_auth', methods=['GET'])
def check_auth():

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)