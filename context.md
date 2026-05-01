# Blueprint: Microgame Odyssey System Architecture

## Technical Architecture
- **Framework:** React 18+ with TypeScript, Vite bundler.
- **Styling:** Tailwind CSS + custom fonts (`Space Grotesk`, `Inter`, `JetBrains Mono`).
- **State Management:** React Context API (`GameProvider.tsx`), exposing `activeRun` object.
- **Transitions:** `motion/react` for route/combat flow animations.

## Core Schemas (Target State)
### RunState (Roguelike Loop)
- Tracks current floor, player HP/Block/Energy, total Gold, current Deck, Discard pile, current Hand.
- Holds active "Curses" (Unfocused, Dissonance).
- Tracks puzzle pieces / overarching meta-goals.

### Encounter Flow State Machine
1. *MapView:* Selects next node (Combat, Event, Shop, Rest). Node configuration generates parameters.
2. *CombatView:* Resolves enemy intents, player card plays, and triggers Minigame overlays.
3. *DraftView:* Offers randomized card pool based on Combat performance / Minigame success thresholds.

### Mini-game Interrupt Data Interfaces (Spec: Dead Reckoning, Resonance, The Surge)
- **ActiveMinigame Data Component:** Passed into `MinigameOverlay.tsx`.
- Maps the archetype-trigger (Precision, Timing, Speed) to the corresponding UI.
- Responsible for passing the `Result Threshold` back to the central `RunState` (e.g., triggering the card upgrade, drawing cards, or adding curses).

## Asset / Utility Maps
- `imageService.ts`: Wraps Gemini API calls for asset generation, implements strict timeout shielding.
- `cards.ts`: Defines card parameters, costs, and their affinity to specific minigames.
- `enemies.ts`: Defines enemy specs, rotating intents, HP, and sprite identities.
