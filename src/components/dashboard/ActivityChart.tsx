
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from 'recharts';
import { ChartTooltipContent } from "@/components/ui/chart";

// Generate different data based on timeRange
const generateData = (timeRange: string) => {
  const dataPoints = timeRange === '7d' ? 7 : timeRange === '30d' ? 7 : 12;
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = [];
  
  for (let i = 0; i < dataPoints; i++) {
    const monthIndex = i % 12;
    const randomFactor = Math.random() * 0.4 + 0.8; // Random between 0.8 and 1.2
    
    data.push({
      name: timeRange === '7d' ? `Day ${i+1}` : months[monthIndex],
      users: Math.floor(4000 * randomFactor * (1 + i * 0.1)),
      sessions: Math.floor(2400 * randomFactor * (1 + i * 0.08)),
      conversions: Math.floor(800 * randomFactor * (1 + i * 0.12)),
    });
  }
  
  return data;
};

interface ActivityChartProps {
  timeRange: string;
}

const ActivityChart = ({ timeRange }: ActivityChartProps) => {
  const data = generateData(timeRange);

  return (
    <div className="h-[300px] w-full">
      <AreaChart 
        width={700} 
        height={300} 
        data={data} 
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#9b87f5" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7E69AB" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#7E69AB" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D6BCFA" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#D6BCFA" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#9ca3af' }}
          axisLine={{ stroke: '#4b5563', strokeWidth: 1 }}
        />
        <YAxis 
          tick={{ fill: '#9ca3af' }}
          axisLine={{ stroke: '#4b5563', strokeWidth: 1 }}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="users"
          stroke="#9b87f5"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorUsers)"
          name="Active Users"
        />
        <Area
          type="monotone"
          dataKey="sessions"
          stroke="#7E69AB"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorSessions)"
          name="Sessions"
        />
        <Area
          type="monotone"
          dataKey="conversions"
          stroke="#D6BCFA"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorConversions)"
          name="Conversions"
        />
      </AreaChart>
    </div>
  );
};

export default ActivityChart;
