import { Outlet } from "react-router-dom";

export default function POSLayout() {
  return <div className="min-h-screen flex flex-col"><header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center px-6">Top Navbar</header><main className="flex-1 overflow-hidden"><Outlet /></main></div>;
}
