import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MessageCircle } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { subscribeToChats } from "@/lib/firebase";
import type { Chat, User } from "@shared/schema";

interface ChatListProps {
  onChatSelect: (chatId: number) => void;
}

export default function ChatList({ onChatSelect }: ChatListProps) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!user?.firebaseUid) return;

    const unsubscribe = subscribeToChats(user.firebaseUid, (newChats) => {
      setChats(newChats);
    });

    return unsubscribe;
  }, [user?.firebaseUid]);

  useEffect(() => {
    const filtered = chats.filter(chat =>
      chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChats(filtered);
  }, [chats, searchQuery]);

  const formatTime = (date: Date | null) => {
    if (!date) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getChatDisplayName = (chat: Chat) => {
    if (chat.name) return chat.name;
    if (chat.isGroup) return "Group Chat";
    
    // For direct messages, show the other participant's name
    const otherParticipant = chat.participants.find(p => p !== user?.firebaseUid);
    return otherParticipant || "Unknown User";
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-neutral-800">Messages</h1>
          <Button size="sm" className="rounded-full w-10 h-10 p-0">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-neutral-50 border-none rounded-full"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => (
              <Card
                key={chat.id}
                className="cursor-pointer hover:bg-neutral-50 transition-colors border-none shadow-none"
                onClick={() => onChatSelect(chat.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                          {getChatDisplayName(chat).charAt(0).toUpperCase()}
                        </div>
                      </Avatar>
                      {!chat.isGroup && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-neutral-800 truncate">
                          {getChatDisplayName(chat)}
                        </h3>
                        <span className="text-xs text-neutral-500">
                          {formatTime(chat.lastMessageTime)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-neutral-600 truncate">
                        {chat.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="w-16 h-16 text-neutral-300 mb-4" />
            <h3 className="font-medium text-neutral-800 mb-2">No conversations</h3>
            <p className="text-sm text-neutral-600 mb-4">
              {searchQuery ? "No chats match your search" : "Start a new conversation to get chatting"}
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}