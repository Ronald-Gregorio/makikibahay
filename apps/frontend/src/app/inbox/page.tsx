
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@makikibahay/ui';
import { Button } from '@makikibahay/ui';
import { Inbox, Send, Star, Archive, Trash2, Mail, Edit, Reply, ReplyAll, Forward, ArchiveRestore, PanelLeft, X } from 'lucide-react';
import { Badge } from '@makikibahay/ui';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@makikibahay/ui';
import { Avatar, AvatarFallback } from '@makikibahay/ui';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@makikibahay/ui';
import { Input } from '@makikibahay/ui';
import { Textarea } from '@makikibahay/ui';

const initialMessages = [
  {
    id: 1,
    from: 'Sunny Day',
    to: 'me',
    email: 'sunny.day@example.com',
    subject: 'Re: Inquiry for Sunshine Residences',
    text: 'Yes, the solo room is still available. Would you like to schedule a visit this weekend? I am available on Saturday from 9 AM to 5 PM.\n\nBest,\nSunny',
    isRead: false,
    isStarred: true,
    isArchived: false,
    isTrashed: false,
    date: '3:45 PM',
    type: 'received' as const,
  },
  {
    id: 2,
    from: 'Maria Maple',
    to: 'me',
    email: 'maria.maple@example.com',
    subject: 'Bed spacer slot confirmation',
    text: 'Your slot at Maple Tree Dormitory is confirmed. Please settle the reservation fee within 3 banking days to secure your spot. You can send it via GCash to 09123456789. Thank you!',
    isRead: false,
    isStarred: false,
    isArchived: false,
    isTrashed: false,
    date: '11:20 AM',
    type: 'received' as const,
  },
  {
    id: 3,
    from: 'Makikibahay Team',
    to: 'me',
    email: 'team@makikibahay.com',
    subject: 'Welcome to Makikibahay!',
    text: 'We are excited to have you on board. Start by browsing our listings or, if you are an owner, create your first listing today! Let us know if you have any questions.',
    isRead: true,
    isStarred: false,
    isArchived: true,
    isTrashed: false,
    date: 'Yesterday',
    type: 'received' as const,
  },
  {
    id: 4,
    from: 'Pat Professional',
    to: 'me',
    email: 'pat.pro@example.com',
    subject: 'Viewing Schedule for The Professional\'s Pad',
    text: 'The unit is available for viewing this Saturday at 2 PM. Let me know if this works for you. The address is 789 Gen. Tinio St, Cabanatuan City.',
    isRead: true,
    isStarred: false,
    isArchived: false,
    isTrashed: false,
    date: 'May 28',
    type: 'received' as const,
  },
];

type Message = {
  id: number;
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
};
type MailboxType = 'inbox' | 'starred' | 'sent' | 'archive' | 'trash';
type ComposeMode = 'new' | 'reply' | 'reply-all' | 'forward';
interface ComposeState {
  mode: ComposeMode;
  message: Message | null;
  recipient?: string;
}

function InboxComponent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeState, setComposeState] = useState<ComposeState | null>(null);
  const [mailbox, setMailbox] = useState<MailboxType>('inbox');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const to = searchParams.get('to');
    if (to) {
      handleCompose('new', null, to);
    }
  }, [searchParams]);

  const unreadCount = messages.filter(m => !m.isRead && !m.isArchived && !m.isTrashed && m.type === 'received').length;
  const sentCount = messages.filter(m => m.type === 'sent' && !m.isTrashed).length;

  const handleMessageAction = (id: number, action: 'star' | 'archive' | 'trash' | 'read' | 'toggleStar' | 'unarchive') => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === id) {
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

    if (action === 'archive' || action === 'trash' || action === 'unarchive') {
      setSelectedMessage(null); // Deselect message after action
    }
  };

  const handleAddSentMessage = (to: string, subject: string, text: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      from: 'me',
      to: to,
      email: to,
      subject: subject,
      text: text,
      isRead: true,
      isStarred: false,
      isArchived: false,
      isTrashed: false,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'sent',
    };
    setMessages(prev => [newMessage, ...prev]);
  };

  const getFilteredMessages = () => {
    switch (mailbox) {
      case 'inbox':
        return messages.filter(m => m.type === 'received' && !m.isArchived && !m.isTrashed);
      case 'starred':
        return messages.filter(m => m.isStarred && !m.isTrashed);
      case 'sent':
        return messages.filter(m => m.type === 'sent' && !m.isTrashed);
      case 'archive':
        return messages.filter(m => m.isArchived && !m.isTrashed);
      case 'trash':
        return messages.filter(m => m.isTrashed);
      default:
        return [];
    }
  };

  const filteredMessages = getFilteredMessages();

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    setComposeState(null);
    if (!message.isRead) {
      handleMessageAction(message.id, 'read');
    }
  };

  const handleTrash = (id: number) => {
    handleMessageAction(id, 'trash');
    toast({ title: "Message moved to Trash." });
  }

  const handleArchive = (id: number) => {
    handleMessageAction(id, 'archive');
    toast({ title: "Message Archived." });
  }

  const handleUnarchive = (id: number) => {
    handleMessageAction(id, 'unarchive');
    toast({ title: "Message moved to Inbox." });
  }

  const handleToggleStar = (id: number) => {
    const message = messages.find(m => m.id === id);
    if (message) {
      handleMessageAction(id, 'toggleStar');
      toast({ title: message.isStarred ? 'Unstarred' : 'Starred' });
    }
  }

  const handleCompose = (mode: ComposeMode, message: Message | null, recipient?: string) => {
    setSelectedMessage(null);
    setComposeState({ mode, message, recipient });
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
                <div className="text-center text-muted-foreground p-8">
                  <p>No messages in {mailbox}.</p>
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
  message: Message,
  mailbox: MailboxType,
  onTrash: (id: number) => void,
  onArchive: (id: number) => void,
  onUnarchive: (id: number) => void,
  onToggleStar: (id: number) => void,
  onCompose: (mode: ComposeMode, message: Message) => void;
}) {
  const isSentMailbox = mailbox === 'sent';
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-2 border-b">
        <div className="flex items-center gap-1">
          {mailbox === 'archive' ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onUnarchive(message.id)}><ArchiveRestore className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>Unarchive</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onArchive(message.id)} disabled={isSentMailbox}><Archive className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>Archive</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onTrash(message.id)}><Trash2 className="h-4 w-4" /></Button>
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
              onClick={() => onToggleStar(message.id)}
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
  let subject = '';
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




