/**
 * Keepsake — Bespoke (Product 2) Preview SVG Generator
 *
 * Simulates how a finished bespoke pet-hair resin puck will look,
 * given a chosen hair formation template and any selected add-ons.
 *
 *   formations: 'filled' | 'heart' | 'swirl' | 'bundle' | 'line' | 'circle'
 *   addons:     subset of ['gold', 'silver', 'flowers']
 *
 * Used by customize.html for both the small template-card thumbnails
 * and the large live preview panel.
 */

function makeBespokePreviewSVG(opts) {
  const {
    w = 220,
    h = 172,
    template = 'filled',
    addons = [],
    seed = 42,
    showResin = true,
  } = opts;

  const cx = w / 2;
  const cy = h / 2;
  const rx = w * 0.47;
  const ry = h * 0.45;
  const id = `bsp_${template}_${addons.join('-') || 'none'}_${seed}`;

  let s = seed;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const rr = (a, b) => a + rand() * (b - a);

  // Hair colour palette — warm browns/golds typical of pet fur
  const HAIR_COLORS = ['#5C3F2A', '#7A5638', '#9C7A52', '#C09668', '#D4B384', '#3B2818'];
  const hairColor = () => HAIR_COLORS[Math.floor(rand() * HAIR_COLORS.length)];

  // ── Hair-strand path helpers ─────────────────────────────
  function strand(x1, y1, x2, y2, opt = {}) {
    const cpx = (x1 + x2) / 2 + rr(-10, 10);
    const cpy = (y1 + y2) / 2 + rr(-6, 6);
    const col = opt.color || hairColor();
    const op  = opt.opacity ?? (0.45 + rand() * 0.45);
    const sw  = opt.width   ?? (0.5 + rand() * 0.9);
    return `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${cpx.toFixed(1)},${cpy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}"
      stroke="${col}" stroke-width="${sw.toFixed(2)}" stroke-opacity="${op.toFixed(2)}"
      fill="none" stroke-linecap="round"/>`;
  }

  // ── 6 hair formations ────────────────────────────────────
  function formationStrands() {
    const out = [];

    if (template === 'filled') {
      // Densely scattered across the whole puck
      for (let i = 0; i < 70; i++) {
        const px = cx + rr(-rx * 0.78, rx * 0.78);
        const py = cy + rr(-ry * 0.78, ry * 0.78);
        const ang = rand() * Math.PI;
        const len = rr(rx * 0.18, rx * 0.55);
        out.push(strand(
          px - Math.cos(ang) * len * 0.5,
          py - Math.sin(ang) * len * 0.5,
          px + Math.cos(ang) * len * 0.5,
          py + Math.sin(ang) * len * 0.5,
        ));
      }
    }

    else if (template === 'heart') {
      // Strands packed inside a heart shape
      // Heart parametric: (16 sin³t, 13 cost - 5 cos2t - 2 cos3t - cos4t)
      function heartPoint(t) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        return { x: cx + x * (rx / 22), y: cy + y * (ry / 22) - ry * 0.05 };
      }
      // Outline strands following the curve
      for (let i = 0; i < 36; i++) {
        const t = (i / 36) * Math.PI * 2;
        const p1 = heartPoint(t);
        const p2 = heartPoint(t + 0.18);
        out.push(strand(p1.x, p1.y, p2.x, p2.y, { width: 1.0, opacity: 0.85 }));
      }
      // Fill interior
      for (let i = 0; i < 50; i++) {
        const t = rand() * Math.PI * 2;
        const k = Math.sqrt(rand()) * 0.85;
        const p = heartPoint(t);
        const pcx = cx + (p.x - cx) * k;
        const pcy = cy + (p.y - cy) * k;
        const ang = rand() * Math.PI;
        const len = rr(4, 12);
        out.push(strand(
          pcx - Math.cos(ang) * len,
          pcy - Math.sin(ang) * len,
          pcx + Math.cos(ang) * len,
          pcy + Math.sin(ang) * len,
          { opacity: 0.55 + rand() * 0.35, width: 0.55 + rand() * 0.7 },
        ));
      }
    }

    else if (template === 'swirl') {
      // Logarithmic spiral
      const turns = 2.4;
      const steps = 80;
      let prev = null;
      for (let i = 0; i < steps; i++) {
        const t = (i / steps) * Math.PI * 2 * turns;
        const r = rx * 0.08 + (rx * 0.55) * (i / steps);
        const x = cx + Math.cos(t) * r;
        const y = cy + Math.sin(t) * r * (ry / rx);
        if (prev) {
          out.push(strand(prev.x, prev.y, x, y, { width: 1.1, opacity: 0.8 }));
        }
        prev = { x, y };
      }
      // Wisps along the spiral
      for (let i = 0; i < 40; i++) {
        const t = rand() * Math.PI * 2 * turns;
        const r = rx * 0.08 + (rx * 0.55) * (rand());
        const x = cx + Math.cos(t) * r;
        const y = cy + Math.sin(t) * r * (ry / rx);
        const ang = t + Math.PI / 2 + rr(-0.4, 0.4);
        const len = rr(4, 14);
        out.push(strand(
          x - Math.cos(ang) * len,
          y - Math.sin(ang) * len,
          x + Math.cos(ang) * len,
          y + Math.sin(ang) * len,
          { opacity: 0.45 + rand() * 0.35 },
        ));
      }
    }

    else if (template === 'bundle') {
      // Tight vertical bundle in the centre
      for (let i = 0; i < 55; i++) {
        const offset = rr(-rx * 0.12, rx * 0.12);
        const tilt   = rr(-0.18, 0.18);
        const yTop = cy - ry * rr(0.55, 0.78);
        const yBot = cy + ry * rr(0.55, 0.78);
        const x1 = cx + offset;
        const x2 = cx + offset + Math.tan(tilt) * (yBot - yTop);
        out.push(strand(x1, yTop, x2, yBot, {
          width: 0.6 + rand() * 0.9,
          opacity: 0.55 + rand() * 0.4,
        }));
      }
      // A subtle "tie" band in the middle
      out.push(`<ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.16}" ry="${ry * 0.05}"
        fill="rgba(60,40,25,0.35)"/>`);
    }

    else if (template === 'line') {
      // Single horizontal line of parallel strands
      for (let i = 0; i < 22; i++) {
        const dy = rr(-ry * 0.06, ry * 0.06);
        const x1 = cx - rx * rr(0.55, 0.72);
        const x2 = cx + rx * rr(0.55, 0.72);
        out.push(strand(x1, cy + dy, x2, cy + dy + rr(-2, 2), {
          width: 0.7 + rand() * 0.7,
          opacity: 0.6 + rand() * 0.3,
        }));
      }
    }

    else if (template === 'circle') {
      // Ring of strands
      const ringR = rx * 0.55;
      const ringRy = ry * 0.55;
      const segs = 60;
      let prev = null;
      for (let i = 0; i <= segs; i++) {
        const t = (i / segs) * Math.PI * 2;
        const x = cx + Math.cos(t) * ringR;
        const y = cy + Math.sin(t) * ringRy;
        if (prev) {
          out.push(strand(prev.x, prev.y, x, y, { width: 1.0, opacity: 0.78 }));
        }
        prev = { x, y };
      }
      // Tiny radial wisps off the ring
      for (let i = 0; i < 30; i++) {
        const t = rand() * Math.PI * 2;
        const x = cx + Math.cos(t) * ringR;
        const y = cy + Math.sin(t) * ringRy;
        const len = rr(3, 9);
        const dir = rand() < 0.5 ? -1 : 1;
        out.push(strand(
          x, y,
          x + Math.cos(t) * len * dir,
          y + Math.sin(t) * len * dir,
          { opacity: 0.45, width: 0.5 + rand() * 0.5 },
        ));
      }
    }

    return out.join('\n');
  }

  // ── Add-ons ──────────────────────────────────────────────
  function goldFlakes() {
    const out = [];
    for (let i = 0; i < 22; i++) {
      const fx = cx + rr(-rx * 0.78, rx * 0.78);
      const fy = cy + rr(-ry * 0.78, ry * 0.78);
      const sz = rr(3, 9);
      const angle = rr(0, 180);
      const op = 0.55 + rand() * 0.4;
      const pts = [
        [fx + rr(-sz * 0.25, sz * 0.25), fy - sz * 0.5 + rr(-1.5, 1.5)],
        [fx + sz * 0.55 + rr(-2, 2),     fy + rr(-sz * 0.25, sz * 0.25)],
        [fx + rr(-sz * 0.1, sz * 0.3),   fy + sz * 0.5 + rr(-1.5, 1.5)],
        [fx - sz * 0.55 + rr(-2, 2),     fy + rr(-sz * 0.2, sz * 0.2)],
      ].map(p => p.join(',')).join(' ');
      out.push(`<polygon points="${pts}" fill="#D4AF5A" opacity="${op.toFixed(2)}"
        transform="rotate(${angle.toFixed(1)},${fx.toFixed(1)},${fy.toFixed(1)})"/>`);
      // tiny highlight dot
      out.push(`<circle cx="${(fx - sz * 0.15).toFixed(1)}" cy="${(fy - sz * 0.15).toFixed(1)}"
        r="${(sz * 0.12).toFixed(1)}" fill="#fff" opacity="${(op * 0.7).toFixed(2)}"/>`);
    }
    return out.join('\n');
  }

  function silverFlakes() {
    const out = [];
    for (let i = 0; i < 24; i++) {
      const fx = cx + rr(-rx * 0.75, rx * 0.75);
      const fy = cy + rr(-ry * 0.75, ry * 0.75);
      const sz = rr(2.5, 6.5);
      const op = 0.5 + rand() * 0.45;
      // Diamond-shape silver flake
      const pts = [
        [fx, fy - sz * 0.55],
        [fx + sz * 0.45, fy],
        [fx, fy + sz * 0.55],
        [fx - sz * 0.45, fy],
      ].map(p => p.join(',')).join(' ');
      out.push(`<polygon points="${pts}" fill="#E5E7EB" opacity="${op.toFixed(2)}"/>`);
      out.push(`<circle cx="${(fx - sz * 0.12).toFixed(1)}" cy="${(fy - sz * 0.12).toFixed(1)}"
        r="${(sz * 0.1).toFixed(1)}" fill="#fff" opacity="${(op * 0.8).toFixed(2)}"/>`);
    }
    return out.join('\n');
  }

  function pressedFlowers() {
    const out = [];
    const flowerColors = [
      ['#E8B4C0', '#C26880'], // pink
      ['#F0E0A8', '#C8A040'], // yellow
      ['#D4C4E0', '#8870A8'], // lavender
      ['#F4EADE', '#C0A890'], // cream
    ];
    // 3-5 flowers placed around the edges (so they don't dominate the centre)
    const fcount = 3 + Math.floor(rand() * 3);
    for (let i = 0; i < fcount; i++) {
      const ang = (i / fcount) * Math.PI * 2 + rand() * 0.4;
      const dist = rr(0.45, 0.7);
      const fx = cx + Math.cos(ang) * rx * dist;
      const fy = cy + Math.sin(ang) * ry * dist;
      const r = rr(7, 11);
      const [petal, center] = flowerColors[Math.floor(rand() * flowerColors.length)];
      const petals = 5 + Math.floor(rand() * 2);
      for (let p = 0; p < petals; p++) {
        const pa = (p / petals) * Math.PI * 2 + rand() * 0.1;
        const px = fx + Math.cos(pa) * r * 0.55;
        const py = fy + Math.sin(pa) * r * 0.55;
        out.push(`<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}"
          rx="${(r * 0.42).toFixed(1)}" ry="${(r * 0.28).toFixed(1)}"
          fill="${petal}" opacity="0.8"
          transform="rotate(${(pa * 180 / Math.PI + 90).toFixed(1)},${px.toFixed(1)},${py.toFixed(1)})"/>`);
      }
      out.push(`<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${(r * 0.28).toFixed(1)}"
        fill="${center}" opacity="0.92"/>`);
      out.push(`<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${(r * 0.13).toFixed(1)}"
        fill="#3D2A18" opacity="0.6"/>`);
    }
    // A couple of small fern fronds for texture
    for (let f = 0; f < 2; f++) {
      const fx = cx + rr(-rx * 0.6, rx * 0.6);
      const fy = cy + rr(-ry * 0.6, ry * 0.6);
      const ang = rand() * Math.PI * 2;
      const len = rr(rx * 0.18, rx * 0.32);
      const ex = fx + Math.cos(ang) * len;
      const ey = fy + Math.sin(ang) * len;
      out.push(`<line x1="${fx.toFixed(1)}" y1="${fy.toFixed(1)}"
        x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}"
        stroke="#5A6A4E" stroke-width="1" stroke-opacity="0.65" stroke-linecap="round"/>`);
      for (let k = 1; k <= 4; k++) {
        const t = k / 5;
        const mx = fx + Math.cos(ang) * len * t;
        const my = fy + Math.sin(ang) * len * t;
        const fl = len * 0.18 * (1 - t * 0.4);
        [-1, 1].forEach(side => {
          const fa = ang + side * 0.85;
          out.push(`<line x1="${mx.toFixed(1)}" y1="${my.toFixed(1)}"
            x2="${(mx + Math.cos(fa) * fl).toFixed(1)}" y2="${(my + Math.sin(fa) * fl).toFixed(1)}"
            stroke="#5A6A4E" stroke-width="0.75" stroke-opacity="0.55" stroke-linecap="round"/>`);
        });
      }
    }
    return out.join('\n');
  }

  // ── Compose SVG ──────────────────────────────────────────
  const strands = formationStrands();
  const overlays = [];
  if (addons.includes('gold'))    overlays.push(goldFlakes());
  if (addons.includes('silver'))  overlays.push(silverFlakes());
  if (addons.includes('flowers')) overlays.push(pressedFlowers());

  // The resin body — warm cream/taupe gradient (bespoke theme)
  const body = showResin ? `
    <defs>
      <radialGradient id="body_${id}" cx="42%" cy="35%" r="62%">
        <stop offset="0%"   stop-color="#EFE3D2" stop-opacity="0.95"/>
        <stop offset="50%"  stop-color="#D4C4AC" stop-opacity="0.82"/>
        <stop offset="100%" stop-color="#9C8268" stop-opacity="0.65"/>
      </radialGradient>
      <radialGradient id="sheen_${id}" cx="36%" cy="26%" r="50%">
        <stop offset="0%"   stop-color="white" stop-opacity="0.55"/>
        <stop offset="50%"  stop-color="white" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="white" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="depth_${id}" cx="58%" cy="70%" r="55%">
        <stop offset="0%"   stop-color="#5A4830" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="#5A4830" stop-opacity="0"/>
      </radialGradient>
      <clipPath id="clip_${id}">
        <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>
      </clipPath>
      <filter id="blur_${id}"><feGaussianBlur stdDeviation="0.6"/></filter>
    </defs>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#body_${id})"/>
  ` : `
    <defs>
      <clipPath id="clip_${id}">
        <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>
      </clipPath>
      <filter id="blur_${id}"><feGaussianBlur stdDeviation="0.6"/></filter>
    </defs>
  `;

  const overlay = showResin ? `
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#depth_${id})"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#sheen_${id})"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"
      fill="none" stroke="rgba(255,255,255,0.32)" stroke-width="1.5"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx-1}" ry="${ry-1}"
      fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="0.5"/>
    <ellipse cx="${(cx - rx * 0.22).toFixed(1)}" cy="${(cy - ry * 0.28).toFixed(1)}"
      rx="${(rx * 0.08).toFixed(1)}" ry="${(ry * 0.06).toFixed(1)}"
      fill="white" opacity="0.7"/>
  ` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="display:block;">
    ${body}
    <g clip-path="url(#clip_${id})" filter="url(#blur_${id})">
      ${strands}
    </g>
    <g clip-path="url(#clip_${id})">
      ${overlays.join('\n')}
    </g>
    ${overlay}
  </svg>`;
}

window.makeBespokePreviewSVG = makeBespokePreviewSVG;
