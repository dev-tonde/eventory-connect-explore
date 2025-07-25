import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Download, ExternalLink } from "lucide-react";
import { Event } from "@/types/event";
import { downloadICSFile, getGoogleCalendarUrl, getOutlookCalendarUrl } from "@/utils/calendarExport";
import { useToast } from "@/hooks/use-toast";

interface AddToCalendarProps {
  event: Event;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export default function AddToCalendar({ event, variant = "outline", size = "default" }: AddToCalendarProps) {
  const { toast } = useToast();

  const handleDownloadICS = () => {
    try {
      downloadICSFile(event);
      toast({
        title: "Calendar file downloaded",
        description: "The event has been saved as an ICS file.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download calendar file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleCalendar = () => {
    window.open(getGoogleCalendarUrl(event), '_blank');
  };

  const handleOutlookCalendar = () => {
    window.open(getOutlookCalendarUrl(event), '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Calendar className="h-4 w-4" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleGoogleCalendar} className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOutlookCalendar} className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Outlook Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadICS} className="gap-2">
          <Download className="h-4 w-4" />
          Download ICS File
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}