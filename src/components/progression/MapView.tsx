import React from 'react';
import { useGame } from '../../store/GameProvider';
import { motion } from 'motion/react';
import { Map, Swords, Hexagon, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export function MapView() {
  const { activeRun, setScreen, endRun, updateRun } = useGame();

  if (!activeRun) return null;

  const canProgress = activeRun.puzzlePieces < activeRun.maxPuzzlePieces;
  
  const handleNodeClick = () => {
    // In a full implementation, we'd have different node types (combat, event, shop)
    updateRun({
       player: {
          ...activeRun.player,
          energy: activeRun.player.maxEnergy,
          block: 0
       }
    });
    setScreen('combat');
  };

  const handleReveal = () => {
    // Proceed to reveal/end screen
    setScreen('reveal');
  };

  return (
    <div className="min-h-screen bg-indigo-950 text-indigo-50 flex flex-col p-8 font-sans relative overflow-hidden">
      {/* Starry Night Sky Background Elements */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #f0abfc 1px, transparent 1px)', backgroundSize: '40px 40px', backgroundPosition: '0 0' }}></div>
      <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-gradient-to-tl from-emerald-600/20 via-sky-600/10 to-transparent blur-[80px] -z-10 rounded-full pointer-events-none" />

      <header className="flex justify-between items-center bg-indigo-900/80 backdrop-blur-md border-[3px] border-indigo-800 p-4 rounded shadow-[0_0_20px_rgba(30,27,75,0.8)] shrink-0 z-10 [image-rendering:pixelated] mb-8">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Current Frontier</span>
            <span className="text-xl font-black text-fuchsia-400 italic drop-shadow-md">EXPEDITION {activeRun.floor}</span>
          </div>
          <div className="h-10 w-px bg-indigo-800"></div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Sparks Recovered</span>
            <span className="font-mono text-emerald-400 text-lg">{activeRun.puzzlePieces} / {activeRun.maxPuzzlePieces}</span>
          </div>
        </div>
        <button id="btn-abandon-run" className="flex items-center gap-2 px-4 py-2 bg-indigo-950 border border-indigo-700 rounded text-sm font-bold uppercase tracking-widest text-indigo-300 hover:bg-indigo-800 hover:text-white transition-colors"
                onClick={() => setScreen('menu')}>
          Abandon
        </button>
      </header>

      <div id="map-interaction-area" className="flex-1 flex justify-center items-center relative z-10">
        {!canProgress ? (
           <div className="flex flex-col items-center">
             <h2 className="text-4xl font-black uppercase tracking-tighter flex items-center justify-center gap-6 italic drop-shadow-[0_0_15px_rgba(232,121,249,0.5)] mb-8">
               <Sparkles className="text-emerald-400 animate-pulse" size={40} />
               <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-fuchsia-300">Image Recovered</span>
               <Sparkles className="text-emerald-400 animate-pulse" size={40} />
             </h2>
             <button 
               id="btn-reveal-memory"
               onClick={handleReveal}
               className="group relative inline-flex items-center justify-center px-12 py-6 bg-emerald-500 border-2 border-white text-indigo-950 font-black text-2xl uppercase tracking-widest overflow-hidden rounded shadow-[0_0_30px_rgba(52,211,153,0.4)] hover:bg-emerald-400 transition-all [image-rendering:pixelated]"
             >
               Reveal Memory
             </button>
           </div>
        ) : (
          <div className="flex flex-col items-center">
             <div className="text-center mb-12">
               <h2 className="text-2xl font-black uppercase tracking-widest text-fuchsia-300 drop-shadow-md mb-2">Uncharted Node</h2>
               <p className="text-indigo-300/80 font-medium max-w-md mx-auto text-sm">Select the next point of interest to continue assembling the lost memory.</p>
             </div>
             
             <button 
               id="btn-combat-node"
               onClick={handleNodeClick}
               className="relative flex flex-col items-center justify-center w-48 h-48 bg-indigo-900/60 backdrop-blur-md border-[3px] border-indigo-700 rounded-full hover:border-orange-400 hover:bg-indigo-800 transition-all group shadow-[0_0_20px_rgba(30,27,75,0.5)] hover:shadow-[0_0_40px_rgba(249,115,22,0.4)]"
             >
               <div className="absolute inset-0 bg-orange-500/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
               <Swords className="text-indigo-400 group-hover:text-orange-400 mb-4 transition-colors z-10" size={40} />
               <span className="font-black uppercase tracking-widest text-indigo-200 group-hover:text-white transition-colors z-10">Combat Node</span>
             </button>
             
             <div className="mt-12 opacity-60 pointer-events-none flex flex-col items-center">
                <div className="w-1 h-12 bg-indigo-800 border-r border-indigo-600 border-dashed rounded mb-4"></div>
                <div className="flex gap-8">
                  <div className="w-24 h-24 rounded-full border-2 border-indigo-800/50 flex flex-col items-center justify-center text-indigo-700/50 bg-indigo-950/30">
                    <Hexagon size={24} className="mb-2"/>
                    <span className="text-[10px] uppercase font-bold tracking-widest">Unknown</span>
                  </div>
                  <div className="w-24 h-24 rounded-full border-2 border-indigo-800/50 flex flex-col items-center justify-center text-indigo-700/50 bg-indigo-950/30">
                    <Hexagon size={24} className="mb-2"/>
                    <span className="text-[10px] uppercase font-bold tracking-widest">Unknown</span>
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>

    </div>
  );
}
