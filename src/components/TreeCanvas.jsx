import { useEffect, useRef } from 'react';

/**
 * Premium organic tree animation — Canvas API.
 *
 * GROWTH:  trunk → large branches → small branches → leaf nodes
 * SCROLL:  reverse deformation — leaves first, trunk last
 *
 * Styling: thick tapering trunk, muted palette, subtle leaf nodes.
 */

/* ================================================================
   PALETTE — muted, desaturated tones at moderate opacity
   ================================================================ */
function branchColor(depth, maxDepth) {
  // palette hues: gray-blue, teal, slate-purple, neutral
  const palettes = [
    [140, 150, 170],  // soft gray-blue
    [120, 160, 175],  // muted teal
    [130, 140, 180],  // desaturated blue
    [150, 138, 172],  // light purple
    [135, 150, 158],  // neutral slate
  ];
  const pick = palettes[Math.floor(Math.random() * palettes.length)];
  // deeper branches get slightly lower opacity
  const alpha = 0.55 - (depth / maxDepth) * 0.18;
  return {
    stroke: `rgba(${pick[0]}, ${pick[1]}, ${pick[2]}, ${alpha.toFixed(2)})`,
    rgb: pick,
    alpha,
  };
}

function leafColor() {
  const palettes = [
    [150, 175, 195],  // soft steel blue
    [140, 180, 180],  // muted teal
    [160, 155, 190],  // light lavender
    [165, 175, 185],  // silver
  ];
  const pick = palettes[Math.floor(Math.random() * palettes.length)];
  return `rgba(${pick[0]}, ${pick[1]}, ${pick[2]}, 0.50)`;
}

/* ================================================================
   HELPERS
   ================================================================ */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/* ================================================================
   BRANCH DATA STRUCTURE
   ================================================================ */
class Branch {
  constructor(sx, sy, angle, length, width, depth, maxDepth) {
    this.sx = sx;                              // start x
    this.sy = sy;                              // start y
    this.angle = angle;
    this.length = length;
    this.width = width;                        // line width (tapering)
    this.depth = depth;
    this.maxDepth = maxDepth;

    // end point
    this.ex = sx + Math.cos(angle) * length;
    this.ey = sy + Math.sin(angle) * length;

    // color
    const col = branchColor(depth, maxDepth);
    this.stroke = col.stroke;
    this.rgb = col.rgb;
    this.alpha = col.alpha;

    // is this a terminal branch? (will have leaf)
    this.isTerminal = false;
    this.leafColor = leafColor();
    this.leafRadius = rand(3.0, 5.5);

    // animation
    this.progress = 0;     // 0 = not drawn, 1 = fully drawn
    this.leafProgress = 0; // 0 = no leaf, 1 = full leaf

    this.children = [];
  }
}

/* ================================================================
   TREE GENERATION — recursive with natural tapering
   ================================================================ */
function buildTree(canvasW, canvasH) {
  const isMobile = canvasW < 600;
  const maxDepth = isMobile ? 10 : 12;

  // trunk starts at bottom center, slight offset
  const startX = canvasW / 2 + rand(-20, 20);
  const startY = canvasH + 5; // slightly below canvas edge

  const trunkLength = Math.min(canvasH, canvasW) * (isMobile ? 0.22 : 0.25);
  const trunkWidth = isMobile ? 8.0 : 10.0;

  const trunk = new Branch(
    startX,
    startY,
    -Math.PI / 2 + rand(-0.04, 0.04), // nearly straight up
    trunkLength,
    trunkWidth,
    0,
    maxDepth
  );

  // recursive child generation
  function generateChildren(parent) {
    if (parent.depth >= parent.maxDepth) {
      parent.isTerminal = true;
      return;
    }

    // number of children depends on depth
    let childCount;
    if (parent.depth === 0) {
      childCount = 5; // trunk has 5 main branches
    } else if (parent.depth < 2) {
      childCount = Math.floor(rand(3, 5));
    } else if (parent.depth < 4) {
      childCount = Math.floor(rand(3, 5));
    } else if (parent.depth < 7) {
      childCount = Math.floor(rand(2, 4));
    } else if (parent.depth < 9) {
      childCount = Math.floor(rand(2, 3));
    } else {
      childCount = Math.floor(rand(1, 3));
    }

    for (let i = 0; i < childCount; i++) {
      // angular spread increases with depth
      const spread = rand(0.2, 0.55);
      // alternate left/right with slight randomness
      const dir = (i % 2 === 0 ? 1 : -1) * (i === 0 && childCount === 3 ? 0 : 1);
      const newAngle = parent.angle + dir * spread + rand(-0.08, 0.08);

      // length shrinks with depth
      const shrink = rand(0.60, 0.80);
      const newLength = parent.length * shrink;

      // width tapers naturally — thicker near trunk, thin at tips
      const taperRatio = parent.depth < 2 ? 0.65 : 0.58;
      const newWidth = Math.max(0.5, parent.width * taperRatio);

      const child = new Branch(
        parent.ex,
        parent.ey,
        newAngle,
        newLength,
        newWidth,
        parent.depth + 1,
        parent.maxDepth
      );

      parent.children.push(child);
      generateChildren(child);
    }

    // if no children ended up being generated, mark as terminal
    if (parent.children.length === 0) {
      parent.isTerminal = true;
    }
  }

  generateChildren(trunk);
  return trunk;
}

/* ================================================================
   FLATTEN — breadth-first ordered by depth for sequential animation
   ================================================================ */
function flattenByDepth(root) {
  const all = [];

  function collect(node) {
    all.push(node);
    for (const c of node.children) {
      collect(c);
    }
  }
  collect(root);

  // sort by depth so trunk draws first, leaves last
  all.sort((a, b) => a.depth - b.depth);
  return all;
}

/* ================================================================
   REACT COMPONENT
   ================================================================ */
export default function TreeCanvas() {
  const canvasRef = useRef(null);
  const state = useRef({
    branches: [],
    maxDepth: 0,
    growDone: false,
    animId: null,
    startTime: null,
    scrollProgress: 0,   // 0 = no scroll (tree fully visible), 1 = fully deformed
    needsRedraw: false,
  });

  /* ---- INIT: size canvas & build tree ---- */
  function init() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const root = buildTree(w, h);
    const branches = flattenByDepth(root);
    const maxDepth = branches.reduce((m, b) => Math.max(m, b.depth), 0);

    const s = state.current;
    s.branches = branches;
    s.maxDepth = maxDepth;
    s.growDone = false;
    s.startTime = null;
    s.scrollProgress = 0;

    // cancel any running animation
    if (s.animId) cancelAnimationFrame(s.animId);
    s.animId = requestAnimationFrame(growLoop);
  }

  /* ---- DRAW — renders current state of all branches ---- */
  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const { branches } = state.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < branches.length; i++) {
      const b = branches[i];
      if (b.progress <= 0.001) continue;

      const p = b.progress;

      // current end point based on progress
      const cx = b.sx + (b.ex - b.sx) * p;
      const cy = b.sy + (b.ey - b.sy) * p;

      // draw the branch line with tapering
      // width tapers from full width at start to ~60% at end
      const startW = b.width * dpr;
      const endW = b.width * 0.55 * dpr * p;

      // for thick branches (depth < 3), draw a tapered path
      if (b.width > 1.5) {
        // draw tapered branch using two lines for a subtle taper effect
        ctx.beginPath();
        ctx.moveTo(b.sx * dpr, b.sy * dpr);
        ctx.lineTo(cx * dpr, cy * dpr);
        ctx.strokeStyle = b.stroke;
        ctx.lineWidth = (startW + endW) / 2;
        ctx.stroke();
      } else {
        // thin branches — simple line
        ctx.beginPath();
        ctx.moveTo(b.sx * dpr, b.sy * dpr);
        ctx.lineTo(cx * dpr, cy * dpr);
        ctx.strokeStyle = b.stroke;
        ctx.lineWidth = b.width * dpr;
        ctx.stroke();
      }

      // draw leaf node at terminal branches
      if (b.isTerminal && b.leafProgress > 0.01) {
        const lp = b.leafProgress;
        const lr = b.leafRadius * dpr * lp;

        ctx.beginPath();
        ctx.arc(cx * dpr, cy * dpr, lr, 0, Math.PI * 2);
        ctx.fillStyle = b.leafColor;
        ctx.globalAlpha = lp * 0.7;
        ctx.fill();

        // very subtle soft highlight — a second slightly larger, dimmer circle
        ctx.beginPath();
        ctx.arc(cx * dpr, cy * dpr, lr * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = b.leafColor;
        ctx.globalAlpha = lp * 0.12;
        ctx.fill();

        ctx.globalAlpha = 1;
      }
    }
  }

  /* ---- GROWTH ANIMATION LOOP ---- */
  function growLoop(timestamp) {
    const s = state.current;
    if (!s.startTime) s.startTime = timestamp;

    const elapsed = timestamp - s.startTime;
    const TOTAL = 3200; // 3.2 seconds total

    const count = s.branches.length;
    const maxD = s.maxDepth;

    for (let i = 0; i < count; i++) {
      const b = s.branches[i];

      // each depth level gets a time slice
      // trunk (depth 0) starts at t=0, deepest starts at ~65% of total
      const depthRatio = b.depth / maxD;
      const branchStartTime = depthRatio * TOTAL * 0.65;
      const branchDuration = TOTAL * 0.30; // each branch takes ~30% of total to draw
      const localElapsed = elapsed - branchStartTime;

      if (localElapsed <= 0) {
        b.progress = 0;
        b.leafProgress = 0;
      } else if (localElapsed >= branchDuration) {
        b.progress = 1;
        // leaves appear after branch fully drawn, with a small additional delay
        if (b.isTerminal) {
          const leafDelay = 100; // ms after branch completes
          const leafDuration = 400;
          const leafElapsed = localElapsed - branchDuration - leafDelay;
          if (leafElapsed <= 0) {
            b.leafProgress = 0;
          } else {
            b.leafProgress = Math.min(1, easeOutCubic(leafElapsed / leafDuration));
          }
        }
      } else {
        b.progress = easeOutCubic(localElapsed / branchDuration);
        b.leafProgress = 0;
      }
    }

    draw();

    if (elapsed < TOTAL + 600) { // +600ms for leaf animations to finish
      s.animId = requestAnimationFrame(growLoop);
    } else {
      // finalize
      for (const b of s.branches) {
        b.progress = 1;
        if (b.isTerminal) b.leafProgress = 1;
      }
      s.growDone = true;
      draw();
    }
  }

  /* ---- SCROLL DEFORMATION ---- */
  function handleScroll() {
    const s = state.current;
    if (!s.growDone) return;

    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    // map scroll to 0 → 1 deformation progress
    // starts deforming immediately, fully gone by 70% viewport scroll
    const deformation = Math.min(1, Math.max(0, scrollY / (vh * 0.65)));
    s.scrollProgress = deformation;

    applyDeformation(deformation);
    draw();
  }

  function applyDeformation(d) {
    // d = 0: fully visible, d = 1: fully gone
    // Reverse order: leaves/tips disappear first, trunk last

    const s = state.current;
    const maxD = s.maxDepth;

    for (const b of s.branches) {
      // each depth level has a deformation window
      // deepest branches (highest depth) start disappearing first
      const reversedDepth = maxD - b.depth; // 0 = leaf level, maxD = trunk
      const depthRatio = reversedDepth / maxD;

      // each depth band occupies a portion of the deformation range
      // with overlap so it feels smooth
      const bandWidth = 1.0 / (maxD + 1) * 2.2; // slightly overlapping bands
      const bandStart = depthRatio * (1 - bandWidth * 0.5);
      const bandEnd = bandStart + bandWidth;

      // how far through this band's deformation are we?
      const localD = Math.min(1, Math.max(0, (d - bandStart) / (bandEnd - bandStart)));

      // Reverse the progress: 1 → 0
      b.progress = 1 - easeOutCubic(localD);

      // leaves disappear faster
      if (b.isTerminal) {
        // leaves start disappearing even before the branch
        const leafD = Math.min(1, Math.max(0, (d - bandStart * 0.7) / (bandWidth * 0.5)));
        b.leafProgress = 1 - Math.min(1, easeOutCubic(leafD));
      }
    }
  }

  /* ---- LIFECYCLE ---- */
  useEffect(() => {
    init();

    const onResize = () => init();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', handleScroll);
      const s = state.current;
      if (s.animId) cancelAnimationFrame(s.animId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas"
      aria-hidden="true"
    />
  );
}
