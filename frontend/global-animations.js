document.addEventListener("DOMContentLoaded", () => {
  // 1. INJECT CUSTOM CURSORS, CANVAS, LOADER AND MOUSE GLOW INDEPENDENTLY
  injectGlobalElements();

  // 2. CURSOR LOGIC WITH SMOOTH LERP
  const dot = document.getElementById("eco-cursor-dot");
  const ring = document.getElementById("eco-cursor-ring");
  const glow = document.getElementById("mouse-glow");
  
  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  const lerpFactor = 0.15; // smooth lag factor

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (dot) {
      dot.style.left = mouseX + "px";
      dot.style.top = mouseY + "px";
    }
    if (glow) {
      glow.style.left = mouseX + "px";
      glow.style.top = mouseY + "px";
    }
  });

  // Smoothly interpolate the outer cursor ring position
  function animateCursor() {
    ringX += (mouseX - ringX) * lerpFactor;
    ringY += (mouseY - ringY) * lerpFactor;
    if (ring) {
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";
    }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Handle click effects on cursor
  document.addEventListener("mousedown", () => {
    if (ring) ring.style.transform = "translate(-50%, -50%) scale(0.6)";
  });
  document.addEventListener("mouseup", () => {
    if (ring) ring.style.transform = "translate(-50%, -50%) scale(1)";
  });

  // Attach hover states to all interactive elements
  function updateInteractiveHovers() {
    const clickables = document.querySelectorAll("a, button, select, input, textarea, .tbtn, .pledgeCard, .day, tr, .fCard");
    clickables.forEach(el => {
      // Prevent duplicates
      if (el.dataset.hoverBound) return;
      el.dataset.hoverBound = "true";

      el.addEventListener("mouseenter", () => {
        document.body.classList.add("cursor-hover");
      });
      el.addEventListener("mouseleave", () => {
        document.body.classList.remove("cursor-hover");
      });
    });
  }
  updateInteractiveHovers();
  
  // Periodically scan for new elements (like navbar elements injected dynamically)
  setInterval(updateInteractiveHovers, 1000);

  // 3. BACKGROUND CANVAS ANIMATIONS (PARTICLES & LEAVES)
  initCanvasAnimation();

  // 4. SCROLL REVEAL OBSERVER
  initScrollObserver();

  // 5. REMOVE LOADER OVERLAY
  const loader = document.getElementById("global-loader");
  if (loader) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        loader.classList.add("fade-out");
      }, 1500); // 1.5 seconds seed growing duration
    });
    // Fallback if load event doesn't fire immediately
    setTimeout(() => {
      loader.classList.add("fade-out");
    }, 2500);
  }
});

// Inject general layout items to keep HTML code neat
function injectGlobalElements() {
  // Glow background
  if (!document.getElementById("mouse-glow")) {
    const glow = document.createElement("div");
    glow.id = "mouse-glow";
    glow.className = "mouse-glow-bg";
    document.body.appendChild(glow);
  }

  // Cursor Dot
  if (!document.getElementById("eco-cursor-dot")) {
    const dot = document.createElement("div");
    dot.id = "eco-cursor-dot";
    document.body.appendChild(dot);
  }

  // Cursor Ring
  if (!document.getElementById("eco-cursor-ring")) {
    const ring = document.createElement("div");
    ring.id = "eco-cursor-ring";
    document.body.appendChild(ring);
  }

  // Background Canvas
  if (!document.getElementById("global-canvas")) {
    const canvas = document.createElement("canvas");
    canvas.id = "global-canvas";
    document.body.prepend(canvas);
  }

  // Sprouting loader screen
  if (!document.getElementById("global-loader")) {
    const loader = document.createElement("div");
    loader.id = "global-loader";
    loader.innerHTML = `
      <svg class="loader-tree-svg" viewBox="0 0 100 100">
        <!-- Seed growing into leaf branch -->
        <path d="M50 85 C50 65, 52 45, 55 30 
                 C58 35, 68 25, 75 35 
                 C65 42, 58 38, 55 30
                 C52 35, 42 32, 35 45
                 C45 48, 51 42, 53 30" />
        <circle cx="50" cy="85" r="3" fill="#84cc16"/>
      </svg>
      <div class="loader-text">ECO-COMMIT AI</div>
    `;
    document.body.appendChild(loader);
  }
}

// Background Canvas logic
function initCanvasAnimation() {
  const canvas = document.getElementById("global-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const setSize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  setSize();
  window.addEventListener("resize", setSize);

  // Particles variables
  const particles = [];
  const totalParticles = 25;
  for (let i = 0; i < totalParticles; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      speed: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.5 + 0.2
    });
  }

  // Leaves variables
  const leaves = [];
  const totalLeaves = 15;
  for (let i = 0; i < totalLeaves; i++) {
    leaves.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -100 - 50,
      size: Math.random() * 8 + 5,
      speedY: Math.random() * 0.8 + 0.4,
      speedX: Math.random() * 0.4 - 0.2,
      sway: Math.random() * 2 * Math.PI,
      swaySpeed: Math.random() * 0.02 + 0.01,
      angle: Math.random() * 360
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid effect (infinite grid lines)
    ctx.strokeStyle = "rgba(34, 197, 94, 0.025)";
    ctx.lineWidth = 1;
    const gridSpacing = 80;
    for (let x = 0; x < canvas.width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Render & update floating glowing green particles
    ctx.shadowBlur = 6;
    ctx.shadowColor = "#22c55e";
    particles.forEach(p => {
      ctx.fillStyle = `rgba(34, 197, 94, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // drift upward
      p.y -= p.speed;
      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
    });
    ctx.shadowBlur = 0; // reset shadow

    // Render & update drifting sways (falling leaves)
    ctx.fillStyle = "rgba(132, 204, 22, 0.15)";
    leaves.forEach(l => {
      l.sway += l.swaySpeed;
      l.x += l.speedX + Math.sin(l.sway) * 0.5;
      l.y += l.speedY;
      l.angle += 0.5;

      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.angle * Math.PI / 180);
      
      // Draw simple organic leaf shape
      ctx.beginPath();
      ctx.moveTo(0, -l.size);
      ctx.quadraticCurveTo(l.size / 2, 0, 0, l.size);
      ctx.quadraticCurveTo(-l.size / 2, 0, 0, -l.size);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // recycle leaf when out of viewport
      if (l.y > canvas.height + 20 || l.x < -20 || l.x > canvas.width + 20) {
        l.y = -50;
        l.x = Math.random() * canvas.width;
        l.speedY = Math.random() * 0.8 + 0.4;
      }
    });

    requestAnimationFrame(loop);
  }
  loop();
}

// Scroll IntersectionObserver setup
function initScrollObserver() {
  const elements = document.querySelectorAll(".scroll-reveal");
  if (elements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-active");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  elements.forEach(el => observer.observe(el));
}

// Global Toast utility
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText = "position:fixed; top:24px; right:24px; z-index:1000001; display:flex; flex-direction:column; gap:10px;";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast-card ${type}`;
  
  // Style and animations
  let color = "#22c55e"; // green for success
  let icon = "✓";
  if (type === "error") { color = "#ef4444"; icon = "✕"; }
  if (type === "info") { color = "#3b82f6"; icon = "ℹ"; }

  toast.style.cssText = `
    background: rgba(13, 29, 20, 0.85);
    backdrop-filter: blur(12px);
    border: 1px solid ${color};
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    color: #fff;
    padding: 14px 24px;
    border-radius: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 12px;
    transform: translateX(120%);
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  `;

  toast.innerHTML = `<span style="background:${color}; width:20px; height:20px; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:11px; font-weight:bold;">${icon}</span> ${message}`;
  container.appendChild(toast);

  // Trigger entering animation
  requestAnimationFrame(() => {
    toast.style.transform = "translateX(0)";
  });

  // Remove toast
  setTimeout(() => {
    toast.style.transform = "translateX(120%)";
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3500);
}
// Export showToast globally
window.showToast = showToast;
