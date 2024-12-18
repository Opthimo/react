// src/config.js

let API_BASE_URL;
let SOCKET_URL;

const hostname = window.location.hostname;

if (hostname === 'therver.local') {
  API_BASE_URL = process.env.REACT_APP_API_BASE_URL_LOCAL || `https://${hostname}/api`;
  SOCKET_URL = process.env.REACT_APP_SOCKET_URL_LOCAL || `https://${hostname}`;
} else if (hostname === '192.168.188.95') {
  API_BASE_URL = process.env.REACT_APP_API_BASE_URL_LAN || `https://${hostname}/api`;
  SOCKET_URL = process.env.REACT_APP_SOCKET_URL_LAN || `https://${hostname}`;
} else if (hostname === '10.42.1.174') {
  API_BASE_URL = process.env.REACT_APP_API_BASE_URL_WLAN || `https://${hostname}/api`;
  SOCKET_URL = process.env.REACT_APP_SOCKET_URL_WLAN || `https://${hostname}:4000`;
} else {
  // Fallback-Werte setzen, falls keine Umgebungsvariable vorhanden ist
  API_BASE_URL = `https://therver.local/api`;
  SOCKET_URL = `https://therver.local`;
}

const config = {
  API_BASE_URL,
  SOCKET_URL,
};

export { API_BASE_URL, SOCKET_URL };