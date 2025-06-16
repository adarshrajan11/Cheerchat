import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import ChatList from "@/components/chat-list";
import ChatWindow from "@/components/chat-window";
import LoginScreen from "@/components/login-screen";
import type { Chat } from "@shared/schema";

function ChatApp() {
  const { user, loading } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isMobile] = useState(() => window.innerWidth < 768);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const handleChatSelect = async (chatId: number) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      if (response.ok) {
        const chat = await response.json();
        setSelectedChat(chat);
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  if (isMobile) {
    return (
      <div className="h-screen bg-neutral-50">
        {selectedChat ? (
          <ChatWindow chat={selectedChat} onBack={handleBackToList} />
        ) : (
          <ChatList onChatSelect={handleChatSelect} />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <div className="w-1/3 border-r border-neutral-200">
        <ChatList onChatSelect={handleChatSelect} />
      </div>
      <div className="flex-1">
        {selectedChat ? (
          <ChatWindow chat={selectedChat} onBack={handleBackToList} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                💬
              </div>
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">Welcome to Chat</h2>
              <p className="text-neutral-600">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <ChatApp />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
