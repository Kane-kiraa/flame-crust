import { useState, useEffect, useRef } from "react";
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  User, 
  Bike, 
  ShieldCheck, 
  Sparkles,
  Wifi
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Tone synthesizers using Web Audio API for ringing & connect sounds
function startRingtone() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return () => {};
    const ctx = new AudioContext();
    let isRunning = true;

    const playBeep = () => {
      if (!isRunning) return;
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.setValueAtTime(0.15, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.25);
      osc2.stop(now + 1.25);
    };

    playBeep();
    const interval = setInterval(playBeep, 3500);

    return () => {
      isRunning = false;
      clearInterval(interval);
      try { ctx.close(); } catch (e) {}
    };
  } catch (e) {
    return () => {};
  }
}

function playEndCallTone() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(425, now);
    osc.frequency.setValueAtTime(320, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {}
}

export function OnlineCallModal({
  open,
  onOpenChange,
  recipient = { name: "Partner", role: "Driver", photo: "" },
  callerType = "CUSTOMER" // "CUSTOMER" or "DRIVER"
}) {
  const [callStatus, setCallStatus] = useState("connecting"); // "connecting", "ringing", "connected", "ended"
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const stopRingRef = useRef(null);

  useEffect(() => {
    if (!open) {
      if (stopRingRef.current) stopRingRef.current();
      setCallStatus("connecting");
      setSecondsElapsed(0);
      return;
    }

    // 1. Initial Connecting (1.5s)
    const connectTimer = setTimeout(() => {
      setCallStatus("ringing");
      stopRingRef.current = startRingtone();

      // 2. Simulate pickup / answer (3.5s)
      const answerTimer = setTimeout(() => {
        if (stopRingRef.current) stopRingRef.current();
        setCallStatus("connected");
      }, 3500);

      return () => clearTimeout(answerTimer);
    }, 1500);

    return () => {
      clearTimeout(connectTimer);
      if (stopRingRef.current) stopRingRef.current();
    };
  }, [open]);

  // Call Duration Counter
  useEffect(() => {
    if (callStatus !== "connected") return;
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [callStatus]);

  const handleEndCall = () => {
    if (stopRingRef.current) stopRingRef.current();
    playEndCallTone();
    setCallStatus("ended");
    setTimeout(() => {
      onOpenChange(false);
    }, 800);
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) handleEndCall();
      else onOpenChange(val);
    }}>
      <DialogContent 
        showCloseButton={false}
        className="w-[92vw] max-w-sm p-0 overflow-hidden rounded-[36px] bg-zinc-950 text-white border border-white/15 shadow-2xl z-[120]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Online Call with {recipient.name}</DialogTitle>
          <DialogDescription>Flame & Crust High Quality In-App Voice Call</DialogDescription>
        </DialogHeader>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-red-600/30 via-orange-600/10 to-transparent pointer-events-none" />

        <div className="relative z-10 p-6 flex flex-col items-center justify-between min-h-[460px] select-none">
          {/* Top Status */}
          <div className="text-center space-y-1.5 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold text-amber-400">
              <Wifi className="size-3.5 animate-pulse text-emerald-400" />
              <span>Flame Voice HD • End-to-End</span>
            </div>
            <h3 className="text-xl font-black tracking-tight text-white pt-2">
              {recipient.name || "Delivery Partner"}
            </h3>
            <p className="text-xs text-zinc-400 font-semibold">
              {callStatus === "connecting" && "Connecting to secure line..."}
              {callStatus === "ringing" && "Ringing..."}
              {callStatus === "connected" && (
                <span className="text-emerald-400 font-mono font-bold text-sm tracking-wider">
                  {formatTimer(secondsElapsed)}
                </span>
              )}
              {callStatus === "ended" && "Call Ended"}
            </p>
          </div>

          {/* Central Pulsating Avatar */}
          <div className="relative my-6 flex items-center justify-center">
            {callStatus === "connected" && (
              <>
                <span className="absolute size-36 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
                <span className="absolute size-44 rounded-full bg-emerald-500/10 animate-pulse" />
              </>
            )}
            {callStatus === "ringing" && (
              <>
                <span className="absolute size-36 rounded-full bg-red-500/20 animate-ping opacity-75" />
                <span className="absolute size-44 rounded-full bg-amber-500/15 animate-pulse" />
              </>
            )}

            <div className="relative size-28 rounded-full ring-4 ring-white/20 p-1 bg-gradient-to-tr from-red-600 to-amber-500 shadow-2xl">
              {recipient.photo ? (
                <img 
                  src={recipient.photo} 
                  alt={recipient.name} 
                  className="size-full rounded-full object-cover shadow-inner" 
                />
              ) : (
                <div className="size-full rounded-full bg-zinc-900 text-white flex items-center justify-center">
                  <User className="size-12 text-zinc-400" />
                </div>
              )}
            </div>
          </div>

          {/* Call Controls Toolbar */}
          <div className="w-full space-y-5">
            <div className="flex items-center justify-center gap-6">
              {/* Mute Mic */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  "size-13 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-md",
                  isMuted 
                    ? "bg-red-500/20 text-red-400 border border-red-500/50" 
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                )}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="size-5.5" /> : <Mic className="size-5.5" />}
              </button>

              {/* Speaker */}
              <button
                type="button"
                onClick={() => setIsSpeaker(!isSpeaker)}
                className={cn(
                  "size-13 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-md",
                  isSpeaker 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" 
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                )}
                title={isSpeaker ? "Speaker On" : "Speaker Off"}
              >
                {isSpeaker ? <Volume2 className="size-5.5" /> : <VolumeX className="size-5.5" />}
              </button>
            </div>

            {/* End Call Button */}
            <button
              type="button"
              onClick={handleEndCall}
              className="w-full h-13 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              <PhoneOff className="size-5" />
              <span>End Call</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
