import { users, chats, messages, type User, type InsertUser, type Chat, type InsertChat, type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void>;
  
  // Chat methods
  getChat(id: number): Promise<Chat | undefined>;
  getUserChats(userId: string): Promise<Chat[]>;
  createChat(chat: InsertChat): Promise<Chat>;
  updateChatLastMessage(chatId: number, lastMessage: string): Promise<void>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getChatMessages(chatId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(messageId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chats: Map<number, Chat>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentChatId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.chats = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentChatId = 1;
    this.currentMessageId = 1;
    
    // Initialize with demo data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample users
    const user1: User = {
      id: 1,
      username: "alice",
      email: "alice@example.com",
      displayName: "Alice Smith",
      photoURL: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face",
      firebaseUid: "alice-uid",
      isOnline: true,
      lastSeen: new Date(),
      createdAt: new Date()
    };

    const user2: User = {
      id: 2,
      username: "bob",
      email: "bob@example.com",
      displayName: "Bob Johnson",
      photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      firebaseUid: "bob-uid",
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
      createdAt: new Date()
    };

    this.users.set(1, user1);
    this.users.set(2, user2);
    this.currentUserId = 3;

    // Create sample chat
    const chat1: Chat = {
      id: 1,
      name: null,
      isGroup: false,
      participants: ["alice-uid", "bob-uid"],
      lastMessage: "Hey there! How are you?",
      lastMessageTime: new Date(),
      createdBy: "alice-uid",
      createdAt: new Date()
    };

    this.chats.set(1, chat1);
    this.currentChatId = 2;

    // Create sample messages
    const message1: Message = {
      id: 1,
      chatId: 1,
      senderId: "alice-uid",
      senderName: "Alice Smith",
      text: "Hey there! How are you?",
      type: "text",
      fileUrl: null,
      fileName: null,
      fileSize: null,
      read: false,
      timestamp: new Date()
    };

    this.messages.set(1, message1);
    this.currentMessageId = 2;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      id, 
      username: insertUser.username,
      email: insertUser.email,
      displayName: insertUser.displayName,
      photoURL: insertUser.photoURL || null,
      firebaseUid: insertUser.firebaseUid || null,
      isOnline: false,
      lastSeen: null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isOnline = isOnline;
      user.lastSeen = new Date();
      this.users.set(id, user);
    }
  }

  // Chat methods
  async getChat(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    return Array.from(this.chats.values()).filter(chat => 
      chat.participants.includes(userId)
    );
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = this.currentChatId++;
    const chat: Chat = { 
      id,
      name: insertChat.name || null,
      isGroup: insertChat.isGroup || false,
      participants: insertChat.participants,
      lastMessage: null,
      lastMessageTime: null,
      createdBy: insertChat.createdBy,
      createdAt: new Date()
    };
    this.chats.set(id, chat);
    return chat;
  }

  async updateChatLastMessage(chatId: number, lastMessage: string): Promise<void> {
    const chat = this.chats.get(chatId);
    if (chat) {
      chat.lastMessage = lastMessage;
      chat.lastMessageTime = new Date();
      this.chats.set(chatId, chat);
    }
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getChatMessages(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.chatId === chatId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      id,
      chatId: insertMessage.chatId,
      senderId: insertMessage.senderId,
      senderName: insertMessage.senderName,
      text: insertMessage.text,
      type: insertMessage.type || "text",
      fileUrl: insertMessage.fileUrl || null,
      fileName: insertMessage.fileName || null,
      fileSize: insertMessage.fileSize || null,
      read: false,
      timestamp: new Date()
    };
    this.messages.set(id, message);

    // Update chat's last message
    await this.updateChatLastMessage(insertMessage.chatId, insertMessage.text);
    
    return message;
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      message.read = true;
      this.messages.set(messageId, message);
    }
  }
}

export const storage = new MemStorage();
