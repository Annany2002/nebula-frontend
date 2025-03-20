import { useSequentialAnimation } from "@/lib/animations";
import { ReactNode } from "react";

interface DashboardNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardNav = ({ activeTab, setActiveTab }: DashboardNavProps) => {
  const sequentialRef = useSequentialAnimation(
    100
  ) as React.RefObject<HTMLUListElement>; // Cast to the correct type

  return (
    <nav className="mb-8 border-b dark:border-gray-800">
      <ul className="flex gap-6" ref={sequentialRef}>
        {["overview", "analytics", "projects", "tasks", "team"].map((tab) => (
          <li key={tab}>
            <button
              className={`pb-3 px-1 font-medium capitalize transition-all ${
                activeTab === tab
                  ? "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DashboardNav;
