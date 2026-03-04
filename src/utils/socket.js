// src/utils/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// use autoConnect false if you want manual connection
const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // ensures websocket transport is used
});

export default socket;
