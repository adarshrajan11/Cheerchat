import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  photoURL: text("photo_url"),
  firebaseUid: text("firebase_uid").unique(),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  name: text("name"),
  isGroup: boolean("is_group").default(false),
  participants: text("participants").array().notNull(),
  lastMessage: text("last_message"),
  lastMessageTime: timestamp("last_message_time"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(),
  senderId: text("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  text: text("text").notNull(),
  type: text("type").notNull().default("text"), // text, image, file
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  read: boolean("read").default(false),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  displayName: true,
  photoURL: true,
  firebaseUid: true,
});

export const insertChatSchema = createInsertSchema(chats).pick({
  name: true,
  isGroup: true,
  participants: true,
  createdBy: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  chatId: true,
  senderId: true,
  senderName: true,
  text: true,
  type: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;
export type Chat = typeof chats.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
