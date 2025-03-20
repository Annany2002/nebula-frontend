import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: ReactNode;
}

const StatCard = ({
  title,
  value,
  change,
  isPositive,
  icon,
}: StatCardProps) => {
  return (
    <Card className="overflow-hidden bg-background/40 backdrop-blur-sm border border-white/10 transition-all hover:shadow-md hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-400">
              {value}
            </h3>
          </div>
          <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center">
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span
            className={`text-sm font-medium ${
              isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {change}
          </span>
          <span className="text-sm text-muted-foreground ml-1">
            vs last month
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
