'use client';
import api from '@/lib/api';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@makikibahay/ui';
import { Button } from '@makikibahay/ui';
import { Input } from '@makikibahay/ui';
import { Send, User, MessageSquare } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import type { Message } from '@makikibahay/types';

interface ChatMessage extends Message {
  sender?: {
    avatar?: string;
    name?: string;
  };
}

interface ChatWindowProps {
  listingId: string;
  ownerId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWindow({ listingId, ownerId, isOpen, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!isOpen) return;

    // Initialize Socket.io connection
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      upgrade: false,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to chat server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from chat server');
    });

    // Join room for this listing
    const roomId = `listing_${listingId}_user_${session?.user?.id}_owner_${ownerId}`;
    socketInstance.emit('joinRoom', { roomId });

    // Listen for incoming messages
    socketInstance.on('messageReceived', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      // Auto-scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    // Listen for typing indicators
    socketInstance.on('typing', ({ userId, isTyping }: { userId: string, isTyping: boolean }) => {
      if (userId !== session?.user?.id) {
        setIsTyping(isTyping);
      }
    });

    socketInstance.on('messageRead', ({ messageId }: { messageId: string }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    });

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('messageReceived');
      socketInstance.off('typing');
      socketInstance.off('messageRead');
    };
  }, [isOpen, listingId, ownerId, session?.user?.id]);

  useEffect(() => {
    if (socket && isOpen) {
      const roomId = `listing_${listingId}_user_${session?.user?.id}_owner_${ownerId}`;
      // Load message history when opening chat
      api.get<ChatMessage[]>(`/messages/${roomId}`)
        .then(data => {
          setMessages(data);
        })
        .catch(error => console.error('Error loading messages:', error));
    }
  }, [socket, isOpen, listingId, ownerId, session?.user?.id]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const roomId = `listing_${listingId}_user_${session?.user?.id}_owner_${ownerId}`;

    try {
      // Optimistic update - add message immediately
      const optimisticMessage: ChatMessage = {
        _id: Date.now().toString(),
        roomId,
        senderId: session?.user?.id || '',
        receiverId: ownerId,
        listingId,
        content: messageText,
        sentAt: new Date(),
        isRead: false,
      };

      setMessages(prev => [...prev, optimisticMessage]);

      await api.post('/messages', {
        content: messageText,
        receiverId: ownerId,
        listingId
      });

      setMessageText('');
      // Server will emit the message via Socket.io
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (socket && isConnected) {
      const roomId = `listing_${listingId}_user_${session?.user?.id}_owner_${ownerId}`;
      socket.emit('typing', { roomId, isTyping });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 w-96 h-96 bg-surface border border-t border-l border-r shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">Chat with Owner</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4" ref={messagesEndRef}>
        {messages.map((message, index) => (
          <div
            key={message._id || index}
            className={`mb-4 p-3 rounded-lg ${message.senderId === session?.user?.id
              ? 'bg-accent/20 ml-auto'
              : 'bg-muted ml-auto'
              }`}
          >
            <div className="flex items-center gap-3 mb-2">
              {message.senderId !== session?.user?.id && (
                <img
                  src={message.sender?.avatar || '/placeholder-avatar.jpg'}
                  alt={message.senderId}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div>
                <div className="font-semibold text-sm">
                  {message.senderId === session?.user?.id ? 'You' : message.senderId}
                </div>
                <div className="text-xs text-muted-foreground">
                  {message.sentAt ? new Date(message.sentAt).toLocaleString() : ''}
                </div>
              </div>
            </div>
            <p className="text-sm text-primary-text">{message.content}</p>
            {message.isRead && (
              <div className="text-xs text-muted-foreground mt-1">
                ✓ Read
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-accent" />
            <span className="text-sm text-muted-foreground">Owner is typing...</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              handleTyping(true);
            }}
            onBlur={() => handleTyping(false)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || !isConnected}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}