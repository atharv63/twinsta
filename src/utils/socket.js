// src/utils/socket.js
import { io } from "socket.io-client";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const socket = io(API_BASE, {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
