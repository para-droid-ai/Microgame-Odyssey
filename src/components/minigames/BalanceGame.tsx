import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function BalanceGame({ onComplete }: { onComplete: (result: any) => void }) {
  const duration = 5000;
  const targetTime = 3000; // Need 3 seconds total in the safe zone
  const [complete, setComplete] = useState(false);
  const [safeTime, setSafeTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const rafRef = useRef(0);
  const startTime = useRef(performance.now());
  const [feedback, setFeedback] = useState<string | null>(null);

  // Position 0 to 1
  const [indicatorPos, setIndicatorPos] = useState(0.5);
  // Velocity
  const velocity = useRef(0);
  const isPressing = useRef(false);

  // Safe zone bounds (0.35 to 0.65 is center 30%)
  const safeMin = 0.35;
  const safeMax = 0.65;

  useEffect(() => {
    let lastTime = performance.now();
    const loop = (time: number) => {
      if (complete) return;

      const dt = time - lastTime;
      lastTime = time;

      const elapsed = time - startTime.current;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      // Gravity pulls left
      if (isPressing.current) {
         velocity.current += 0.0015 * dt; // tap pushes right
      } else {
         velocity.current -= 0.001 * dt; // gravity pulls left
      }

      // Apply friction/drag
      velocity.current *= 0.92;

      setIndicatorPos(prev => {
        let next = prev + velocity.current * (dt / 16);
        // Bounce off walls
        if (next < 0) { next = 0; velocity.current *= -0.5; }
        if (next > 1) { next = 1; velocity.current *= -0.5; }
        return next;
      });

      // Update safe time
      setIndicatorPos(pos => {
         if (pos >= safeMin && pos <= safeMax) {
             setSafeTime(s => s + dt);
         }
         return pos;
      });

      if (remaining === 0) {
        setComplete(true);
      } else {
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [complete]);

  useEffect(() => {
    if (complete) {
       let tier = 'fail';
       if (safeTime >= targetTime * 0.9) tier = 'perfect'; // 90% of target
       else if (safeTime >= targetTime * 0.6) tier = 'good'; // 60%
       else if (safeTime >= targetTime * 0.3) tier = 'partial';

       setFeedback(tier.toUpperCase());
       setTimeout(() => onComplete({ tier }), 1500);
    }
  }, [complete, safeTime, targetTime, onComplete]);

  return (
    <div
      className="flex flex-col items-center justify-center p-8 select-none w-full max-w-md font-sans touch-none"
      onPointerDown={() => isPressing.current = true}
      onPointerUp={() => isPressing.current = false}
      onPointerLeave={() => isPressing.current = false}
    >
      <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest italic flex items-center justify-between w-full">
         EQUILIBRIUM <span className="text-sky-400 font-mono text-xl">{(timeLeft / 1000).toFixed(2)}</span>
      </h3>

      <p className="text-zinc-400 mb-8 font-mono text-sm uppercase">Tap/Hold to counter gravity</p>

      <div className="relative w-full h-16 bg-zinc-950 border-2 border-zinc-700 rounded-full overflow-hidden shadow-inner mb-6">
         {/* Safe Zone */}
         <div
           className="absolute top-0 bottom-0 bg-emerald-500/20 border-x-2 border-emerald-500/50"
           style={{ left: `${safeMin * 100}%`, width: `${(safeMax - safeMin) * 100}%` }}
         />

         {/* Indicator */}
         <div
           className={cn(
             "absolute top-1 bottom-1 w-4 rounded-full transition-colors duration-75 shadow-[0_0_10px_rgba(255,255,255,0.5)] -ml-2",
             (indicatorPos >= safeMin && indicatorPos <= safeMax) ? "bg-emerald-400 shadow-emerald-400/50" : "bg-white"
           )}
           style={{ left: `${indicatorPos * 100}%` }}
         />
      </div>

      <div className="w-full bg-zinc-900 h-4 rounded-full overflow-hidden border border-zinc-800">
         <div
           className="h-full bg-sky-500 transition-all duration-75"
           style={{ width: `${Math.min(100, (safeTime / targetTime) * 100)}%` }}
         />
      </div>
      <div className="text-zinc-500 font-mono text-xs mt-2 w-full text-right">
        {(safeTime / 1000).toFixed(2)}s / {(targetTime / 1000).toFixed(2)}s
      </div>

      <AnimatePresence>
        {feedback && (
           <motion.div
             initial={{ opacity: 0, scale: 0.5, y: 10 }}
             animate={{ opacity: 1, scale: 1.5, y: 0 }}
             className={cn(
               "absolute font-black text-3xl uppercase tracking-widest drop-shadow-xl z-20",
               feedback === 'PERFECT' ? 'text-amber-400' : feedback === 'GOOD' ? 'text-emerald-400' : feedback === 'FAIL' ? 'text-red-500' : 'text-zinc-300'
             )}
           >
             {feedback}
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
