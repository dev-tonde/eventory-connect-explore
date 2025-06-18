
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [genre, setGenre] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const genres = [
    "Music",
    "Technology", 
    "Food",
    "Arts",
    "Sports",
    "Business",
    "Family",
    "Health",
    "Education",
    "All Categories"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !genre) {
      toast({
        title: "Missing information",
        description: "Please enter your email and select a genre.",
        variant: "destructive",
      });
      return;
    }

    // Store newsletter subscription in localStorage
    const newsletters = JSON.parse(localStorage.getItem('eventory_newsletters') || '[]');
    const newSubscription = {
      email,
      genre,
      subscribedAt: new Date().toISOString()
    };
    
    newsletters.push(newSubscription);
    localStorage.setItem('eventory_newsletters', JSON.stringify(newsletters));

    setIsSubscribed(true);
    toast({
      title: "Successfully subscribed!",
      description: "You'll receive our weekly newsletter with events in your preferred genre.",
    });
  };

  if (isSubscribed) {
    return (
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-green-800">Welcome to Our Newsletter!</CardTitle>
              <CardDescription className="text-green-600">
                You'll receive weekly updates about {genre === "All Categories" ? "all types of events" : `${genre.toLowerCase()} events`} in your area.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-r from-purple-50 to-blue-50 py-16">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Mail className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Stay Updated with Weekly Events</CardTitle>
            <CardDescription>
              Get personalized event recommendations delivered to your inbox every week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
              </div>
              
              <div>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your preferred event genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full h-12 text-lg">
                Subscribe to Newsletter
              </Button>
              
              <p className="text-sm text-gray-600 text-center">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default NewsletterSignup;
