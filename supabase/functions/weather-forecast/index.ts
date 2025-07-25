import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherRequest {
  lat: number;
  lng: number;
  date: string; // YYYY-MM-DD format
}

interface WeatherResponse {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  description: string;
  suggestions: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

  try {
    const { lat, lng, date }: WeatherRequest = await req.json();
    
    if (!lat || !lng || !date) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: lat, lng, date' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // For demo purposes, we'll return mock weather data
    // In production, you would integrate with a real weather API like OpenWeatherMap
    const mockWeatherConditions = [
      { 
        condition: "rainy", 
        precipitation: 80, 
        temperature: 15,
        humidity: 85,
        windSpeed: 15,
        description: "Heavy rain expected throughout the day" 
      },
      { 
        condition: "cold", 
        precipitation: 10,
        temperature: 8, 
        humidity: 70,
        windSpeed: 12,
        description: "Cold weather with possible frost" 
      },
      { 
        condition: "windy", 
        precipitation: 20,
        temperature: 18,
        humidity: 65,
        windSpeed: 25, 
        description: "Strong winds with occasional gusts" 
      },
      { 
        condition: "clear", 
        precipitation: 5,
        temperature: 22, 
        humidity: 60,
        windSpeed: 8,
        description: "Clear skies and pleasant weather" 
      },
    ];
    
    // Select random condition for demo (would be actual API call in production)
    const weatherData = mockWeatherConditions[Math.floor(Math.random() * mockWeatherConditions.length)];
    
    // Generate weather-based suggestions
    const suggestions: string[] = [];
    
    if (weatherData.precipitation > 50) {
      suggestions.push("🌧️ Bring an umbrella or raincoat");
      suggestions.push("👟 Wear waterproof shoes");
      suggestions.push("🚗 Consider taking a ride instead of walking");
    }

    if (weatherData.temperature < 12) {
      suggestions.push("🧥 Bring a warm jacket or coat");
      suggestions.push("🧤 Consider gloves and warm accessories");
      suggestions.push("☕ Pack a thermos with hot drinks");
    }

    if (weatherData.windSpeed > 20) {
      suggestions.push("💨 Secure loose items and hair");
      suggestions.push("🧥 Wear wind-resistant clothing");
      suggestions.push("👓 Consider protective eyewear");
    }

    if (weatherData.temperature > 25) {
      suggestions.push("☀️ Bring sunscreen and a hat");
      suggestions.push("💧 Stay hydrated with plenty of water");
      suggestions.push("👕 Wear light, breathable clothing");
    }

    if (suggestions.length === 0) {
      suggestions.push("✨ Perfect weather for the event!");
      suggestions.push("📸 Great conditions for photos");
    }

    const response: WeatherResponse = {
      ...weatherData,
      suggestions,
    };

    console.log(`Weather forecast for ${lat}, ${lng} on ${date}:`, response);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Error in weather-forecast function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get weather forecast' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);