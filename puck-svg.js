/**
 * Keepsake Resin Puck SVG Generator
 * Renders translucent oblate spheroid with suspended hair strands
 * Based on real rutilated-quartz / resin-encased-hair product reference
 */

const STRAND_CONFIGS = {
  // Colour themes matching product drops
  'warm-gold':   { base: ['#d4c4a0','#c8b890','#b8a470'], strands: ['#C69B3C','#d4af5a','#b8860b','#8B6914'], bg: ['#e8dcc0','#c8b480','#9a7840'] },
  'midnight':    { base: ['#b0b8c8','#8090a8','#506080'], strands: ['#C69B3C','#d4af5a','#e8c870'], bg: ['#d0d8e8','#90a0c0','#506888'] },
  'sage':        { base: ['#b8c8b0','#90a888','#607860'], strands: ['#8A7968','#b0a080','#786040'], bg: ['#d0dcc8','#a0b898','#708060'] },
  'rose':        { base: ['#d8c0b8','#c0a098','#a07868'], strands: ['#C69B3C','#d4af5a','#b87858'], bg: ['#e8d8d0','#c8b0a8','#a08070'] },
  'teal':        { base: ['#a8c8c0','#78a8a0','#487870'], strands: ['#8A7968','#b0a080','#507868'], bg: ['#c8e0d8','#98c0b8','#608880'] },
  'amber':       { base: ['#d8c090','#c0a060','#987830'], strands: ['#C69B3C','#e8c048','#8B6000'], bg: ['#e8d8a0','#c8b060','#907020'] },
  'blush':       { base: ['#d8c0c0','#c0a0a0','#a07878'], strands: ['#C69B3C','#d4af5a','#c09090'], bg: ['#e8d8d8','#d0b8b8','#b09090'] },
  'slate':       { base: ['#c0c8d8','#98a8c0','#6878a0'], strands: ['#8A9BB0','#a0b0c8','#C69B3C'],   bg: ['#d8e0f0','#b0c0d8','#8090b8'] },
  'bespoke':     { base: ['#d4caba','#baa890','#907860'], strands: ['#C69B3C','#d4af5a','#b89050','#8B6914'], bg: ['#e8ddd0','#c8b898','#a08060'] },
  'hero':        { base: ['#c8c0a8','#b0a880','#887848'], strands: ['#C69B3C','#e0c060','#d4af5a','#8B6914'], bg: ['#e0d8c0','#c0b080','#907840'] },
};

/**
 * Generate a translucent oblate spheroid SVG with internal hair strands
 * @param {object} opts
 * @param {number} opts.w - width
 * @param {number} opts.h - height
 * @param {string} opts.theme - key in STRAND_CONFIGS
 * @param {number} [opts.strandCount] - number of strands (default 18)
 * @param {string} [opts.pattern] - 'scattered'|'bundle'|'swirl'|'heart'|'radial' (default 'scattered')
 * @param {number} [opts.seed] - random seed
 * @returns {string} SVG markup
 */
function makeResinPuckSVG(opts) {
  const { w = 200, h = 156, theme = 'warm-gold', strandCount = 18, pattern = 'scattered', seed = 42 } = opts;
  const cfg = STRAND_CONFIGS[theme] || STRAND_CONFIGS['warm-gold'];
  const cx = w / 2, cy = h / 2;
  const rx = w * 0.47, ry = h * 0.45;
  const id = `puck_${theme}_${seed}`;

  // Seeded pseudo-random
  let s = seed;
  function rand() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
  function randRange(a, b) { return a + rand() * (b - a); }

  // Generate strand paths based on pattern
  function getStrandPaths() {
    const paths = [];
    const count = strandCount;

    for (let i = 0; i < count; i++) {
      const r = rand();
      const color = cfg.strands[Math.floor(r * cfg.strands.length)];
      const opacity = 0.35 + rand() * 0.5;
      const width = 0.4 + rand() * 0.9;

      let x1, y1, x2, y2;

      if (pattern === 'radial') {
        // Strands radiate from a central focal point (like rutile quartz)
        const focalX = cx + randRange(-rx * 0.15, rx * 0.15);
        const focalY = cy + randRange(-ry * 0.1, ry * 0.1);
        const angle = rand() * Math.PI * 2;
        const len = randRange(rx * 0.4, rx * 0.85);
        x1 = focalX + Math.cos(angle) * len * 0.08;
        y1 = focalY + Math.sin(angle) * len * 0.08 * (ry/rx);
        x2 = focalX + Math.cos(angle) * len;
        y2 = focalY + Math.sin(angle) * len * (ry/rx);
      } else if (pattern === 'bundle') {
        // Parallel bundle in centre
        const angle = -0.3 + rand() * 0.6;
        const spread = (i / count - 0.5) * rx * 0.6;
        x1 = cx + spread + randRange(-8, 8);
        y1 = cy - ry * 0.7 + rand() * ry * 0.2;
        x2 = cx + spread * 0.7 + randRange(-8, 8);
        y2 = cy + ry * 0.7 - rand() * ry * 0.2;
      } else if (pattern === 'swirl') {
        // Curved swirl
        const angle = (i / count) * Math.PI * 2.2;
        const r2 = rx * (0.3 + rand() * 0.55);
        x1 = cx + Math.cos(angle) * r2 * 0.3;
        y1 = cy + Math.sin(angle) * r2 * 0.3 * (ry/rx);
        x2 = cx + Math.cos(angle + 0.9) * r2;
        y2 = cy + Math.sin(angle + 0.9) * r2 * (ry/rx);
      } else {
        // Scattered — like real pet hair, crossing at various angles
        const angle = rand() * Math.PI;
        const perpX = cx + randRange(-rx * 0.6, rx * 0.6);
        const perpY = cy + randRange(-ry * 0.5, ry * 0.5);
        const len = randRange(rx * 0.3, rx * 0.9);
        x1 = perpX - Math.cos(angle) * len * 0.5;
        y1 = perpY - Math.sin(angle) * len * 0.5 * (ry/rx);
        x2 = perpX + Math.cos(angle) * len * 0.5;
        y2 = perpY + Math.sin(angle) * len * 0.5 * (ry/rx);
      }

      // Slight curve via quadratic bezier
      const cpx = (x1 + x2) / 2 + randRange(-12, 12);
      const cpy = (y1 + y2) / 2 + randRange(-8, 8);

      paths.push(`<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${cpx.toFixed(1)},${cpy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}"
        stroke="${color}" stroke-width="${width.toFixed(2)}" stroke-opacity="${opacity.toFixed(2)}"
        fill="none" stroke-linecap="round"/>`);
    }
    return paths.join('\n');
  }

  const strands = getStrandPaths();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="display:block;">
  <defs>
    <radialGradient id="body_${id}" cx="42%" cy="35%" r="62%">
      <stop offset="0%"   stop-color="${cfg.bg[0]}" stop-opacity="0.92"/>
      <stop offset="40%"  stop-color="${cfg.bg[1]}" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="${cfg.bg[2]}" stop-opacity="0.60"/>
    </radialGradient>
    <radialGradient id="sheen_${id}" cx="38%" cy="28%" r="48%">
      <stop offset="0%"   stop-color="white" stop-opacity="0.55"/>
      <stop offset="50%"  stop-color="white" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="depth_${id}" cx="55%" cy="65%" r="55%">
      <stop offset="0%"   stop-color="${cfg.base[2]}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${cfg.base[2]}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="clip_${id}">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>
    </clipPath>
    <filter id="blur_${id}">
      <feGaussianBlur stdDeviation="0.8"/>
    </filter>
    <filter id="glow_${id}">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Base glass body -->
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#body_${id})"/>

  <!-- Internal strands clipped to puck shape -->
  <g clip-path="url(#clip_${id})" filter="url(#blur_${id})">
    ${strands}
  </g>

  <!-- Depth shadow bottom -->
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#depth_${id})"/>

  <!-- Glass sheen highlight -->
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#sheen_${id})"/>

  <!-- Rim edge -->
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"
    fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx - 1}" ry="${ry - 1}"
    fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="0.5"/>

  <!-- Specular dot -->
  <ellipse cx="${(cx - rx * 0.22).toFixed(1)}" cy="${(cy - ry * 0.28).toFixed(1)}"
    rx="${(rx * 0.08).toFixed(1)}" ry="${(ry * 0.06).toFixed(1)}"
    fill="white" opacity="0.7"/>
</svg>`;
}

// Export for use in HTML via script tag
window.makeResinPuckSVG = makeResinPuckSVG;
window.STRAND_CONFIGS = STRAND_CONFIGS;
