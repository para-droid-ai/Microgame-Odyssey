import React from 'react';
import { MinigameType } from '../../types';
import { TimingGame } from './TimingGame';
import { SpeedGame } from './SpeedGame';
import { PrecisionGame } from './PrecisionGame';
import { MemoryGame } from './MemoryGame';
import { motion, AnimatePresence } from 'motion/react';

interface MinigameOverlayProps {
  type: MinigameType | null;
  onResult: (result: any) => void;
}

export function MinigameOverlay({ type, onResult }: MinigameOverlayProps) {
  if (!type || type === 'none') return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl shadow-black relative flex flex-col items-center justify-center min-h-[50vh]"
        >
          {type === 'timing' && <TimingGame onComplete={onResult} />}
          {type === 'speed' && <SpeedGame onComplete={onResult} />}
          {type === 'precision' && <PrecisionGame onComplete={onResult} />}
          {type === 'memory' && <MemoryGame onComplete={onResult} />}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
