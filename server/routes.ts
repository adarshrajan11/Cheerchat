import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertChatSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import { Server as SocketIOServer } from "socket.io";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/users/firebase/:uid", async (req, res) => {
    try {
      const firebaseUid = req.params.uid;
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid user data" });
      }

      const user = await storage.createUser(validation.data);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isOnline } = req.body;
      await storage.updateUserOnlineStatus(id, isOnline);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Chat routes
  app.get("/api/chats/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const chat = await storage.getChat(id);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat" });
    }
  });

  app.get("/api/users/:userId/chats", async (req, res) => {
    try {
      const userId = req.params.userId;
      const chats = await storage.getUserChats(userId);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user chats" });
    }
  });

  app.post("/api/chats", async (req, res) => {
    try {
      const validation = insertChatSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid chat data" });
      }

      const chat = await storage.createChat(validation.data);
      res.status(201).json(chat);
    } catch (error) {
      res.status(500).json({ message: "Failed to create chat" });
    }
  });

  // Message routes
  app.get("/api/chats/:chatId/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const messages = await storage.getChatMessages(chatId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/chats/:chatId/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const validation = insertMessageSchema.extend({
        chatId: z.number().optional()
      }).safeParse({ ...req.body, chatId });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid message data" });
      }

      const message = await storage.createMessage(validation.data);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.put("/api/messages/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markMessageAsRead(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup Socket.IO for real-time messaging
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-chat", (chatId) => {
      socket.join(`chat-${chatId}`);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    socket.on("send-message", async (data) => {
      try {
        const message = await storage.createMessage({
          chatId: data.chatId,
          senderId: data.senderId,
          senderName: data.senderName,
          text: data.text,
          type: data.type || "text",
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileSize: data.fileSize
        });

        // Broadcast message to all users in the chat
        io.to(`chat-${data.chatId}`).emit("new-message", message);
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("typing", (data) => {
      socket.to(`chat-${data.chatId}`).emit("user-typing", {
        userId: data.userId,
        userName: data.userName
      });
    });

    socket.on("stop-typing", (data) => {
      socket.to(`chat-${data.chatId}`).emit("user-stop-typing", {
        userId: data.userId
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return httpServer;
}
