
import { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommunityChat from "@/components/community/CommunityChat";
import CommunityImages from "@/components/community/CommunityImages";
import CommunityHeader from "@/components/community/CommunityHeader";

const Community = () => {
  const { communityId } = useParams<{ communityId: string }>();

  if (!communityId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Community not found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <CommunityHeader communityId={communityId} />
        
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="mt-4">
            <CommunityChat communityId={communityId} />
          </TabsContent>
          
          <TabsContent value="images" className="mt-4">
            <CommunityImages communityId={communityId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;
