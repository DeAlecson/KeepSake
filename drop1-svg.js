/**
 * Keepsake Product 1 — Resin Drop SVG Generator
 * Renders translucent oblate disc/puck with decorative inclusions:
 * - lava: tri-color lava lamp blobs
 * - goldflake: scattered gold foil fragments
 * - flora: pressed flowers + botanicals
 * - colorwash: fluid paint pour / alcohol ink style
 * - marble: swirled marble effect
 *
 * Product 2 (bespoke hair) is handled by puck-svg.js
 */

function makeDrop1SVG(opts) {
  const { w = 200, h = 200, style = 'lava', colors = ['#C69B3C','#8A7968','#F4EADE'], seed = 42, label = '' } = opts;
  const cx = w / 2, cy = h / 2;
  // Oblate disc — slightly wider than tall
  const rx = w * 0.46, ry = h * 0.44;
  const id = `d1_${style}_${seed}`;

  let s = seed;
  function rand() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
  function rr(a, b) { return a + rand() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

  // ── Base glass body gradients ──────────────────────────
  function baseGradients(tint1, tint2, opacity1 = 0.75, opacity2 = 0.55) {
    return `
    <radialGradient id="body_${id}" cx="42%" cy="36%" r="66%">
      <stop offset="0%"   stop-color="${tint1}" stop-opacity="${opacity1}"/>
      <stop offset="55%"  stop-color="${tint2}" stop-opacity="${opacity2}"/>
      <stop offset="100%" stop-color="${tint2}" stop-opacity="0.35"/>
    </radialGradient>
    <radialGradient id="sheen_${id}" cx="36%" cy="26%" r="50%">
      <stop offset="0%"   stop-color="white" stop-opacity="0.6"/>
      <stop offset="40%"  stop-color="white" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="edge_${id}" cx="50%" cy="50%" r="50%">
      <stop offset="70%"  stop-color="transparent" stop-opacity="0"/>
      <stop offset="100%" stop-color="${tint2}" stop-opacity="0.25"/>
    </radialGradient>`;
  }

  function clipAndDefs(extraDefs = '') {
    return `<defs>
      ${extraDefs}
      <clipPath id="clip_${id}">
        <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>
      </clipPath>
    </defs>`;
  }

  function glassBody(tint1, tint2, opacity1, opacity2) {
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#body_${id})"/>`;
  }

  function glassOverlay() {
    return `
    <!-- depth edge -->
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#edge_${id})"/>
    <!-- sheen -->
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#sheen_${id})"/>
    <!-- rim -->
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx-1.5}" ry="${ry-1.5}" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>
    <!-- specular -->
    <ellipse cx="${(cx - rx*0.2).toFixed(1)}" cy="${(cy - ry*0.26).toFixed(1)}"
      rx="${(rx*0.09).toFixed(1)}" ry="${(ry*0.07).toFixed(1)}"
      fill="white" opacity="0.75"/>`;
  }

  // ─────────────────────────────────────────────────────
  // STYLE: LAVA — tri-color blob formations
  // ─────────────────────────────────────────────────────
  if (style === 'lava') {
    const [c1, c2, c3] = colors;
    // base is semi-translucent c3
    const blobs = [];

    // Big anchor blob bottom
    blobs.push(`<ellipse cx="${cx}" cy="${cy + ry*0.28}" rx="${rx*0.32}" ry="${ry*0.36}" fill="${c2}" opacity="0.82"/>`);
    // Rising tall centre blob
    blobs.push(`<ellipse cx="${cx + rr(-rx*0.08, rx*0.08)}" cy="${cy - ry*0.05}" rx="${rx*0.21}" ry="${ry*0.48}" fill="${c1}" opacity="0.78"/>`);
    // Left side blob
    blobs.push(`<ellipse cx="${cx - rx*0.38}" cy="${cy + ry*0.15}" rx="${rx*0.22}" ry="${ry*0.28}" fill="${c2}" opacity="0.7"/>`);
    // Small floating dot top-left
    blobs.push(`<circle cx="${cx - rx*0.3}" cy="${cy - ry*0.5}" r="${rx*0.1}" fill="${c1}" opacity="0.65"/>`);
    // Right side blob
    blobs.push(`<ellipse cx="${cx + rx*0.4}" cy="${cy + ry*0.2}" rx="${rx*0.2}" ry="${ry*0.25}" fill="${c1}" opacity="0.6"/>`);
    // Small top-right
    blobs.push(`<circle cx="${cx + rx*0.32}" cy="${cy - ry*0.42}" r="${rx*0.08}" fill="${c2}" opacity="0.55"/>`);

    const defs = baseGradients(c3, c3.replace('#','#')+'cc', 0.65, 0.45);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="display:block;">
    ${clipAndDefs(defs)}
    ${glassBody(c3, c3)}
    <g clip-path="url(#clip_${id})">
      ${blobs.join('\n')}
    </g>
    ${glassOverlay()}
  </svg>`;
  }

  // ─────────────────────────────────────────────────────
  // STYLE: GOLDFLAKE — scattered gold foil fragments in clear resin
  // ─────────────────────────────────────────────────────
  if (style === 'goldflake') {
    const flakeColor = colors[0] || '#C69B3C';
    const flakes = [];
    const count = 18 + Math.floor(rand() * 12);
    for (let i = 0; i < count; i++) {
      // Random polygon-ish flake using a rotated, skewed rect
      const fx = cx + rr(-rx*0.75, rx*0.75);
      const fy = cy + rr(-ry*0.72, ry*0.72);
      const fw = rr(4, 16);
      const fh = rr(2, 9);
      const angle = rr(0, 180);
      const op = rr(0.35, 0.85);
      // Irregular polygon approximation
      const pts = [
        [fx + rr(-fw*0.2,fw*0.2), fy - fh*0.5 + rr(-2,2)],
        [fx + fw*0.5 + rr(-3,3), fy + rr(-fh*0.3,fh*0.3)],
        [fx + rr(-fw*0.1,fw*0.3), fy + fh*0.5 + rr(-2,2)],
        [fx - fw*0.5 + rr(-3,3), fy + rr(-fh*0.2,fh*0.2)],
      ].map(p => p.join(',')).join(' ');
      flakes.push(`<polygon points="${pts}" fill="${flakeColor}" opacity="${op.toFixed(2)}" transform="rotate(${angle.toFixed(1)},${fx.toFixed(1)},${fy.toFixed(1)})"/>`);
    }
    // A few silver ones too
    for (let i = 0; i < 5; i++) {
      const fx = cx + rr(-rx*0.65, rx*0.65);
      const fy = cy + rr(-ry*0.65, ry*0.65);
      const fw = rr(3, 10);
      const pts = [
        [fx, fy - fw*0.5], [fx + fw*0.5, fy], [fx, fy + fw*0.5], [fx - fw*0.5, fy]
      ].map(p => p.join(',')).join(' ');
      flakes.push(`<polygon points="${pts}" fill="rgba(220,220,235,0.6)" opacity="${rr(0.3,0.7).toFixed(2)}"/>`);
    }

    const defs = baseGradients('rgba(240,232,215,1)', 'rgba(215,205,185,1)', 0.88, 0.7);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="display:block;">
    ${clipAndDefs(defs)}
    ${glassBody()}
    <g clip-path="url(#clip_${id})">
      <rect x="${cx-rx}" y="${cy-ry}" width="${rx*2}" height="${ry*2}" fill="rgba(235,225,200,0.3)"/>
      ${flakes.join('\n')}
    </g>
    ${glassOverlay()}
  </svg>`;
  }

  // ─────────────────────────────────────────────────────
  // STYLE: FLORA — pressed flowers in clear/tinted resin
  // ─────────────────────────────────────────────────────
  if (style === 'flora') {
    const [petalCol, stemCol, bgTint] = colors;

    // Draw a simple stylised flower
    function flower(x, y, r, col, petals = 6) {
      const parts = [];
      for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r * 0.9;
        parts.push(`<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}"
          rx="${(r*0.48).toFixed(1)}" ry="${(r*0.32).toFixed(1)}"
          fill="${col}" opacity="0.82"
          transform="rotate(${((angle*180/Math.PI)+90).toFixed(1)},${px.toFixed(1)},${py.toFixed(1)})"/>`);
      }
      // Centre
      parts.push(`<circle cx="${x}" cy="${y}" r="${(r*0.32).toFixed(1)}" fill="rgba(210,150,40,0.9)"/>`);
      parts.push(`<circle cx="${x}" cy="${y}" r="${(r*0.16).toFixed(1)}" fill="rgba(255,200,60,0.8)"/>`);
      return parts.join('\n');
    }

    // Fern/stem lines
    function fern(x, y, len, angle, col) {
      const parts = [];
      const ex = x + Math.cos(angle) * len;
      const ey = y + Math.sin(angle) * len;
      parts.push(`<line x1="${x}" y1="${y}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}"
        stroke="${col}" stroke-width="1.2" stroke-opacity="0.7" stroke-linecap="round"/>`);
      // side fronds
      for (let i = 1; i <= 4; i++) {
        const t = i / 5;
        const mx = x + Math.cos(angle) * len * t;
        const my = y + Math.sin(angle) * len * t;
        const fl = len * 0.18 * (1 - t * 0.4);
        [-1,1].forEach(side => {
          const fa = angle + side * 0.8;
          parts.push(`<line x1="${mx.toFixed(1)}" y1="${my.toFixed(1)}"
            x2="${(mx+Math.cos(fa)*fl).toFixed(1)}" y2="${(my+Math.sin(fa)*fl).toFixed(1)}"
            stroke="${col}" stroke-width="0.8" stroke-opacity="0.55" stroke-linecap="round"/>`);
        });
      }
      return parts.join('\n');
    }

    // Small scattered petals
    function loosePetal(x, y, col) {
      const r = rr(4, 9);
      const a = rr(0, 360);
      return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}"
        rx="${r.toFixed(1)}" ry="${(r*0.55).toFixed(1)}"
        fill="${col}" opacity="${rr(0.5,0.8).toFixed(2)}"
        transform="rotate(${a.toFixed(1)},${x.toFixed(1)},${y.toFixed(1)})"/>`;
    }

    const content = [];
    // Background tint
    content.push(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${bgTint}" opacity="0.18"/>`);

    // Ferns
    content.push(fern(cx-rx*0.1, cy+ry*0.15, ry*0.7, -Math.PI/2 - 0.3, stemCol));
    content.push(fern(cx+rx*0.2, cy+ry*0.2, ry*0.55, -Math.PI/2 + 0.4, stemCol));

    // Main flower centre
    content.push(flower(cx, cy+ry*0.05, rx*0.28, petalCol, 7));

    // Small scattered petals
    for (let i = 0; i < 8; i++) {
      content.push(loosePetal(cx + rr(-rx*0.65, rx*0.65), cy + rr(-ry*0.6, ry*0.6), petalCol));
    }
    // Gold flake sprinkle
    for (let i = 0; i < 6; i++) {
      const fx = cx + rr(-rx*0.65, rx*0.65);
      const fy = cy + rr(-ry*0.6, ry*0.6);
      content.push(`<polygon points="${fx},${fy-3} ${fx+3},${fy} ${fx},${fy+3} ${fx-3},${fy}"
        fill="rgba(198,155,60,0.6)" opacity="${rr(0.3,0.7).toFixed(2)}"/>`);
    }

    const defs = baseGradients('rgba(248,242,234,1)', 'rgba(230,220,200,1)', 0.82, 0.65);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="display:block;">
    ${clipAndDefs(defs)}
    ${glassBody()}
    <g clip-path="url(#clip_${id})">
      ${content.join('\n')}
    </g>
    ${glassOverlay()}
  </svg>`;
  }

  // ─────────────────────────────────────────────────────
  // STYLE: COLORWASH — fluid alcohol ink / resin pour
  // ─────────────────────────────────────────────────────
  if (style === 'colorwash') {
    const [c1, c2, c3] = colors;
    // Big fluid blobs of colour bleeding into each other
    const pools = [
      { x: cx - rx*0.2, y: cy + ry*0.15, rx: rx*0.55, ry: ry*0.55, col: c1, op: 0.72 },
      { x: cx + rx*0.28, y: cy - ry*0.2, rx: rx*0.45, ry: ry*0.45, col: c2, op: 0.65 },
      { x: cx - rx*0.15, y: cy - ry*0.32, rx: rx*0.38, ry: ry*0.3, col: c3, op: 0.55 },
    ];
    const defs = baseGradients('rgba(255,252,248,1)', 'rgba(240,235,225,1)', 0.6, 0.4) +
      `<filter id="soften_${id}"><feGaussianBlur stdDeviation="8"/></filter>`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="display:block;">
    ${clipAndDefs(defs)}
    ${glassBody()}
    <g clip-path="url(#clip_${id})" filter="url(#soften_${id})">
      ${pools.map(p => `<ellipse cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}"
        rx="${p.rx.toFixed(1)}" ry="${p.ry.toFixed(1)}"
        fill="${p.col}" opacity="${p.op}"/>`).join('\n')}
    </g>
    <!-- crisp specks -->
    <g clip-path="url(#clip_${id})">
      ${Array.from({length:6},(_,i)=>{
        const sx = cx+rr(-rx*0.5,rx*0.5), sy = cy+rr(-ry*0.5,ry*0.5);
        return `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${rr(1,3).toFixed(1)}"
          fill="white" opacity="${rr(0.2,0.5).toFixed(2)}"/>`;
      }).join('')}
    </g>
    ${glassOverlay()}
  </svg>`;
  }

  // ─────────────────────────────────────────────────────
  // STYLE: MARBLE — swirled marble veins
  // ─────────────────────────────────────────────────────
  if (style === 'marble') {
    const [veinCol, baseCol] = colors;
    const veins = [];
    for (let i = 0; i < 8; i++) {
      const startX = cx + rr(-rx, rx);
      const startY = cy + rr(-ry, ry);
      const cp1x = startX + rr(-60, 60); const cp1y = startY + rr(-40, 40);
      const cp2x = cp1x + rr(-50, 50);   const cp2y = cp1y + rr(-50, 50);
      const endX = cp2x + rr(-60, 60);   const endY = cp2y + rr(-40, 40);
      veins.push(`<path d="M${startX.toFixed(1)},${startY.toFixed(1)} C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}"
        stroke="${veinCol}" stroke-width="${rr(0.5,2).toFixed(1)}" fill="none"
        stroke-opacity="${rr(0.25,0.65).toFixed(2)}" stroke-linecap="round"/>`);
    }
    const defs = baseGradients(baseCol, baseCol, 0.85, 0.7);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="display:block;">
    ${clipAndDefs(defs)}
    ${glassBody()}
    <g clip-path="url(#clip_${id})">
      ${veins.join('\n')}
    </g>
    ${glassOverlay()}
  </svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${colors[0]}"/>
  </svg>`;
}

window.makeDrop1SVG = makeDrop1SVG;
