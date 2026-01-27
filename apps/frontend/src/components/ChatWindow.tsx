'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@makikibahay/ui';
import { Button } from '@makikibahay/ui';
import { Input } from '@makikibahay/ui';
import { Send, User, MessageSquare } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import type { Message } from '@makikibahay/types';

interface ChatWindowProps {
  listingId: string;
  ownerId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWindow({ listingId, ownerId, isOpen, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    const roomId = `listing_${listingId}_user_${useSession().data?.user?.id}_owner_${ownerId}`;
    socketInstance.emit('joinRoom', { roomId });

    // Listen for incoming messages
    socketInstance.on('messageReceived', (message: Message) => {
      setMessages(prev => [...prev, message]);
      // Auto-scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    // Listen for typing indicators
    socketInstance.on('typing', ({ userId, isTyping }) => {
      if (userId !== useSession().data?.user?.id) {
        setIsTyping(isTyping);
      }
    });

    socketInstance.on('messageRead', ({ messageId }) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
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
  }, [isOpen, listingId, ownerId]);

  useEffect(() => {
    if (socket && isOpen) {
      // Load message history when opening chat
      fetch(`/api/messages/${roomId}`)
        .then(res => res.json())
        .then(data => {
          setMessages(data);
        })
        .catch(error => console.error('Error loading messages:', error));
    }
  }, [socket, isOpen, listingId]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !socket) return;

    try {
      // Optimistic update - add message immediately
      const optimisticMessage: Message = {
        id: Date.now().toString(),
        roomId: `listing_${listingId}_user_${useSession().data?.user?.id}_owner_${ownerId}`,
        senderId: useSession().data?.user?.id || '',
        receiverId: ownerId,
        listingId,
        content: messageText,
        sentAt: new Date(),
        isRead: false,
      };

      setMessages(prev => [...prev, optimisticMessage]);
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageText,
          receiverId: ownerId,
          listingId
        }),
      });

      if (response.ok) {
        setMessageText('');
        // Server will emit the message via Socket.io
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (socket && isConnected) {
      const roomId = `listing_${listingId}_user_${useSession().data?.user?.id}_owner_${ownerId}`;
      socket.emit('typing', { roomId, isTyping });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 w-96 h-96 bg-surface border border border-t border-l border-r shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">Chat with Owner</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
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
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 p-3 rounded-lg ${
              message.senderId === useSession().data?.user?.id
                ? 'bg-accent/20 ml-auto'
                : 'bg-muted ml-auto'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              {message.senderId !== useSession().data?.user?.id && (
                <img
                  src={message.sender.avatar || '/placeholder-avatar.jpg'}
                  alt={message.senderId}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div>
                <div className="font-semibold text-sm">
                  {message.senderId === useSession().data?.user?.id ? 'You' : message.senderId}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(message.sentAt).toLocaleString()}
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
            onChange={(e) => setMessageText(e.target.value)}
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