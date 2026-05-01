import React, { useEffect, useState, useRef } from 'react';
import { cn } from '../../lib/utils';
import { AnimatePresence, motion } from 'motion/react';

interface GridNode {
  id: number;
  active: boolean;
  expiresAt: number;
}

export function SpeedGame({ onComplete }: { onComplete: (result: any) => void }) {
  const duration = 12000; // 12 seconds
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [active, setActive] = useState(true);
  const startTime = useRef(performance.now());
  const rafRef = useRef(0);
  
  const [grid, setGrid] = useState<GridNode[]>(Array(16).fill(null).map((_, i) => ({ id: i, active: false, expiresAt: 0 })));
  const [lockout, setLockout] = useState(0); // timestamp when lockout ends
  
  const nextSpawnTime = useRef(0);

  useEffect(() => {
    const loop = (time: number) => {
      const elapsed = time - startTime.current;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        setActive(false);
        setHits(h => {
          let tier = 'fail';
          if (h >= 18) tier = 'surge';
          else if (h >= 12) tier = 'strong';
          else if (h >= 6) tier = 'adequate';
          
          setTimeout(() => onComplete({ tier, score: h }), 1000);
          return h;
        });
      } else {
        // Spawn logic
        if (elapsed > nextSpawnTime.current) {
          nextSpawnTime.current = elapsed + 350; // spawn slightly faster (350ms) to allow getting 18 hits

          setGrid(prev => {
            const inactives = prev.filter(n => !n.active);
            if (inactives.length === 0) return prev;
            const pick = inactives[Math.floor(Math.random() * inactives.length)];
            const next = [...prev];
            next[pick.id] = { ...pick, active: true, expiresAt: time + 1200 };
            return next;
          });
        }
        
        // Expire logic
        setGrid(prev => {
          let changed = false;
          const next = prev.map(n => {
             if (n.active && time > n.expiresAt) {
                 changed = true;
                 return { ...n, active: false };
             }
             return n;
          });
          return changed ? next : prev;
        });

        rafRef.current = requestAnimationFrame(loop);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onComplete]);

  const handleTap = (id: number) => {
    if (!active) return;
    const now = performance.now();
    if (now < lockout) return; // ignore inputs while locked out

    setGrid(prev => {
      const node = prev[id];
      if (node.active) {
        // Hit
        setHits(h => h + 1);
        const next = [...prev];
        next[id] = { ...node, active: false }; // Consume it
        return next;
      } else {
        // Miss - Penalty
        setLockout(now + 300);
        return prev;
      }
    });
  };

  const isLockedOut = performance.now() < lockout;

  return (
    <div className="flex flex-col items-center justify-center p-8 select-none w-full max-w-md font-sans">
      <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest italic flex items-center justify-between w-full">
         THE SURGE <span className="text-amber-500 font-mono text-xl">{(timeLeft / 1000).toFixed(2)}</span>
      </h3>
      
      <div className="flex justify-between w-full mb-6 font-mono text-zinc-400">
         <span>HITS: <span className="text-emerald-400">{hits}</span></span>
         <span>TARGET: 18</span>
      </div>

      <div className={cn(
        "grid grid-cols-4 gap-2 w-full aspect-square transition-opacity",
        isLockedOut && "opacity-50 blur-[2px]"
      )}>
        {grid.map(node => (
          <button
            key={node.id}
            onPointerDown={() => handleTap(node.id)}
            disabled={!active || isLockedOut}
            className={cn(
              "w-full h-full rounded border-2 transition-colors duration-75 active:scale-95",
              node.active 
                ? "bg-amber-400/20 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]" 
                : "bg-zinc-900 border-zinc-800"
            )}
          >
             {node.active && (
                 <div className="w-1/2 h-1/2 mx-auto bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,1)] flex" />
             )}
          </button>
        ))}
      </div>
      
      {isLockedOut && (
         <div className="absolute text-red-500 font-black text-2xl uppercase tracking-widest pointer-events-none drop-shadow-xl z-20">
             LOCKED
         </div>
      )}

      {/* Floating feedback */}
      <AnimatePresence>
        {!active && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-10 text-white font-black text-3xl pointer-events-none drop-shadow-md bg-zinc-900/90 px-6 py-4 border border-zinc-700 rounded-xl flex flex-col items-center"
          >
            <div>{hits} HITS</div>
            <div className={`text-xl mt-2 ${hits >= 18 ? 'text-amber-400' : hits >= 12 ? 'text-zinc-300' : hits >= 6 ? 'text-amber-700' : 'text-red-500'}`}>
                {hits >= 18 ? 'SURGE' : hits >= 12 ? 'STRONG' : hits >= 6 ? 'ADEQUATE' : 'SYSTEM EXHAUSTED'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
