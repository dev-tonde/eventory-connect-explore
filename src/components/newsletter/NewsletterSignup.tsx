/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackNewsletterSignup, trackFormSubmission } from "@/lib/analytics";

// Basic email validation
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Sanitize input to prevent XSS
const sanitizeInput = (input: string) => input.replace(/[<>]/g, "").trim();

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
  "All Categories",
];

// Supabase newsletter subscription endpoint
const NEWSLETTER_API_ENDPOINT = "https://yaihbkgojeuewdacmtje.supabase.co/functions/v1/newsletter-subscribe";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [genre, setGenre] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedEmail = sanitizeInput(email);
    const sanitizedGenre = sanitizeInput(genre);

    if (!sanitizedEmail || !sanitizedGenre) {
      toast({
        title: "Missing information",
        description: "Please enter your email and select a genre.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(sanitizedEmail)) {
      toast({
        title: "Invalid email address",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Send to backend API for database storage
      const response = await fetch(NEWSLETTER_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          genre: sanitizedGenre,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe. Please try again.");
      }

      setIsSubscribed(true);
      
      // Track successful newsletter signup
      trackNewsletterSignup(sanitizedGenre);
      trackFormSubmission('newsletter_signup', true);
      
      toast({
        title: "Successfully subscribed!",
        description:
          "You'll receive our weekly newsletter with events in your preferred genre.",
      });
    } catch (error: any) {
      // Track failed newsletter signup
      trackFormSubmission('newsletter_signup', false);
      
      toast({
        title: "Subscription failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CheckCircle
                className="h-16 w-16 text-green-600 mx-auto mb-4"
                aria-hidden="true"
              />
              <CardTitle className="text-2xl text-green-800">
                Welcome to Our Newsletter!
              </CardTitle>
              <CardDescription className="text-green-600">
                You'll receive weekly updates about{" "}
                {genre === "All Categories"
                  ? "all types of events"
                  : `${genre.toLowerCase()} events`}{" "}
                in your area.
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
            <Mail
              className="h-12 w-12 text-purple-600 mx-auto mb-4"
              aria-hidden="true"
            />
            <CardTitle className="text-2xl">
              Stay Updated with Weekly Events
            </CardTitle>
            <CardDescription>
              Get personalized event recommendations delivered to your inbox
              every week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  maxLength={80}
                  autoComplete="off"
                  aria-label="Email address"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Select
                  value={genre}
                  onValueChange={setGenre}
                  disabled={loading}
                >
                  <SelectTrigger
                    className="h-12"
                    aria-label="Select event genre"
                  >
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

              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={loading}
              >
                {loading ? "Subscribing..." : "Subscribe to Newsletter"}
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
// This component provides a newsletter signup form with email validation and genre selection.
// It includes a success message upon subscription and uses localStorage to store the subscription data.
