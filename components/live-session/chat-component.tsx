'use client'

import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
// Import StreamChat type. We'll infer the user type from the hook.
import { Channel, Event, StreamChat } from 'stream-chat';
import { Send, BarChartHorizontalBig } from 'lucide-react'; // Added PollChart icon

import { parseISO } from 'date-fns';
import { DateDisplay } from '../shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreatePollForm, PollFormData } from './create-poll-form'; // Import the form and its data type
import { useToast } from '@/hooks/use-toast'; // Import useToast
// Import the hook to infer its return type
import { UseCurrentUser } from '@/hooks/use-current-user';
import { PollDisplay } from './poll-display'; // Import the PollDisplay component

// Infer the user type from the hook's return value
type CurrentUserType = ReturnType<typeof UseCurrentUser>;

interface Message {
  id: string
  text: string
  sender: string
  senderImage?: string
  timestamp: Date;
  poll?: any; // Add optional poll property to message type
}

interface ChatComponentProps {
  channel: Channel;
  chatClient: StreamChat; // Add chatClient prop
  isCreator: boolean;     // Add isCreator prop
  currentUser: CurrentUserType; // Add currentUser prop
}

export function ChatComponent({ channel, chatClient, isCreator, currentUser }: ChatComponentProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false); // State for dialog
  const { toast } = useToast(); // Initialize toast

  // Subscribe to new messages
  useEffect(() => {
    if (!channel) return

    // Listen for new messages
    const handleNewMessage = (event: Event) => {
      const { message } = event
      if (!message) return;

      // Check if the message has a poll attached
      const pollData = message.poll; // Stream message object might have a 'poll' property

      setMessages((prev) => [
        ...prev,
        {
          id: message.id,
          text: message.text || '',
          sender: message.user?.name || message.user?.id || 'Unknown User',
          senderImage: message.user?.image as string | undefined,
          timestamp: message.created_at ? parseISO(message.created_at) : new Date(),
          poll: pollData, // Store poll data with the message
        },
      ]);
    };

    // Load existing messages
    const loadMessages = async () => {
      try {
        const response = await channel.watch()
        const channelMessages = response.messages || []
        setMessages(
          channelMessages.map(msg => ({
            id: msg.id,
            text: msg.text || '',
            sender: msg.user?.name || msg.user?.id || 'Unknown User',
            senderImage: msg.user?.image as string | undefined,
            timestamp: msg.created_at ? parseISO(msg.created_at) : new Date(),
            poll: msg.poll, // Include poll data when loading existing messages
          })),
        );
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()

    // Add message listener
    channel.on('message.new', handleNewMessage)

    // Cleanup
    return () => {
      channel.off('message.new', handleNewMessage)
    }
  }, [channel])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !channel) return

    try {
      await channel.sendMessage({
        text: newMessage,
      })
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  };

  // Handler for submitting the poll form
  const handleCreatePollSubmit = async (pollData: PollFormData) => {
    if (!chatClient || !currentUser?.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Chat client or user not available.',
      });
      return;
    }

    try {
      // 1. Create the poll using the chatClient
      const poll = await chatClient.createPoll({
        name: pollData.name,
        options: pollData.options,
        enforce_unique_vote: pollData.enforceUniqueVote,
        // Add other poll settings here if needed in the future
      });

      // 2. Send a message with the poll ID attached
      // Access the ID via poll.poll.id based on SDK structure
      if (!poll.poll?.id) {
        throw new Error('Poll created successfully, but poll ID is missing in the response.');
      }
      await channel.sendMessage({
        text: `📊 Poll: ${pollData.name}`, // Add context text
        poll_id: poll.poll.id, // Correctly access the nested poll ID
        // Ensure the message is associated with the creator
        user_id: currentUser.id,
      });

      toast({
        title: 'Poll Created',
        description: 'Your poll has been added to the chat.',
      });
      setIsPollDialogOpen(false); // Close the dialog on success
    } catch (error) {
      console.error('Error creating poll or sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Poll Creation Failed',
        description: error instanceof Error ? error.message : 'Could not create the poll.',
      });
    }
  };


  return (
    <div className="flex flex-col h-full bg-background border rounded-lg mt-0 md:mt-6">
      {/* Message Display Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
        {messages.map((message, index) => (
        <div key={message.id} className={`px-2 py-1 hover:bg-muted/50 rounded ${index % 2 === 0 ? 'bg-muted/30' : ''}`}>
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={message.senderImage} width={32} height={32} alt={`${message.sender}'s avatar`} />
              <AvatarFallback>{message.sender[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm">{message.sender}</span>
                <span className="text-xs text-muted-foreground">
                  <DateDisplay date={message.timestamp} format="h:mm aa" />
                </span>
              </div>
              {/* Render message text */}
              <p className="text-sm mt-0.5 text-black dark:text-muted-foreground break-words whitespace-pre-wrap">
                {message.text}
              </p>
              {/* Conditionally render PollDisplay if poll data exists */}
              {message.poll && (
                <PollDisplay
                  pollData={message.poll}
                  messageId={message.id}
                  channel={channel}
                  chatClient={chatClient}
                  currentUserId={currentUser?.id}
                  isCreator={isCreator} // Pass isCreator down
                />
              )}
            </div>
          </div>
        </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Wrapped by Dialog for the Trigger */}
      <Dialog open={isPollDialogOpen} onOpenChange={setIsPollDialogOpen}>
        <div className="border-t p-3">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Chat..."
              className="flex-1"
            />
            {/* Conditionally render Poll button for creator */}
            {isCreator && (
               <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2" aria-label="Create Poll">
                     <BarChartHorizontalBig className="h-4 w-4" />
                  </Button>
               </DialogTrigger>
            )}
            <Button variant="secondary" size="sm" className="px-2" onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Poll Creation Dialog Content */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a New Poll</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a poll for the chat.
            </DialogDescription>
          </DialogHeader>
          <CreatePollForm
            onSubmit={handleCreatePollSubmit}
            onCancel={() => setIsPollDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
