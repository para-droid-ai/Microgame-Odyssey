import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function MemoryGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [state, setState] = useState<'showing' | 'waiting' | 'failed' | 'success'>('showing');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const sequenceLength = 4;

  useEffect(() => {
    // Generate sequence
    const newSeq = [];
    for (let i = 0; i < sequenceLength; i++) {
        newSeq.push(Math.floor(Math.random() * 4));
    }
    setSequence(newSeq);
    
    // Play sequence
    let step = 0;
    const interval = setInterval(() => {
      if (step >= newSeq.length) {
        clearInterval(interval);
        setActiveIndex(null);
        setState('waiting');
        return;
      }
      setActiveIndex(newSeq[step]);
      setTimeout(() => setActiveIndex(null), 400); // give it a little blink gap
      step++;
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const handleTap = (index: number) => {
    if (state !== 'waiting') return;
    
    const nextInput = [...playerInput, index];
    setPlayerInput(nextInput);
    setActiveIndex(index);
    setTimeout(() => setActiveIndex(null), 200);

    const currentStep = nextInput.length - 1;
    if (nextInput[currentStep] !== sequence[currentStep]) {
        // Failed
        setState('failed');
        setTimeout(() => onComplete(0.2), 1000); // small score for trying
        return;
    }

    if (nextInput.length === sequenceLength) {
        // Success
        setState('success');
        setTimeout(() => onComplete(1.0), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 select-none font-sans w-full max-w-sm">
      <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest italic">
        {state === 'showing' && "Watch Closely..."}
        {state === 'waiting' && "Repeat Sequence"}
        {state === 'failed' && "System Malfunction"}
        {state === 'success' && "Memory Locked"}
      </h3>
      <p className="text-zinc-400 mb-8 font-mono text-sm uppercase">Match the Pattern</p>
      
      <div className="grid grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((idx) => {
           const isActive = activeIndex === idx;
           return (
             <motion.button
               key={idx}
               whileTap={{ scale: state === 'waiting' ? 0.9 : 1 }}
               onClick={() => handleTap(idx)}
               disabled={state !== 'waiting'}
               className={cn(
                 "w-24 h-24 rounded shadow-inner border-2 border-zinc-700 transition-colors duration-150",
                 isActive ? "bg-fuchsia-500 border-fuchsia-300 shadow-[0_0_20px_#d946ef]" : "bg-zinc-800 hover:bg-zinc-700 disabled:hover:bg-zinc-800"
               )}
             />
           );
        })}
      </div>
      
      <div className="mt-8 flex gap-2">
         {sequence.map((_, idx) => (
             <div 
               key={idx} 
               className={cn(
                 "w-3 h-3 border border-zinc-600 rotate-45 transition-colors",
                 playerInput.length > idx && state !== 'failed' ? "bg-emerald-400 border-emerald-400 shadow-[0_0_10px_#34d399]" : "bg-zinc-900"
               )} 
             />
         ))}
      </div>
    </div>
  );
}
