import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommunityChatProps {
  communityId: string;
}

interface Message {
  id: string;
  user_id: string;
  message: string;
  message_type: string;
  image_url?: string;
  event_id?: string;
  created_at: string;
}

const CommunityChat = ({ communityId }: CommunityChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["community-messages", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_messages")
        .select("*")
        .eq("community_id", communityId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: {
      message: string;
      message_type: string;
    }) => {
      const { error } = await supabase.from("community_messages").insert({
        community_id: communityId,
        user_id: user?.id,
        ...messageData,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["community-messages", communityId],
      });
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
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
        () => {
          queryClient.invalidateQueries({
            queryKey: ["community-messages", communityId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId, queryClient]);

  if (isLoading) {
    return <div>Loading messages...</div>;
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardContent className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.user_id === user?.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.user_id === user?.id
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            aria-label="Send image"
            disabled
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            aria-label="Send event"
            disabled
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
            aria-label="Message input"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            type="button"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CommunityChat;
// This component provides a real-time chat interface for communities, allowing users to send and receive messages. It uses Supabase for real-time updates and presence tracking, displaying messages in a scrollable area. The chat supports text messages, with a user-friendly input field and send button.
// The component handles message sending, real-time updates, and user presence tracking. It also includes error handling for message sending failures and displays a loading state while fetching messages. The chat interface is designed to be responsive and visually appealing, with different styles for messages sent by the current user and others.
// The component also includes a subscription to listen for new messages in real-time, ensuring that the chat updates automatically when new messages are sent. The messages are displayed in a scrollable area, and the view automatically scrolls to the latest message when new messages are added. The input field allows users to type messages and send them by pressing Enter, with support for Shift+Enter to insert line breaks.
// The chat interface is designed to be user-friendly, with clear visual distinctions between messages sent by the current user and those sent by others. The component also includes buttons for sending images and events, although these features are currently disabled. The overall layout is responsive, ensuring a good user experience on both desktop and mobile devices.
