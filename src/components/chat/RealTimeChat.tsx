
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Users, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface RealTimeChatProps {
  communityId: string;
  eventId?: string;
}

const RealTimeChat = ({ communityId, eventId }: RealTimeChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    loadMessages();
    setupRealTimeSubscription();
    
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [communityId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('community_messages')
        .select(`
          *,
          profiles:user_id (first_name, last_name)
        `)
        .eq('community_id', communityId)
        .eq('event_id', eventId || null)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading messages:', error);
        // Fallback to loading messages without profile join
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('community_messages')
          .select('*')
          .eq('community_id', communityId)
          .eq('event_id', eventId || null)
          .order('created_at', { ascending: true })
          .limit(50);

        if (fallbackError) throw fallbackError;
        setMessages(fallbackData?.map(msg => ({ ...msg, profiles: null })) || []);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load chat messages.",
        variant: "destructive",
      });
    }
  };

  const setupRealTimeSubscription = () => {
    const channel = supabase
      .channel(`community-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `community_id=eq.${communityId}`
        },
        async (payload) => {
          // Load the full message with profile data
          const { data } = await supabase
            .from('community_messages')
            .select(`
              *,
              profiles:user_id (first_name, last_name)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data]);
          } else {
            // Fallback without profile join
            setMessages(prev => [...prev, { ...payload.new as any, profiles: null }]);
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users = Object.keys(newState);
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setOnlineUsers(prev => [...prev, key]);
        toast({
          title: "User joined",
          description: `${newPresences[0]?.name || 'Someone'} joined the chat`,
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setOnlineUsers(prev => prev.filter(user => user !== key));
        toast({
          title: "User left",
          description: `${leftPresences[0]?.name || 'Someone'} left the chat`,
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && user) {
          await channel.track({
            user_id: user.id,
            name: user.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('community_messages')
        .insert([{
          community_id: communityId,
          event_id: eventId || null,
          user_id: user.id,
          message: newMessage.trim(),
          message_type: 'text'
        }]);

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <span>Live Chat</span>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <Badge variant="secondary">{onlineUsers.length} online</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.user_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      message.user_id === user?.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.user_id !== user?.id && (
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs font-medium">
                          {message.profiles?.first_name && message.profiles?.last_name 
                            ? `${message.profiles.first_name} ${message.profiles.last_name}`
                            : 'Anonymous User'
                          }
                        </span>
                      </div>
                    )}
                    <p className="text-sm">{message.message}</p>
                    <span className="text-xs opacity-70">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !newMessage.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeChat;
