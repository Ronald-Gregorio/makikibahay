
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/index';
import { Button } from '@/components/ui/index';
import { Inbox, Send, Star, Archive, Trash2, Mail, Edit, Reply, ReplyAll, Forward, ArchiveRestore, PanelLeft, X } from 'lucide-react';
import { Badge } from '@/components/ui/index';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/index';
import { Avatar, AvatarFallback } from '@/components/ui/index';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/index';
import { Input } from '@/components/ui/index';
import { Textarea } from '@/components/ui/index';
import Link from 'next/link';

import { messageService } from '@/services/api/messages';
import { useAuth } from '@/hooks/use-auth';

type Message = {
  id: string;
  from: string;
  to: string;
  email: string;
  subject: string;
  text: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  date: string;
  type: 'received' | 'sent';
  roomId: string; // Added
  listingId: any; // Added
  senderId: any;
  receiverId: any;
};

type MailboxType = 'inbox' | 'starred' | 'sent' | 'archive' | 'trash';
type ComposeMode = 'new' | 'reply' | 'reply-all' | 'forward';

interface ComposeState {
  mode: ComposeMode;
  message: any | null;
  recipient?: string;
  initialSubject?: string;
}

function InboxComponent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter(); // Added router for auth guard
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [thread, setThread] = useState<any[]>([]);
  const [composeState, setComposeState] = useState<ComposeState | null>(null);
  const [mailbox, setMailbox] = useState<MailboxType>('inbox');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await messageService.getConversations();
        setMessages(data);
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load conversations.' });
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, toast, router]);

  useEffect(() => {
    const to = searchParams.get('to');
    const subject = searchParams.get('subject');
    if (to) {
      handleCompose('new', null, to, subject || '');
    }
  }, [searchParams]);

  const unreadCount = messages.filter(m => !m.isRead && m.receiverId?._id === user?.id).length;
  const sentCount = messages.filter(m => m.senderId?._id === user?.id).length;

  const handleMessageAction = async (id: string, action: 'star' | 'archive' | 'trash' | 'read' | 'toggleStar' | 'unarchive') => {
    // Optimistic update
    setMessages(prev =>
      prev.map(m => {
        if (m._id === id) {
          switch (action) {
            case 'star': return { ...m, isStarred: !m.isStarred };
            case 'archive': return { ...m, isArchived: true };
            case 'unarchive': return { ...m, isArchived: false };
            case 'trash': return { ...m, isTrashed: true };
            case 'read': return { ...m, isRead: true };
            case 'toggleStar': return { ...m, isStarred: !m.isStarred }
          }
        }
        return m;
      })
    );

    try {
        const message = messages.find(m => m._id === id);
        if (!message) return;

        let statusUpdate: any = {};
        switch (action) {
            case 'star': 
            case 'toggleStar':
                statusUpdate.isStarred = !message.isStarred;
                break;
            case 'archive':
                statusUpdate.isArchived = true;
                break;
            case 'unarchive':
                statusUpdate.isArchived = false;
                break;
            case 'trash':
                statusUpdate.isTrashed = true;
                break;
            case 'read':
                statusUpdate.isRead = true;
                break;
        }

        await messageService.updateStatus(id, statusUpdate);
    } catch (err) {
        console.error('Failed to update message status:', err);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update message status on server.' });
        // Revert (could fetch again)
        const data = await messageService.getConversations();
        setMessages(data);
    }
  };

  const handleAddSentMessage = async (to: string, subject: string, text: string) => {
      if (!to) return;
      
      try {
          // Use current message's listingId if replying
          const listingId = selectedMessage?.listingId?._id || selectedMessage?.listingId || searchParams.get('listingId');
          const receiverId = to;
          
          await messageService.sendMessage(subject ? `[Subject: ${subject}]\n\n${text}` : text, receiverId, listingId, selectedMessage?.roomId);
          
          // Refresh conversations
          const data = await messageService.getConversations();
          setMessages(data);
      } catch (err) {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to send message.' });
      }
  };

  const getFilteredMessages = () => {
    // Current backend doesn't support archived/trashed flags in DB yet, 
    // but we'll filter locally for now if those fields exist in the normalized response.
    switch (mailbox) {
      case 'inbox':
        return messages.filter(m => m.receiverId?._id === user?.id && !m.isArchived && !m.isTrashed);
      case 'starred':
        return messages.filter(m => m.isStarred && !m.isTrashed);
      case 'sent':
        return messages.filter(m => m.senderId?._id === user?.id && !m.isTrashed);
      case 'archive':
        return messages.filter(m => m.isArchived && !m.isTrashed);
      case 'trash':
        return messages.filter(m => m.isTrashed);
      default:
        return messages;
    }
  };

  const filteredMessages = getFilteredMessages();

  const handleSelectMessage = async (message: any) => {
    setSelectedMessage(message);
    setComposeState(null);
    try {
        const threadData = await messageService.getMessagesByRoom(message.roomId);
        setThread(threadData);
    } catch (err) {
        console.error('Failed to fetch thread:', err);
    }
  };

  const handleTrash = (id: string) => {
    handleMessageAction(id, 'trash');
    toast({ title: "Message moved to Trash." });
  }

  const handleArchive = (id: string) => {
    handleMessageAction(id, 'archive');
    toast({ title: "Message Archived." });
  }

  const handleUnarchive = (id: string) => {
    handleMessageAction(id, 'unarchive');
    toast({ title: "Message moved to Inbox." });
  }

  const handleToggleStar = (id: string) => {
    const message = messages.find(m => m._id === id);
    if (message) {
      handleMessageAction(id, 'toggleStar');
      toast({ title: message.isStarred ? 'Unstarred' : 'Starred' });
    }
  }

  const handleCompose = (mode: ComposeMode, message: Message | null, recipient?: string, initialSubject?: string) => {
    setSelectedMessage(null);
    setComposeState({ mode, message, recipient, initialSubject });
  }

  const SidebarButton = ({ type, icon, label, count }: { type: MailboxType, icon: React.ReactNode, label: string, count?: number }) => {
    const buttonContent = (
      <Button
        variant={mailbox === type ? 'secondary' : 'ghost'}
        className={cn("w-full justify-start gap-2", isSidebarCollapsed && "justify-center")}
        onClick={() => {
          setMailbox(type)
          setSelectedMessage(null);
          setComposeState(null);
        }}
      >
        {icon}
        {!isSidebarCollapsed && <span>{label}</span>}
        {!isSidebarCollapsed && count !== undefined && count > 0 && <Badge className="ml-auto">{count}</Badge>}
      </Button>
    );

    if (isSidebarCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return buttonContent;
  };

  const getMessageRecipient = (message: Message) => {
    if (message.type === 'sent') return `To: ${message.to}`;
    return message.from;
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 h-[calc(100vh-112px)] flex flex-col">
      <TooltipProvider delayDuration={0}>
        <div className={cn(
          "grid gap-4 flex-grow h-full overflow-hidden transition-[grid-template-columns] duration-300",
          "md:grid-cols-[auto_1fr]",
          "lg:grid-cols-[auto_320px_1fr]",
          isSidebarCollapsed ? "lg:grid-cols-[auto_320px_1fr]" : "lg:grid-cols-[260px_320px_1fr]"
        )}>
          {/* Sidebar */}
          <aside className={cn(
            "hidden md:flex flex-col gap-2 border-r pr-4 transition-[width] duration-300",
            isSidebarCollapsed ? "w-[80px]" : "w-[260px]"
          )}>
            <div className={cn("p-2 flex items-center", isSidebarCollapsed ? "justify-center" : "justify-between")}>
              {!isSidebarCollapsed && (
                <Button className="w-full" onClick={() => handleCompose('new', null)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Compose
                </Button>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(prev => !prev)}>
                    <PanelLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <nav className={cn("p-2 space-y-1", isSidebarCollapsed && "px-0")}>
              <SidebarButton type="inbox" icon={<Inbox className="h-4 w-4" />} label="Inbox" count={unreadCount} />
              <SidebarButton type="starred" icon={<Star className="h-4 w-4" />} label="Starred" />
              <SidebarButton type="sent" icon={<Send className="h-4 w-4" />} label="Sent" count={sentCount} />
              <SidebarButton type="archive" icon={<Archive className="h-4 w-4" />} label="Archive" />
              <SidebarButton type="trash" icon={<Trash2 className="h-4 w-4" />} label="Trash" />
            </nav>
          </aside>

          {/* Message List */}
          <div className={cn(
            "border rounded-lg overflow-y-auto",
            (selectedMessage || composeState) && "hidden lg:block"
          )}>
            <div className="p-2">
              <h2 className="text-xl font-bold font-headline p-2 capitalize">{mailbox}</h2>
            </div>
            <div className="flex flex-col gap-1 p-2">
              {filteredMessages.length > 0 ? filteredMessages.map(message => (
                <button
                  key={message.id}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                    selectedMessage?.id === message.id && "bg-accent"
                  )}
                  onClick={() => handleSelectMessage(message)}
                >
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className={`font-semibold ${!message.isRead && message.type === 'received' ? 'text-foreground' : ''}`}>{getMessageRecipient(message)}</div>
                        {!message.isRead && message.type === 'received' && (
                          <span className="flex h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className={cn(
                        "ml-auto text-xs",
                        !message.isRead && message.type === 'received' ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {message.date}
                      </div>
                    </div>
                    <div className="text-xs font-medium">{message.subject}</div>
                  </div>
                  <div className="line-clamp-2 text-xs text-muted-foreground">
                    {message.text.substring(0, 300)}
                  </div>
                </button>
              )) : (
                <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center bg-gray-light/30 border border-transparent rounded-lg">
                  <div className="h-20 w-20 bg-primary-green/10 rounded-full flex items-center justify-center mb-4">
                    <Inbox className="h-8 w-8 text-primary-green" />
                  </div>
                  <h3 className="text-xl font-bold text-text-dark mb-2">Your inbox is empty</h3>
                  <p className="text-sm text-gray-text max-w-[250px] mb-6">
                    When you contact property owners or receive messages, they'll appear here in your {mailbox}.
                  </p>
                  <Button asChild className="bg-primary-green hover:bg-primary-green-hover text-white">
                    <Link href="/browse">
                      Explore Properties
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Message View / Compose */}
          <div className={cn("border rounded-lg flex flex-col",
            !(selectedMessage || composeState) && "hidden lg:flex"
          )}>
            {composeState ? (
              <ComposeView
                composeState={composeState}
                onSend={(to, subject, body) => {
                  handleAddSentMessage(to, subject, body);
                  setComposeState(null);
                }}
                onClose={() => setComposeState(null)}
              />
            ) : selectedMessage ? (
              <MessageView
                mailbox={mailbox}
                message={selectedMessage}
                onTrash={handleTrash}
                onArchive={handleArchive}
                onUnarchive={handleUnarchive}
                onToggleStar={handleToggleStar}
                onCompose={handleCompose}
              />
            ) : (
              <div className="p-8 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                <Mail className="h-10 w-10 mb-4" />
                <p>Select a message to read</p>
              </div>
            )}
          </div>

        </div>
      </TooltipProvider>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InboxComponent />
    </Suspense>
  )
}

function MessageView({ message, mailbox, onTrash, onArchive, onUnarchive, onToggleStar, onCompose }: {
  message: any,
  mailbox: MailboxType,
  onTrash: (id: string) => void,
  onArchive: (id: string) => void,
  onUnarchive: (id: string) => void,
  onToggleStar: (id: string) => void,
  onCompose: (mode: ComposeMode, message: any) => void;
}) {
  const isSentMailbox = mailbox === 'sent';
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-2 border-b">
        <div className="flex items-center gap-1">
          {mailbox === 'archive' ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onUnarchive(message._id)}><ArchiveRestore className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>Unarchive</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onArchive(message._id)} disabled={isSentMailbox}><Archive className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>Archive</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onTrash(message._id)}><Trash2 className="h-4 w-4" /></Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <div className="flex items-center gap-1 ml-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onCompose('reply', message)}><Reply className="h-4 w-4" /></Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onCompose('reply-all', message)}><ReplyAll className="h-4 w-4" /></Button>
            </TooltipTrigger>
            <TooltipContent>Reply All</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onCompose('forward', message)}><Forward className="h-4 w-4" /></Button>
            </TooltipTrigger>
            <TooltipContent>Forward</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarFallback>{message.type === 'sent' ? 'Me' : message.from.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="font-semibold">{message.type === 'sent' ? 'Me' : message.from}</p>
              <p className="text-xs text-muted-foreground">To: {message.type === 'sent' ? message.to : 'me <user@example.com>'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{message.date}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleStar(message._id)}
              disabled={isSentMailbox}
            >
              <Star className={cn("h-4 w-4", message.isStarred && "fill-primary text-primary")} />
            </Button>
          </div>
        </div>
        <Separator className="my-4" />
        <h1 className="text-2xl font-bold font-headline mb-4">{message.subject}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
          {message.text}
        </div>
      </div>
    </div>
  )
}

function ComposeView({ composeState, onSend, onClose }: { composeState: ComposeState, onSend: (to: string, subject: string, body: string) => void, onClose: () => void; }) {
  const { toast } = useToast();
  const { mode, message, recipient } = composeState;

  let to = recipient || '';
  let subject = composeState.initialSubject || '';
  let body = '';

  if (message) {
    switch (mode) {
      case 'reply':
      case 'reply-all':
        to = message.email;
        subject = message.subject.startsWith('Re:') ? message.subject : `Re: ${message.subject}`;
        body = `\n\n---- On ${message.date}, ${message.from} wrote: ----\n>${message.text.split('\n').join('\n>')}`;
        break;
      case 'forward':
        subject = `Fwd: ${message.subject}`;
        body = `\n\n---- Forwarded message ----\nFrom: ${message.from}\nDate: ${message.date}\nSubject: ${message.subject}\n\n${message.text}`;
        break;
    }
  }

  const [toState, setToState] = useState(to);
  const [subjectState, setSubjectState] = useState(subject);
  const [bodyState, setBodyState] = useState(body);

  const handleSend = () => {
    // In a real app, this would trigger an API call.
    if (!toState) {
      toast({ variant: 'destructive', title: "Cannot Send", description: "Recipient is missing." });
      return;
    }
    toast({ title: "Message Sent!", description: "Your message has been sent successfully." });
    onSend(toState, subjectState, bodyState);
  }

  let title = 'New Message';
  if (mode === 'reply' || mode === 'reply-all') title = 'Reply';
  if (mode === 'forward') title = 'Forward';

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center justify-between p-2">
        <CardTitle className="font-headline text-lg">{title}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>
      <CardContent className="space-y-4 flex-grow flex flex-col p-2 pt-4">
        <Input placeholder="To" value={toState} onChange={(e) => setToState(e.target.value)} />
        <Input placeholder="Subject" value={subjectState} onChange={(e) => setSubjectState(e.target.value)} />
        <Textarea
          placeholder="Compose your message..."
          className="flex-grow"
          value={bodyState}
          onChange={(e) => setBodyState(e.target.value)}
        />
      </CardContent>
      <div className="p-2 flex justify-end">
        <Button onClick={handleSend}>
          <Send className="mr-2 h-4 w-4" /> Send
        </Button>
      </div>
    </div>
  );
}




