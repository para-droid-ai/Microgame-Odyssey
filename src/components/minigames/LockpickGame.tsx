import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export function LockpickGame({ onComplete }: { onComplete: (result: any) => void }) {
  const [stage, setStage] = useState(0); // 0, 1, 2 (3 locks)
  const maxStages = 3;
  const [angle, setAngle] = useState(0);
  const [complete, setComplete] = useState(false);
  const rafRef = useRef(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Level configuration
  const speeds = [150, 250, 350]; // degrees per second
  const wedgeSizes = [45, 30, 20]; // degrees
  const wedgeStarts = useRef([
     Math.random() * 360,
     Math.random() * 360,
     Math.random() * 360
  ]);

  useEffect(() => {
    let lastTime = performance.now();
    const loop = (time: number) => {
      if (complete) return;
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      setAngle(a => (a + speeds[Math.min(stage, 2)] * dt) % 360);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stage, complete]);

  const handleAction = () => {
    if (complete) return;

    // Check if needle is inside wedge
    const wedgeStart = wedgeStarts.current[stage];
    const wedgeEnd = (wedgeStart + wedgeSizes[stage]) % 360;

    // Handle wrap around 360
    let isHit = false;
    if (wedgeEnd > wedgeStart) {
       isHit = angle >= wedgeStart && angle <= wedgeEnd;
    } else {
       isHit = angle >= wedgeStart || angle <= wedgeEnd;
    }

    if (isHit) {
       if (stage + 1 >= maxStages) {
          // Win
          setComplete(true);
          setFeedback("UNLOCKED");
          setTimeout(() => onComplete({ tier: 'perfect' }), 1000);
       } else {
          setStage(s => s + 1);
          setFeedback("TUMBLER SET");
          setTimeout(() => setFeedback(null), 500);
       }
    } else {
       // Fail immediately
       setComplete(true);
       setFeedback("JAMMED");
       setTimeout(() => onComplete({ tier: 'fail' }), 1000);
    }
  };

  const wedgeStart = wedgeStarts.current[Math.min(stage, 2)];
  const wedgeSize = wedgeSizes[Math.min(stage, 2)];

  return (
    <div className="flex flex-col items-center justify-center p-8 select-none font-sans" onPointerDown={handleAction}>
       <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-widest italic">Tumbler</h3>

       <div className="relative w-48 h-48 rounded-full border-4 border-zinc-800 bg-zinc-950 shadow-inner flex items-center justify-center">
          {/* Safe Wedge visualization using conic gradient */}
          <div
             className="absolute inset-2 rounded-full opacity-50 pointer-events-none transition-all duration-300"
             style={{
                background: `conic-gradient(from ${wedgeStart}deg, transparent 0deg, #10b981 0deg, #10b981 ${wedgeSize}deg, transparent ${wedgeSize}deg)`
             }}
          />

          {/* Rotating Needle */}
          <div
            className="absolute top-1/2 left-1/2 w-1 bg-amber-400 origin-bottom shadow-[0_0_10px_rgba(251,191,36,0.8)]"
            style={{
                height: '45%',
                transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                marginTop: '1px' // visual tweak
            }}
          />

          {/* Center Hub */}
          <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-600 z-10 flex items-center justify-center">
             <span className="text-xs font-mono text-zinc-400">{stage}/{maxStages}</span>
          </div>
       </div>

       <div className="h-10 mt-8 flex items-center justify-center">
          {feedback && (
             <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                className={cn(
                   "font-black uppercase tracking-widest",
                   feedback === 'JAMMED' ? 'text-red-500' : 'text-emerald-400'
                )}
             >
                {feedback}
             </motion.div>
          )}
       </div>
    </div>
  );
}
