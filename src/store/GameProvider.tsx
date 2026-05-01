import React, { createContext, useContext, useEffect, useState } from 'react';
import { MetaState, RunState, PlayerState } from '../types';
import { STARTING_DECK } from '../data/cards';
import { generateRunSeed } from '../lib/rng';

interface GameContextType {
  // Navigation
  screen: 'menu' | 'map' | 'combat' | 'meta' | 'draft' | 'reveal';
  setScreen: (s: 'menu' | 'map' | 'combat' | 'meta' | 'draft' | 'reveal') => void;
  // Meta
  meta: MetaState;
  updateMeta: (updates: Partial<MetaState>) => void;
  // Run
  activeRun: RunState | null;
  startRun: () => void;
  endRun: (creditsEarned: number, completedImage?: string) => void;
  updateRun: (updates: Partial<RunState> | ((prev: RunState) => Partial<RunState>)) => void;
}

const defaultMeta: MetaState = {
  credits: 0,
  unlockedCards: ['strike', 'defend'],
  equippedCosmetic: null,
  highestFloor: 0,
  unlockedImages: [],
};

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [screen, setScreen] = useState<'menu' | 'map' | 'combat' | 'meta' | 'draft' | 'reveal'>('menu');
  const [meta, setMeta] = useState<MetaState>(() => {
    try {
      const stored = localStorage.getItem('warrior_meta');
      return stored ? JSON.parse(stored) : defaultMeta;
    } catch {
      return defaultMeta;
    }
  });

  const [activeRun, setActiveRun] = useState<RunState | null>(null);

  useEffect(() => {
    localStorage.setItem('warrior_meta', JSON.stringify(meta));
  }, [meta]);

  const updateMeta = (updates: Partial<MetaState>) => {
    setMeta(prev => ({ ...prev, ...updates }));
  };

  const startRun = () => {
    const freshPlayer: PlayerState = {
      hp: 50,
      maxHp: 50,
      energy: 3,
      maxEnergy: 3,
      block: 0,
      focusedStrikeToken: false,
      freeCardsThisTurn: 0,
    };
    setActiveRun({
      floor: 1,
      deck: [...STARTING_DECK],
      player: freshPlayer,
      puzzlePieces: 0,
      maxPuzzlePieces: 3, // Short runs for prototype
      runSeed: generateRunSeed(),
      gold: 0,
      curses: [],
      draftSizeModifier: 0,
      bonusEnergyNextCombat: 0,
      exhaustedNextCombat: false,
    });
    setScreen('map');
  };

  const endRun = (creditsEarned: number, completedImage?: string) => {
    setMeta(prev => {
      const unlockedImages = prev.unlockedImages || [];
      if (completedImage && !unlockedImages.includes(completedImage)) {
        unlockedImages.push(completedImage);
      }
      return {
        ...prev,
        credits: prev.credits + creditsEarned,
        highestFloor: Math.max(prev.highestFloor, activeRun?.floor || 0),
        unlockedImages
      };
    });
    setActiveRun(null);
    setScreen('menu');
  };

  const updateRun = (updates: Partial<RunState> | ((prev: RunState) => Partial<RunState>)) => {
    setActiveRun(prev => {
      if (!prev) return null;
      const computedUpdates = typeof updates === 'function' ? updates(prev) : updates;
      return { ...prev, ...computedUpdates };
    });
  };

  return (
    <GameContext.Provider value={{ screen, setScreen, meta, updateMeta, activeRun, startRun, endRun, updateRun }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
};
