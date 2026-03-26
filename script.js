/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PORTFOLIO — script.js  (Enhanced with AI Chatbot + PayMongo donations)
 *  Sections:
 *    1.  Custom Cursor
 *    2.  Navbar (scroll + mobile)
 *    3.  Theme Toggle
 *    4.  Three.js Hero Scene
 *    5.  Scroll Reveal (IntersectionObserver)
 *    6.  Skill Bar Animations
 *    7.  Parallax
 *    8.  Contact Form
 *    9.  Footer Year & Active Nav
 *   10.  AI Chatbot
 *   11.  Donation / PayMongo
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  BACKEND URL — change this to your deployed server URL in production
 */
const BACKEND_URL = 'http://localhost:3001';

'use strict';

/* ══════════════════════════════════════════════════════════════════════════
   1. CUSTOM CURSOR
══════════════════════════════════════════════════════════════════════════ */
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = -200, mouseY = -200;
let followerX = -200, followerY = -200;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
});

(function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
  requestAnimationFrame(animateFollower);
})();

const hoverTargets = 'a, button, input, textarea, .project-card, .nav-link, .amount-btn, .chip';
document.addEventListener('mouseover', (e) => {
  if (e.target.closest(hoverTargets)) document.body.classList.add('cursor-hover');
});
document.addEventListener('mouseout', (e) => {
  if (e.target.closest(hoverTargets)) document.body.classList.remove('cursor-hover');
});
document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; cursorFollower.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; cursorFollower.style.opacity = '1'; });

/* ══════════════════════════════════════════════════════════════════════════
   2. NAVBAR
══════════════════════════════════════════════════════════════════════════ */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open');
  document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
});

document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   3. THEME TOGGLE
══════════════════════════════════════════════════════════════════════════ */
const themeToggle = document.getElementById('themeToggle');
const html        = document.documentElement;
const savedTheme  = localStorage.getItem('portfolio-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('portfolio-theme', next);
  // NOTE: Three.js scene is intentionally unaffected by theme changes.
});

/* ══════════════════════════════════════════════════════════════════════════
   4. THREE.JS HERO SCENE
══════════════════════════════════════════════════════════════════════════ */
(function initThreeScene() {
  const canvas = document.getElementById('heroCanvas');

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const dirLight = new THREE.DirectionalLight(0x00ffe0, 2.2);
  dirLight.position.set(4, 6, 4);
  scene.add(dirLight);
  const rimLight = new THREE.DirectionalLight(0x4466ff, 0.8);
  rimLight.position.set(-4, -2, -3);
  scene.add(rimLight);

  // ── PLACEHOLDER CUBE ──────────────────────────────────────────────────
  // Replace this block with GLTFLoader to load your custom .glb model
  // See commented GLTF block below.
  const cubeGeo   = new THREE.BoxGeometry(1.6, 1.6, 1.6);
  const cubeSolid = new THREE.Mesh(cubeGeo, new THREE.MeshStandardMaterial({ color: 0x0e1420, roughness: 0.25, metalness: 0.85, transparent: true, opacity: 0.92 }));
  const cubeWire  = new THREE.Mesh(cubeGeo, new THREE.MeshBasicMaterial({ color: 0x00ffe0, wireframe: true, transparent: true, opacity: 0.18 }));
  const cubeGroup = new THREE.Group();
  cubeGroup.add(cubeSolid, cubeWire);
  cubeGroup.position.set(2.2, 0, 0);
  scene.add(cubeGroup);

  /*
  // ── GLTF MODEL (uncomment to activate) ──────────────────────────────
  // Add to HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/examples/js/loaders/GLTFLoader.js"></script>
  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load('./model.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.set(1, 1, 1);
    model.position.set(2.2, 0, 0);
    scene.add(model);
  }, undefined, console.error);
  */

  // Particles
  const pGeo  = new THREE.BufferGeometry();
  const pPos  = new Float32Array(80 * 3).map(() => (Math.random() - 0.5) * 20);
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x00ffe0, size: 0.04, transparent: true, opacity: 0.35 }));
  scene.add(particles);

  // Mouse parallax
  let tRX = 0, tRY = 0, cRX = 0, cRY = 0;
  window.addEventListener('mousemove', (e) => {
    tRY = ((e.clientX / window.innerWidth)  - 0.5) * 0.6;
    tRX = ((e.clientY / window.innerHeight) - 0.5) * 0.4;
  });

  const clock = new THREE.Clock();
  let frameId;

  function animate() {
    frameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    cubeGroup.rotation.y = t * 0.35;
    cubeGroup.rotation.x = t * 0.18;
    cubeGroup.position.y = Math.sin(t * 0.7) * 0.18;
    cRX += (tRX - cRX) * 0.04;
    cRY += (tRY - cRY) * 0.04;
    camera.rotation.x = cRX * 0.3;
    camera.rotation.y = cRY * 0.3;
    particles.rotation.y = t * 0.04;
    particles.rotation.x = t * 0.02;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(frameId);
    else { clock.start(); animate(); }
  });
})();

/* ══════════════════════════════════════════════════════════════════════════
   5. SCROLL REVEAL
══════════════════════════════════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-item').forEach(el => revealObserver.observe(el));

/* ══════════════════════════════════════════════════════════════════════════
   6. SKILL BAR ANIMATIONS
══════════════════════════════════════════════════════════════════════════ */
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach(fill => {
        setTimeout(() => { fill.style.width = `${fill.dataset.level}%`; }, 400);
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.25 });

const skillsSection = document.getElementById('skills');
if (skillsSection) skillObserver.observe(skillsSection);

/* ══════════════════════════════════════════════════════════════════════════
   7. PARALLAX
══════════════════════════════════════════════════════════════════════════ */
const heroContent = document.querySelector('.hero-content');
const scrollHint  = document.querySelector('.scroll-hint');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroContent) {
    heroContent.style.transform = `translateY(${y * 0.28}px)`;
    heroContent.style.opacity   = `${1 - y / 500}`;
  }
  if (scrollHint) scrollHint.style.opacity = `${Math.max(0, 1 - y / 250) * 0.5}`;
}, { passive: true });

/* ══════════════════════════════════════════════════════════════════════════
   8. CONTACT FORM
══════════════════════════════════════════════════════════════════════════ */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const sendBtn     = contactForm?.querySelector('.btn-send');
const btnText     = sendBtn?.querySelector('.btn-text');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    contactForm.querySelectorAll('input, textarea').forEach(input => {
      if (!input.value.trim()) {
        input.style.borderColor = '#ff4466';
        valid = false;
        input.addEventListener('focus', () => { input.style.borderColor = ''; }, { once: true });
      }
    });
    if (!valid) return;
    if (btnText) btnText.textContent = 'Sending…';
    sendBtn.disabled = true;
    setTimeout(() => {
      contactForm.reset();
      if (btnText) btnText.textContent = 'Sent ✓';
      formSuccess.classList.add('visible');
      setTimeout(() => {
        if (btnText) btnText.textContent = 'Send Message';
        sendBtn.disabled = false;
        formSuccess.classList.remove('visible');
      }, 3500);
    }, 1400);
  });
}

/* Card ripple */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    const rect   = card.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    Object.assign(ripple.style, {
      position: 'absolute', borderRadius: '50%', pointerEvents: 'none', zIndex: '0',
      width: `${size}px`, height: `${size}px`,
      left: `${e.clientX - rect.left - size / 2}px`,
      top:  `${e.clientY - rect.top  - size / 2}px`,
      background: 'rgba(0,255,224,0.08)',
      transform: 'scale(0)',
      animation: 'ripple 0.55s ease-out forwards',
    });
    card.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

const rippleStyle  = document.createElement('style');
rippleStyle.textContent = '@keyframes ripple { to { transform: scale(2.2); opacity: 0; } }';
document.head.appendChild(rippleStyle);

/* ══════════════════════════════════════════════════════════════════════════
   9. FOOTER YEAR & ACTIVE NAV
══════════════════════════════════════════════════════════════════════════ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${entry.target.id}` ? 'var(--accent)' : '';
      });
    }
  });
}, { threshold: 0.5 }).observe = function(el) {
  // manually observe each section
};
sections.forEach(s => {
  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${entry.target.id}` ? 'var(--accent)' : '';
        });
      }
    });
  }, { threshold: 0.4 }).observe(s);
});

/* ══════════════════════════════════════════════════════════════════════════
   10. AI CHATBOT
   ─────────────────────────────────────────────────────────────────────────
   Talks to: POST ${BACKEND_URL}/chat
   Backend uses OpenRouter (free) with Llama 3 8B Instruct.
══════════════════════════════════════════════════════════════════════════ */
(function initChatbot() {
  const chatTrigger  = document.getElementById('chatTrigger');
  const chatWindow   = document.getElementById('chatWindow');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput    = document.getElementById('chatInput');
  const chatSend     = document.getElementById('chatSend');
  const chatTyping   = document.getElementById('chatTyping');
  const chatClear    = document.getElementById('chatClear');
  const suggestions  = document.getElementById('chatSuggestions');

  if (!chatTrigger) return;

  // ── Conversation history (sent to backend each turn) ──────────────────
  let conversationHistory = [];

  // ── Helpers ──────────────────────────────────────────────────────────
  function timeStr() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function appendMessage(role, text, isError = false) {
    const wrapper = document.createElement('div');
    wrapper.className = `chat-msg ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble' + (isError ? ' error' : '');
    bubble.textContent = text;

    const time = document.createElement('span');
    time.className = 'msg-time';
    time.textContent = timeStr();

    wrapper.appendChild(bubble);
    wrapper.appendChild(time);
    chatMessages.appendChild(wrapper);

    // Auto-scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return bubble;
  }

  function setTyping(show) {
    chatTyping.classList.toggle('visible', show);
    if (show) chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function setInputDisabled(disabled) {
    chatInput.disabled = disabled;
    chatSend.disabled  = disabled;
  }

  // ── Toggle open/close ────────────────────────────────────────────────
  chatTrigger.addEventListener('click', () => {
    const isOpen = chatWindow.classList.toggle('open');
    chatTrigger.classList.toggle('active', isOpen);
    if (isOpen) {
      setTimeout(() => chatInput.focus(), 400);
    }
  });

  // ── Suggestion chips ─────────────────────────────────────────────────
  suggestions.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
      sendMessage(e.target.textContent);
      suggestions.style.display = 'none'; // hide after first use
    }
  });

  // ── Clear chat ────────────────────────────────────────────────────────
  chatClear.addEventListener('click', () => {
    // Keep only the first greeting
    const msgs = chatMessages.querySelectorAll('.chat-msg');
    msgs.forEach((m, i) => { if (i > 0) m.remove(); });
    suggestions.style.display = 'flex';
    conversationHistory = [];
  });

  // ── Send on button click or Enter (Shift+Enter = newline) ────────────
  chatSend.addEventListener('click', () => sendMessage());
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-grow textarea
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
  });

  // ── Core send function ────────────────────────────────────────────────
  async function sendMessage(overrideText) {
    const text = (overrideText || chatInput.value).trim();
    if (!text) return;

    // Show user message
    appendMessage('user', text);
    chatInput.value = '';
    chatInput.style.height = 'auto';

    // Track history
    conversationHistory.push({ role: 'user', content: text });

    // Disable input while waiting
    setInputDisabled(true);
    setTyping(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const data   = await res.json();
      const reply  = data.reply || 'Sorry, I could not get a response.';

      // Track assistant reply in history
      conversationHistory.push({ role: 'assistant', content: reply });
      setTyping(false);
      appendMessage('bot', reply);

    } catch (err) {
      setTyping(false);
      appendMessage('bot', `⚠️ ${err.message}. Make sure the backend server is running at ${BACKEND_URL}`, true);
      // Remove failed user msg from history so conversation stays clean
      conversationHistory.pop();
    } finally {
      setInputDisabled(false);
      chatInput.focus();
    }
  }

})();

/* ══════════════════════════════════════════════════════════════════════════
   11. DONATION / PAYMONGO
   ─────────────────────────────────────────────────────────────────────────
   Calls: POST ${BACKEND_URL}/create-checkout
   Backend calls PayMongo Checkout Session API and returns checkoutUrl.
══════════════════════════════════════════════════════════════════════════ */
(function initDonation() {
  const donateBtn      = document.getElementById('donateBtn');
  const donateBtnText  = donateBtn?.querySelector('.donate-btn-text');
  const donateSpinner  = document.getElementById('donateSpinner');
  const customInput    = document.getElementById('customAmount');
  const amountBtns     = document.querySelectorAll('.amount-btn');
  const paySuccess     = document.getElementById('paySuccess');
  const payCancel      = document.getElementById('payCancel');

  if (!donateBtn) return;

  // ── Track selected amount ─────────────────────────────────────────────
  let selectedAmount = 250; // default

  function updateDonateLabel(amount) {
    selectedAmount = amount;
    if (donateBtnText) {
      donateBtnText.textContent = `Donate ₱${Number(amount).toLocaleString()}`;
    }
  }

  // Preset button clicks
  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (customInput) customInput.value = '';
      updateDonateLabel(parseInt(btn.dataset.amount, 10));
    });
  });

  // Custom input
  if (customInput) {
    customInput.addEventListener('input', () => {
      const val = parseInt(customInput.value, 10);
      if (val >= 50) {
        amountBtns.forEach(b => b.classList.remove('active'));
        updateDonateLabel(val);
      }
    });
  }

  // ── Show payment result banners if URL has ?payment= param ───────────
  const urlParams = new URLSearchParams(window.location.search);
  const payStatus = urlParams.get('payment');
  if (payStatus === 'success' && paySuccess) {
    paySuccess.style.display = 'flex';
    // Scroll to donate section
    document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' });
  } else if (payStatus === 'cancelled' && payCancel) {
    payCancel.style.display = 'flex';
    document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' });
  }

  // ── Donate button ─────────────────────────────────────────────────────
  donateBtn.addEventListener('click', async () => {
    if (selectedAmount < 50) {
      alert('Minimum donation amount is ₱50.');
      return;
    }

    // Loading state
    donateBtn.disabled   = true;
    if (donateBtnText)   donateBtnText.textContent = 'Redirecting…';
    if (donateSpinner)   donateSpinner.classList.add('spinning');

    try {
      const res = await fetch(`${BACKEND_URL}/create-checkout`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: selectedAmount }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const { checkoutUrl } = await res.json();
      if (!checkoutUrl) throw new Error('No checkout URL received from server.');

      // Redirect to PayMongo hosted checkout
      window.location.href = checkoutUrl;

    } catch (err) {
      alert(`Payment error: ${err.message}\n\nMake sure the backend is running at ${BACKEND_URL}`);
      donateBtn.disabled = false;
      if (donateBtnText) donateBtnText.textContent = `Donate ₱${Number(selectedAmount).toLocaleString()}`;
      if (donateSpinner) donateSpinner.classList.remove('spinning');
    }
  });

})();

// ─── Image data ───────────────────────────────────────────────────────────
  // Using picsum.photos for beautiful placeholder images
  const images1 = [
    { src: 'techstack/python.png'},
    { src: 'techstack/c.png'},
    { src: 'techstack/html5.png'},
    { src: 'techstack/js.png'},
    { src: 'techstack/mongodb.svg'},
  ];

  function makeCard(img, idx) {
    return `
      <div class="card">
        <img src="${img.src}" alt="${img.label}" loading="lazy">
      </div>`;
  }

  function buildTrack(trackEl, items) {
    // Duplicate items for seamless loop
    const html = [...items, ...items].map((img, i) => makeCard(img, i)).join('');
    trackEl.innerHTML = html;
  }

  buildTrack(document.getElementById('track1'), images1);

  // ─── Speed control ────────────────────────────────────────────────────────
  function setSpeed(seconds) {
    document.documentElement.style.setProperty('--speed', 30 + 's');
  }
