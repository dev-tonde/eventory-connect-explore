
import EventSearch from "@/components/search/EventSearch";

const Events = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Events</h1>
          <p className="text-gray-600">Find amazing events happening near you</p>
        </div>
        <EventSearch />
      </div>
    </div>
  );
};

export default Events;
