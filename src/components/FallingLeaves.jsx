import { useEffect, useRef } from 'react';

/**
 * FallingLeaves — Canvas-based ambient leaf particles.
 *
 * Draws gently falling, swaying leaf shapes that drift downward.
 * Uses the same muted golden-amber palette as TreeBackground's leaves.
 * The canvas is positioned as a fixed overlay starting from the About section
 * and spanning the full remaining page height.
 */

/* ================================================================
   HELPERS
   ================================================================ */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/* ================================================================
   LEAF PARTICLE
   ================================================================ */
class Leaf {
  constructor(canvasW, canvasH, startFromTop = false) {
    this.canvasW = canvasW;
    this.canvasH = canvasH;

    // Position — spread across full width, start above viewport or randomly
    this.x = rand(0, canvasW);
    this.y = startFromTop ? rand(-80, -10) : rand(-canvasH * 0.1, canvasH);

    // Size — small, subtle leaves
    this.size = rand(4, 10);

    // Movement
    this.speedY = rand(0.25, 0.9);       // gentle fall speed
    this.speedX = rand(-0.15, 0.15);      // slight horizontal drift
    this.swayAmplitude = rand(15, 40);     // horizontal sway range
    this.swaySpeed = rand(0.008, 0.02);    // sway oscillation speed
    this.swayOffset = rand(0, Math.PI * 2);

    // Rotation
    this.rotation = rand(0, Math.PI * 2);
    this.rotationSpeed = rand(-0.015, 0.015);

    // Appearance
    this.opacity = rand(0.08, 0.28);
    this.color = this._pickColor();

    // Leaf shape type (0 = oval, 1 = pointed, 2 = round)
    this.shape = Math.floor(rand(0, 3));

    // Phase for animation timing
    this.phase = rand(0, 1000);
  }

  _pickColor() {
    const colors = [
      [200, 175, 100],  // soft gold
      [185, 160, 90],   // warm amber
      [175, 150, 110],  // muted tan
      [195, 165, 85],   // golden
      [180, 155, 105],  // warm neutral
      [150, 175, 195],  // steel blue (from TreeCanvas)
      [140, 180, 180],  // muted teal
      [160, 155, 190],  // light lavender
    ];
    return colors[Math.floor(rand(0, colors.length))];
  }

  update(time) {
    // Vertical fall
    this.y += this.speedY;

    // Horizontal sway — sine wave
    this.x += this.speedX + Math.sin(time * this.swaySpeed + this.swayOffset) * 0.3;

    // Rotation
    this.rotation += this.rotationSpeed;

    // Reset when leaf falls below canvas
    if (this.y > this.canvasH + 20) {
      this.y = rand(-60, -10);
      this.x = rand(0, this.canvasW);
      this.opacity = rand(0.08, 0.28);
      this.speedY = rand(0.25, 0.9);
    }

    // Wrap horizontally
    if (this.x < -30) this.x = this.canvasW + 20;
    if (this.x > this.canvasW + 30) this.x = -20;
  }

  draw(ctx, dpr) {
    ctx.save();
    ctx.translate(this.x * dpr, this.y * dpr);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.opacity;

    const s = this.size * dpr;
    const [r, g, b] = this.color;
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

    switch (this.shape) {
      case 0: // Oval leaf
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.4, s * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 1: // Pointed leaf shape
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.8);
        ctx.bezierCurveTo(s * 0.5, -s * 0.3, s * 0.45, s * 0.4, 0, s * 0.7);
        ctx.bezierCurveTo(-s * 0.45, s * 0.4, -s * 0.5, -s * 0.3, 0, -s * 0.8);
        ctx.fill();
        break;

      case 2: // Round leaf (like tree dots)
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2);
        ctx.fill();
        // Soft glow
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
        ctx.globalAlpha = this.opacity * 0.15;
        ctx.fill();
        break;

      default:
        break;
    }

    ctx.restore();
  }
}

/* ================================================================
   REACT COMPONENT
   ================================================================ */
export default function FallingLeaves() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    leaves: [],
    animId: null,
    startTime: null,
    aboutOffsetTop: 0,
    visible: false,
  });

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

    // Find the About section's top offset
    const aboutEl = document.getElementById('about');
    if (aboutEl) {
      stateRef.current.aboutOffsetTop = aboutEl.offsetTop;
    }

    // Determine leaf count based on screen size
    const isMobile = w < 600;
    const leafCount = isMobile ? 25 : 50;

    // Create leaves
    const leaves = [];
    for (let i = 0; i < leafCount; i++) {
      leaves.push(new Leaf(w, h, false));
    }

    const s = stateRef.current;
    s.leaves = leaves;
    s.startTime = null;

    if (s.animId) cancelAnimationFrame(s.animId);
    s.animId = requestAnimationFrame(loop);
  }

  function loop(timestamp) {
    const s = stateRef.current;
    if (!s.startTime) s.startTime = timestamp;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    // Determine visibility based on scroll position
    const scrollY = window.scrollY;
    const aboutTop = s.aboutOffsetTop;

    // Start showing leaves when scrolled to ~80% of the way to About section
    const activationPoint = aboutTop * 0.75;
    s.visible = scrollY >= activationPoint;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (s.visible) {
      // Fade-in factor based on how far past the activation point
      const fadeInDistance = aboutTop * 0.25;
      const fadeIn = Math.min(1, (scrollY - activationPoint) / fadeInDistance);

      const time = timestamp - s.startTime;

      for (const leaf of s.leaves) {
        leaf.update(time);

        // Apply the global fade-in to each leaf
        const origOpacity = leaf.opacity;
        leaf.opacity = origOpacity * fadeIn;
        leaf.draw(ctx, dpr);
        leaf.opacity = origOpacity;
      }
    }

    s.animId = requestAnimationFrame(loop);
  }

  useEffect(() => {
    init();

    const onResize = () => init();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      const s = stateRef.current;
      if (s.animId) cancelAnimationFrame(s.animId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="falling-leaves-canvas"
      aria-hidden="true"
    />
  );
}
