
    const inputWrap    = document.getElementById('inputWrap');
    const ghostInput   = document.getElementById('ghostInput');
    const messagesWrap = document.getElementById('messagesWrap');
    const chatHistory  = document.getElementById('chatHistory');
    const blobSvg      = document.getElementById('blobSvg');
    const blobFill     = document.getElementById('blobFill');
    const blobStroke   = document.getElementById('blobStroke');

    let inputOpen  = false;
    let isActive   = false;
    let isHovering = false;

    const SPIKE_PATH = [
      "M 329,109","C 344,82 328,30 310,0","C 300,-16 290,-16 280,0",
      "C 262,30 246,82 254,52","C 244,46 222,42 200,42","C 178,42 156,46 146,52",
      "C 154,82 138,30 120,0","C 110,-16 100,-16 90,0","C 72,30 56,82 71,109",
      "C 44,140 30,168 30,200","C 30,290 106,370 200,370","C 294,370 370,290 370,200",
      "C 370,168 356,140 329,109","Z"
    ].join(" ");

    const cx = 200, cy = 200, R = 158, NUM_POINTS = 64;
    const waves = [
      { a: 12, f: 2, p: 0,   ps: 0.0007 },
      { a: 8,  f: 3, p: 1.2, ps: 0.0011 },
      { a: 6,  f: 5, p: 2.4, ps: 0.0008 },
      { a: 5,  f: 7, p: 0.8, ps: 0.0013 },
      { a: 4,  f: 4, p: 3.1, ps: 0.0006 },
    ];

    let rafId = null, blobActive = true, lastPath = null, morphRaf = null;

    function buildBlobPath(t) {
      const pts = [];
      for (let i = 0; i < NUM_POINTS; i++) {
        const angle = (i / NUM_POINTS) * Math.PI * 2;
        let r = R;
        for (const w of waves) r += w.a * Math.sin(w.f * angle + w.p + t * w.ps);
        pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
      }
      let d = `M ${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
      for (let i = 0; i < NUM_POINTS; i++) {
        const p0=pts[(i-1+NUM_POINTS)%NUM_POINTS], p1=pts[i],
              p2=pts[(i+1)%NUM_POINTS],            p3=pts[(i+2)%NUM_POINTS];
        const cp1x=p1[0]+(p2[0]-p0[0])/6, cp1y=p1[1]+(p2[1]-p0[1])/6;
        const cp2x=p2[0]-(p3[0]-p1[0])/6, cp2y=p2[1]-(p3[1]-p1[1])/6;
        d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
      }
      return d + ' Z';
    }

    function tickBlob(t) {
      if (!blobActive) return;
      const d = buildBlobPath(t); lastPath = d;
      blobFill.setAttribute('d', d); blobStroke.setAttribute('d', d);
      rafId = requestAnimationFrame(tickBlob);
    }
    rafId = requestAnimationFrame(tickBlob);

    // ── Nav bubble wobble ─────────────────────────────────────────────
    const navBubbles     = document.querySelectorAll('.nav-bubble');
    const navBubblePaths = document.querySelectorAll('.nav-bubble svg path');

    // idle frames — subtle organic wobble
    const navIdle = [
      ["M 45,4 C 56,2 72,6 78,14 C 84,22 84,36 78,44 C 72,52 56,56 45,54 C 34,56 18,52 12,44 C 6,36 6,22 12,14 C 18,6 34,2 45,4 Z","M 45,3 C 57,1 74,7 79,15 C 85,23 84,37 77,45 C 70,53 54,57 44,55 C 33,57 17,52 11,44 C 5,36 6,21 12,13 C 18,5 33,5 45,3 Z","M 45,5 C 55,3 71,8 77,16 C 83,24 83,37 77,45 C 71,53 55,56 45,54 C 35,56 19,52 13,44 C 7,36 7,23 13,15 C 19,7 35,7 45,5 Z"],
      ["M 45,3 C 57,1 74,8 80,16 C 86,24 85,38 78,46 C 71,54 55,57 44,55 C 33,57 17,53 11,45 C 5,37 5,22 11,14 C 17,6 33,5 45,3 Z","M 45,4 C 58,2 75,9 80,17 C 86,25 85,39 78,47 C 71,55 54,58 43,56 C 32,57 16,53 10,45 C 4,37 5,22 11,14 C 17,6 32,6 45,4 Z","M 45,2 C 56,0 73,7 79,15 C 85,23 84,37 77,45 C 70,53 54,56 44,54 C 34,56 18,52 12,44 C 6,36 6,21 12,13 C 18,5 34,4 45,2 Z"],
      ["M 45,5 C 58,3 73,9 79,17 C 85,25 84,40 77,48 C 70,56 54,58 43,56 C 32,58 16,54 10,46 C 4,38 5,23 11,15 C 17,7 32,7 45,5 Z","M 45,4 C 57,2 72,8 78,16 C 84,24 83,39 76,47 C 69,55 53,58 42,56 C 31,58 15,54 9,46 C 3,38 4,23 10,15 C 16,7 33,6 45,4 Z","M 45,6 C 59,4 74,10 80,18 C 86,26 85,41 78,49 C 71,57 54,59 43,57 C 32,59 16,55 10,47 C 4,39 5,24 11,16 C 17,8 31,8 45,6 Z"],
    ];

    // hover frames — more exaggerated organic movement, slightly larger
    const navHover = [
      ["M 45,0 C 59,-2 76,5 82,14 C 89,24 88,38 81,47 C 74,56 58,60 45,58 C 32,60 16,56 9,47 C 2,38 2,23 9,14 C 16,4 31,-2 45,0 Z",
       "M 45,1 C 61,-1 77,7 84,17 C 90,26 88,40 80,49 C 72,58 57,61 45,59 C 33,61 17,57 10,48 C 3,38 4,24 11,15 C 18,5 29,3 45,1 Z",
       "M 45,-1 C 60,-4 78,4 85,14 C 92,24 90,39 82,48 C 74,57 58,61 45,59 C 31,61 15,57 8,47 C 1,37 2,22 9,13 C 16,3 30,-3 45,-1 Z"],
      ["M 45,-1 C 60,-3 78,6 84,16 C 90,26 89,41 81,50 C 73,59 57,62 44,60 C 31,62 15,58 8,49 C 1,39 2,24 9,14 C 16,4 30,-2 45,-1 Z",
       "M 45,1 C 61,0 79,7 85,17 C 91,27 90,42 82,51 C 74,60 57,63 44,61 C 31,63 14,59 7,50 C 0,40 1,25 8,15 C 15,5 29,-1 45,1 Z",
       "M 45,0 C 62,-2 80,5 86,15 C 92,25 91,40 83,50 C 75,59 58,63 45,61 C 32,63 15,59 8,49 C 1,39 1,23 8,14 C 15,4 28,2 45,0 Z"],
      ["M 45,2 C 61,-1 79,6 85,16 C 92,26 90,42 82,51 C 74,60 57,64 45,62 C 32,64 15,60 8,51 C 1,41 2,25 9,15 C 16,5 29,5 45,2 Z",
       "M 45,0 C 62,-2 80,5 87,16 C 93,26 92,41 84,51 C 76,60 58,64 45,62 C 32,64 14,60 7,50 C 0,40 1,24 8,14 C 15,4 28,3 45,0 Z",
       "M 45,3 C 60,0 78,7 84,17 C 91,27 89,43 81,52 C 73,61 57,65 45,63 C 33,65 16,61 9,51 C 2,41 3,26 10,16 C 17,6 30,6 45,3 Z"],
    ];

    navBubblePaths.forEach((path, idx) => {
      let frame    = 0;
      let hovering = false;
      let anim     = null;

      function idleGo() {
        if (hovering) return;
        const next = (frame + 1) % navIdle[idx].length;
        anim = anime({
          targets: path, d: navIdle[idx][next],
          duration: 2800 + idx * 400,
          easing: 'easeInOutSine',
          complete: () => { frame = next; idleGo(); }
        });
      }
      setTimeout(idleGo, idx * 600);

      let hoverFrame = 0;
      function hoverGo() {
        if (!hovering) return;
        const next = (hoverFrame + 1) % navHover[idx].length;
        anim = anime({
          targets: path, d: navHover[idx][next],
          duration: 600,
          easing: 'easeInOutSine',
          complete: () => { hoverFrame = next; hoverGo(); }
        });
      }

      navBubbles[idx].addEventListener('mouseenter', () => {
        hovering = true;
        if (anim) anim.pause();
        // First snap to first hover frame smoothly, then loop
        anime({
          targets: path, d: navHover[idx][0],
          duration: 300, easing: 'easeOutSine',
          complete: () => { hoverFrame = 0; hoverGo(); }
        });
      });

      navBubbles[idx].addEventListener('mouseleave', () => {
        hovering = false;
        if (anim) anim.pause();
        anime({
          targets: path, d: navIdle[idx][frame],
          duration: 400, easing: 'easeOutSine',
          complete: () => idleGo()
        });
      });
    });

    // ── Easing ────────────────────────────────────────────────────────
    const easeInOutCubic = t => t < 0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
    const easeOutBack    = t => { const c1=1.70158,c3=c1+1; return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2); };
    const easeInOutQuart = t => t < 0.5 ? 8*t*t*t*t : 1-Math.pow(-2*t+2,4)/2;

    // ── Morph ─────────────────────────────────────────────────────────
    function morphTo(targetPath, duration, easingFn, onDone) {
      blobActive = false; cancelAnimationFrame(rafId);
      if (morphRaf) cancelAnimationFrame(morphRaf);
      const interp = flubber.interpolate(lastPath || buildBlobPath(0), targetPath, { maxSegmentLength: 4 });
      const start  = performance.now();
      function tick(now) {
        const raw = Math.min((now-start)/duration, 1);
        const d   = interp(easingFn(raw)); lastPath = d;
        blobFill.setAttribute('d', d); blobStroke.setAttribute('d', d);
        if (raw < 1) morphRaf = requestAnimationFrame(tick);
        else { morphRaf = null; if (onDone) onDone(); }
      }
      morphRaf = requestAnimationFrame(tick);
    }

    function morphToBlob(duration, onDone) {
      blobActive = false; cancelAnimationFrame(rafId);
      if (morphRaf) cancelAnimationFrame(morphRaf);
      const interp = flubber.interpolate(lastPath || buildBlobPath(0), buildBlobPath(performance.now()+duration), { maxSegmentLength: 4 });
      const start  = performance.now();
      function tick(now) {
        const raw = Math.min((now-start)/duration, 1);
        const d   = interp(easeInOutCubic(raw)); lastPath = d;
        blobFill.setAttribute('d', d); blobStroke.setAttribute('d', d);
        if (raw < 1) morphRaf = requestAnimationFrame(tick);
        else { morphRaf = null; blobActive = true; rafId = requestAnimationFrame(tickBlob); if (onDone) onDone(); }
      }
      morphRaf = requestAnimationFrame(tick);
    }

    // ── Blob interaction ──────────────────────────────────────────────
    blobSvg.addEventListener('mouseenter', () => {
      isHovering = true;
      if (!isActive) morphTo(SPIKE_PATH, 600, easeOutBack, null);
    });
    blobSvg.addEventListener('mouseleave', () => {
      if (!isActive) { isHovering = false; morphToBlob(500, null); }
    });
    blobSvg.addEventListener('click', () => {
      inputOpen = !inputOpen;
      isActive  = inputOpen;
      if (inputOpen) {
        inputWrap.classList.add('visible');
        chatHistory.classList.add('visible');
        setTimeout(() => ghostInput.focus(), 50);
        requestAnimationFrame(() => chatHistory.scrollTo({ top: chatHistory.scrollHeight, behavior: 'smooth' }));
        morphTo(SPIKE_PATH, 500, easeInOutQuart, null);
      } else {
        inputWrap.classList.remove('visible');
        chatHistory.classList.remove('visible');
        if (!isHovering) morphToBlob(500, null);
      }
    });

    document.addEventListener('click', (e) => {
      if (!inputOpen) return;
      if (e.target.closest('#scene')) return;
      inputOpen = false; isActive = false; isHovering = false;
      inputWrap.classList.remove('visible');
      chatHistory.classList.remove('visible');
      morphToBlob(500, null);
    });

    ghostInput.addEventListener('focus', () => {
      requestAnimationFrame(() => chatHistory.scrollTo({ top: chatHistory.scrollHeight, behavior: 'smooth' }));
    });

    ghostInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && ghostInput.value.trim()) {
            const text = ghostInput.value.trim();
            ghostInput.value = '';
            addMessage(text, 'user');
            paintBloom();
            ghostInput.disabled = true;

            const reply = await getAIReply(text);
            ghostInput.disabled = false;
            ghostInput.focus();
            addMessage(reply, 'ai');
        }
     });
    function addMessage(text, role) {
      const all = messagesWrap.querySelectorAll('.message');
      all.forEach((msg, i) => { if (all.length - i >= 12) msg.classList.add('fading'); });
      const div = document.createElement('div');
      div.className = `message ${role}`;
      div.innerHTML = `<span class="bubble">${text}</span>`;
      messagesWrap.appendChild(div);
      requestAnimationFrame(() => chatHistory.scrollTo({ top: chatHistory.scrollHeight, behavior: 'smooth' }));
      const updated = messagesWrap.querySelectorAll('.message');
      if (updated.length > 20) updated[0].remove();
    }


    // ── Watercolor background painter ────────────────────────────────
    const wcCanvas  = document.getElementById('watercolorCanvas');
    const wcCtx     = wcCanvas.getContext('2d');

    function resizeCanvas() {
      wcCanvas.width  = window.innerWidth;
      wcCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // near-blob + floral palette
    const WC_PALETTE = [
      [90,  175, 170],  // soft teal
      [110, 190, 180],  // seafoam
      [70,  140, 160],  // slate teal
      [200, 140, 190],  // dusty mauve
      [210, 160, 200],  // soft orchid
      [170, 130, 210],  // lavender
      [240, 170, 185],  // blush pink
      [155, 190, 220],  // periwinkle blue
      [180, 210, 175],  // soft sage
      [225, 175, 210],  // lilac rose
    ];

    function paintBloom() {
      const W = wcCanvas.width, H = wcCanvas.height;
      const cx = W / 2, cy = H / 2;
      const [r, g, b] = WC_PALETTE[Math.floor(Math.random() * WC_PALETTE.length)];

      const maxRadius = 180;
      const duration  = 900; // ms
      const start     = performance.now();

      function frame(now) {
        const t        = Math.min((now - start) / duration, 1);
        // ease out — fast expand then slow
        const eased    = 1 - Math.pow(1 - t, 3);
        const radius   = maxRadius * eased;
        // alpha: peaks early then fades
        const alpha    = 0.52 * Math.sin(t * Math.PI) * (1 - t * 0.4);

        wcCtx.clearRect(0, 0, W, H);

        const safeR = Math.max(radius, 1);
        const grad = wcCtx.createRadialGradient(cx, cy, 0, cx, cy, safeR);
        grad.addColorStop(0,    `rgba(${r},${g},${b},${alpha})`);
        grad.addColorStop(0.45, `rgba(${r},${g},${b},${alpha * 0.55})`);
        grad.addColorStop(0.8,  `rgba(${r},${g},${b},${alpha * 0.15})`);
        grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);

        if (radius < 1) { requestAnimationFrame(frame); return; }
        wcCtx.beginPath();
        wcCtx.arc(cx, cy, radius, 0, Math.PI * 2);
        wcCtx.fillStyle = grad;
        wcCtx.fill();

        if (t < 1) requestAnimationFrame(frame);
        else wcCtx.clearRect(0, 0, W, H);
      }

      requestAnimationFrame(frame);
    }

const conversationHistory = [];

async function getAIReply(userText) {
  conversationHistory.push({ role: 'user', content: userText });

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory }),
    });
    const data = await response.json();
    const reply = data.reply || "I couldn't find an answer to that.";
    conversationHistory.push({ role: 'assistant', content: reply });
    return reply;
  } catch (err) {
    return "Something went wrong — try again in a moment.";
  }
}