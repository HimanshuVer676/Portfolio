import { useEffect, useRef } from 'react';

/**
 * Realistic illustrated tree — Canvas 2D.
 *
 * Draws a textbook-style tree with:
 *   - Thick solid trunk with natural taper
 *   - Clearly visible branch structure (bezier curves)
 *   - Rounded leaf clusters at branch tips
 *   - Seeded random → identical on every refresh
 *   - Growth animation on load
 *   - Scroll-based retraction
 */

/* ================================================================
   SEEDED PRNG — mulberry32 (same tree every refresh)
   ================================================================ */
function createRng(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ================================================================
   TREE DATA STRUCTURE
   ================================================================ */
class BranchSegment {
  constructor(x1, y1, x2, y2, cpx, cpy, width, depth, maxDepth) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.cpx = cpx; // control point for quadratic curve
    this.cpy = cpy;
    this.width = width;
    this.depth = depth;
    this.maxDepth = maxDepth;
    this.children = [];
    this.leaves = []; // { x, y, radius }
    this.progress = 0; // 0→1 for growth animation
    this.leafProgress = 0;
  }
}

/* ================================================================
   TREE GENERATION — realistic textbook style
   ================================================================ */
function buildRealisticTree(canvasW, canvasH) {
  const SEED = 271828;
  const rand = createRng(SEED);
  const rr = (min, max) => rand() * (max - min) + min;

  const isMobile = canvasW < 600;
  const maxDepth = isMobile ? 7 : 9;

  // Scale everything relative to canvas
  const scale = Math.min(canvasW, canvasH) / 900;

  // Trunk starts at bottom center
  const startX = canvasW / 2;
  const startY = canvasH + 2;

  // Trunk length — about 30% of canvas height
  const trunkLen = canvasH * 0.30;
  // Trunk width — ~10px scaled (≈1cm)
  const trunkWidth = Math.max(8, 12 * scale);

  // Allow tree to complete naturally without flattening at the top
  const topMargin = -500;
  const maxY = topMargin; // minimum Y value (canvas Y is inverted)

  const allBranches = [];

  function addBranch(x1, y1, angle, length, width, depth) {
    if (depth > maxDepth || width < 0.6 || length < 3) return;

    let x2 = x1 + Math.cos(angle) * length;
    let y2 = y1 + Math.sin(angle) * length;

    if (y2 < maxY) {
      const ratio = (maxY - y1) / (y2 - y1);
      x2 = x1 + (x2 - x1) * Math.max(0.1, ratio);
      y2 = maxY;
      length = length * Math.max(0.1, ratio);
    }

    // Very slight bend for perfect structure
    const bendAmount = depth === 0 ? 0.01 : 0.04;
    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);
    const bend = rr(-bendAmount, bendAmount) * length;
    const cpx = (x1 + x2) / 2 + perpX * bend;
    const cpy = (y1 + y2) / 2 + perpY * bend;

    const seg = new BranchSegment(x1, y1, x2, y2, cpx, cpy, width, depth, maxDepth);
    allBranches.push(seg);

    // Leaves at tips (sparse)
    if (depth >= maxDepth - 2) {
      const leafCount = Math.floor(rr(1, 3));
      for (let i = 0; i < leafCount; i++) {
        const lAngle = rr(0, Math.PI * 2);
        const lDist = rr(2, 6) * scale;
        seg.leaves.push({
          x: x2 + Math.cos(lAngle) * lDist,
          y: y2 + Math.sin(lAngle) * lDist,
          radius: rr(1.0, 2.0) * scale,
          opacity: rr(0.10, 0.22),
        });
      }
    }
    
    // Scatter sparse leaves along mid-depth branches
    if (depth >= maxDepth - 3 && depth < maxDepth - 1 && rand() < 0.3) {
      const lAngle = rr(0, Math.PI * 2);
      const t = rr(0.6, 1.0);
      const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cpx + t * t * x2;
      const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cpy + t * t * y2;
      const lDist = rr(2, 5) * scale;
      seg.leaves.push({
        x: px + Math.cos(lAngle) * lDist,
        y: py + Math.sin(lAngle) * lDist,
        radius: rr(1.0, 2.0) * scale,
        opacity: rr(0.10, 0.22),
      });
    }

    if (depth >= maxDepth) return;
    if (y2 <= maxY + 5) return;

    // Structured, symmetrical branching
    let childCount = 2;
    let spreadAngle = 0.5;

    if (depth === 0) {
      childCount = 5; // Perfect 5-branch fan for trunk
      spreadAngle = 1.7; // Wide spread
    } else if (depth === 1) {
      childCount = 3;
      spreadAngle = 1.0;
    } else if (depth < 4) {
      childCount = 2;
      spreadAngle = 0.7 - depth * 0.05;
    } else {
      childCount = rand() < 0.85 ? 2 : 1;
      spreadAngle = 0.5;
    }

    for (let c = 0; c < childCount; c++) {
      let slot = 0;
      if (childCount > 1) {
        slot = -0.5 + (c / (childCount - 1));
      }
      
      const childAngle = angle + slot * spreadAngle + rr(-0.04, 0.04);
      const shrink = depth === 0 ? 0.52 : rr(0.72, 0.80);
      const childLen = length * shrink;
      const taperRatio = depth === 0 ? 0.45 : 0.65;
      const childWidth = Math.max(0.6, width * taperRatio);

      addBranch(x2, y2, childAngle, childLen, childWidth, depth + 1);
      seg.children.push(allBranches[allBranches.length - 1]);
    }
  }

  // Build perfectly structured tree
  addBranch(startX, startY, -Math.PI / 2, trunkLen, trunkWidth, 0);

  // Reaching branches toward "H" of Himanshu (left) and "a" of Verma (right)
  const forkX = startX;
  const forkY = startY - trunkLen;
  
  // Left reaching branch (toward H)
  addBranch(forkX, forkY, -Math.PI / 2 - 1.15, trunkLen * 0.46, trunkWidth * 0.22, 3);
  
  // Right reaching branch (toward a)
  addBranch(forkX, forkY, -Math.PI / 2 + 1.15, trunkLen * 0.46, trunkWidth * 0.22, 3);

  // Sort by depth for drawing order (trunk first)
  allBranches.sort((a, b) => a.depth - b.depth);

  return { branches: allBranches, maxDepth };
}

/* ================================================================
   COLORS — warm muted palette on dark background
   ================================================================ */
function getBranchColor(depth, maxDepth) {
  const t = depth / maxDepth;
  // Trunk: warm brown → Tips: lighter golden
  const r = Math.floor(140 + t * 50);
  const g = Math.floor(100 + t * 50);
  const b = Math.floor(50 + t * 30);
  const a = 0.75 - t * 0.15;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function getLeafColor(opacity) {
  // Soft golden-amber leaves
  const colors = [
    `rgba(200, 175, 100, ${opacity})`,
    `rgba(185, 160, 90, ${opacity})`,
    `rgba(175, 150, 110, ${opacity})`,
    `rgba(195, 165, 85, ${opacity})`,
    `rgba(180, 155, 105, ${opacity})`,
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/* ================================================================
   EASING
   ================================================================ */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/* ================================================================
   REACT COMPONENT
   ================================================================ */
export default function TreeBackground() {
  const canvasRef = useRef(null);
  const state = useRef({
    branches: [],
    maxDepth: 0,
    growDone: false,
    animId: null,
    startTime: null,
    targetScroll: 0,
    currentScroll: 0,
  });

  /* ---- INIT ---- */
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

    const { branches, maxDepth } = buildRealisticTree(w * dpr, h * dpr);

    const s = state.current;
    s.branches = branches;
    s.maxDepth = maxDepth;
    s.growDone = false;
    s.startTime = null;
    s.targetScroll = 0;
    s.currentScroll = 0;

    if (s.animId) cancelAnimationFrame(s.animId);
    s.animId = requestAnimationFrame(growLoop);
  }

  /* ---- DRAW ---- */
  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { branches, maxDepth } = state.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const b of branches) {
      if (b.progress <= 0.005) continue;

      const p = b.progress;

      // Current endpoint based on progress
      const t = p;
      // Point on quadratic bezier at parameter t
      const cx = (1 - t) * (1 - t) * b.x1 + 2 * (1 - t) * t * b.cpx + t * t * b.x2;
      const cy = (1 - t) * (1 - t) * b.y1 + 2 * (1 - t) * t * b.cpy + t * t * b.y2;

      // Draw branch as quadratic bezier (clipped to progress)
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);

      // Draw subdivided bezier up to current progress
      const steps = Math.max(4, Math.floor(20 * p));
      for (let i = 1; i <= steps; i++) {
        const st = (i / steps) * p;
        const sx = (1 - st) * (1 - st) * b.x1 + 2 * (1 - st) * st * b.cpx + st * st * b.x2;
        const sy = (1 - st) * (1 - st) * b.y1 + 2 * (1 - st) * st * b.cpy + st * st * b.y2;
        ctx.lineTo(sx, sy);
      }

      // Width tapers along the branch
      const startW = b.width;
      const endW = b.width * 0.55;
      ctx.lineWidth = startW - (startW - endW) * p;
      ctx.strokeStyle = getBranchColor(b.depth, maxDepth);
      ctx.stroke();

      // Draw leaves
      if (b.leafProgress > 0.01) {
        for (const leaf of b.leaves) {
          const lp = b.leafProgress;
          const lr = leaf.radius * lp;

          // Main leaf dot
          ctx.beginPath();
          ctx.arc(leaf.x, leaf.y, lr, 0, Math.PI * 2);
          ctx.fillStyle = getLeafColor(leaf.opacity * lp);
          ctx.fill();
        }
      }
    }
  }

  /* ---- GROWTH ANIMATION ---- */
  function growLoop(timestamp) {
    const s = state.current;
    if (!s.startTime) s.startTime = timestamp;

    const elapsed = timestamp - s.startTime;
    const TOTAL = 3500; // 3.5s total growth

    for (const b of s.branches) {
      const depthRatio = b.depth / s.maxDepth;
      const branchStart = depthRatio * TOTAL * 0.60;
      const branchDur = TOTAL * 0.35;
      const localT = elapsed - branchStart;

      if (localT <= 0) {
        b.progress = 0;
        b.leafProgress = 0;
      } else if (localT >= branchDur) {
        b.progress = 1;
        // Leaves appear after branch drawn
        const leafDelay = 150;
        const leafDur = 500;
        const leafT = localT - branchDur - leafDelay;
        b.leafProgress = leafT <= 0 ? 0 : Math.min(1, easeOutCubic(leafT / leafDur));
      } else {
        b.progress = easeOutCubic(localT / branchDur);
        b.leafProgress = 0;
      }
    }

    draw();

    if (elapsed < TOTAL + 800) {
      s.animId = requestAnimationFrame(growLoop);
    } else {
      for (const b of s.branches) {
        b.progress = 1;
        b.leafProgress = 1;
      }
      s.growDone = true;
      s.currentScroll = 0;
      s.targetScroll = 0;
      draw();
      s.animId = requestAnimationFrame(scrollLoop);
    }
  }

  /* ---- SCROLL ANIMATION LOOP ---- */
  function scrollLoop() {
    const s = state.current;
    if (!s.growDone) return;

    // Smoothly interpolate current scroll towards target scroll
    // Slower interpolation when scrolling up (targetScroll < currentScroll)
    // so the tree has time to beautifully draw itself back in.
    const isGrowingBack = s.targetScroll < s.currentScroll;
    const lerpFactor = isGrowingBack ? 0.015 : 0.08;
    s.currentScroll += (s.targetScroll - s.currentScroll) * lerpFactor;

    // If there is still a noticeable difference, recalculate and draw
    if (Math.abs(s.targetScroll - s.currentScroll) > 0.001) {
      const d = s.currentScroll;

      for (const b of s.branches) {
        const reversedDepth = s.maxDepth - b.depth;
        const depthRatio = reversedDepth / s.maxDepth;
        const bandWidth = (1.0 / (s.maxDepth + 1)) * 2.2;
        const bandStart = depthRatio * (1 - bandWidth * 0.5);
        const bandEnd = bandStart + bandWidth;
        const localD = Math.min(1, Math.max(0, (d - bandStart) / (bandEnd - bandStart)));

        b.progress = 1 - easeOutCubic(localD);

        if (b.leaves.length > 0) {
          const leafD = Math.min(1, Math.max(0, (d - bandStart * 0.7) / (bandWidth * 0.5)));
          b.leafProgress = 1 - Math.min(1, easeOutCubic(leafD));
        }
      }

      draw();
    }

    s.animId = requestAnimationFrame(scrollLoop);
  }

  /* ---- SCROLL EVENT ---- */
  function handleScroll() {
    const s = state.current;
    if (!s.growDone) return;

    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    s.targetScroll = Math.min(1, Math.max(0, scrollY / (vh * 0.65)));
  }

  /* ---- LIFECYCLE ---- */
  useEffect(() => {
    init();

    window.addEventListener('resize', init);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', init);
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
