import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/use-auth";
import {
  db, // Assuming 'db' is exported from your firebase.ts
  subscribeToChats,
  subscribeToMessages,
  sendMessage,
  createChat,
  firebaseApp, // Added for potential chat creation

} from "../lib/firebase"; // Adjusted path

import { doc, getDoc } from "firebase/firestore"; // For fetching user profiles


// --- Dummy Component Replacements (for environment compatibility) ---
// You should use your actual shadcn/ui components in your local development environment.
const Card = ({ className, children }: any) => <div className={`bg-white rounded-lg shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ className, children }: any) => <div className={`p-4 border-b border-gray-200 ${className}`}>{children}</div>;
const CardTitle = ({ className, children }: any) => <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
const CardContent = ({ className, children }: any) => <div className={`p-4 ${className}`}>{children}</div>;

const Button = ({ onClick, disabled, className, children, type = "button" }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    type={type}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-neutral-100 dark:data-[state=open]:bg-neutral-800
      bg-blue-600 text-white hover:bg-blue-700
      ${className}`}
  >
    {children}
  </button>
);

const Input = ({ type = "text", placeholder, value, onChange, className, disabled }: any) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
      border-gray-300 focus:ring-blue-500 ${className}`}
  />
);

const Avatar = ({ className, children }: any) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
);

// --- Dummy useToast (replace with your shadcn/ui useToast hook) ---
const useToast = () => {
  const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    console.log(`Toast: ${title} - ${description} (Variant: ${variant || 'default'})`);
    // In a real app, you'd show a visual toast notification here
  };
  return { toast };
};

// --- Lucide-react Icon Replacements (using inline SVGs) ---
const Send = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
);

const MessageCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

const User = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const Settings = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.22a2 2 0 0 0 .73 2.73l.04.02a2 2 0 0 1 .97 2.07v.44a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.22a2 2 0 0 0 .73 2.73l.04.02a2 2 0 0 1 .97 2.07v.44a2 2 0 0 0-2 2v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.22a2 2 0 0 0-.73-2.73l-.04-.02a2 2 0 0 1-.97-2.07v-.44a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.22a2 2 0 0 0-.73-2.73l-.04-.02a2 2 0 0 1-.97-2.07V2.22a2 2 0 0 0-2-2Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);


// --- Interface Definitions ---
interface Message {
  id: string; // Firebase doc ID
  text: string;
  senderId: string; // Firebase UID of sender
  senderName: string; // Display name of sender
  timestamp: Date;
  type: 'text' | 'image' | 'file'; // Message type
  isOwn?: boolean; // Indicates if the message was sent by the current user
}

interface Chat {
  id: string; // Firebase doc ID
  name: string; // Display name for the chat (e.g., other participant's name)
  participants: string[]; // Array of Firebase UIDs
  lastMessage: string;
  timestamp: Date;
  unread?: number; // Optional, can be implemented with more complex logic
}

export default function ChatPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState(""); // Renamed to avoid conflict
  const [chats, setChats] = useState<Chat[]>([]);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  // Effect to load chats for the current user
  useEffect(() => {
    if (authLoading || !user) {
      setChats([]); // Clear chats if user is not authenticated or loading
      return;
    }

    console.log(`Subscribing to chats for user: ${user.firebaseUid}`);
    const unsubscribe = subscribeToChats(user.firebaseUid!, async (fetchedChats) => {
      console.log("Fetched chats:", fetchedChats);
      const chatsWithNamesPromises = fetchedChats.map(async (chatData: any) => {
        let chatName = "Unknown Chat";
        // Find the other participant's UID in a 1-on-1 chat
        const otherParticipantUid = chatData.participants.find((p: string) => p !== user.firebaseUid);

        if (otherParticipantUid && db) {
          try {
            const otherUserDocRef = doc(db, `artifacts/${firebaseApp.appId}/public/data/users`, otherParticipantUid);
            const otherUserSnap = await getDoc(otherUserDocRef);
            if (otherUserSnap.exists()) {
              const otherUserData = otherUserSnap.data();
              chatName = otherUserData.displayName || otherUserData.username || `User: ${otherParticipantUid.substring(0, 6)}...`;
            } else {
              chatName = `User: ${otherParticipantUid.substring(0, 6)}...`;
            }
          } catch (error) {
            console.error("Error fetching other user's profile:", error);
            chatName = `Error User: ${otherParticipantUid.substring(0, 6)}...`;
          }
        } else if (chatData.participants.length > 1) {
          // Simple naming for group chats if no specific name is stored
          chatName = `Group Chat (${chatData.participants.length})`;
        } else if (chatData.participants.length === 1 && chatData.participants[0] === user.firebaseUid) {
          chatName = "My Notes"; // Self-chat
        }


        return {
          id: chatData.id,
          name: chatName,
          participants: chatData.participants,
          lastMessage: chatData.lastMessage || "No messages yet.",
          // Ensure timestamp is a Date object
          timestamp: chatData.lastMessageTime?.toDate() || chatData.createdAt?.toDate() || new Date(),
          unread: chatData.unread || 0,
        };
      });

      const processedChats = await Promise.all(chatsWithNamesPromises);
      // Sort chats by timestamp for consistent display (latest first)
      processedChats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setChats(processedChats);

      // Select the first chat if no chat is currently selected and chats are available
      if (!selectedChat && processedChats.length > 0) {
        setSelectedChat(processedChats[0]);
      } else if (selectedChat && !processedChats.some(chat => chat.id === selectedChat.id)) {
        // If the previously selected chat no longer exists, select the first available
        setSelectedChat(processedChats.length > 0 ? processedChats[0] : null);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount or user change
  }, [user, authLoading, selectedChat, firebaseApp.appId, db]); // Added db to dependencies


  // Effect to load messages for the selected chat
  useEffect(() => {
    if (!selectedChat || !user) {
      setMessages([]); // Clear messages if no chat selected or no user
      return;
    }

    console.log(`Subscribing to messages for chat: ${selectedChat.id}`);
    const unsubscribe = subscribeToMessages(selectedChat.id, (fetchedMessages) => {
      console.log("Fetched messages:", fetchedMessages);
      const mappedMessages = fetchedMessages.map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        senderId: msg.senderId,
        senderName: msg.senderName || msg.senderId,
        timestamp: msg.timestamp?.toDate() || new Date(), // Ensure it's a Date object
        isOwn: msg.senderId === user.firebaseUid,
        type: msg.type || 'text',
      }));
      setMessages(mappedMessages);
    });

    return () => unsubscribe(); // Cleanup on unmount or selectedChat change
  }, [selectedChat, user]); // Depend on selectedChat and user

  // Effect for auto-scrolling to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedChat || !user) {
      toast({
        title: "Cannot send message",
        description: "Please type a message and select a chat.",
        variant: "destructive"
      });
      return;
    }

    try {
      await sendMessage(selectedChat.id, {
        text: newMessageText,
        senderId: user.firebaseUid ?? "",
        senderName: user.displayName || user.username,
        type: 'text' // Hardcoding type as 'text' for now
      });
      setNewMessageText("");
      toast({
        title: "Message sent",
        description: "Your message has been delivered"
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 font-inter">
        <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          Loading authentication...
          <span className="animate-pulse ml-2">...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by AuthProvider redirecting to LoginScreen
    // but as a fallback, we could render a message or redirect explicitly.
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800 font-inter">
        <p>You are not authenticated. Please log in.</p>
      </div>
    );
  }

  return (
    <main className="flex h-screen bg-neutral-50 font-inter text-neutral-800">
      {/* Chat List Sidebar */}
      <div className="w-80 bg-white border-r border-neutral-200 flex flex-col shadow-md">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <Button variant="ghost" size="sm" onClick={signOut} className="bg-red-500 hover:bg-red-600 text-white">
              Sign Out
            </Button>
          </div>
          <div className="text-sm text-neutral-600 truncate">
            Logged in as: <span className="font-mono">{user.displayName || user.username}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-neutral-500">
              No chats yet. You can create one from a user list, or this might be a fresh start.
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-4 border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors ${selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {chat.name.charAt(0)}
                    </div>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-neutral-800 truncate">
                        {chat.name}
                      </h3>
                      <span className="text-xs text-neutral-500">
                        {formatTime(chat.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-neutral-600 truncate">
                        {chat.lastMessage}
                      </p>
                      {chat.unread && chat.unread > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-neutral-200 flex items-center space-x-3 shadow-sm">
              <Avatar className="w-10 h-10">
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                  {selectedChat.name.charAt(0)}
                </div>
              </Avatar>
              <div>
                <h2 className="font-medium text-neutral-800">{selectedChat.name}</h2>
                <p className="text-sm text-green-500">Active now</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-neutral-500 mt-10">
                  No messages in this chat. Start the conversation!
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${message.isOwn
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-neutral-100 text-neutral-800 rounded-bl-md'
                        }`}
                    >
                      <p>{message.text}</p>
                      <p className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-neutral-500'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} /> {/* For auto-scrolling */}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-neutral-200 shadow-md">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessageText}
                  onChange={(e: any) => setNewMessageText(e.target.value)}
                  className="flex-1 rounded-full"
                  disabled={!selectedChat || !user}
                />
                <Button type="submit" className="rounded-full w-10 h-10 p-0" disabled={!newMessageText.trim() || !selectedChat || !user}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-white">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">Welcome to Chat</h2>
              <p className="text-neutral-600">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
