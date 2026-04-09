import { io } from "socket.io-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const SOCKET_BASE_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || API_BASE_URL.replace(/\/api\/?$/, "");

class ChatSocketService {
  constructor() {
    this.socket = null;
  }

  ensureSocket() {
    if (this.socket) return this.socket;

    this.socket = io(SOCKET_BASE_URL, {
      withCredentials: true,
      autoConnect: false,
    });

    return this.socket;
  }

  connect() {
    const socket = this.ensureSocket();
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  disconnect() {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  on(eventName, handler) {
    const socket = this.ensureSocket();
    socket.on(eventName, handler);
  }

  off(eventName, handler) {
    if (!this.socket) return;
    this.socket.off(eventName, handler);
  }

  emitWithAck(eventName, payload) {
    return new Promise((resolve, reject) => {
      const socket = this.connect();
      socket.emit(eventName, payload, (response) => {
        if (!response?.success) {
          reject(new Error(response?.message || "Socket request failed"));
          return;
        }

        resolve(response.data ?? null);
      });
    });
  }

  joinAppointmentChat(appointmentId) {
    return this.emitWithAck("chat:join", { appointmentId });
  }

  sendMessage(appointmentId, message) {
    return this.emitWithAck("chat:send", { appointmentId, message });
  }

  markAsRead(appointmentId) {
    return this.emitWithAck("chat:read", { appointmentId });
  }
}

export const chatSocketService = new ChatSocketService();
