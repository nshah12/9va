// 9VA — homepage interactivity
document.addEventListener('DOMContentLoaded', () => {

  /* sticky nav */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });

  /* mobile menu */
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (toggle && mobileMenu) {
    const closeBtn = mobileMenu.querySelector('.mm-close');
    const open = () => { mobileMenu.classList.add('open'); document.body.style.overflow='hidden'; };
    const close = () => { mobileMenu.classList.remove('open'); document.body.style.overflow=''; };
    toggle.addEventListener('click', open);
    closeBtn && closeBtn.addEventListener('click', close);
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }

  /* scroll reveal */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold:0.15, rootMargin:'0px 0px -60px 0px' });
  revealEls.forEach((el, i) => {
    el.style.setProperty('--i', i % 8);
    io.observe(el);
  });

  /* manifesto line-by-line highlight */
  const lines = document.querySelectorAll('.manifesto-line');
  if (lines.length) {
    const lineIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-in');
      });
    }, { threshold:0.6 });
    lines.forEach(l => lineIO.observe(l));
  }

  /* animated stat counters */
  const counters = document.querySelectorAll('[data-count]');
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const decimals = el.dataset.count.includes('.') ? 1 : 0;
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(decimals) + suffix;
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold:0.6 });
  counters.forEach(c => countIO.observe(c));

  /* current year */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* contact form — Web3Forms, submitted via fetch so the page never reloads */
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    const successBox = document.querySelector('#form-success');
    const errorBox = document.querySelector('#form-error');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const submitLabel = submitBtn ? submitBtn.innerHTML : '';

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (contactForm.querySelector('.botcheck')?.checked) return; // bot trap

      if (errorBox) errorBox.style.display = 'none';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
          contactForm.style.display = 'none';
          if (successBox) successBox.style.display = 'block';
        } else {
          throw new Error(data.message || 'submission failed');
        }
      } catch (err) {
        if (errorBox) errorBox.style.display = 'block';
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = submitLabel; }
      }
    });
  }

  /* why-9va journey panel — traveling pulse, synced node glow, hover detail */
  const whyPath = document.querySelector('#whyPath');
  const whyDot = document.querySelector('#whyDot');
  if (whyPath && whyDot) {
    const whyNodes = document.querySelectorAll('.why-node');
    const whyColors = ['#AF441F', '#3F5B73', '#A8721F', '#AF441F', '#3F5B73', '#A8721F'];
    const whyLabels = ['PLATFORMS', 'METHOD', 'ACCESS', 'COMMS', 'DEPTH', 'TERMS'];
    const whyDetails = [
      "ASTRA, BizCollect and PRANA are live, in-production platforms serving real users today — not prototypes or slide-deck concepts. Every capability we describe is something we've already shipped and operate ourselves.",
      "Every engagement follows the same model: Consulting identifies what needs to change in the business, then Engineering and AI build the platform that makes it real — on one shared foundation of reusable assets, not a one-off build.",
      "There's no account manager layer at 9VA. Jitendra and Nilesh are personally involved in scoping, delivery and every major decision on your engagement — the people who built the model are the people you work with.",
      "You get one point of contact for the life of the engagement, a response within 24 hours as standard, and no sales pitches disguised as check-ins — just the conversation you actually need.",
      "9VA doesn't cover six industries shallowly. Our expertise is concentrated in banking, regulation, capital markets, platform engineering and AI — mastered through 25+ years of hands-on work, not a generalist checklist.",
      "Scope, engagement model and pricing are agreed before any work begins — no retainer traps, no scope creep billed after the fact. You know what you're committing to upfront."
    ];
    const whyNumEl = document.querySelector('#whyNum');
    const whyTextEl = document.querySelector('#whyText');
    const whyFractions = [0, 0.2, 0.4, 0.6, 0.8, 1];
    const whyTotal = whyPath.getTotalLength();
    const whyDuration = 16000; // ms — slow, deliberate pass
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let whyHovering = -1;
    let whyStart = null;

    function whyShowDetail(i) {
      if (!whyNumEl || !whyTextEl) return;
      whyNumEl.textContent = '0' + (i + 1);
      whyNumEl.style.background = whyColors[i];
      whyNumEl.style.color = '#FBF8F1';
      whyTextEl.innerHTML = '<b>' + whyLabels[i] + '</b> — ' + whyDetails[i];
    }

    whyNodes.forEach((n) => {
      const i = parseInt(n.dataset.i, 10);
      n.addEventListener('mouseenter', () => { whyHovering = i; whyShowDetail(i); n.style.filter = `drop-shadow(0 0 8px ${whyColors[i]})`; });
      n.addEventListener('mouseleave', () => { whyHovering = -1; });
    });

    if (!prefersReducedMotion) {
      const whyFrame = (ts) => {
        if (!whyStart) whyStart = ts;
        const frac = ((ts - whyStart) % whyDuration) / whyDuration;
        const pt = whyPath.getPointAtLength(frac * whyTotal);
        whyDot.setAttribute('cx', pt.x);
        whyDot.setAttribute('cy', pt.y);
        whyNodes.forEach((n) => {
          const i = parseInt(n.dataset.i, 10);
          if (i === whyHovering) return;
          const dist = Math.min(Math.abs(frac - whyFractions[i]), Math.abs(frac - whyFractions[i] - 1));
          n.style.filter = dist < 0.02 ? `drop-shadow(0 0 8px ${whyColors[i]})` : 'none';
        });
        requestAnimationFrame(whyFrame);
      };
      requestAnimationFrame(whyFrame);
    } else {
      whyDot.style.display = 'none';
    }
  }
});
