import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export function BlindTimerGame({ onComplete }: { onComplete: (result: any) => void }) {
  const target = 5.0; // 5 seconds
  const hideAt = 2.0; // Hide after 2 seconds

  const [running, setRunning] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(0);
  const rafRef = useRef(0);

  const startTimer = () => {
     setRunning(true);
     startTime.current = performance.now();
     const loop = (time: number) => {
        setElapsed((time - startTime.current) / 1000);
        rafRef.current = requestAnimationFrame(loop);
     };
     rafRef.current = requestAnimationFrame(loop);
  };

  const stopTimer = () => {
     setRunning(false);
     setStopped(true);
     cancelAnimationFrame(rafRef.current);

     const diff = Math.abs(elapsed - target);
     let tier = 'fail';
     if (diff <= 0.1) tier = 'perfect'; // within 100ms
     else if (diff <= 0.5) tier = 'good'; // within 500ms
     else if (diff <= 1.0) tier = 'partial'; // within 1s

     setTimeout(() => onComplete({ tier, time: elapsed }), 2000);
  };

  // Ensure cleanup
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const isVisible = !running || elapsed < hideAt;

  return (
    <div className="flex flex-col items-center justify-center p-8 select-none font-sans w-full max-w-sm">
      <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest italic">Internal Clock</h3>
      <p className="text-zinc-400 mb-8 font-mono text-sm uppercase">Stop exactly at {target.toFixed(2)}s</p>

      <div className="relative w-48 h-32 bg-zinc-900 border-4 border-zinc-800 rounded-xl flex items-center justify-center shadow-inner mb-8">
         {/* Noise overlay when hidden */}
         {!isVisible && !stopped && (
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
         )}

         {/* The Timer */}
         <div className={cn(
             "font-mono text-5xl font-black tracking-tighter transition-opacity duration-300",
             isVisible || stopped ? "opacity-100" : "opacity-0",
             stopped && Math.abs(elapsed - target) <= 0.1 ? "text-amber-400" : "text-sky-400"
         )}>
             {elapsed.toFixed(2)}
         </div>

         {!running && !stopped && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm rounded-lg">
                <span className="text-zinc-400 font-bold uppercase tracking-widest text-sm animate-pulse">Awaiting Start</span>
            </div>
         )}
      </div>

      {!running && !stopped ? (
         <button
           onClick={startTimer}
           className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl uppercase tracking-widest rounded shadow-[0_0_15px_rgba(16,185,129,0.3)]"
         >
           Initialize
         </button>
      ) : (
         <button
           onClick={stopTimer}
           disabled={stopped}
           className={cn(
             "px-8 py-4 font-black text-xl uppercase tracking-widest rounded transition-all",
             !stopped ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] active:scale-95" : "bg-zinc-800 text-zinc-600 border-2 border-zinc-700"
           )}
         >
           {stopped ? 'Locked' : 'Halt'}
         </button>
      )}

      {stopped && (
         <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="mt-6 font-mono text-zinc-300"
         >
            Delta: <span className={Math.abs(elapsed - target) <= 0.1 ? "text-amber-400" : "text-red-400"}>
               {Math.abs(elapsed - target).toFixed(2)}s
            </span>
         </motion.div>
      )}
    </div>
  );
}
