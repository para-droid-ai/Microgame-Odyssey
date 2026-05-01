import React from 'react';
import { useGame } from '../../store/GameProvider';
import { CARD_DATABASE } from '../../data/cards';
import { ArrowLeft, Lock, Unlock, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export function MetaStoreView() {
  const { meta, updateMeta, setScreen } = useGame();

  const allCards = Object.values(CARD_DATABASE);
  const purchasableCards = allCards.filter(c => c.id !== 'strike' && c.id !== 'defend');

  const getCost = (rarity: string) => {
    if (rarity === 'uncommon') return 50;
    if (rarity === 'rare') return 150;
    return 20;
  };

  const handlePurchase = (cardId: string, cost: number) => {
    if (meta.credits >= cost && !meta.unlockedCards.includes(cardId)) {
      updateMeta({
        credits: meta.credits - cost,
        unlockedCards: [...meta.unlockedCards, cardId]
      });
    }
  };

  return (
    <div className="min-h-screen bg-indigo-950 text-indigo-50 flex flex-col p-8 select-none font-sans relative overflow-hidden">
      {/* Starry Night Sky Background Elements */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #f0abfc 1px, transparent 1px)', backgroundSize: '40px 40px', backgroundPosition: '0 0' }}></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-orange-500/10 via-fuchsia-600/10 to-transparent blur-[80px] -z-10 rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full z-10">
        <div className="flex items-center justify-between border-b-[3px] border-indigo-800/50 pb-8 mb-8 [image-rendering:pixelated]">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setScreen('menu')}
              className="p-4 bg-indigo-900 border-[3px] border-indigo-800 rounded hover:bg-indigo-800 hover:border-emerald-400/50 transition-colors shadow-lg"
            >
              <ArrowLeft size={24} className="text-indigo-300" />
            </button>
            <h1 className="text-4xl font-black uppercase tracking-widest italic drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">The Codex Hub</h1>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-indigo-400 text-[10px] font-bold tracking-widest uppercase">Collected Sparks</div>
            <div className="text-4xl font-mono text-orange-400 drop-shadow-md">{meta.credits}</div>
          </div>
         </div>

        <div className="mb-12">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-6 flex items-center gap-3 text-fuchsia-300">
            Dormant Memories
            <span className="text-[10px] font-normal text-indigo-400 uppercase tracking-widest bg-indigo-900/50 px-2 py-1 rounded">({meta.unlockedCards.length} / {allCards.length})</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {purchasableCards.map((card, idx) => {
            const isUnlocked = meta.unlockedCards.includes(card.id);
            const cost = getCost(card.rarity);
            const canAfford = meta.credits >= cost;

            return (
              <motion.div 
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "relative flex flex-col p-4 rounded border-[3px] transition-all h-64 shadow-xl [image-rendering:pixelated]",
                  isUnlocked ? "bg-indigo-900/80 border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.1)]" : "bg-indigo-950/80 border-indigo-800"
                )}
              >
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-indigo-950/90 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center">
                    <Lock className="text-indigo-500 mb-2" size={24} />
                    <span className="text-[10px] uppercase font-bold text-indigo-400 mb-2">Needs {cost} Sparks</span>
                    <button
                      onClick={() => handlePurchase(card.id, cost)}
                      disabled={!canAfford}
                      className={cn(
                        "w-full py-2 rounded font-black uppercase tracking-widest text-[10px] transition-all border",
                        canAfford 
                          ? "bg-orange-500 text-indigo-950 border-orange-300 hover:bg-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                          : "bg-indigo-900/50 text-indigo-600 border-indigo-800 cursor-not-allowed"
                      )}
                    >
                      Kindle Object
                    </button>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div className="w-8 h-8 rounded bg-indigo-900 border border-indigo-700 flex items-center justify-center font-mono text-sm font-bold text-indigo-100 shadow-inner">
                    {card.cost}
                  </div>
                  <div className={cn(
                    "text-[10px] uppercase font-black px-2 py-1 rounded shadow-sm",
                    card.rarity === 'uncommon' ? 'bg-sky-500/20 border border-sky-500/50 text-sky-300' : 'bg-orange-500/20 border border-orange-500/50 text-orange-300'
                  )}>
                    {card.rarity}
                  </div>
                </div>

                <div className="text-center mb-2">
                  <h3 className="font-black uppercase tracking-tighter text-lg leading-tight text-white">{card.name}</h3>
                </div>

                <div className="flex-1 flex items-center justify-center bg-indigo-900/30 rounded border border-indigo-800/50 p-2 shadow-inner">
                   <p className="text-[10px] text-center text-fuchsia-200/80 font-medium leading-tight">
                     {card.description(card.baseValue, true)}
                   </p>
                </div>

                {card.minigame !== 'none' && (
                   <div className="mt-3 flex justify-center">
                     <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/30 bg-indigo-950 px-2 py-0.5 rounded shadow">
                       {card.minigame}
                     </span>
                   </div>
                )}
              </motion.div>
            );
          })}
        </div>
        </div>

        <div>
           <h2 className="text-xl font-bold uppercase tracking-wider mb-6 flex items-center gap-3 text-sky-300">
             Restored Vistas
             <span className="text-[10px] font-normal text-indigo-400 uppercase tracking-widest bg-indigo-900/50 px-2 py-1 rounded">({(meta.unlockedImages || []).length})</span>
           </h2>
           <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
              {(meta.unlockedImages || []).length === 0 ? (
                 <div className="col-span-full py-12 text-center text-indigo-400/50 border-2 border-dashed border-indigo-800/50 rounded flex flex-col items-center">
                    <ImageIcon size={32} className="mb-4 opacity-50" />
                    <span className="font-bold uppercase tracking-widest text-sm">No Sights Restored Yet</span>
                 </div>
              ) : (
                (meta.unlockedImages || []).map((img, i) => (
                   <div key={i} className="aspect-square bg-indigo-900/40 border-[3px] border-indigo-700/50 rounded flex items-center justify-center relative group overflow-hidden shadow-lg">
                      {img.startsWith('data:image') || img.startsWith('http') ? (
                         <img src={img} alt={`Restored Vista ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                         <ImageIcon className="text-indigo-600 group-hover:scale-110 transition-transform" size={48} />
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-indigo-950/90 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform text-center flex flex-col gap-1 items-center">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Memory Restored</span>
                      </div>
                   </div>
                ))
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
