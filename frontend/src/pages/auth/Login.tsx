import LoginForm from '../../components/auth/LoginForm';
import { UtensilsCrossed, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

export const Login = () => {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* LEFT PANEL - Branding (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:w-[60%] xl:w-[65%] relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900">
        {/* Animated Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
          <div className="absolute top-1/4 right-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-20 left-1/3 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '4s' }}></div>
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white shadow-xl border border-white/20">
            <UtensilsCrossed className="h-8 w-8" strokeWidth={2} />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Express Diner POS</span>
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            Enterprise Restaurant Management.
          </h1>
          <p className="text-xl text-blue-100/80 font-medium mb-12 max-w-lg leading-relaxed">
            Fast. Secure. Reliable. The premium point-of-sale platform designed to scale with your business operations.
          </p>
          
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-white/90 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold">99.99% Uptime</span>
            </div>
            <div className="flex items-center gap-2 text-white/90 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-semibold">Bank-Grade Security</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-sm font-medium">
          © 2026 Express Diner Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANEL - Authentication */}
      <div className="w-full lg:w-[40%] xl:w-[35%] flex flex-col relative bg-white dark:bg-slate-950 shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)] z-20">
        
        {/* System Status (Top Right) */}
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">System Online</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-12 animate-fade-in-up">
          <div className="w-full max-w-[460px]">
            {/* Mobile Branding (Only shows when left panel is hidden) */}
            <div className="lg:hidden flex flex-col items-center mb-10 text-center">
              <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg mb-4">
                <UtensilsCrossed className="h-8 w-8" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Express Diner POS</h2>
            </div>

            {/* Auth Card Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Welcome back</h2>
              <p className="text-[15px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Secure authentication for authorized restaurant staff. Please enter your credentials to continue.
              </p>
            </div>

            {/* Login Form */}
            <LoginForm />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 flex flex-wrap items-center justify-center gap-4 border-t border-slate-100 dark:border-slate-900">
          <span>v1.0.0 (Build 492)</span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy Policy</a>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
