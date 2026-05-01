const fs = require('fs');

// Ensure dna.md and context.md exist as per AGENTS.md requirements
if (!fs.existsSync('/app/dna.md')) {
  fs.writeFileSync('/app/dna.md', `# DNA / Philosophy
- Minimalistic, punchy retro UI with neon accents.
- Fast-paced combat using microgames.
- Unforgiving but quick iteration loops.
`);
}

if (!fs.existsSync('/app/context.md')) {
  fs.writeFileSync('/app/context.md', `# Technical Context
- React, Vite, TailwindCSS.
- Framer Motion for animations.
- Centralized \`GameProvider\` for state management.
`);
}
