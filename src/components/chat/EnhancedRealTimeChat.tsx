
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Users, User, Image, Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  user_id: string;
  message: string;
  message_type: string;
  image_url?: string;
  event_id?: string;
  created_at: string;
}

interface EnhancedRealTimeChatProps {
  communityId: string;
  eventId?: string;
}

const EnhancedRealTimeChat = ({ communityId, eventId }: EnhancedRealTimeChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["community-messages", communityId, eventId],
    queryFn: async () => {
      const query = supabase
        .from("community_messages")
        .select("*")
        .eq("community_id", communityId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (eventId) {
        query.eq("event_id", eventId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Message[];
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; message_type: string; image_url?: string }) => {
      const { data, error } = await supabase
        .from("community_messages")
        .insert({
          community_id: communityId,
          event_id: eventId || null,
          user_id: user?.id,
          ...messageData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;
    
    sendMessageMutation.mutate({
      message: newMessage,
      message_type: "text",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`community-${communityId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "community_messages",
          filter: `community_id=eq.${communityId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            ["community-messages", communityId, eventId],
            (old: Message[] = []) => [...old, payload.new as Message]
          );
        }
      )
      .on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState();
        const users = Object.keys(newState);
        setOnlineUsers(users);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        setOnlineUsers(prev => [...prev, key]);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setOnlineUsers(prev => prev.filter(u => u !== key));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            name: user.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [communityId, eventId, user, queryClient]);

  if (isLoading) {
    return <div>Loading messages...</div>;
  }

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
                    message.user_id === user?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      message.user_id === user?.id
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.user_id !== user?.id && (
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs font-medium">
                          User
                        </span>
                      </div>
                    )}
                    {message.image_url && (
                      <img 
                        src={message.image_url} 
                        alt="Shared image" 
                        className="max-w-full h-auto rounded mb-2"
                      />
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
            <Button variant="outline" size="sm">
              <Image className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Smile className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !newMessage.trim()}
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

export default EnhancedRealTimeChat;
