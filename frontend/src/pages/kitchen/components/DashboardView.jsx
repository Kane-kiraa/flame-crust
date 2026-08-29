import { useState, useEffect } from "react";
import { 
  Clock, 
  Flame, 
  CheckCircle2, 
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Utensils
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/food-api";
import { cn } from "@/lib/utils";

// Helper component for elapsed time
function ElapsedTimer({ startTime }) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const start = new Date(startTime);
      const diffInSecs = Math.floor((now - start) / 1000);
      const m = Math.floor(diffInSecs / 60);
      const s = diffInSecs % 60;
      setElapsed(`${m}:${s.toString().padStart(2, '0')}`);
    };
    calc();
    const intv = setInterval(calc, 1000);
    return () => clearInterval(intv);
  }, [startTime]);

  return <span className="font-mono">{elapsed}</span>;
}

export function DashboardView({ pendingOrders, preparingOrders, readyOrders, updateOrderStatus, onOrderClick, todayRevenue, totalOrdersToday }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6 shrink-0">
        <StatCard title="Today's Orders" value={totalOrdersToday || 0} icon={ShoppingBag} color="blue" />
        <StatCard title="Preparing" value={preparingOrders.length} icon={Flame} color="orange" />
        <StatCard title="Ready" value={readyOrders.length} icon={CheckCircle2} color="green" />
        <StatCard title="Delayed" value="0" icon={Clock} color="red" />
        <StatCard title="Avg Prep Time" value="14 min" icon={Utensils} color="indigo" />
        <StatCard title="Revenue Today" value={`$${(todayRevenue || 0).toFixed(2)}`} icon={DollarSign} color="emerald" />
      </div>

      {/* Kanban Board Columns */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        
        {/* NEW / TO PREPARE */}
        <Column 
          title="To Prepare" 
          count={pendingOrders.length} 
          icon={Clock} 
          colorClass="text-blue-500"
          bgClass="bg-blue-50 dark:bg-blue-900/20"
        >
          {pendingOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onClick={() => onOrderClick(order)}
              action={
                <Button 
                  onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, "PREPARING"); }}
                  className="w-full h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 font-bold border border-orange-200 dark:border-orange-500/20"
                >
                  <Flame className="size-4 mr-2" /> Start Preparing
                </Button>
              }
            />
          ))}
        </Column>

        {/* PREPARING */}
        <Column 
          title="Preparing" 
          count={preparingOrders.length} 
          icon={Flame} 
          colorClass="text-orange-500"
          bgClass="bg-orange-50 dark:bg-orange-900/20"
        >
          {preparingOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onClick={() => onOrderClick(order)}
              showTimer
              action={
                <Button 
                  onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, "READY"); }}
                  className="w-full h-12 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold"
                >
                  <CheckCircle2 className="size-4 mr-2" /> Mark as Ready
                </Button>
              }
            />
          ))}
        </Column>

        {/* READY */}
        <Column 
          title="Ready" 
          count={readyOrders.length} 
          icon={CheckCircle2} 
          colorClass="text-green-500"
          bgClass="bg-green-50 dark:bg-green-900/20"
        >
          {readyOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onClick={() => onOrderClick(order)}
              action={
                <div className="w-full h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center font-bold text-sm border border-slate-200 dark:border-zinc-700">
                  <ShoppingBag className="size-4 mr-2" /> Waiting for Driver
                </div>
              }
            />
          ))}
        </Column>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorMap = {
    blue: "text-blue-500 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20",
    orange: "text-orange-500 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400 border-orange-100 dark:border-orange-500/20",
    green: "text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400 border-green-100 dark:border-green-500/20",
    red: "text-red-500 bg-red-50 dark:bg-red-500/10 dark:text-red-400 border-red-100 dark:border-red-500/20",
    indigo: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{title}</span>
        <div className={cn("p-1.5 rounded-lg border", colorMap[color])}>
          <Icon className="size-4" />
        </div>
      </div>
      <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
    </div>
  );
}

function Column({ title, count, icon: Icon, colorClass, bgClass, children }) {
  return (
    <div className={cn("flex flex-col rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden transition-colors h-full", bgClass)}>
      <div className="px-5 py-4 border-b border-slate-200/60 dark:border-white/5 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md flex items-center justify-between shrink-0">
        <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <Icon className={cn("size-5", colorClass)} /> {title}
        </h2>
        <span className="bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-sm font-black px-3 py-1 rounded-full">
          {count}
        </span>
      </div>
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}

function OrderCard({ order, onClick, action, showTimer }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-white/5 cursor-pointer hover:shadow-md hover:border-orange-500/50 transition-all flex flex-col group"
    >
      <div className="flex justify-between items-start mb-3 border-b border-slate-100 dark:border-white/5 pb-3">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Order</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 leading-none">#{order.order_number || order.id}</h3>
        </div>
        <div className="text-right flex flex-col items-end">
          {showTimer ? (
             <div className="flex items-center gap-1.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-1 rounded-lg text-sm font-bold border border-orange-200 dark:border-orange-500/20">
               <Flame className="size-3.5 animate-pulse" />
               <ElapsedTimer startTime={order.updated_at || order.created_at} />
             </div>
          ) : (
            <>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Time</span>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-zinc-300">
                <Clock className="size-3.5" />
                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </>
          )}
        </div>
      </div>

      {showTimer && (
        <div className="mb-3">
           <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
             <div className="h-full bg-orange-500 rounded-full w-[60%] relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
             </div>
           </div>
           <div className="flex justify-between items-center mt-1.5">
              <span className="text-xs font-bold text-slate-500">Preparing...</span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
                 <div className="size-4 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-[8px] text-slate-600">C</div>
                 Chef Khen
              </div>
           </div>
        </div>
      )}

      <div className="flex-1 space-y-2 mb-4">
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <div className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-1.5 py-0.5 rounded text-xs font-black min-w-[24px] text-center shrink-0">
              {item.quantity}x
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-zinc-200 truncate">{item.product_name}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        {action}
      </div>
    </div>
  );
}
