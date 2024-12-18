// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Überprüfe den Authentifizierungsstatus beim Laden der App
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/check_auth`, { withCredentials: true });
        if (response.data.authenticated) {
          setUser({
            id: response.data.user_id,
            username: response.data.username,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Fehler beim Überprüfen der Authentifizierung:', error);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password }, { withCredentials: true });
      if (response.status === 200) {
        setUser({
          id: response.data.user_id,
          username: response.data.username,
        });
        return true;
      }
    } catch (error) {
      console.error('Login-Fehler:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.get(`${API_BASE_URL}/logout`, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('Logout-Fehler:', error);
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, { username, email, password }, { withCredentials: true });
      if (response.status === 201) {
        return true;
      }
    } catch (error) {
      console.error('Registrierungsfehler:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
