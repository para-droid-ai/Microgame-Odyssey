import React, { useState } from 'react';
import { useGame } from '../../store/GameProvider';
import { CARD_DATABASE } from '../../data/cards';
import { CardDef } from '../../types';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Sparkles } from 'lucide-react';

export function DraftView() {
  const { activeRun, updateRun, setScreen } = useGame();
  const [selected, setSelected] = useState<string | null>(null);

  // Generate random cards based on unlocked cards
  const [options] = useState<CardDef[]>(() => {
    // In a real app we'd filter by unlocked cards in meta, but let's just pick from all unlocked for prototype
    const storedMeta = localStorage.getItem('warrior_meta');
    const unlockedIds = storedMeta ? JSON.parse(storedMeta).unlockedCards : ['strike', 'defend'];
    
    const possibleCards = unlockedIds.map((id: string) => CARD_DATABASE[id]).filter(Boolean);
    const draft: CardDef[] = [];
    
    // Add draft modifiers
    const count = 3 + (activeRun?.draftSizeModifier || 0);
    
    for(let i=0; i<count; i++) {
        const r = possibleCards[Math.floor(Math.random() * possibleCards.length)];
        if (r) draft.push(r);
    }
    return draft;
  });

  const handleSelect = () => {
    if (!selected || !activeRun) return;
    const card = CARD_DATABASE[selected];
    if (card) {
      updateRun({
        floor: activeRun.floor + 1,
        deck: [...activeRun.deck, card],
        draftSizeModifier: 0, // Reset
        player: {
            ...activeRun.player,
            // Heal 10 HP between floors
            hp: Math.min(activeRun.player.maxHp, activeRun.player.hp + 10)
        }
      });
      setScreen('map');
    }
  };

  const handleSkip = () => {
    if (!activeRun) return;
    updateRun({
      floor: activeRun.floor + 1,
      draftSizeModifier: 0, // Reset
      player: {
          ...activeRun.player,
          hp: Math.min(activeRun.player.maxHp, activeRun.player.hp + 15) // Extra heal for skip
      }
    });
    setScreen('map');
  };

  return (
    <div className="min-h-screen bg-indigo-950 text-indigo-50 flex flex-col items-center justify-center p-8 font-sans overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #f0abfc 1px, transparent 1px)', backgroundSize: '40px 40px', backgroundPosition: '0 0' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-b from-fuchsia-600/30 to-transparent blur-[100px] -z-10 rounded-full pointer-events-none"/>
      
      <div className="text-center mb-16 relative z-10 w-full max-w-4xl">
        <h2 className="text-5xl font-black uppercase tracking-tighter flex items-center justify-center gap-6 italic drop-shadow-[0_0_15px_rgba(232,121,249,0.5)]">
          <Sparkles className="text-emerald-400 animate-pulse" size={40} />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-fuchsia-300">Discover a Spark</span>
          <Sparkles className="text-emerald-400 animate-pulse" size={40} />
        </h2>
        <p className="text-fuchsia-200 mt-6 inline-block bg-indigo-900/50 backdrop-blur px-6 py-2 border border-indigo-500/30 font-black uppercase tracking-widest text-sm rounded shadow-[0_0_10px_rgba(30,27,75,0.8)] [image-rendering:pixelated]">Integrate a new memory into your codex</p>
      </div>

      <div className="flex flex-wrap justify-center gap-8 mb-16 relative z-10">
        {options.map((card, idx) => (
          <motion.div
            key={`${card.id}-${idx}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelected(card.id)}
            className={cn(
              "w-64 aspect-[2.5/3.5] rounded border-[3px] flex flex-col p-4 cursor-pointer transition-all relative bg-indigo-950/80 backdrop-blur-md shadow-xl group [image-rendering:pixelated]",
              selected === card.id ? "border-emerald-400 scale-105 shadow-[0_0_40px_rgba(52,211,153,0.4)] bg-indigo-900 -translate-y-2" : "border-indigo-800 hover:border-fuchsia-400/50 hover:scale-105 hover:-translate-y-2"
            )}
          >
            <div className="flex justify-between items-start mb-4">
               <div className={cn(
                 "w-8 h-8 rounded border flex items-center justify-center font-mono text-lg font-bold shadow",
                 selected === card.id ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "bg-indigo-900 border-indigo-700 text-indigo-300"
               )}>
                 {card.cost}
               </div>
               <div className={cn(
                 "text-[10px] shadow-sm uppercase font-black px-2 py-1 rounded tracking-widest",
                 card.rarity === 'uncommon' ? 'bg-sky-500/20 border border-sky-500/50 text-sky-300' : 
                 card.rarity === 'rare' ? 'bg-orange-500/20 border border-orange-500/50 text-orange-300' : 'bg-indigo-900 border border-indigo-700 text-indigo-400'
               )}>
                 {card.rarity}
               </div>
            </div>

            <div className="text-center mb-4">
               <h3 className={cn(
                 "font-black uppercase tracking-tighter text-xl leading-tight transition-colors",
                 selected === card.id ? "text-emerald-300" : "text-white"
               )}>{card.name}</h3>
            </div>

            <p className="text-xs text-center text-fuchsia-200/80 mb-6 flex-1 flex items-center justify-center bg-indigo-950/60 rounded border border-indigo-800/80 shadow-inner p-4 leading-relaxed font-medium">
               {card.description(card.baseValue, true)}
            </p>

            {card.minigame !== 'none' && (
               <div className="mt-auto flex justify-center">
                 <span className={cn(
                   "text-[10px] font-black uppercase tracking-widest border px-3 py-1 rounded",
                   selected === card.id ? "text-orange-400 bg-orange-500/20 border-orange-500/50" : "text-indigo-400 bg-indigo-900 border-indigo-700"
                 )}>
                   {card.minigame}
                 </span>
               </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex gap-6 relative z-10 [image-rendering:pixelated]">
        <button 
          onClick={handleSkip}
          className="px-8 py-4 bg-indigo-950 border-[3px] border-indigo-800/80 text-indigo-400 font-bold uppercase tracking-widest rounded text-sm hover:bg-indigo-900 hover:text-white transition-all shadow-[0_0_15px_rgba(30,27,75,0.8)]"
        >
          Skip & Mend (+15 HP)
        </button>
        <button 
          onClick={handleSelect}
          disabled={!selected}
          className={cn(
            "px-12 py-4 font-black uppercase tracking-widest rounded transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] text-sm border-2",
            selected ? "bg-emerald-500 border-white text-indigo-950 hover:bg-emerald-400" : "bg-indigo-900/50 text-indigo-700 border-transparent cursor-not-allowed"
          )}
        >
          Integrate Spark
        </button>
      </div>

    </div>
  );
}
