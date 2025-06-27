
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2, BarChart3, MessageSquare } from "lucide-react";

const DashboardTools = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            AI Poster Generator
          </CardTitle>
          <CardDescription>
            Generate stunning event posters with AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => navigate("/poster-studio")}>
            Create Poster
          </Button>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Advanced Analytics
          </CardTitle>
          <CardDescription>
            Deep dive into your event performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" variant="outline">
            View Analytics
          </Button>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Community Tools
          </CardTitle>
          <CardDescription>
            Manage event communities and chat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" variant="outline">
            Manage Communities
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTools;
