import { Server } from "socket.io";
import { verifyToken } from "../helpers/jwtHelper.js";
import chatService from "../services/chatService.js";

const roomNameForAppointment = (appointmentId) =>
  `appointment_chat_${appointmentId}`;

const parseCookieValue = (cookieHeader, key) => {
  if (!cookieHeader) return null;

  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [rawKey, ...rest] = pair.trim().split("=");
    if (rawKey === key) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
};

const getSocketToken = (socket) => {
  const tokenFromAuth = socket.handshake?.auth?.token;
  if (tokenFromAuth) return tokenFromAuth;

  const cookieHeader = socket.handshake?.headers?.cookie;
  return parseCookieValue(cookieHeader, "token");
};

const socketErrorPayload = (message) => ({
  success: false,
  message,
});

export const setupChatSocket = (httpServer, corsOptions) => {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOptions.origin,
      credentials: Boolean(corsOptions.credentials),
    },
  });

  io.use((socket, next) => {
    try {
      const token = getSocketToken(socket);

      if (!token) {
        return next(new Error("Unauthorized socket connection"));
      }

      const decoded = verifyToken(token);
      socket.user = {
        id: decoded.id,
        role: decoded.role,
      };

      next();
    } catch (error) {
      next(new Error(error.message || "Unauthorized socket connection"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("chat:join", async (payload = {}, callback) => {
      try {
        const { appointmentId } = payload;

        if (!appointmentId) {
          throw new Error("appointmentId is required");
        }

        await chatService.getChatEnabledAppointmentForUser(
          socket.user.id,
          appointmentId,
        );

        const room = roomNameForAppointment(Number(appointmentId));
        await socket.join(room);

        if (typeof callback === "function") {
          callback({
            success: true,
            message: "Joined chat room",
            data: {
              appointment_id: Number(appointmentId),
              room,
            },
          });
        }
      } catch (error) {
        if (typeof callback === "function") {
          callback(socketErrorPayload(error.message || "Failed to join chat"));
        }
      }
    });

    socket.on("chat:send", async (payload = {}, callback) => {
      try {
        const { appointmentId, message } = payload;

        if (!appointmentId) {
          throw new Error("appointmentId is required");
        }

        if (typeof message !== "string" || message.trim().length === 0) {
          throw new Error("message cannot be empty");
        }

        const savedMessage = await chatService.sendMessage(
          socket.user.id,
          appointmentId,
          { message: message.trim() },
        );

        const room = roomNameForAppointment(Number(appointmentId));

        io.to(room).emit("chat:new_message", {
          success: true,
          data: savedMessage,
        });

        if (typeof callback === "function") {
          callback({
            success: true,
            message: "Message sent",
            data: savedMessage,
          });
        }
      } catch (error) {
        if (typeof callback === "function") {
          callback(
            socketErrorPayload(error.message || "Failed to send message"),
          );
        }
      }
    });

    socket.on("chat:read", async (payload = {}, callback) => {
      try {
        const { appointmentId } = payload;

        if (!appointmentId) {
          throw new Error("appointmentId is required");
        }

        const result = await chatService.markMessagesAsRead(
          socket.user.id,
          appointmentId,
        );

        const room = roomNameForAppointment(Number(appointmentId));
        io.to(room).emit("chat:messages_read", {
          success: true,
          data: {
            appointment_id: Number(appointmentId),
            user_id: Number(socket.user.id),
            updated_count: result.updated_count,
          },
        });

        if (typeof callback === "function") {
          callback({
            success: true,
            message: "Messages marked as read",
            data: result,
          });
        }
      } catch (error) {
        if (typeof callback === "function") {
          callback(
            socketErrorPayload(error.message || "Failed to mark as read"),
          );
        }
      }
    });
  });

  return io;
};
