import { Server as SocketIOServer, type Socket } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { config } from "./config/env.js";
import { verifyToken } from "./utils/jwt.js";
import type { AuthTokenPayload } from "./types/auth.js";
// Note: message.service.js is dynamically imported in socket event handlers to prevent circular ESM dependencies

let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.frontendUrl,
      credentials: true
    }
  });

  // Socket Authentication Middleware
  io.use((socket: Socket, next) => {
    let token = socket.handshake.auth?.token;

    if (!token && socket.handshake.headers?.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token && socket.handshake.headers?.cookie) {
      const match = socket.handshake.headers.cookie.match(/token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      return next(new Error("Authentication required: No token provided"));
    }

    const payload = verifyToken(token) as AuthTokenPayload | null;
    if (!payload) {
      return next(new Error("Authentication required: Invalid or expired token"));
    }

    socket.data.user = payload;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const user: AuthTokenPayload = socket.data.user;

    // Automatically join user's private notification room
    socket.join(`user:${user.userId}`);

    // Join Conversation Room with server-side authorization check
    socket.on("join_conversation", async (data: { conversationId: string }, callback) => {
      try {
        if (!data || !data.conversationId) {
          socket.emit("error", { message: "Invalid conversationId" });
          return;
        }

        const { verifyConversationMembership } = await import("./services/message.service.js");
        const isMember = await verifyConversationMembership(
          user.userId,
          data.conversationId
        );

        if (!isMember) {
          socket.emit("error", {
            message: "Forbidden: You do not belong to this conversation"
          });
          return;
        }

        socket.join(`conversation:${data.conversationId}`);

        if (typeof callback === "function") {
          callback({ success: true, conversationId: data.conversationId });
        }
      } catch (err: any) {
        socket.emit("error", { message: err.message || "Failed to join conversation" });
      }
    });

    // Leave Conversation Room
    socket.on("leave_conversation", (data: { conversationId: string }) => {
      if (data && data.conversationId) {
        socket.leave(`conversation:${data.conversationId}`);
      }
    });

    // Real-time Message Sending via WebSocket
    socket.on(
      "send_message",
      async (
        data: { conversationId: string; content: string },
        callback
      ) => {
        try {
          if (!data || !data.conversationId || !data.content) {
            socket.emit("error", { message: "Missing conversationId or content" });
            return;
          }

          const { sendMessage } = await import("./services/message.service.js");
          const message = await sendMessage(
            user.userId,
            data.conversationId,
            { content: data.content }
          );

          if (typeof callback === "function") {
            callback({ success: true, message });
          }
        } catch (err: any) {
          socket.emit("error", { message: err.message || "Failed to send message" });
        }
      }
    );

    // Typing Indicator
    socket.on(
      "typing",
      (data: { conversationId: string; isTyping: boolean }) => {
        if (data && data.conversationId) {
          socket.to(`conversation:${data.conversationId}`).emit("user_typing", {
            conversationId: data.conversationId,
            userId: user.userId,
            isTyping: Boolean(data.isTyping)
          });
        }
      }
    );

    socket.on("disconnect", () => {
      // Automatic cleanup handled by socket.io
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | null => {
  return io;
};

export const emitToConversation = (
  conversationId: string,
  event: string,
  data: any
) => {
  if (io) {
    io.to(`conversation:${conversationId}`).emit(event, data);
  }
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};
