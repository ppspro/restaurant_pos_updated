import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 selection:bg-blue-500/30">
      <Outlet />
    </div>
  );
}
