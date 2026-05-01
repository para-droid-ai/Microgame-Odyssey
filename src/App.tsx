import React from 'react';
import { GameProvider, useGame } from './store/GameProvider';
import { MainMenuView } from './components/progression/MainMenuView';
import { CombatView } from './components/combat/CombatView';
import { DraftView } from './components/combat/DraftView';
import { MapView } from './components/progression/MapView';
import { PuzzleRevealView } from './components/progression/PuzzleRevealView';
import { MetaStoreView } from './components/progression/MetaStoreView';

function AppRouter() {
  const { screen } = useGame();

  return (
    <>
      {screen === 'menu' && <MainMenuView />}
      {screen === 'combat' && <CombatView />}
      {screen === 'meta' && <MetaStoreView />}
      {screen === 'draft' && <DraftView />}
      {screen === 'map' && <MapView />}
      {screen === 'reveal' && <PuzzleRevealView />}
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppRouter />
    </GameProvider>
  );
}
