import { X, Phone, MessageCircle, Clock, ShoppingBag, MapPin, ChefHat, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/food-api";
import { cn } from "@/lib/utils";

export function OrderDetailsPanel({ order, onClose, user, customers = [] }) {
  if (!order) return null;

  const customer = customers.find(c => String(c.id) === String(order.customer_id)) || null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Order #{order.order_number || order.id}
              <span className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-widest border border-orange-200 dark:border-orange-500/30">
                {order.status}
              </span>
            </h2>
            <div className="flex items-center gap-3 mt-1 text-sm font-bold text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1"><Clock className="size-4" /> {new Date(order.created_at).toLocaleString()}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {order.order_type === 'DELIVERY' ? <MapPin className="size-4 text-blue-500" /> : <ShoppingBag className="size-4 text-purple-500" />} 
                {order.order_type || 'Delivery'}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-500 rounded-full transition-colors border border-slate-200 dark:border-white/5 shadow-sm"
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-white dark:bg-zinc-950">
          
          {/* Customer Profile Section */}
          <section className="bg-slate-50 dark:bg-zinc-900 rounded-3xl p-5 border border-slate-200 dark:border-white/5 shadow-sm flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-slate-200 dark:bg-zinc-800 border-2 border-white dark:border-zinc-700 overflow-hidden shadow-sm flex items-center justify-center text-2xl font-black text-slate-400">
                {customer?.avatar ? (
                  <img src={getImageUrl(customer.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                   customer?.name ? customer.name.charAt(0).toUpperCase() : <UsersIcon className="size-8 text-slate-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{customer?.name || order.customer_name || 'Guest'}</h3>
                  {customer && (
                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30">
                      Customer
                    </span>
                  )}
                </div>
                {customer ? (
                  <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 truncate max-w-[250px]">{customer.phone} • {customer.email}</p>
                ) : (
                  <p className="text-sm font-bold text-slate-500 dark:text-zinc-400">Walk-in or Guest Customer</p>
                )}
              </div>
            </div>
            {customer && (
              <div className="flex items-center gap-2">
                <a href={`mailto:${customer.email}`} className="flex items-center justify-center rounded-xl h-10 w-10 border border-slate-200 dark:border-white/10 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                  <MessageCircle className="size-4" />
                </a>
                <a href={`tel:${customer.phone}`} className="flex items-center justify-center rounded-xl h-10 w-10 border border-slate-200 dark:border-white/10 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                  <Phone className="size-4" />
                </a>
              </div>
            )}
          </section>

          {/* Kitchen Timeline (Chef -> Order -> Customer Traceability) */}
          <section>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Order Timeline</h4>
            <div className="flex items-center justify-between relative px-2">
              <div className="absolute top-1/2 left-6 right-6 h-1 -translate-y-1/2 bg-slate-200 dark:bg-zinc-800 rounded-full z-0">
                <div className={cn("h-full bg-orange-500 rounded-full transition-all", 
                  order.status === 'PENDING' || order.status === 'CONFIRMED' ? 'w-[40%]' :
                  order.status === 'PREPARING' ? 'w-[65%]' : 
                  order.status === 'READY' || order.status === 'COMPLETED' ? 'w-[100%]' : 'w-[20%]'
                )}></div>
              </div>
              
              <TimelineStep active={order.status === 'PENDING' || order.status === 'CONFIRMED'} completed={['PREPARING', 'READY', 'COMPLETED'].includes(order.status)} title="Received" time={new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} />
              <TimelineStep active={order.status === 'CONFIRMED'} completed={['PREPARING', 'READY', 'COMPLETED'].includes(order.status)} title="Accepted" time="" />
              <TimelineStep active={order.status === 'PREPARING'} completed={['READY', 'COMPLETED'].includes(order.status)} title="Preparing" time="" />
              <TimelineStep active={order.status === 'READY'} completed={['COMPLETED'].includes(order.status)} title="Ready" time="" />
              <TimelineStep active={order.status === 'COMPLETED'} completed={order.status === 'COMPLETED'} title="Delivered" time="" />
            </div>
            
            {['PREPARING', 'READY', 'COMPLETED'].includes(order.status) && (
              <div className="mt-6 flex items-center justify-center gap-2 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl p-3">
                <ChefHat className="size-5 text-orange-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                  Assigned to <strong className="text-orange-600 dark:text-orange-400">{user?.name || 'Chef'}</strong>
                </span>
              </div>
            )}
          </section>

          {/* Food Items */}
          <section>
             <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Order Items</h4>
             <div className="space-y-4">
               {order.items?.map((item, idx) => (
                 <div key={idx} className="flex gap-4 p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm items-start">
                    <div className="size-24 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-white/5 overflow-hidden flex items-center justify-center shrink-0">
                      {item.product_image ? (
                        <img src={getImageUrl(item.product_image)} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="size-8 text-slate-300 dark:text-zinc-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <h5 className="font-bold text-lg text-slate-900 dark:text-white leading-tight truncate">{item.product_name}</h5>
                        <div className="bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-black text-lg px-3 py-1 rounded-xl shrink-0">
                          {item.quantity}x
                        </div>
                      </div>
                      
                      {item.options && item.options !== "{}" && (
                        <div className="mt-3 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Customizations:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(() => {
                              try {
                                return Object.values(JSON.parse(item.options)).map((opt, i) => (
                                   <span key={i} className="bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold px-2 py-1 rounded-md border border-slate-200 dark:border-white/5">{opt}</span>
                                ));
                              } catch (e) {
                                return <span>{String(item.options)}</span>;
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                 </div>
               ))}
             </div>
          </section>

        </div>

      </div>
    </div>
  );
}

function TimelineStep({ active, completed, title, time }) {
  return (
    <div className="flex flex-col items-center z-10 w-16">
      <div className={cn(
        "size-8 rounded-full border-4 flex items-center justify-center bg-white dark:bg-zinc-950 transition-colors",
        completed ? "border-orange-500 bg-orange-500" : active ? "border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]" : "border-slate-300 dark:border-zinc-700"
      )}>
        {completed ? <CheckCircle2 className="size-4 text-white" /> : <div className={cn("size-2.5 rounded-full", active ? "bg-orange-500" : "bg-slate-300 dark:bg-zinc-700")} />}
      </div>
      <span className={cn("text-xs font-bold mt-2 text-center", active || completed ? "text-slate-900 dark:text-white" : "text-slate-400")}>{title}</span>
      <span className="text-[10px] font-bold text-slate-400">{time}</span>
    </div>
  );
}

function UsersIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
