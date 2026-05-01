import { stringToSeed, mulberry32 } from '../lib/rng';

export const PROMPT_GRAMMAR = {
  baseStyle: "32-bit pixel art, retro video game aesthetic, highly detailed parallax landscape, nostalgic.",
  subjects: [
    "A ruined monolithic sword",
    "A forgotten star-mech",
    "A solitary crystalline tree",
    "A fractured gateway",
    "An overgrown stone colossus",
    "A glowing well of magic",
    "A mysterious hovering obelisk",
    "An ancient, slumbering dragon made of stone",
    "A colossal arcade cabinet overgrown with vines"
  ],
  environments: [
    "atop a floating island",
    "deep within a neon-lit subterranean cavern",
    "in a silent, starry desert",
    "surrounded by a shattered digital grid",
    "in a dense, bioluminescent forest",
    "on the edge of an endless crystalline sea",
    "amongst the ruins of a forgotten castle",
    "underneath a massive, glowing moon"
  ],
  colorPalettes: [
    "bathed in deep indigo and neon fuchsia",
    "illuminated by harsh emerald green and shadows",
    "warm golden hour light against midnight blue",
    "painted in stark monochromatic reds and blacks",
    "filled with soft pastel pinks and electric blues",
    "submerged in deep ocean teals and cyan",
    "glowing with toxic yellow and deep purple"
  ],
  atmospheres: [
    "lonely and melancholic",
    "vibrant and chaotic",
    "peaceful and silent",
    "crackling with volatile energy",
    "ancient and deeply forgotten",
    "surreal and dreamlike"
  ]
};

export function generatePromptForRun(seedInput: string): string {
  const seedNum = stringToSeed(seedInput);
  const rng = mulberry32(seedNum);

  const pick = (arr: string[]) => arr[Math.floor(rng() * arr.length)];

  const subject = pick(PROMPT_GRAMMAR.subjects);
  const env = pick(PROMPT_GRAMMAR.environments);
  const palette = pick(PROMPT_GRAMMAR.colorPalettes);
  const atm = pick(PROMPT_GRAMMAR.atmospheres);

  return `${PROMPT_GRAMMAR.baseStyle} ${subject} ${env}, ${palette}. ${atm}.`;
}
