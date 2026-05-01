import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../store/GameProvider';
import { CardDef, EnemyState, MinigameType } from '../../types';
import { MinigameOverlay } from '../minigames/MinigameOverlay';
import { Shield, Zap, Heart, Sword } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { getRandomEnemy, ENEMIES } from '../../data/enemies';

export function CombatView() {
  const { activeRun, updateRun, endRun, setScreen } = useGame();
  
  // Local combat state
  const [hand, setHand] = useState<CardDef[]>([]);
  const [discard, setDiscard] = useState<CardDef[]>([]);
  const [deck, setDeck] = useState<CardDef[]>([]);
  const [enemy, setEnemy] = useState<EnemyState | null>(null);
  
  const [activeMinigame, setActiveMinigame] = useState<{type: MinigameType, card: CardDef} | null>(null);
  const initialized = useRef(false);

  const processDraw = (
    count: number,
    stateRefs: { hand: CardDef[], deck: CardDef[], discard: CardDef[], lostEnergy: number }
  ) => {
    for (let i = 0; i < count; i++) {
       if (stateRefs.deck.length === 0) {
         if (stateRefs.discard.length === 0) break; // Cannot draw
         stateRefs.deck = [...stateRefs.discard].sort(() => Math.random() - 0.5);
         stateRefs.discard = [];
       }
       const card = stateRefs.deck.shift()!;
       if (card.name === 'Dissonance') {
          stateRefs.lostEnergy += 1;
          stateRefs.discard.push(card);
       } else {
          stateRefs.hand.push(card);
       }
    }
  };

  // Initial draw & enemy setup
  useEffect(() => {
    if (activeRun && !initialized.current) {
      initialized.current = true;
      // shuffle deck
      const shuffled = [...activeRun.deck].sort(() => Math.random() - 0.5);
      
      let stateRefs = { 
        hand: [] as CardDef[], 
        deck: shuffled, 
        discard: [] as CardDef[], 
        lostEnergy: 0 
      };
      
      processDraw(4, stateRefs);
      
      // Calculate start energy
      const baseEnergy = 3; // hardcoded for now, could read from meta
      const mEnergy = activeRun.exhaustedNextCombat ? baseEnergy - 1 : baseEnergy;
      const bEnergy = activeRun.bonusEnergyNextCombat || 0;
      const initialEnergy = Math.max(0, mEnergy + bEnergy - stateRefs.lostEnergy);

      updateRun({
         exhaustedNextCombat: false,
         bonusEnergyNextCombat: 0,
         player: {
             ...activeRun.player,
             maxEnergy: mEnergy,
             energy: initialEnergy,
             block: 0,
             freeCardsThisTurn: 0
         }
      });
      
      setHand(stateRefs.hand);
      setDeck(stateRefs.deck);
      setDiscard(stateRefs.discard);
      
      const newEnemy = getRandomEnemy(activeRun.floor);
      setEnemy(newEnemy);
    }
  }, [activeRun, updateRun]);

  const endTurn = () => {
    if (!activeRun || !enemy) return;
    
    // Enemy action + Curses
    const playerUpdates = { ...activeRun.player };
    
    // Check for Unfocused curse
    const unfocusedCount = hand.filter(c => c.name === 'Unfocused').length;
    if (unfocusedCount > 0) {
      playerUpdates.hp = Math.max(0, playerUpdates.hp - (2 * unfocusedCount));
    }

    if (enemy.intent === 'attack') {
      const dmg = Math.max(0, enemy.intentValue - playerUpdates.block);
      playerUpdates.hp = Math.max(0, playerUpdates.hp - dmg);
    }
    
    // Reset player block & energy
    playerUpdates.block = 0;
    playerUpdates.energy = playerUpdates.maxEnergy;
    playerUpdates.freeCardsThisTurn = 0;
    
    updateRun({ player: playerUpdates });
    
    if (playerUpdates.hp <= 0) {
      endRun(10 + activeRun.floor * 5); // Game Over
      return;
    }

    // New Enemy Intent
    setEnemy(e => {
      if (!e) return e;
      const def = ENEMIES.find(x => x.id === e.id);
      if (!def) return e; // fallback
      const nextTurn = e.turnCount + 1;
      const nextIntent = def.intents[nextTurn % def.intents.length];
      return {
        ...e,
        turnCount: nextTurn,
        intent: nextIntent.action,
        intentValue: nextIntent.value + Math.floor(activeRun.floor * 2)
      };
    });

    // Player draw
    let stateRefs = { 
      hand: [] as CardDef[], 
      deck: [...deck], 
      discard: [...discard, ...hand], 
      lostEnergy: 0 
    };
    
    processDraw(4, stateRefs);
    
    if (stateRefs.lostEnergy > 0) {
       playerUpdates.energy = Math.max(0, playerUpdates.energy - stateRefs.lostEnergy);
       updateRun({ player: playerUpdates }); // Apply energy loss incrementally
    }
    
    setHand(stateRefs.hand);
    setDeck(stateRefs.deck);
    setDiscard(stateRefs.discard);
  };

  const playCard = (card: CardDef, index: number) => {
    if (!activeRun) return;
    if (card.name === 'Unfocused' || card.name === 'Dissonance') return; // Cannot play curses
    
    let consumedEnergy = card.cost;
    let freeCards = activeRun.player.freeCardsThisTurn || 0;
    
    if (freeCards > 0) {
      consumedEnergy = 0;
      freeCards -= 1;
    } else if (activeRun.player.energy < card.cost) {
      return; // Cannot afford
    }
    
    // Consume energy
    updateRun({
      player: {
        ...activeRun.player,
        energy: activeRun.player.energy - consumedEnergy,
        freeCardsThisTurn: freeCards
      }
    });

    // Remove from hand
    const newHand = [...hand];
    newHand.splice(index, 1);
    const newDiscard = [...discard, card];
    setHand(newHand);
    setDiscard(newDiscard);

    if (card.minigame !== 'none') {
      setActiveMinigame({ type: card.minigame, card });
    } else {
      resolveCard(card, 1.0, newHand, newDiscard); // 1.0 multiplier for no minigame
    }
  };

  const resolveCard = (card: CardDef, result: any, overrideHand?: CardDef[], overrideDiscard?: CardDef[]) => {
    setActiveMinigame(null);
    if (!activeRun) return;
    
    let multiplier = 1.0;
    const runUpdates: any = {};
    const playerUpdates: any = {};
    
    let newHand = overrideHand ? [...overrideHand] : [...hand];
    let newDeck = [...deck];
    let newDiscard = overrideDiscard ? [...overrideDiscard] : [...discard];

    if (result && result.tier) {
      if (card.minigame === 'precision') {
        if (result.tier === 'gold') {
          multiplier = 1.5;
        } else if (result.tier === 'silver') {
          multiplier = 1.0;
          playerUpdates.focusedStrikeToken = true;
        } else if (result.tier === 'bronze') {
          multiplier = 0.8;
          runUpdates.gold = (activeRun.gold || 0) + 15;
        } else {
          multiplier = 0.0;
          const curse: CardDef = {
            id: `unfocused-${Date.now()}`,
            name: 'Unfocused',
            type: 'skill',
            cost: 1,
            baseValue: 0,
            minigame: 'none',
            description: () => 'Unplayable. If in hand at end of turn, take 2 DMG.',
            rarity: 'common',
            icon: 'EyeOff'
          };
          newDeck.splice(Math.floor(Math.random() * newDeck.length), 0, curse);
        }
      } else if (card.minigame === 'timing') {
         let drawCount = 0;
         if (result.tier === 'flawless') {
           multiplier = 1.5;
           drawCount = 3;
           playerUpdates.freeCardsThisTurn = 99;
         } else if (result.tier === 'clean') {
           multiplier = 1.0;
           drawCount = 2;
           playerUpdates.freeCardsThisTurn = 1;
         } else if (result.tier === 'partial') {
           multiplier = 0.8;
           drawCount = 1;
         } else {
           multiplier = 0.0;
           const curse: CardDef = {
             id: `dissonance-${Date.now()}`,
             name: 'Dissonance',
             type: 'skill',
             cost: 0,
             baseValue: 0,
             minigame: 'none',
             description: () => 'Exhaust. When drawn, lose 1 Energy.',
             rarity: 'common',
             icon: 'X'
           };
           newDiscard.push(curse);
         }
         
         if (drawCount > 0) {
            let stateRefs = { 
              hand: newHand, 
              deck: newDeck, 
              discard: newDiscard, 
              lostEnergy: 0 
            };
            processDraw(drawCount, stateRefs);
            newHand = stateRefs.hand;
            newDeck = stateRefs.deck;
            newDiscard = stateRefs.discard;
            if (stateRefs.lostEnergy > 0) {
               playerUpdates.energyLoss = (playerUpdates.energyLoss || 0) + stateRefs.lostEnergy;
            }
         }
      } else if (card.minigame === 'speed') {
         if (result.tier === 'surge') {
           multiplier = 1.5;
           runUpdates.draftSizeModifier = 2;
           runUpdates.gold = (activeRun.gold || 0) + 30;
           runUpdates.bonusEnergyNextCombat = 1;
         } else if (result.tier === 'strong') {
           multiplier = 1.0;
           runUpdates.draftSizeModifier = 1;
           runUpdates.gold = (activeRun.gold || 0) + 15;
         } else if (result.tier === 'adequate') {
           multiplier = 0.8;
           runUpdates.gold = (activeRun.gold || 0) + 10;
         } else {
           multiplier = 0.5;
           runUpdates.gold = (activeRun.gold || 0) + 5;
           runUpdates.exhaustedNextCombat = true;
         }
      } else {
        multiplier = result.tier === 'fail' ? 0.0 : 1.0;
      }
    } else {
      multiplier = result === 1.0 ? 1.0 : 0.5 + (result * 1.0);
    }

    if (activeRun.player.focusedStrikeToken && card.type === 'attack') {
       multiplier *= 2;
       playerUpdates.focusedStrikeToken = false;
    }

    const finalValue = Math.floor(card.baseValue * multiplier);

    setHand(newHand);
    setDeck(newDeck);
    setDiscard(newDiscard);
    
    // Apply updates functionally to not overwrite energy changes from playCard
    updateRun(prev => {
      const { energyLoss, ...cleanPlayerUpdates } = playerUpdates;
      return {
        ...prev,
        ...runUpdates,
        player: {
          ...prev.player,
          ...cleanPlayerUpdates,
          energy: Math.max(0, prev.player.energy - (energyLoss || 0)),
          block: (card.type === 'skill' || card.type === 'power') 
             ? prev.player.block + finalValue 
             : prev.player.block
        }
      };
    });

    if (card.type === 'attack') {
      setEnemy(e => {
        if (!e) return e;
        const newHp = Math.max(0, e.hp - finalValue);
        if (newHp <= 0) {
          setTimeout(() => {
              updateRun(prev => ({ ...prev, puzzlePieces: prev.puzzlePieces + 1 }));
              setScreen('draft');
          }, 1000); 
        }
        return { ...e, hp: newHp };
      });
    }
  };

  if (!activeRun || !enemy) return null;

  return (
    <div className="flex flex-col h-screen bg-indigo-950 text-indigo-50 font-sans overflow-hidden select-none p-4 space-y-4 relative">
      {/* Starry Night Effect */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #f0abfc 1px, transparent 1px)', backgroundSize: '40px 40px', backgroundPosition: '0 0' }}></div>
      <div className="absolute inset-0 z-0 opacity-20 mix-blend-screen pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #7dd3fc 2px, transparent 2px)', backgroundSize: '100px 100px', backgroundPosition: '50px 50px' }}></div>

      {/* Top HUD */}
      <header className="flex justify-between items-center bg-indigo-900/80 backdrop-blur-md border-[3px] border-indigo-800 p-4 rounded shadow-[0_0_20px_rgba(30,27,75,0.8)] shrink-0 z-10 [image-rendering:pixelated]">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Active Run</span>
            <span className="text-xl font-black text-fuchsia-400 italic drop-shadow-md">FRONTIER {activeRun.floor}</span>
          </div>
          <div className="h-10 w-px bg-indigo-800"></div>
          <div className="space-y-1 w-48">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-rose-400 uppercase flex items-center gap-1"><Heart size={10} /> VITALITY</span>
              <span className="font-mono text-indigo-200">{activeRun.player.hp} / {activeRun.player.maxHp}</span>
            </div>
            <div className="w-full h-2 bg-indigo-950/80 rounded overflow-hidden border border-indigo-800">
              <div 
                className="bg-gradient-to-r from-rose-600 to-rose-400 h-full transition-all duration-300" 
                style={{ width: `${(activeRun.player.hp / activeRun.player.maxHp) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="space-y-1 w-40">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-sky-400 uppercase flex items-center gap-1"><Shield size={10}/> ARMOR</span>
              <span className="font-mono text-indigo-200">{activeRun.player.block}</span>
            </div>
            <div className="w-full h-2 bg-indigo-950/80 rounded overflow-hidden border border-indigo-800">
              <div className="bg-gradient-to-r from-sky-600 to-sky-400 h-full transition-all duration-300" style={{ width: activeRun.player.block > 0 ? '100%' : '0%' }}></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {/* Modifiers */}
           {activeRun.player.focusedStrikeToken && (
             <div className="bg-orange-500/20 border border-orange-500/50 text-orange-400 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">
               Focused Strike
             </div>
           )}
           {activeRun.curses && activeRun.curses.length > 0 && (
             <div className="flex gap-1">
               {activeRun.curses.map((c, i) => (
                  <div key={i} className="bg-red-500/20 border border-red-500/50 text-red-400 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                    {c}
                  </div>
               ))}
             </div>
           )}
           <div className="h-10 w-px bg-indigo-800 mx-2"></div>
           <div className="flex flex-col items-end">
             <span className="text-[10px] uppercase font-bold text-amber-400/80">Wealth</span>
             <span className="text-xl font-mono text-amber-400 font-bold drop-shadow-md">{activeRun.gold || 0} g</span>
           </div>
        </div>
      </header>

      {/* Main Arena */}
      <div className="flex-1 flex space-x-4 overflow-hidden relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-60 bg-gradient-to-t from-violet-600/30 to-transparent blur-3xl -z-10 rounded-full"/>
        
        {/* Play Area */}
        <div className="flex-1 bg-indigo-900/60 backdrop-blur border-[3px] border-indigo-800 relative flex flex-col justify-center items-center shadow-lg rounded">
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
           
           {/* Enemy */}
           <div className="flex flex-col items-center z-10">
             {/* Intent */}
             <div className="mb-4 bg-indigo-950/90 px-4 py-2 border-2 border-indigo-500/50 flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] rounded-sm">
               {enemy.intent === 'attack' ? <Sword className="text-rose-400" size={16}/> : <Shield className="text-sky-400" size={16}/>}
               <span className="font-mono font-bold text-indigo-100">{enemy.intentValue}</span>
               <span className="text-[10px] text-fuchsia-300 uppercase tracking-widest ml-1">{enemy.intent}</span>
             </div>
             
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="text-[8rem] filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] [image-rendering:pixelated]"
             >
               {enemy.sprite}
             </motion.div>
             
             {/* Enemy HP Bar */}
             <div className="mt-8 w-64 bg-indigo-950/80 p-3 border border-indigo-800 rounded">
               <div className="flex justify-between text-[10px] font-mono mb-2">
                 <span className="text-fuchsia-300 uppercase font-black tracking-widest">{enemy.name}</span>
                 <span className="text-rose-400">{enemy.hp} / {enemy.maxHp}</span>
               </div>
               <div className="w-full h-2 bg-indigo-900/50 rounded-full border border-indigo-700 overflow-hidden">
                 <div 
                   className="bg-rose-500 h-full transition-all duration-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                   style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                 />
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Hand / Controls */}
      <div className="p-4 bg-indigo-900/80 backdrop-blur-md border-[3px] border-indigo-800 rounded shadow-[0_0_20px_rgba(30,27,75,0.8)] relative flex flex-col shrink-0 overflow-visible z-10 [image-rendering:pixelated]">
        <div className="flex justify-between items-center bg-indigo-950/50 p-2 mb-2 rounded border border-indigo-800/50">
           <span className="text-[10px] font-mono text-indigo-400/80">SESSION_ID: {activeRun.floor}-XA</span>
           <div className="flex gap-4">
             {activeRun.player.freeCardsThisTurn && activeRun.player.freeCardsThisTurn > 0 ? (
               <div className="flex items-center gap-3 bg-amber-500/20 px-4 py-1.5 rounded border border-amber-500/50">
                 <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Free Actions</span>
                 <span className="font-mono text-amber-300 text-sm leading-none">{activeRun.player.freeCardsThisTurn > 50 ? 'INFINITE' : activeRun.player.freeCardsThisTurn}</span>
               </div>
             ) : null}
             <div className="flex items-center gap-3 bg-indigo-950 px-4 py-1.5 rounded border border-indigo-700/50">
               <Zap className="text-emerald-400" size={14} />
               <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Energy</span>
               <div className="flex gap-1 ml-1">
                 <span className="font-mono text-emerald-300 text-sm leading-none">{activeRun.player.energy}</span>
                 <span className="font-mono text-indigo-500 text-sm leading-none">/ {activeRun.player.maxEnergy}</span>
               </div>
             </div>
           </div>
         </div>

         <div className="flex items-end justify-between gap-4 h-48 w-full max-w-5xl mx-auto overflow-visible relative z-10 pt-4">
          
          {/* Deck Info */}
          <div className="w-16 h-24 bg-indigo-950/80 rounded border-2 border-indigo-800 flex flex-col items-center justify-center text-indigo-300 self-center hover:border-fuchsia-500/50 hover:bg-indigo-900 transition-colors shadow-inner">
            <div className="text-xl font-mono text-fuchsia-300 drop-shadow-md">{deck.length}</div>
            <div className="text-[9px] uppercase font-black tracking-widest mt-1 text-indigo-400/80">Draw</div>
          </div>
          
          {/* Cards */}
          <div className="flex-1 flex justify-center gap-[-10px] isolate h-full items-end mt-4">
            <AnimatePresence>
              {hand.map((card, idx) => {
                const isCurse = card.name === 'Unfocused' || card.name === 'Dissonance';
                const canPlay = !isCurse && ((activeRun.player.freeCardsThisTurn && activeRun.player.freeCardsThisTurn > 0) || activeRun.player.energy >= card.cost);
                return (
                 <motion.div
                   key={`${card.id}-${idx}`}
                   initial={{ y: 100, rotate: idx * 5 - 10, opacity: 0 }}
                   animate={{ y: 0, rotate: (idx - (hand.length - 1)/2) * 5, opacity: 1 }}
                   exit={{ y: -50, opacity: 0, scale: 0.8 }}
                   whileHover={{ y: -30, rotate: 0, zIndex: 10, scale: 1.05 }}
                   onClick={() => playCard(card, idx)}
                   className={cn(
                     "w-36 h-48 bg-indigo-950/90 rounded border-[3px] flex flex-col p-2 shadow-2xl cursor-pointer -ml-4 transition-all origin-bottom group",
                     canPlay ? 'border-emerald-500/80 hover:border-emerald-300 hover:bg-indigo-900' : 'border-indigo-800 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
                   )}
                   style={{ zIndex: idx }}
                 >
                   <div className="flex justify-between items-start mb-2">
                     <span className={cn(
                       "text-[10px] uppercase font-black tracking-tighter w-full truncate",
                       canPlay ? "text-emerald-300" : "text-indigo-300"
                     )}>{card.name}</span>
                     <div className={cn(
                       "flex-shrink-0 font-mono text-xs font-bold leading-none border  w-6 h-6 flex items-center justify-center rounded-sm",
                       canPlay ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "bg-indigo-900 border-indigo-700 text-indigo-500"
                     )}>
                       {card.cost}
                     </div>
                   </div>
                   
                   <div className="flex-1 flex items-center justify-center bg-indigo-900/40 rounded p-2 border border-indigo-800/50 shadow-inner">
                     <p className="text-[10px] text-fuchsia-200/80 text-center leading-tight [text-shadow:_0_1px_2px_rgba(0,0,0,0.8)]">
                       {card.description(card.baseValue, true)}
                     </p>
                   </div>
                   
                   {card.minigame !== 'none' && (
                     <div className={cn(
                       "mt-2 text-[9px] uppercase font-black tracking-widest text-center py-1 rounded bg-indigo-950 border border-indigo-800/50",
                       canPlay ? "text-orange-400 group-hover:bg-orange-500/20 group-hover:border-orange-500/50" : "text-indigo-500"
                     )}>
                       {card.minigame}
                     </div>
                   )}
                 </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* End Turn */}
          <div className="flex flex-col items-center gap-2 self-center shrink-0">
            <button 
              onClick={endTurn}
              className="px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-indigo-950 font-black uppercase tracking-widest border border-emerald-200 rounded transition-transform active:scale-95 shadow-[0_0_20px_rgba(52,211,153,0.4)] text-xs"
            >
              End Phase
            </button>
            <div className="w-full flex justify-between mt-2 px-3 py-1.5 bg-indigo-950/80 border border-indigo-800 rounded text-[10px] font-black uppercase text-indigo-400">
               <span>DROP</span>
               <span className="text-fuchsia-400">{discard.length}</span>
            </div>
          </div>
        </div>
      </div>

      <MinigameOverlay 
        type={activeMinigame?.type || null}
        onResult={(score) => resolveCard(activeMinigame!.card, score)} 
      />
    </div>
  );
}
