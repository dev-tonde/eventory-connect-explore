import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

const HeaderLogo = () => (
  <Link
    to="/"
    className="flex items-center gap-2 text-2xl font-bold text-purple-600 hover:text-purple-800 transition-colors"
    aria-label="Eventory Home"
  >
    <Calendar className="h-7 w-7" aria-hidden="true" />
    <span>Eventory</span>
  </Link>
);

export default HeaderLogo;
// This component renders the logo for the Eventory application.
// It includes a link to the home page and uses the Calendar icon from Lucide for visual appeal.
