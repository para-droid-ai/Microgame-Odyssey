# Image Generation Architecture (Codename: Nano Banana)

## Overview
This document outlines the technical plan for generating the "Puzzle Prize" images dynamically. The core of this system is a **Deterministic Prompt Grammar**—a seed-based engine that curates unique, highly specific text prompts which are then fed into the generative image model (affectionately codenamed "Nano Banana" for this project).

## 1. The Seed Engine (Deterministic PRNG)
Every run generates an alphanumeric "Run Seed" (e.g., `8F3A-9V`). This seed drives a PRNG (Pseudo-Random Number Generator) like Mulberry32 to ensure that all random selections for that run are deterministic. 
If a player shares a seed, the exact same prompt (and thus similar challenge sequence and outcome image) will be generated.

## 2. Prompt Grammar & Lexicon
Instead of completely random images, we construct a prompt using structured arrays holding visual motifs that fit the *Microgame Odyssey* universe.

**The Prompt Formula:**
`[Base Style] + [Subject] + [Environment] + [Color Palette] + [Atmosphere]`

### Lexicon Examples
*   **Base Style (Constant):** "32-bit pixel art, retro video game aesthetic, highly detailed parallax landscape, nostalgic."
*   **Subject:** "A ruined monolithic sword", "a forgotten star-mech", "a solitary crystalline tree", "a fractured gateway".
*   **Environment:** "atop a floating island", "deep within a neon-lit subterranean cavern", "in a silent, starry desert".
*   **Color Palette:** "bathed in deep indigo and neon fuchsia", "illuminated by harsh emerald green and shadows", "warm golden hour light against midnight blue".
*   **Atmosphere:** "lonely and melancholic", "vibrant and chaotic", "peaceful and silent".

*Example Outcome:* 
> "32-bit pixel art, retro video game aesthetic, highly detailed parallax landscape. A ruined monolithic sword atop a floating island, bathed in deep indigo and neon fuchsia. Lonely and melancholic."

## 3. The "Nano Banana" Integration (Generation Model)
The image generation API (whether utilizing Gemini's Imagen, an external Nano Banana endpoint, or a placeholder service during development) must be handled securely.

### Implementation Pathway:
1. **Client-Side Assembly:** The React client uses the Run Seed to assemble the final prompt string via the Prompt Grammar.
2. **Backend/Serverless Proxy:** The client sends the prompt string to a secure backend endpoint `/api/generate-image` (to prevent exposing the model's API keys in the browser).
3. **Lazy Generation vs. Eager Generation:** 
    *   *Lazy (Current Plan):* To save on API costs, the actual request to the Nano Banana model is only triggered when the player successfully reaches the final node.
    *   *Obfuscation (During Run):* During the run, the UI displays a blurred, abstract CSS shape or generic placeholder that slowly "resolves" as they gather puzzle pieces.
4. **Caching / Retrieval:** If a run seed has been beaten before, the generated image URL can be cached in a database to save generations.

## 4. Implementation Steps (Next Actions)
- [ ] Write the deterministic PRNG utility (`src/lib/rng.ts`).
- [ ] Create the Prompt Grammar lexicons (`src/data/promptGrammar.ts`).
- [ ] Build the `generateRunPrompt(seed)` function that pieces the string together.
- [ ] Implement a Mock Image Generation service that simulates the API call with a 3-second delay, returning a placeholder URL or a solid vibrant color texture.
- [ ] Update `PuzzleRevealView.tsx` to handle the asynchronous fetching of this image.
