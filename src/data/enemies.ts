import { EnemyState } from '../types';

export interface EnemyDef extends Omit<EnemyState, 'intent' | 'intentValue'> {
  intents: Array<{ action: 'attack' | 'defend', value: number }>;
}

export const ENEMIES: EnemyDef[] = [
  {
    id: 'e1',
    name: 'Glitch Swarm',
    hp: 45,
    maxHp: 45,
    sprite: '👾',
    intents: [
      { action: 'attack', value: 4 },
      { action: 'attack', value: 4 },
      { action: 'attack', value: 8 },
      { action: 'defend', value: 10 }
    ]
  },
  {
    id: 'e2',
    name: 'Cyber Sentinel',
    hp: 60,
    maxHp: 60,
    sprite: '🤖',
    intents: [
      { action: 'attack', value: 12 },
      { action: 'defend', value: 15 },
      { action: 'attack', value: 6 },
      { action: 'attack', value: 6 }
    ]
  },
  {
    id: 'e3',
    name: 'Data Phantom',
    hp: 50,
    maxHp: 50,
    sprite: '👻',
    intents: [
      { action: 'defend', value: 5 },
      { action: 'attack', value: 15 },
      { action: 'defend', value: 5 },
      { action: 'attack', value: 15 }
    ]
  }
];

export function getRandomEnemy(floor: number): EnemyState {
    const list = ENEMIES;
    const def = list[Math.floor(Math.random() * list.length)];
    // Base stats scaled by floor optionally, but we'll keep it simple for now
    
    return {
        ...def,
        hp: Math.floor(def.maxHp + (floor * 5)),
        maxHp: Math.floor(def.maxHp + (floor * 5)),
        intent: def.intents[0].action,
        intentValue: def.intents[0].value + Math.floor(floor * 2),
        turnCount: 0
    };
}
