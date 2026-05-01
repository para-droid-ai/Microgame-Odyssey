import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

const WORDS = ['BLOCK', 'SPARK', 'DRAFT', 'CRITS', 'SWORD'];

export function UnscrambleGame({ onComplete }: { onComplete: (result: any) => void }) {
  const [word] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [scrambled, setScrambled] = useState<{char: string, id: number}[]>([]);
  const [input, setInput] = useState<{char: string, id: number}[]>([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [status, setStatus] = useState<'playing' | 'fail' | 'success'>('playing');

  useEffect(() => {
     let arr = word.split('').map((char, i) => ({ char, id: i }));
     // shuffle
     for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
     }
     setScrambled(arr);
  }, [word]);

  useEffect(() => {
     if (status !== 'playing') return;
     const t = setInterval(() => {
        setTimeLeft(l => {
           if (l <= 1) {
              setStatus('fail');
              clearInterval(t);
              setTimeout(() => onComplete({ tier: 'fail' }), 1000);
              return 0;
           }
           return l - 1;
        });
     }, 1000);
     return () => clearInterval(t);
  }, [status, onComplete]);

  const handleTap = (item: {char: string, id: number}) => {
     if (status !== 'playing') return;

     const newInput = [...input, item];
     setInput(newInput);

     // Check if correct so far
     const currentStr = newInput.map(x => x.char).join('');
     if (word.startsWith(currentStr)) {
        // Good so far
        if (newInput.length === word.length) {
           setStatus('success');
           setTimeout(() => onComplete({ tier: 'perfect' }), 1000);
        }
     } else {
        // Mistake made
        setStatus('fail');
        setTimeout(() => onComplete({ tier: 'fail' }), 1000);
     }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 select-none font-sans w-full max-w-sm">
      <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest italic flex items-center justify-between w-full">
         Cipher <span className={cn("font-mono text-xl", timeLeft <= 3 ? "text-red-500 animate-pulse" : "text-sky-400")}>{timeLeft}s</span>
      </h3>
      <p className="text-zinc-400 mb-8 font-mono text-sm uppercase">Reconstruct the sequence</p>

      {/* Target Slots */}
      <div className="flex gap-2 mb-12">
         {word.split('').map((_, i) => (
            <div key={i} className="w-12 h-14 border-b-4 border-zinc-700 flex items-center justify-center font-black text-2xl text-white uppercase">
               {input[i]?.char || ''}
            </div>
         ))}
      </div>

      {/* Available Letters */}
      <div className="flex gap-3 flex-wrap justify-center">
         {scrambled.map(item => {
            const isUsed = input.find(x => x.id === item.id);
            return (
               <button
                  key={item.id}
                  disabled={!!isUsed || status !== 'playing'}
                  onPointerDown={() => handleTap(item)}
                  className={cn(
                     "w-12 h-14 rounded font-black text-xl uppercase transition-all duration-75 border-2",
                     isUsed ? "opacity-20 bg-zinc-900 border-zinc-800 text-zinc-600 scale-95" : "bg-zinc-800 border-zinc-600 hover:bg-zinc-700 text-zinc-100 active:scale-95 shadow-md",
                     status === 'fail' && !isUsed && "border-red-500/50 text-red-500"
                  )}
               >
                  {item.char}
               </button>
            );
         })}
      </div>

      {status !== 'playing' && (
         <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
               "mt-8 font-black text-2xl uppercase tracking-widest",
               status === 'success' ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'text-red-500'
            )}
         >
            {status === 'success' ? 'DECRYPTED' : 'SEQUENCE LOST'}
         </motion.div>
      )}
    </div>
  );
}
