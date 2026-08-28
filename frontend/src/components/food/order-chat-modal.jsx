import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  MessageSquare, 
  Phone, 
  X, 
  Loader2, 
  Bike, 
  User, 
  CheckCheck, 
  Sparkles 
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOrderMessages, sendOrderMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function OrderChatModal({ 
  open, 
  onOpenChange, 
  orderId, 
  orderNumber,
  currentUser = { type: "CUSTOMER", name: "Customer" }, 
  recipient = { name: "Driver", role: "Courier Partner", phone: "" } 
}) {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const prevCountRef = useRef(0);

  const cannedReplies = currentUser.type === "CUSTOMER" 
    ? [
        "👋 Hi! How long until delivery?",
        "🏠 I am waiting downstairs.",
        "🚪 Please leave it at the gate/door.",
        "📞 Please call me when you arrive."
      ]
    : [
        "🛵 I have picked up your order and am on the way!",
        "📍 Almost there, arriving in ~5 mins.",
        "🚦 Facing some traffic, will arrive shortly.",
        "🚪 I am outside your location!"
      ];

  const fetchMessages = async () => {
    if (!orderId) return;
    try {
      const data = await getOrderMessages(orderId);
      const list = Array.isArray(data) ? data : [];
      setMessages(list);

      // Play soft sound or scroll if new message arrives
      if (list.length > prevCountRef.current) {
        if (prevCountRef.current > 0) {
          const lastMsg = list[list.length - 1];
          if (lastMsg.sender_type !== currentUser.type) {
            // Incoming message
            try {
              if ("vibrate" in navigator) navigator.vibrate(100);
            } catch (e) {}
          }
        }
        prevCountRef.current = list.length;
        scrollToBottom();
      }
    } catch (err) {
      console.error("Failed to load chat messages", err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    if (!open || !orderId) return;
    setLoading(true);
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);
    return () => clearInterval(interval);
  }, [open, orderId]);

  const handleSend = async (textToSend) => {
    const msg = (textToSend || inputMsg).trim();
    if (!msg || !orderId || sending) return;

    setSending(true);
    setInputMsg("");

    // Optimistic UI update
    const optimisticMsg = {
      id: Date.now(),
      order_id: orderId,
      sender_type: currentUser.type,
      sender_name: currentUser.name,
      message: msg,
      created_at: new Date().toISOString(),
      pending: true
    };
    setMessages(prev => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      await sendOrderMessage({
        order_id: orderId,
        sender_type: currentUser.type,
        sender_name: currentUser.name,
        sender_id: currentUser.id || null,
        message: msg
      });
      await fetchMessages();
    } catch (err) {
      toast.error("Failed to send message");
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="w-[94vw] max-w-md h-[85vh] sm:h-[620px] p-0 overflow-hidden rounded-[28px] bg-card border border-border/70 shadow-2xl flex flex-col z-[100]"
      >
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border/60 bg-secondary/30 shrink-0 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3 min-w-0">
            {recipient.photo ? (
              <img 
                src={recipient.photo} 
                alt={recipient.name} 
                className="size-10.5 rounded-full object-cover border-2 border-primary/40 shrink-0"
              />
            ) : (
              <div className="size-10.5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                {recipient.role?.toLowerCase().includes("driver") || currentUser.type === "CUSTOMER" ? (
                  <Bike className="size-5.5" />
                ) : (
                  <User className="size-5.5" />
                )}
              </div>
            )}
            <div className="min-w-0 text-left">
              <DialogTitle className="font-bold text-sm sm:text-base text-foreground truncate flex items-center gap-1.5">
                {recipient.name || "Live Chat"}
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate">
                {recipient.role || "Delivery Chat"} {orderNumber ? `• Order #${orderNumber}` : ""}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {recipient.phone && (
              <a
                href={`tel:${recipient.phone}`}
                className="size-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
                title="Call"
              >
                <Phone className="size-4" />
              </a>
            )}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-9 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="size-4.5" />
            </button>
          </div>
        </DialogHeader>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar bg-background/50">
          {loading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs">Connecting to live chat...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground space-y-2">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
                <MessageSquare className="size-6" />
              </div>
              <p className="font-bold text-sm text-foreground">Direct Message</p>
              <p className="text-xs max-w-[240px]">
                Send a message directly regarding your ongoing delivery.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_type === currentUser.type;
              return (
                <div 
                  key={m.id} 
                  className={cn(
                    "flex flex-col max-w-[82%] animate-in fade-in-50 duration-150",
                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className="flex items-center gap-1 mb-0.5 px-1">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {isMe ? "You" : m.sender_name || (m.sender_type === "DRIVER" ? "Driver" : "Customer")}
                    </span>
                    <span className="text-[9px] text-muted-foreground/60">
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>

                  <div 
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words shadow-xs",
                      isMe 
                        ? "bg-primary text-primary-foreground rounded-tr-xs" 
                        : "bg-secondary text-foreground border border-border/50 rounded-tl-xs"
                    )}
                  >
                    {m.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 pt-2 pb-1 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-border/40 bg-card/70 shrink-0">
          {cannedReplies.map((reply, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(reply)}
              disabled={sending}
              className="text-[11px] whitespace-nowrap bg-secondary/80 hover:bg-secondary text-foreground px-3 py-1 rounded-full border border-border/60 font-medium transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }} 
          className="p-3 border-t border-border/60 bg-card flex items-center gap-2 shrink-0"
        >
          <Input 
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Type a message..."
            className="rounded-full bg-secondary/40 border-border/70 text-xs sm:text-sm h-11 px-4 flex-1 focus-visible:ring-primary"
          />
          <Button 
            type="submit" 
            disabled={!inputMsg.trim() || sending}
            className="size-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-md shadow-primary/20 cursor-pointer active:scale-95"
          >
            {sending ? <Loader2 className="size-4.5 animate-spin" /> : <Send className="size-4.5" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
