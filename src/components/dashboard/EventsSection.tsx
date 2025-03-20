// import { useIntersectionObserver } from "@/lib/animations";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight } from "lucide-react";
import EventCard from "./EventCard";
import { Badge } from "@/components/ui/badge";

const EventsSection = () => {
  // const activityRef =
  //   useIntersectionObserver() as React.RefObject<HTMLDivElement>;

  const events = [
    {
      title: "Team Meeting",
      time: "Today, 2:00 PM",
      type: "meeting",
      participants: ["AJ", "BK", "CL"],
    },
    {
      title: "Project Deadline",
      time: "Tomorrow, 11:59 PM",
      type: "deadline",
      priority: "high",
    },
    {
      title: "Client Presentation",
      time: "Thursday, 10:00 AM",
      type: "presentation",
      location: "Conference Room A",
    },
    {
      title: "Product Launch",
      time: "Friday, 9:00 AM",
      type: "presentation",
      priority: "medium",
    },
  ];

  return (
    <Card className="h-full bg-background/40 backdrop-blur-sm border border-white/10">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold">
              Upcoming Events
            </CardTitle>
            <CardDescription>Your schedule for this week</CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/30"
          >
            {events.length} Events
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="space-y-3"
          // ref={activityRef}
        >
          {events.map((event, index) => (
            <EventCard
              key={index}
              title={event.title}
              time={event.time}
              type={event.type as "meeting" | "deadline" | "presentation"}
              participants={event.participants}
              location={event.location}
              priority={event.priority as "low" | "medium" | "high" | undefined}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          variant="outline"
          className="w-full mt-2 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 group flex justify-between"
        >
          <span className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
            View Calendar
          </span>
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventsSection;
