import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Send, MessageCircle, User, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  text: string;
  sender: string;
  timestamp: Date;
  isOwn: boolean;
}

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
}

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chats] = useState<Chat[]>([
    {
      id: 1,
      name: "Alice Smith",
      lastMessage: "Hey! How are you doing?",
      timestamp: new Date(),
      unread: 2
    },
    {
      id: 2,
      name: "Bob Johnson", 
      lastMessage: "Thanks for the help yesterday",
      timestamp: new Date(Date.now() - 3600000),
      unread: 0
    },
    {
      id: 3,
      name: "Team Chat",
      lastMessage: "Meeting at 3 PM today",
      timestamp: new Date(Date.now() - 7200000),
      unread: 5
    }
  ]);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedChat) {
      // Sample messages for the selected chat
      setMessages([
        {
          id: 1,
          text: "Hey! How are you doing?",
          sender: selectedChat.name,
          timestamp: new Date(Date.now() - 3600000),
          isOwn: false
        },
        {
          id: 2,
          text: "I'm doing great! Just working on some new projects. How about you?",
          sender: "You",
          timestamp: new Date(Date.now() - 3500000),
          isOwn: true
        },
        {
          id: 3,
          text: "That sounds exciting! I'd love to hear more about it sometime.",
          sender: selectedChat.name,
          timestamp: new Date(Date.now() - 3000000),
          isOwn: false
        }
      ]);
    }
  }, [selectedChat]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: "You",
      timestamp: new Date(),
      isOwn: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
    
    toast({
      title: "Message sent",
      description: "Your message has been delivered"
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className="flex h-screen bg-neutral-50">
      {/* Chat List Sidebar */}
      <div className="w-80 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-neutral-800">Messages</h1>
            <Button variant="ghost" size="sm">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-4 border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors ${
                selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
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
                    {chat.unread > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-neutral-200 flex items-center space-x-3">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.isOwn
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
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-neutral-200">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 rounded-full"
                />
                <Button type="submit" className="rounded-full w-10 h-10 p-0">
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