import { 
  LayoutDashboard, 
  ChefHat, 
  Users, 
  LineChart, 
  Bell, 
  Settings,
  Flame,
  CheckCircle2,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

export function KitchenSidebar({ activeView, setActiveView, user }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: Clock },
    { id: 'preparing', label: 'Preparing', icon: Flame },
    { id: 'ready', label: 'Ready', icon: CheckCircle2 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'chef-profile', label: 'Chef Profile', icon: ChefHat },
    { id: 'performance', label: 'Kitchen Performance', icon: LineChart },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 dark:bg-zinc-950 text-slate-300 flex flex-col h-[calc(100vh-env(safe-area-inset-top,0px))] border-r border-slate-800 transition-colors shrink-0 overflow-y-auto custom-scrollbar">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <ChefHat className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight leading-none">Flame & Crust</h1>
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mt-1">Kitchen Portal</p>
          </div>
        </div>
      </div>

      <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">Main Menu</div>
        {menuItems.slice(0, 4).map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
              activeView === item.id 
                ? "bg-orange-500/10 text-orange-500" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            )}
          >
            <item.icon className={cn("size-5", activeView === item.id ? "text-orange-500" : "text-slate-500")} />
            {item.label}
          </button>
        ))}

        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-6 mb-2 px-3">Management</div>
        {menuItems.slice(4).map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
              activeView === item.id 
                ? "bg-blue-500/10 text-blue-400" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            )}
          >
            <item.icon className={cn("size-5", activeView === item.id ? "text-blue-400" : "text-slate-500")} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer">
          <div className="relative">
            <div className="size-10 rounded-full bg-slate-700 border-2 border-slate-800 overflow-hidden flex items-center justify-center text-slate-300">
               {user?.name?.charAt(0) || 'C'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-green-500 border-2 border-slate-800 rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Khen Chet'}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate flex items-center gap-1">
              {user?.role_title || 'Head Chef'}
              <span className="text-green-500 ml-1">●</span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
