import { Routes, Route } from "react-router-dom";
import { useAuth } from "./contexts/SimpleAuthContext";
import { useLanguage } from "./contexts/SimpleLanguageContext";

export default function App() {
  console.log("App component rendering...");
  
  const { user, isLoading } = useAuth();
  const { currentLanguage } = useLanguage();
  
  console.log("Auth state:", { user, isLoading });
  console.log("Language:", currentLanguage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Event Platform
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Language: {currentLanguage}
              </span>
              {user ? (
                <span className="text-sm text-gray-600">
                  Welcome back!
                </span>
              ) : (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={
            <div className="px-4 py-6 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome to Event Platform
                  </h2>
                  <p className="text-gray-600">
                    Your event management solution
                  </p>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}