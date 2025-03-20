import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardNav from "@/components/dashboard/DashboardNav";
import StatsSection from "@/components/dashboard/StatsSection";
import ActivitySection from "@/components/dashboard/ActivitySection";
import EventsSection from "@/components/dashboard/EventsSection";
import RecentActivitiesSection from "@/components/dashboard/RecentActivitiesSection";
import ConversionChart from "@/components/dashboard/ConversionChart";
import { ChartContainer } from "@/components/ui/chart";

const conversionChartConfig = {
  direct: {
    label: "Direct",
    color: "#9b87f5",
  },
  referral: {
    label: "Referral",
    color: "#7E69AB",
  },
  social: {
    label: "Social",
    color: "#6E59A5",
  },
  organic: {
    label: "Organic",
    color: "#D6BCFA",
  },
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-transparent pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardHeader />
        <div className="mb-8">
          <DashboardNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <StatsSection />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12 mb-2">
          <div className="lg:col-span-2">
            <ActivitySection />
          </div>
          <div className="lg:col-span-1">
            <ChartContainer config={conversionChartConfig}>
              <ConversionChart />
            </ChartContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <EventsSection />
          </div>
          <div className="lg:col-span-2">
            <RecentActivitiesSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
