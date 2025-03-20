import {
  Calendar,
  Users,
  BarChart3,
  Activity,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";

interface EventCardProps {
  title: string;
  time: string;
  type: "meeting" | "deadline" | "presentation";
  participants?: string[];
  location?: string;
  priority?: "low" | "medium" | "high";
}

const EventCard = ({
  title,
  time,
  type,
  participants,
  location,
  priority,
}: EventCardProps) => {
  const getBgColor = () => {
    switch (type) {
      case "meeting":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30";
      case "deadline":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30";
      case "presentation":
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800/30";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "meeting":
        return <Users className="h-5 w-5 text-blue-500" />;
      case "deadline":
        return <Calendar className="h-5 w-5 text-red-500" />;
      case "presentation":
        return <BarChart3 className="h-5 w-5 text-purple-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-amber-500";
      case "low":
        return "text-green-500";
      default:
        return "hidden";
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border ${getBgColor()} hover:shadow-md transition-all hover:-translate-y-0.5`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        <div className="flex-grow">
          <div className="flex justify-between">
            <h4 className="font-medium">{title}</h4>
            {priority && (
              <AlertTriangle className={`h-4 w-4 ${getPriorityColor()}`} />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{time}</p>

          {(participants || location) && (
            <div className="flex flex-wrap gap-3 mt-2 text-xs">
              {participants && participants.length > 0 && (
                <div className="flex items-center">
                  <AvatarGroup>
                    {participants.map((participant, index) => (
                      <Avatar
                        key={index}
                        className="h-6 w-6 border-2 border-white dark:border-gray-800"
                      >
                        <AvatarFallback className="text-[10px]">
                          {participant}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </div>
              )}

              {location && (
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
