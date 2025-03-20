
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronRight, Eye } from "lucide-react";

const activities = [
  {
    user: {
      name: "John Doe",
      avatar: "https://github.com/shadcn.png",
      initials: "JD"
    },
    action: "Updated project \"Mobile App\"",
    status: "Completed",
    statusColor: "green",
    time: "2 hours ago"
  },
  {
    user: {
      name: "Alice Smith",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
      initials: "AS"
    },
    action: "Commented on \"API Integration\"",
    status: "In Progress",
    statusColor: "blue",
    time: "5 hours ago"
  },
  {
    user: {
      name: "Robert Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
      initials: "RJ"
    },
    action: "Added new task \"Design Review\"",
    status: "Pending",
    statusColor: "amber",
    time: "Yesterday"
  },
  {
    user: {
      name: "Maria Campbell",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
      initials: "MC"
    },
    action: "Created new project \"Dashboard\"",
    status: "Completed",
    statusColor: "green",
    time: "2 days ago"
  }
];

const RecentActivitiesSection = () => {
  return (
    <Card className="h-full bg-background/40 backdrop-blur-sm border border-white/10">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold">Recent Activities</CardTitle>
            <CardDescription>Latest user actions and system events</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1 text-purple-600 dark:text-purple-400">
            <Eye className="h-3.5 w-3.5" />
            <span>View All</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity, index) => (
                <TableRow key={index} className="transition-all hover:bg-purple-50/30 dark:hover:bg-purple-900/10">
                  <TableCell className="font-medium pl-6">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback>{activity.user.initials}</AvatarFallback>
                      </Avatar>
                      <span>{activity.user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{activity.action}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`bg-${activity.statusColor}-50 text-${activity.statusColor}-700 dark:bg-${activity.statusColor}-900/20 dark:text-${activity.statusColor}-400 border-${activity.statusColor}-200 dark:border-${activity.statusColor}-800/30`}
                    >
                      {activity.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right pr-6">{activity.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" className="w-full mt-2 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 group flex justify-between">
          <span>View All Activities</span>
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentActivitiesSection;
