
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import ActivityChart from './ActivityChart';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  users: {
    label: "Active Users",
    color: "#9b87f5"
  },
  sessions: {
    label: "Sessions",
    color: "#7E69AB"
  },
  conversions: {
    label: "Conversions",
    color: "#D6BCFA"
  }
};

const ActivitySection = () => {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <Card className="h-full bg-background/40 backdrop-blur-sm border border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-xl font-semibold">Activity Overview</CardTitle>
          <CardDescription>User engagement over time</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig}>
            <ActivityChart timeRange={timeRange} />
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivitySection;
