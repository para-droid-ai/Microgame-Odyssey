export type MinigameType = 'timing' | 'speed' | 'precision' | 'memory' | 'balance' | 'wires' | 'blindTimer' | 'lockpick' | 'unscramble' | 'none';

export type CardRarity = 'common' | 'uncommon' | 'rare';

export interface CardDef {
  id: string;
  name: string;
  type: 'attack' | 'skill' | 'power';
  cost: number;
  baseValue: number;
  minigame: MinigameType;
  description: (val: number, isPreview?: boolean) => string;
  rarity: CardRarity;
  icon: string;
}

export interface PlayerState {
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  block: number;
  focusedStrikeToken?: boolean;
  freeCardsThisTurn?: number;
}

export interface EnemyState {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  intent: 'attack' | 'defend' | 'buff';
  intentValue: number;
  sprite: string;
  turnCount: number;
}

export interface MetaState {
  credits: number;
  unlockedCards: string[];
  equippedCosmetic: string | null;
  highestFloor: number;
  unlockedImages: string[];
}

export interface RunState {
  floor: number;
  deck: CardDef[];
  player: PlayerState;
  puzzlePieces: number;
  maxPuzzlePieces: number;
  runSeed: string;
  gold: number;
  curses: string[];
  draftSizeModifier: number;
  bonusEnergyNextCombat: number;
  exhaustedNextCombat: boolean;
}
