
    // ---------- helpers ----------
    const $ = (id) => document.getElementById(id);
    function rand(min, max){ return Math.random() * (max - min) + min; }
    function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

    const popCork = $("popCork");
    const burst = $("burst");
    const flowBehind = $("flowBehind");
    const scrollCork = $("scrollCork");
    const centerBubbles = $("centerBubbles");

    const cheersZone = $("cheersZone");
    const bottleGhost = $("bottleGhost");
    const pourStream = $("pourStream");
    const glasses = $("glasses");
    const liq1 = $("liq1");
    const liq2 = $("liq2");
    const clinkStars = $("clinkStars");

    let popped = false;
    let flowLoop = null;
    let cheered = false;

    // loop di versamento: genera gocce che cadono verso i bicchieri
    let pourLoop = null;
    function startPourLoop(){
      if (pourLoop) return;
      pourLoop = setInterval(() => {
        if (!pourStream.classList.contains('on')){ stopPourLoop(); return; }
        spawnPourDrop();
      }, Math.round(rand(80, 160)));
    }
    function stopPourLoop(){ if (pourLoop){ clearInterval(pourLoop); pourLoop = null; } }

    function spawnPourDrop(){
      // posizione di partenza relativa a pourStream
      const ps = pourStream;
      const psRect = ps.getBoundingClientRect();
      const startX = 140 + rand(-10,10);
      const startY = 56 + rand(-6,6);

      // scegli un bicchiere target (più probabilità per il primo)
      const glassEls = [liq1.parentElement, liq2.parentElement];
      const idx = Math.random() < 0.56 ? 0 : 1;
      const g = glassEls[idx];
      const gRect = g.getBoundingClientRect();

      // target relativo al pourStream
      const tx = (gRect.left + gRect.width/2) - psRect.left;
      const ty = (gRect.top + gRect.height*0.72) - psRect.top; // mira verso la superficie del liquido
      const dx = tx - startX;
      const dy = ty - startY;

      const d = document.createElement('div'); d.className = 'drop';
      d.style.left = startX + 'px'; d.style.top = startY + 'px';
      d.style.setProperty('--dx', dx + 'px'); d.style.setProperty('--dy', dy + 'px');
      ps.appendChild(d);

      // quando la goccia 'arriva' crea lo splash e rimuovi la goccia
      setTimeout(() => {
        // splash
        const splash = document.createElement('div'); splash.className = 'splash';
        g.appendChild(splash);

        // piccolo wobble del bicchiere
        g.classList.add('wobble');
        g.style.transform = 'rotate(6deg) translateY(-4px)';
        setTimeout(() => { g.style.transform = ''; g.classList.remove('wobble'); }, 480);

        d.remove();
        setTimeout(()=> splash.remove(), 520);
      }, 700);
    }

    // ---------- center bubbles (decor) ----------
    function buildCenterBubbles(){
      centerBubbles.innerHTML = "";
      const n = 18;
      for (let i=0; i<n; i++){
        const b = document.createElement("div");
        b.className = "cb";
        const x = 50 + rand(-40, 40);
        b.style.left = x + "%";
        b.style.bottom = rand(-40, 40) + "px";
        b.style.animationDelay = rand(0, 3.2) + "s";
        b.style.animationDuration = rand(2.8, 5.0) + "s";
        const s = rand(6, 12);
        b.style.width = b.style.height = s + "px";
        centerBubbles.appendChild(b);
      }
    }
    buildCenterBubbles();

    // ---------- bottle burst bubbles ----------
    function spawnBottleBubbles(){
      burst.innerHTML = "";
      const n = 18;
      for (let i=0; i<n; i++){
        const b = document.createElement("div");
        b.className = "bubble";
        const angle = (Math.random() * Math.PI * 1.2) - (Math.PI * 0.2);
        const dist = 40 + Math.random() * 110;
        b.style.setProperty("--dx", (Math.cos(angle) * dist) + "px");
        b.style.setProperty("--dy", (-Math.abs(Math.sin(angle) * dist) - 20) + "px");
        b.style.left = (80 + (Math.random()*20 - 10)) + "px";
        b.style.top  = (80 + (Math.random()*20 - 10)) + "px";
        b.style.animationDelay = (Math.random() * 0.08) + "s";
        burst.appendChild(b);
      }
    }

    // ---------- flow behind cork droplets ----------
    function spawnFlowDroplet(){
      if (!popped) return;
      const d = document.createElement("div");
      d.className = "flowDrop";
      d.style.left = (130 + rand(-18, 18)) + "px";
      d.style.top  = (126 + rand(-18, 18)) + "px";
      d.style.setProperty("--dx", (120 + rand(20, 150)) + "px");
      d.style.setProperty("--dy", (-40 + rand(-90, 20)) + "px");
      d.style.animationDelay = (Math.random() * 0.06) + "s";
      flowBehind.appendChild(d);
      setTimeout(() => d.remove(), 1200);
    }

    function startFlowLoop(){
      const tick = () => {
        if (!popped) { flowLoop = null; return; }
        spawnFlowDroplet();
        flowLoop = setTimeout(tick, rand(60, 120));
      };
      if (!flowLoop) tick();
    }

    // ---------- stars for clink ----------
    function clink(){
      if (cheered) return;
      cheered = true;

      glasses.classList.add("cheers");
      clinkStars.classList.add("on");
      clinkStars.innerHTML = "";

      const n = 14;
      for (let i=0; i<n; i++){
        const s = document.createElement("div");
        s.className = "star";
        s.style.left = (110 + rand(-50, 50)) + "px";
        s.style.top  = (40 + rand(-18, 18)) + "px";
        s.style.setProperty("--dx", rand(-80, 80) + "px");
        s.style.setProperty("--dy", rand(-60, 60) + "px");
        s.style.animationDelay = rand(0, 0.08) + "s";
        s.style.width = s.style.height = rand(7, 12) + "px";
        clinkStars.appendChild(s);
      }

      // little confetti burst too
      fireConfetti();

      setTimeout(() => {
        clinkStars.classList.remove("on");
        glasses.classList.remove("cheers");
      }, 900);
    }

    // ---------- POP / RESET ----------
    function doPop(){
      if (popped) return;
      popped = true;
      cheered = false;

      // cork + burst
      popCork.classList.remove("pop");
      burst.classList.remove("on");
      void popCork.offsetWidth;

      popCork.classList.add("show");
      spawnBottleBubbles();
      burst.classList.add("on");
      popCork.classList.add("pop");

      // flow behind cork
      flowBehind.classList.add("on");
      startFlowLoop();

      // enable pour scene
      bottleGhost.classList.add("on");

      // nudge a bit to show the scene
      setTimeout(() => window.scrollTo({ top: window.innerHeight * 0.92, behavior: "smooth" }), 240);
    }

    function resetAll(){
      popped = false;
      cheered = false;

      if (flowLoop){ clearTimeout(flowLoop); flowLoop = null; }
      stopPourLoop();

      popCork.classList.remove("show","pop");
      burst.classList.remove("on");
      burst.innerHTML = "";

      flowBehind.classList.remove("on");
      flowBehind.querySelectorAll(".flowDrop").forEach(el => el.remove());

      // reset moments
      document.querySelectorAll(".moment").forEach(m => m.classList.remove("show"));

      // reset cork wobble
      scrollCork.style.transform = "rotate(0deg)";
      lastY = window.scrollY;

      // reset pour scene
      bottleGhost.classList.remove("on");
      pourStream.classList.remove("on");
      stopPourLoop();
      bottleGhost.style.transform = "translateX(-50%) translateY(0px) rotate(-10deg)";
      liq1.style.height = "0%";
      liq2.style.height = "0%";
      glasses.classList.remove("cheers");
      clinkStars.classList.remove("on");
      clinkStars.innerHTML = "";

      stopConfetti();
    }

    // Trigger pop on first meaningful scroll
    function maybePop(){
      if (window.scrollY > 12) doPop();
    }
    window.addEventListener("scroll", maybePop, { passive:true });
    window.addEventListener("wheel", doPop, { passive:true });
    window.addEventListener("touchmove", doPop, { passive:true });
    window.addEventListener("keydown", (e) => {
      if (["ArrowDown","PageDown","Space"].includes(e.code)) doPop();
    });

    // Reset when back near top
    window.addEventListener("scroll", () => {
      if (window.scrollY < 8 && popped) resetAll();
    }, { passive:true });

    // ---------- Timeline reveal ----------
    const moments = Array.from(document.querySelectorAll(".moment"));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries){
        if (e.isIntersecting) e.target.classList.add("show");
      }
    }, { threshold: 0.22 });
    moments.forEach(m => io.observe(m));

    // cork wobble with scroll
    let lastY = 0;
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      const v = Math.min(14, Math.max(-14, (y - lastY) * 0.08));
      scrollCork.style.transform = `rotate(${v}deg)`;
      lastY = y;
    }, { passive:true });

    // ---------- POUR SCENE: bottle follows scroll + fills glasses ----------
    function updatePour(){
      if (!popped) return;

      const rect = cheersZone.getBoundingClientRect();
      const vh = window.innerHeight;

      // progress: when zone enters, start pouring; when it leaves, stop
      // map from rect.top ~ (vh*0.75) to rect.top ~ (vh*0.10)
      const start = vh * 0.78;
      const end   = vh * 0.12;
      const t = clamp((start - rect.top) / (start - end), 0, 1);

      // bottle movement & rotation
      // y from 0 -> 80px, x small wobble
      const y = 18 + t * 88;
      const x = Math.sin(t * Math.PI) * 18;
      const rot = -10 - t * 32;

      bottleGhost.style.transform = `translateX(-50%) translateY(${y}px) translateX(${x}px) rotate(${rot}deg)`;

      // stream visible mid-progress
      const streamOn = t > 0.18 && t < 0.92;
      pourStream.classList.toggle("on", streamOn);
      // avvia/ferma loop di gocce
      if (streamOn) startPourLoop(); else stopPourLoop();

      // fill glasses progressively: first fills a bit earlier, second catches up
      const fill1 = clamp((t - 0.22) / 0.60, 0, 1);
      const fill2 = clamp((t - 0.34) / 0.55, 0, 1);

      liq1.style.height = (fill1 * 78).toFixed(1) + "%";
      liq2.style.height = (fill2 * 78).toFixed(1) + "%";

      // when both filled enough -> clink once
      if (fill1 > 0.95 && fill2 > 0.95) clink();
    }
    window.addEventListener("scroll", updatePour, { passive:true });
    window.addEventListener("resize", updatePour);

    // ---------- Confetti (canvas) ----------
    const canvas = document.getElementById("confetti");
    const ctx = canvas.getContext("2d");
    let W, H, confetti = [], running = false, anim = null;

    function resize(){
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    function fireConfetti(){
      const count = 170;
      confetti = [];
      for (let i=0; i<count; i++){
        confetti.push({
          x: rand(0, W),
          y: rand(-H*0.4, -10),
          vx: rand(-2.4, 2.4),
          vy: rand(2.2, 6.2),
          size: rand(4, 9),
          rot: rand(0, Math.PI*2),
          vr: rand(-0.18, 0.18),
          life: rand(70, 120),
          shape: Math.random() < 0.7 ? "rect" : "circle",
          a: 1
        });
      }
      if (!running){
        running = true;
        loop();
        setTimeout(() => { running = false; }, 1900);
      }
    }

    function stopConfetti(){
      running = false;
      confetti = [];
      if (anim){ cancelAnimationFrame(anim); anim = null; }
      ctx.clearRect(0,0,W,H);
    }

    function loop(){
      ctx.clearRect(0,0,W,H);
      for (const p of confetti){
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.03;
        p.rot += p.vr;
        p.life -= 1;
        p.a = Math.max(0, Math.min(1, p.life / 100));

        ctx.save();
        ctx.globalAlpha = p.a;
        const hue = rand(25, 345);
        ctx.fillStyle = `hsla(${hue}, 90%, 70%, ${p.a})`;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.shape === "rect") ctx.fillRect(-p.size/2, -p.size/2, p.size*1.2, p.size*0.8);
        else { ctx.beginPath(); ctx.arc(0,0,p.size/2,0,Math.PI*2); ctx.fill(); }
        ctx.restore();
      }
      confetti = confetti.filter(p => p.life > 0 && p.y < H + 30);
      if (running || confetti.length) anim = requestAnimationFrame(loop);
      else stopConfetti();
    }

    // start clean
    resetAll();