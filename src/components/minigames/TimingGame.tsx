import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { AnimatePresence, motion } from 'motion/react';

export function TimingGame({ onComplete }: { onComplete: (result: any) => void }) {
  const [complete, setComplete] = useState(false);
  const rafRef = useRef<number>(0);
  const startTime = useRef<number>(performance.now());
  
  // Game parameters
  const trackWidth = 300;
  const speed = 200; // pixels per second
  const hitZoneX = trackWidth - 40; // Where the hit zone is centered

  // The 6 pulse timings (in seconds relative to start). We will map this to distances
  // The pulses are NOT uniform. Let's make an interesting phrase.
  // 0.5s, 1.2s, 1.7s, 2.7s, 3.2s, 3.7s
  const initialPulses = [
    { id: 1, time: 1.0, state: 'pending', hitTier: 'none' },
    { id: 2, time: 2.0, state: 'pending', hitTier: 'none' },
    { id: 3, time: 2.6, state: 'pending', hitTier: 'none' },
    { id: 4, time: 3.8, state: 'pending', hitTier: 'none' },
    { id: 5, time: 4.4, state: 'pending', hitTier: 'none' },
    { id: 6, time: 5.0, state: 'pending', hitTier: 'none' },
  ];

  const [pulses, setPulses] = useState(initialPulses);
  const [feedback, setFeedback] = useState<{ text: string, color: string } | null>(null);

  // We only run until the last pulse would naturally expire past the hit zone.
  const maxTime = Math.max(...initialPulses.map(p => p.time)) + 1.0;

  useEffect(() => {
    const loop = (time: number) => {
      if (complete) return;
      const elapsed = (time - startTime.current) / 1000;
      
      setPulses(prev => {
        let changed = false;
        const next = prev.map(p => {
          if (p.state !== 'pending') return p;
          
          // Check if it passed the hit zone entirely
          const pulseX = elapsed * speed;
          const targetX = p.time * speed;
          // Miss window if pulse traveled 0.150 seconds past the target
          if (elapsed > p.time + 0.150) {
            changed = true;
            return { ...p, state: 'miss', hitTier: 'miss' };
          }
          return p;
        });

        if (changed) return next;
        return prev;
      });

      if (elapsed > maxTime) {
         setComplete(true);
      } else {
         rafRef.current = requestAnimationFrame(loop);
      }
    };
    
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [complete, maxTime]);

  useEffect(() => {
    if (complete) {
      // Calculate final score when time is up
      // Flawless = 6 perfect
      // Clean = 6 perfect/good
      // Partial = 4+ hits, 0 misses
      // Fail = 1+ misses
      const hits = pulses.filter(p => p.state === 'hit');
      const misses = pulses.filter(p => p.hitTier === 'miss').length;
      const perfects = pulses.filter(p => p.hitTier === 'perfect').length;

      let tier = 'fail';
      if (misses > 0 || hits.length < 4) {
        tier = 'fail';
      } else if (misses === 0 && hits.length >= 4 && hits.length < 6) {
        tier = 'partial';
      } else if (hits.length === 6 && misses === 0) {
        if (perfects === 6) {
           tier = 'flawless';
        } else {
           tier = 'clean';
        }
      }

      setTimeout(() => onComplete({ tier }), 1500);
    }
  }, [complete, pulses, onComplete]);

  const handleAction = () => {
    if (complete) return;
    const elapsed = (performance.now() - startTime.current) / 1000;

    setPulses(prev => {
      // Find the earliest pending pulse
      const activePulseIdx = prev.findIndex(p => p.state === 'pending');
      if (activePulseIdx === -1) return prev; // nothing to hit
      
      const p = prev[activePulseIdx];
      
      // Calculate difference in seconds
      const diff = Math.abs(elapsed - p.time);
      
      let newTier = 'miss';
      let state = 'hit';
      
      // 120ms window total (+/- 60ms) for perfect/good
      if (diff <= 0.040) {
        newTier = 'perfect'; // center 80ms
      } else if (diff <= 0.080) {
        newTier = 'good'; // outer 160ms total window
      } else {
        newTier = 'miss'; // outside window means miss
        state = 'miss';
      }

      setFeedback({
        text: newTier.toUpperCase(),
        color: newTier === 'perfect' ? 'text-amber-400' : newTier === 'good' ? 'text-emerald-400' : 'text-red-500'
      });
      setTimeout(() => setFeedback(null), 300);

      const next = [...prev];
      next[activePulseIdx] = { ...p, state, hitTier: newTier };
      return next;
    });
  };

  const getElapsed = () => (performance.now() - startTime.current) / 1000;
  // Let's force a re-render for the UI based on time, but use a separate state to avoid trashing React
  const [renderStep, setRenderStep] = useState(0);
  useEffect(() => {
    let loopId = 0;
    const renderLoop = () => {
        setRenderStep(prev => prev + 1);
        loopId = requestAnimationFrame(renderLoop);
    };
    loopId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(loopId);
  }, []);

  const currentElapsed = getElapsed();

  return (
    <div className="flex flex-col items-center justify-center p-8 select-none font-sans" onPointerDown={handleAction}>
      <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-widest italic">Resonance</h3>
      
      <div 
        className="relative h-16 bg-zinc-950 rounded border border-zinc-700 overflow-hidden cursor-pointer shadow-inner flex items-center"
        style={{ width: trackWidth }}
      >
        <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, #3f3f46 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
        
        {/* The Hit Zone */}
        <div 
          className="absolute top-0 bottom-0 border-x-2 border-emerald-500/50 pointer-events-none bg-emerald-500/10"
          style={{ left: hitZoneX - 10, width: 24 }}
        />
        <div 
          className="absolute top-0 bottom-0 pointer-events-none shadow-[0_0_15px_rgba(52,211,153,0.5)] bg-emerald-400/80"
          style={{ left: hitZoneX, width: 4 }}
        />
        
        {/* Pulses */}
        {pulses.map((p) => {
          if (p.state !== 'pending') return null; // hide once hit/missed
          // Position relative to elapsed time
          const distanceToTravel = p.time * speed;
          const currentDist = currentElapsed * speed;
          // Pulse starts off-screen left and moves right toward hitZoneX
          // So hitZoneX represents physical distance where elapsed == p.time.
          // That means at elapsed=0, pulse is at hitZoneX - targetX
          const currentX = hitZoneX - (distanceToTravel - currentDist);

          if (currentX < -20 || currentX > trackWidth + 20) return null;

          return (
            <div 
              key={p.id}
              className="absolute w-[4px] h-12 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]"
              style={{ left: currentX }}
            />
          );
        })}
      </div>
      
      {/* Feedback text */}
      <div className="h-8 mt-4 flex items-center justify-center">
        <AnimatePresence>
          {feedback && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.5, y: 10 }}
               animate={{ opacity: 1, scale: 1.5, y: 0 }}
               exit={{ opacity: 0, scale: 0.8 }}
               className={`font-black uppercase tracking-widest ${feedback.color} drop-shadow-md`}
            >
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {complete && (
        <div className="mt-6 text-xl font-black text-zinc-300 uppercase tracking-widest px-6 py-2 border border-zinc-600 bg-zinc-800 rounded">
           PHRASE COMPLETE
        </div>
      )}
    </div>
  );
}
