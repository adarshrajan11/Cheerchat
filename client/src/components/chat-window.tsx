import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Paperclip, Image, Smile, MoreVertical } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { subscribeToMessages, sendMessage, uploadFile } from "@/lib/firebase";
import type { Message, Chat } from "@shared/schema";

interface ChatWindowProps {
  chat: Chat;
  onBack: () => void;
}

export default function ChatWindow({ chat, onBack }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!chat?.id) return;

    const unsubscribe = subscribeToMessages(chat.id.toString(), (newMessages) => {
      setMessages(newMessages);
    });

    return unsubscribe;
  }, [chat?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user?.firebaseUid) return;

    try {
      await sendMessage(chat.id.toString(), {
        text: newMessage,
        senderId: user.firebaseUid,
        senderName: user.displayName,
        type: 'text'
      });
      
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.firebaseUid) return;

    setUploading(true);
    try {
      const fileUrl = await uploadFile(file);
      
      await sendMessage(chat.id.toString(), {
        text: file.name,
        senderId: user.firebaseUid,
        senderName: user.displayName,
        type: file.type.startsWith('image/') ? 'image' : 'file'
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getChatDisplayName = () => {
    if (chat.name) return chat.name;
    if (chat.isGroup) return "Group Chat";
    
    const otherParticipant = chat.participants.find(p => p !== user?.firebaseUid);
    return otherParticipant || "Unknown User";
  };

  const isMyMessage = (message: Message) => message.senderId === user?.firebaseUid;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-neutral-200 bg-white sticky top-0 z-10">
        <Button variant="ghost" size="sm" className="mr-3" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center space-x-3 flex-1">
          <Avatar className="w-10 h-10">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
              {getChatDisplayName().charAt(0).toUpperCase()}
            </div>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="font-medium text-neutral-800">{getChatDisplayName()}</h2>
            <p className="text-sm text-neutral-500">
              {chat.isGroup ? `${chat.participants.length} members` : "Active now"}
            </p>
          </div>
        </div>
        
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message, index) => {
            const showDate = index === 0 || 
              new Date(message.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();
            
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="text-center text-xs text-neutral-500 mb-4">
                    {new Date(message.timestamp).toLocaleDateString()}
                  </div>
                )}
                
                <div className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${isMyMessage(message) ? 'order-2' : 'order-1'}`}>
                    {!isMyMessage(message) && !chat.isGroup && (
                      <p className="text-xs text-neutral-500 mb-1 px-3">{message.senderName}</p>
                    )}
                    
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isMyMessage(message)
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-neutral-100 text-neutral-800 rounded-bl-md'
                      }`}
                    >
                      {message.type === 'image' ? (
                        <div>
                          <img 
                            src={message.fileUrl || ''} 
                            alt={message.fileName || 'Image'} 
                            className="rounded-lg max-w-full h-auto"
                          />
                          {message.text && <p className="mt-2">{message.text}</p>}
                        </div>
                      ) : message.type === 'file' ? (
                        <div className="flex items-center space-x-2">
                          <Paperclip className="w-4 h-4" />
                          <span>{message.fileName || message.text}</span>
                        </div>
                      ) : (
                        <p>{message.text}</p>
                      )}
                    </div>
                    
                    <p className={`text-xs text-neutral-500 mt-1 px-3 ${isMyMessage(message) ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
              {getChatDisplayName().charAt(0).toUpperCase()}
            </div>
            <h3 className="font-medium text-neutral-800 mb-2">{getChatDisplayName()}</h3>
            <p className="text-sm text-neutral-600">Send a message to start the conversation</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-neutral-200 bg-white">
        {isTyping && (
          <div className="text-sm text-neutral-500 mb-2 px-2">Someone is typing...</div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="pr-20 resize-none rounded-full bg-neutral-100 border-none"
              disabled={uploading}
            />
            
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            size="sm" 
            className="rounded-full w-10 h-10 p-0"
            disabled={!newMessage.trim() || uploading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,application/pdf,.doc,.docx,.txt"
        />
      </div>
    </div>
  );
}