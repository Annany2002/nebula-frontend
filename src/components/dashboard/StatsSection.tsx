import { useIntersectionObserver } from "@/lib/animations";
import StatCard from "./StatCard";
import { Users, BarChart3, Activity, LineChart } from "lucide-react";

const StatsSection = () => {
  const statsRef = useIntersectionObserver();

  return (
    <section
      className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      ref={statsRef}
    >
      <StatCard
        title="Total Users"
        value="12,345"
        change="+12.3%"
        isPositive={true}
        icon={<Users className="text-purple-400" />}
      />
      <StatCard
        title="Revenue"
        value="$34,567"
        change="+8.7%"
        isPositive={true}
        icon={<BarChart3 className="text-indigo-400" />}
      />
      <StatCard
        title="Active Projects"
        value="42"
        change="-2.5%"
        isPositive={false}
        icon={<Activity className="text-pink-400" />}
      />
      <StatCard
        title="Conversion Rate"
        value="6.8%"
        change="+1.4%"
        isPositive={true}
        icon={<LineChart className="text-blue-400" />}
      />
    </section>
  );
};

export default StatsSection;
