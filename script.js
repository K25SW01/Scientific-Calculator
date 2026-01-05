const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.innerText;

        if (value === "C") {
            clearDisplay();
        }
        else if (value === "=") {
            calculate();
        }
        else {
            appendValue(value);
        }
    });
});

function appendValue(value) {
    switch (value) {
        case "÷":
            display.value += "/";
            break;
        case "×":
            display.value += "*";
            break;
        case "π":
            display.value += "Math.PI";
            break;
        case "√":
            display.value += "Math.sqrt(";
            break;
        case "x²":
            display.value += "**2";
            break;
        case "sin":
            display.value += "Math.sin(";
            break;
        case "cos":
            display.value += "Math.cos(";
            break;
        case "tan":
            display.value += "Math.tan(";
            break;
        case "log":
            display.value += "Math.log10(";
            break;
        default:
            display.value += value;
    }
}

function clearDisplay() {
    display.value = "";
}

function calculate() {
    try {
        let result = eval(display.value);
        display.value = result;
    } catch (error) {
        display.value = "Error";
    }
}

// Simple gravity/physics for buttons with drag-to-fling support
(function () {
  const container = document.querySelector('.calculator');
  const btnContainer = document.querySelector('.buttons');
  const toggle = document.getElementById('toggleGravity');
  const items = Array.from(document.querySelectorAll('.gravity-item'));
  let gravityOn = false;
  let bodies = []; // {el, x,y,vx,vy,w,h}
  let rafId = null;
  const G = 1200; // pixels/s^2 gravity
  const bounce = 0.6;
  const friction = 0.995;
  const dt = 1 / 60;

  function getRectRelative(el) {
    const r = el.getBoundingClientRect();
    const c = container.getBoundingClientRect();
    return {
      left: r.left - c.left,
      top: r.top - c.top,
      width: r.width,
      height: r.height
    };
  }

  function startGravity() {
    if (gravityOn) return;
    gravityOn = true;
    container.classList.add('gravity-active');

    // Fix the layout so original grid disappears visually
    btnContainer.style.height = `${btnContainer.getBoundingClientRect().height}px`;

    bodies = items.map(el => {
      const r = getRectRelative(el);
      // compute center coords
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      // copy inline styles to preserve look
      el.style.position = 'absolute';
      el.style.left = `${r.left}px`;
      el.style.top = `${r.top}px`;
      el.style.width = `${r.width}px`;
      el.style.height = `${r.height}px`;
      el.style.transform = 'translate(0,0)';
      // give each a random small x velocity for variety
      const body = {
        el,
        x,
        y,
        vx: (Math.random() - 0.5) * 200,
        vy: 0,
        w: r.width,
        h: r.height,
        grabbed: false
      };
      // give a vivid but simple color variant
      const hue = (Math.random() * 360) | 0;
      el.style.background = `linear-gradient(180deg,hsl(${hue} 80% 92%), hsl(${hue} 70% 88%))`;
      return body;
    });

    // add mouse/touch handlers for dragging
    bodies.forEach(b => {
      b.el.classList.add('floating');
      b.el.addEventListener('pointerdown', pointerDown);
      b.el.style.touchAction = 'none';
    });

    rafId = requestAnimationFrame(loop);
  }

  function stopGravity() {
    if (!gravityOn) return;
    gravityOn = false;
    cancelAnimationFrame(rafId);
    container.classList.remove('gravity-active');
    // remove absolute positioning and restore layout
    bodies.forEach(b => {
      b.el.removeEventListener('pointerdown', pointerDown);
      b.el.classList.remove('floating', 'dragging');
      b.el.style.position = '';
      b.el.style.left = '';
      b.el.style.top = '';
      b.el.style.width = '';
      b.el.style.height = '';
      b.el.style.transform = '';
      b.el.style.background = '';
    });
    bodies = [];
    btnContainer.style.height = '';
  }

  toggle.addEventListener('click', () => {
    if (gravityOn) stopGravity(); else startGravity();
    toggle.textContent = gravityOn ? 'Stop' : 'Gravity';
  });

  // physics loop
  let last = performance.now();
  function loop(now) {
    const t = Math.min(0.032, (now - last) / 1000);
    last = now;
    step(t);
    rafId = requestAnimationFrame(loop);
  }

  function step(delta) {
    const bounds = btnContainer.getBoundingClientRect();
    bodies.forEach(b => {
      if (b.grabbed) return; // position controlled by pointer events
      // integrate
      b.vy += G * delta;
      b.vx *= friction;
      b.vy *= friction;
      b.x += b.vx * delta;
      b.y += b.vy * delta;

      // collisions with container (using center-based coords)
      const left = b.w / 2;
      const right = bounds.width - b.w / 2;
      const top = b.h / 2;
      const bottom = bounds.height - b.h / 2;

      if (b.x < left) {
        b.x = left;
        b.vx = -b.vx * bounce;
      } else if (b.x > right) {
        b.x = right;
        b.vx = -b.vx * bounce;
      }
      if (b.y > bottom) {
        b.y = bottom;
        b.vy = -b.vy * bounce;
        // slight damping on bounce
        if (Math.abs(b.vy) < 20) b.vy = 0;
      } else if (b.y < top) {
        b.y = top;
        b.vy = -b.vy * bounce;
      }

      // apply to element (convert center to top-left)
      const topLeftX = b.x - b.w / 2;
      const topLeftY = b.y - b.h / 2;
      b.el.style.left = `${topLeftX}px`;
      b.el.style.top = `${topLeftY}px`;
      // small rotation for fun
      const angle = Math.max(-12, Math.min(12, b.vx / 10));
      b.el.style.transform = `rotate(${angle}deg)`;
    });
  }

  // Pointer drag/throw handlers
  function pointerDown(e) {
    e.preventDefault();
    const el = e.currentTarget;
    const body = bodies.find(b => b.el === el);
    if (!body) return;
    body.grabbed = true;
    el.setPointerCapture(e.pointerId);
    el.classList.add('dragging');
    body.offsetX = e.clientX;
    body.offsetY = e.clientY;
    body.startX = body.x;
    body.startY = body.y;
    body.vx = 0;
    body.vy = 0;

    const move = (ev) => {
      const dx = ev.clientX - body.offsetX;
      const dy = ev.clientY - body.offsetY;
      body.x = body.startX + dx;
      body.y = body.startY + dy;
      // update position immediately
      const topLeftX = body.x - body.w / 2;
      const topLeftY = body.y - body.h / 2;
      body.el.style.left = `${topLeftX}px`;
      body.el.style.top = `${topLeftY}px`;
    };

    const up = (ev) => {
      // approximate fling velocity from last movement
      const dtMs = Math.max(16, ev.timeStamp - e.timeStamp);
      body.vx = (ev.clientX - body.offsetX) / (dtMs / 1000);
      body.vy = (ev.clientY - body.offsetY) / (dtMs / 1000);
      body.grabbed = false;
      el.classList.remove('dragging');
      el.releasePointerCapture(e.pointerId);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  // Clean up on unload
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(rafId);
  });

  // Optionally, allow double-clicking a button to explode into small velocity
  btnContainer.addEventListener('dblclick', (e) => {
    if (!gravityOn) return;
    const el = e.target.closest('.gravity-item');
    if (!el) return;
    const b = bodies.find(x => x.el === el);
    if (!b) return;
    b.vx += (Math.random() - 0.5) * 700;
    b.vy -= Math.random() * 800;
  });

})();