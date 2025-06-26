
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

const EmptyFollowedOrganizers = () => {
  return (
    <div className="text-center py-12">
      <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">No followed organizers yet</h2>
      <p className="text-gray-500 mb-4">Start following organizers to see their events here</p>
      <Link to="/events">
        <Button>Browse Events</Button>
      </Link>
    </div>
  );
};

export default EmptyFollowedOrganizers;
