# Microgame Odyssey : Project Roadmap

## Phase 1: The Core Loop (In Progress)
- [x] Basic game engine & Context state
- [x] Roguelite combat engine (Turn-based logic, energy, cards, hand)
- [x] WarioWare-style microgame layer (Precision, Timing, Speed)
- [x] Visual Identity implementation (32-bit aesthetic, indigo/purple/fuchsia/emerald palette)
- [ ] Connect combat victory to draft/reward layer loop
- [ ] Implement robust run transition logic (Combat -> Draft -> Next Node)

## Phase 2: The Roguelike Frontier
- [ ] Implement real `MapView` with branching paths (Encounters, Rest Sites, Treasure).
- [ ] Convert current `MapDraftView` into `DraftView` attached to encounter nodes.
- [ ] Develop diverse enemy pool with specific patterns.
- [ ] Expanded card pools with diverse microgame affinities.
- [ ] Relic system (Artifacts / Perks) that alter run/microgame conditions.

## Phase 3: The Puzzle Prize System
- [ ] Data structure for "Dynamically Generated Puzzle Images".
- [ ] Implement "Puzzle Pieces" as rewards for microgame completions or encounter victories.
- [ ] The "Revelation UI" - assembling the image piece by piece.
- [ ] Run Victory / Final Boss state resolving the completed image.
- [ ] Hub World "Archive" to view restored images.

## Phase 4: Polish & Lore
- [ ] Audio pass (chiptune + synthwave).
- [ ] Deep lore integration within card descriptions and environments.
- [ ] Advanced visual flair (scanlines, deeper parallax, responsive canvas scaling).
- [ ] Hub World detailed progression (MetaStore upgrades).
