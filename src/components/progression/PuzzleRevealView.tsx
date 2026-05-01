import React, { useEffect, useState } from 'react';
import { useGame } from '../../store/GameProvider';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2 } from 'lucide-react';
import { generatePuzzleImage } from '../../services/imageService';

export function PuzzleRevealView() {
  const { activeRun, endRun } = useGame();
  const [revealed, setRevealed] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeRun) {
      generatePuzzleImage(activeRun.runSeed).then(url => {
        setImageUrl(url);
        setLoading(false);
        setTimeout(() => setRevealed(true), 500); // Trigger animation after load
      }).catch(err => {
         console.error(err);
         setLoading(false);
         setRevealed(true);
      });
    }
  }, [activeRun]);

  if (!activeRun) return null;

  const handleFinish = () => {
    if (activeRun) {
      endRun(activeRun.floor * 10 + 50, imageUrl || `image_base_${activeRun.maxPuzzlePieces}`); 
    }
  };

  return (
    <div className="min-h-screen bg-indigo-950 text-indigo-50 flex flex-col items-center justify-center p-8 font-sans relative overflow-hidden">
      {/* Dynamic gradients for reveal */}
      <motion.div 
        animate={{ opacity: revealed ? 0.3 : 0 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-0 mix-blend-screen pointer-events-none bg-gradient-to-tr from-fuchsia-600/30 via-emerald-600/20 to-sky-600/30" 
      />

      <div className="text-center mb-12 z-10 relative">
        <h2 className="text-5xl font-black uppercase tracking-tighter flex items-center justify-center gap-6 italic drop-shadow-[0_0_15px_rgba(232,121,249,0.5)]">
          <Sparkles className="text-emerald-400 animate-pulse" size={40} />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-fuchsia-300">Memory Restored</span>
          <Sparkles className="text-emerald-400 animate-pulse" size={40} />
        </h2>
      </div>

      <div className="relative w-80 h-80 sm:w-96 sm:h-96 bg-indigo-950/80 border-[3px] border-indigo-800 rounded shadow-[0_0_40px_rgba(30,27,75,0.8)] z-10 flex items-center justify-center overflow-hidden [image-rendering:pixelated] mb-12">
         <AnimatePresence mode="wait">
           {loading ? (
             <motion.div 
               key="loading"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex flex-col items-center gap-4 text-indigo-400"
             >
               <Loader2 className="animate-spin" size={32} />
               <span className="font-mono text-sm uppercase tracking-widest">Reconstructing...</span>
             </motion.div>
           ) : (
             <motion.div 
               key="image"
               initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
               animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
               transition={{ duration: 2, ease: "easeOut" }}
               className="w-full h-full relative"
             >
               <img src={imageUrl || ''} alt="Recovered Memory" className="w-full h-full object-cover" />
               <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                   <div className="text-[10px] font-mono text-indigo-200">SEED: {activeRun.runSeed}</div>
               </div>
               {/* Digital texture overlay */}
               <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
             </motion.div>
           )}
         </AnimatePresence>
      </div>

      <motion.button 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: loading ? 0 : 1, y: loading ? 20 : 0 }}
        transition={{ delay: 1 }}
        disabled={loading}
        onClick={handleFinish}
        className="px-12 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black uppercase tracking-widest border border-fuchsia-400 rounded transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)] z-10 [image-rendering:pixelated] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Absorb Image & Return
      </motion.button>
    </div>
  );
}
