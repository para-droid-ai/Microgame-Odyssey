import React from 'react';
import { useGame } from '../../store/GameProvider';
import { Play, Database, ShoppingCart, Trophy, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function MainMenuView() {
  const { startRun, meta, setScreen } = useGame();

  return (
    <div className="min-h-screen bg-indigo-950 text-indigo-100 flex flex-col p-8 sm:p-12 selection:bg-emerald-500 font-sans relative overflow-hidden">
      {/* Starry Night Sky Background Elements */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #f0abfc 1px, transparent 1px)', backgroundSize: '40px 40px', backgroundPosition: '0 0' }}></div>
      <div className="absolute inset-0 z-0 opacity-20 mix-blend-screen pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #7dd3fc 2px, transparent 2px)', backgroundSize: '100px 100px', backgroundPosition: '50px 50px' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-violet-600/30 via-fuchsia-600/20 to-transparent blur-[100px] -z-10 rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full relative z-10">
        {/* Title Block */}
        <div className="mb-16 text-center sm:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="inline-block relative"
          >
            <Sparkles className="absolute -top-8 -right-8 text-emerald-400 animate-pulse" size={48} />
            <h1 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter leading-none mb-4 italic drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]">
              Microgame<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">Odyssey</span>
            </h1>
          </motion.div>
          <p className="text-xl text-fuchsia-200 max-w-lg font-medium mx-auto sm:mx-0 mt-4 mix-blend-screen">
            Collect sparks of imagination across tiny frontiers.
          </p>
        </div>

        {/* Start Action */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16 flex justify-center sm:justify-start"
        >
          <button 
            id="btn-begin-journey"
            onClick={startRun}
            className="group relative inline-flex items-center justify-center px-12 py-6 bg-indigo-900 border-2 border-fuchsia-500/50 text-white font-black text-2xl uppercase tracking-widest overflow-hidden rounded shadow-[0_0_30px_rgba(217,70,239,0.3)] hover:border-emerald-400 hover:shadow-[0_0_40px_rgba(52,211,153,0.4)] hover:bg-indigo-800 transition-all [image-rendering:pixelated]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-[shimmer_1.5s_infinite]" />
            <Play className="mr-4 text-emerald-400 group-hover:text-white transition-colors" fill="currentColor" size={28} />
            Begin Journey
          </button>
        </motion.div>

        {/* Meta Stats / Store grid */}
        <div id="meta-stats-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div 
            id="btn-hub-world"
            onClick={() => setScreen('meta')}
            className="bg-indigo-950/80 backdrop-blur-md border-[3px] border-indigo-800/50 p-6 rounded shadow-lg cursor-pointer hover:border-fuchsia-400/50 hover:bg-indigo-900 transition-colors [image-rendering:pixelated]"
          >
            <div className="flex items-center gap-3 text-orange-400 mb-4">
              <Database size={24} />
              <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Hub World</h3>
            </div>
            <div className="text-4xl font-mono text-orange-400 mb-1 drop-shadow-md">{meta.credits}</div>
            <div className="text-[10px] font-bold uppercase text-indigo-400 tracking-widest">Sparks Collected</div>
          </div>

          <div 
            id="btn-codex"
            onClick={() => setScreen('meta')}
            className="bg-indigo-950/80 backdrop-blur-md border-[3px] border-indigo-800/50 p-6 rounded shadow-lg cursor-pointer hover:border-emerald-400/50 hover:bg-indigo-900 transition-colors [image-rendering:pixelated]"
          >
            <div className="flex items-center gap-3 text-emerald-400 mb-4">
              <ShoppingCart size={24} />
              <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Codex</h3>
            </div>
            <div className="text-4xl font-mono text-emerald-400 mb-1 drop-shadow-md">{meta.unlockedCards.length}</div>
            <div className="text-[10px] font-bold uppercase text-indigo-400 tracking-widest">Memories Found</div>
          </div>

          <div id="progress-card" className="bg-indigo-950/80 backdrop-blur-md border-[3px] border-indigo-800/50 p-6 rounded shadow-lg [image-rendering:pixelated]">
            <div className="flex items-center gap-3 text-fuchsia-400 mb-4">
              <Trophy size={24} />
              <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Progress</h3>
            </div>
            <div className="text-4xl font-mono text-fuchsia-400 mb-1 drop-shadow-md">{meta.highestFloor}</div>
            <div className="text-[10px] font-bold uppercase text-indigo-400 tracking-widest">Deepest Frontier</div>
          </div>
        </div>

      </div>
    </div>
  );
}