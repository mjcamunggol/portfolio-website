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
  if (!canvas) return;

  // ── 3D PALETTE (Mapped from your :root CSS variables) ─────────────────
  const COLORS = {
    accent:     0x29aa9b, // --accent (#29aa9b)
    accentGlow: 0x00ffe0, // --accent-mid / --glow base (#00ffe0)
    bg:         0x080c12, // --bg (#080c12)
    surface:    0x0e1420, // --bg-surface (#0e1420)
    text:       0xe8edf5, // --text (#e8edf5)
    textMuted:  0x6b7a99  // --text-muted (#6b7a99)
  };

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // ── LIGHTS ────────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(COLORS.text, 0.65));
  const dirLight = new THREE.DirectionalLight(COLORS.accent, 2.5);
  dirLight.position.set(4, 6, 4);
  scene.add(dirLight);

  const rimLight = new THREE.DirectionalLight(COLORS.textMuted, 1.4);
  rimLight.position.set(-4, -2, -3);
  scene.add(rimLight);

  // ── 1A. FRONT ID BADGE TEXTURE ────────────────────────────────────────
  // >>> REPLACE THIS PATH WITH YOUR ID PHOTO <<<
  const idImageUrl = 'your-id-picture.jpg';
  const fullBleedPhoto = false; // Set to 'true' if your image is already a full ID card

  // >>> OPTIONAL: REPLACE WITH YOUR OWN QR CODE IMAGE URL <<<

  // >>> REPLACE THIS PATH WITH YOUR QR CODE IMAGE FILE <<<
  const qrImageUrl = 'your-qr-picture.jpg';

  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = 512;
  frontCanvas.height = 800;
  const fCtx = frontCanvas.getContext('2d');
  const frontTexture = new THREE.CanvasTexture(frontCanvas);
  frontTexture.colorSpace = THREE.SRGBColorSpace;

  function drawFrontCard(loadedImg = null) {
    if (loadedImg && fullBleedPhoto) {
      fCtx.drawImage(loadedImg, 0, 0, 512, 800);
      frontTexture.needsUpdate = true;
      return;
    }

    // Clean Base Card Surface (--bg-surface: #0e1420) - Header line removed
    fCtx.fillStyle = '#0e1420';
    fCtx.fillRect(0, 0, 512, 800);

    // Lanyard Slot Cutout
    fCtx.fillStyle = '#080c12';
    fCtx.beginPath();
    fCtx.roundRect(206, 36, 100, 18, 9);
    fCtx.fill();
    fCtx.strokeStyle = 'rgba(0, 255, 224, 0.2)';
    fCtx.lineWidth = 2;
    fCtx.stroke();

    // Outer Border (--border)
    fCtx.strokeStyle = 'rgba(0, 255, 224, 0.18)';
    fCtx.lineWidth = 6;
    fCtx.strokeRect(18, 18, 476, 764);

    // ID Photo Frame
    const photoX = 116, photoY = 125, photoW = 280, photoH = 320;
    fCtx.fillStyle = '#080c12';
    fCtx.fillRect(photoX, photoY, photoW, photoH);

    if (loadedImg) {
      fCtx.drawImage(loadedImg, photoX, photoY, photoW, photoH);
    } else {
      fCtx.fillStyle = '#6b7a99';
      fCtx.font = '18px monospace';
      fCtx.textAlign = 'center';
      fCtx.fillText('[ PHOTO HERE ]', 256, 290);
    }

    fCtx.strokeStyle = '#29aa9b';
    fCtx.lineWidth = 4;
    fCtx.strokeRect(photoX, photoY, photoW, photoH);

    // Typography
    fCtx.textAlign = 'center';
    fCtx.fillStyle = '#e8edf5';
    fCtx.font = 'bold 30px sans-serif';
    fCtx.fillText('MARISA CAMUNGGOL', 256, 510);

    fCtx.fillStyle = '#29aa9b';
    fCtx.font = 'bold 20px monospace';
    fCtx.fillText('// SYSTEM ARCHITECT', 256, 550);

    fCtx.fillStyle = '#6b7a99';
    fCtx.font = '16px monospace';
    fCtx.fillText('AI · AUTOMATION · WEB · HARDWARE', 256, 600);

    // Hint to click/flip
    fCtx.fillStyle = 'rgba(0, 255, 224, 0.45)';
    fCtx.font = '14px monospace';
    fCtx.fillText('[ CLICK TO FLIP CARD ]', 256, 660);

    // Bottom Barcode Strip
    fCtx.fillStyle = 'rgba(0, 255, 224, 0.2)';
    for (let x = 96; x < 416; x += 14) {
      const barW = (x % 28 === 0) ? 8 : 4;
      fCtx.fillRect(x, 695, barW, 40);
    }

    frontTexture.needsUpdate = true;
  }

  // ── 1B. BACKSIDE ID TEXTURE (WITH QR IMAGE & SPECS) ───────────────────
  const backCanvas = document.createElement('canvas');
  backCanvas.width = 512;
  backCanvas.height = 800;
  const bCtx = backCanvas.getContext('2d');
  const backTexture = new THREE.CanvasTexture(backCanvas);
  backTexture.colorSpace = THREE.SRGBColorSpace;

  function drawBackCard(loadedQrImg = null) {
    // Clean Deep Dark Base (--bg: #080c12)
    bCtx.fillStyle = '#080c12';
    bCtx.fillRect(0, 0, 512, 800);

    // Outer Border
    bCtx.strokeStyle = 'rgba(0, 255, 224, 0.18)';
    bCtx.lineWidth = 6;
    bCtx.strokeRect(18, 18, 476, 764);

    // Lanyard Slot Cutout
    bCtx.fillStyle = '#0e1420';
    bCtx.beginPath();
    bCtx.roundRect(206, 36, 100, 18, 9);
    bCtx.fill();
    bCtx.strokeStyle = 'rgba(0, 255, 224, 0.2)';
    bCtx.lineWidth = 2;
    bCtx.stroke();

    // QR Code Image Frame (Same style as Front ID Photo Frame)
    const qrSize = 250;
    const qrX = (512 - qrSize) / 2;
    const qrY = 175;

    bCtx.fillStyle = '#0e1420';
    bCtx.fillRect(qrX, qrY, qrSize, qrSize);

    if (loadedQrImg) {
      bCtx.drawImage(loadedQrImg, qrX, qrY, qrSize, qrSize);
    } else {
      bCtx.fillStyle = '#6b7a99';
      bCtx.font = '18px monospace';
      bCtx.textAlign = 'center';
      bCtx.fillText('[ QR HERE ]', 256, qrY + qrSize / 2 + 6);
    }

    bCtx.strokeStyle = '#29aa9b';
    bCtx.lineWidth = 4;
    bCtx.strokeRect(qrX, qrY, qrSize, qrSize);

    // Backside Tech Metadata
    bCtx.textAlign = 'center';
    bCtx.fillStyle = '#e8edf5';
    bCtx.font = 'bold 22px monospace';
    bCtx.fillText('SCAN TO CONNECT', 256, 495);

    bCtx.fillStyle = '#29aa9b';
    bCtx.font = '16px monospace';
    bCtx.fillText('IMUS CITY CAVITE // PH', 256, 535);

    // Security / Clearance Box
    bCtx.fillStyle = '#0e1420';
    bCtx.fillRect(64, 595, 384, 95);
    bCtx.strokeStyle = 'rgba(0, 255, 224, 0.15)';
    bCtx.lineWidth = 2;
    bCtx.strokeRect(64, 595, 384, 95);

    bCtx.fillStyle = '#6b7a99';
    bCtx.font = '14px monospace';
    bCtx.fillText('MAPUA UNIVERSITY // BS CPE', 256, 630);
    bCtx.fillText('2027', 256, 660);

    backTexture.needsUpdate = true;
  }

  // Initialize both card textures and load images
  drawFrontCard();
  drawBackCard();

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(idImageUrl, (tex) => drawFrontCard(tex.image));
  textureLoader.load(qrImageUrl, (tex) => drawBackCard(tex.image));

  // ── 2. BUILD THE 3D ID CARD & CLIP MESH ───────────────────────────────
  const idGroup = new THREE.Group();
  scene.add(idGroup);

  const cardWidth = 1.65;
  const cardHeight = 2.55;
  const cardDepth = 0.05;

  const cardGeo = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth);
  const sideMat = new THREE.MeshStandardMaterial({ color: COLORS.surface, roughness: 0.3, metalness: 0.85 });
  const frontMat = new THREE.MeshStandardMaterial({ map: frontTexture, roughness: 0.25, metalness: 0.15 });
  const backMat = new THREE.MeshStandardMaterial({ map: backTexture, roughness: 0.25, metalness: 0.15 });

  // Materials order: [Right, Left, Top, Bottom, Front, Back]
  const cardMesh = new THREE.Mesh(cardGeo, [sideMat, sideMat, sideMat, sideMat, frontMat, backMat]);
  cardMesh.position.y = -cardHeight / 2;
  idGroup.add(cardMesh);

  // 3D Edge Highlight (--accent: #29aa9b)
  const borderEdges = new THREE.EdgesGeometry(cardGeo);
  const borderLines = new THREE.LineSegments(
    borderEdges,
    new THREE.LineBasicMaterial({ color: COLORS.accent, transparent: true, opacity: 0.55 })
  );
  cardMesh.add(borderLines);

  // Metal Clasp at Top (--text-muted: #6b7a99)
  const clipGeo = new THREE.BoxGeometry(0.32, 0.22, 0.08);
  const clipMat = new THREE.MeshStandardMaterial({ color: COLORS.textMuted, metalness: 0.9, roughness: 0.2 });
  const clipMesh = new THREE.Mesh(clipGeo, clipMat);
  clipMesh.position.y = 0.05;
  idGroup.add(clipMesh);

  // ── 3. VERLET PHYSICS SETUP (LANYARD + CARD) ──────────────────────────
  const anchorX = window.innerWidth < 768 ? 0 : 2.0;
  const anchorY = 4.2;
  const numNodes = 14;
  const ropeLength = 3.2;
  const segmentLength = ropeLength / (numNodes - 1);

  const nodes = [];
  for (let i = 0; i < numNodes; i++) {
    const y = anchorY - i * segmentLength;
    const initialSwing = i === numNodes - 1 ? 0.35 : 0;
    nodes.push({
      pos: new THREE.Vector3(anchorX + initialSwing, y, 0),
      oldPos: new THREE.Vector3(anchorX, y, 0),
      isPinned: i === 0
    });
  }

  // Lanyard Ribbon (--bg-surface: #0e1420)
  const strapWidth = 0.14;
  const strapGeo = new THREE.PlaneGeometry(strapWidth, 1, 1, numNodes - 1);
  const strapMat = new THREE.MeshStandardMaterial({
    color: COLORS.surface,
    roughness: 0.55,
    metalness: 0.3,
    side: THREE.DoubleSide
  });
  const strapMesh = new THREE.Mesh(strapGeo, strapMat);
  scene.add(strapMesh);

  // Glowing Center Stitch along Lanyard (--accent: #29aa9b)
  const stitchCurve = new THREE.CatmullRomCurve3(nodes.map(n => n.pos.clone()));
  const stitchGeo = new THREE.TubeGeometry(stitchCurve, 32, 0.012, 6, false);
  const stitchMat = new THREE.MeshBasicMaterial({ color: COLORS.accent, transparent: true, opacity: 0.8 });
  const stitchMesh = new THREE.Mesh(stitchGeo, stitchMat);
  scene.add(stitchMesh);

  // ── 4. MOUSE & TOUCH DRAG + CLICK-TO-FLIP INTERACTION ─────────────────
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const downPointer = new THREE.Vector2();
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const intersectPoint = new THREE.Vector3();
  const grabOffset = new THREE.Vector3();

  let isDragging = false;
  let isHovered = false;
  let downTime = 0;
  let flipOffset = 0; // Tracks 180-degree (Math.PI) flips!

  function updatePointer(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  function onPointerDown(e) {
    updatePointer(e);
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(cardMesh);

    if (intersects.length > 0) {
      isDragging = true;
      downTime = performance.now();
      downPointer.copy(pointer);

      canvas.style.cursor = 'grabbing';
      borderLines.material.color.setHex(COLORS.accentGlow);
      borderLines.material.opacity = 0.95;

      const endNode = nodes[numNodes - 1];
      dragPlane.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(dragPlane.normal),
        endNode.pos
      );
      if (raycaster.ray.intersectPlane(dragPlane, intersectPoint)) {
        grabOffset.copy(endNode.pos).sub(intersectPoint);
      }
    }
  }

  function onPointerMove(e) {
    updatePointer(e);
    raycaster.setFromCamera(pointer, camera);

    if (isDragging) {
      if (raycaster.ray.intersectPlane(dragPlane, intersectPoint)) {
        const endNode = nodes[numNodes - 1];
        const targetPos = intersectPoint.add(grabOffset);
        endNode.pos.lerp(new THREE.Vector3(targetPos.x, targetPos.y, 0.4), 0.45);
      }
    } else {
      const intersects = raycaster.intersectObject(cardMesh);
      if (intersects.length > 0) {
        if (!isHovered) {
          canvas.style.cursor = 'grab';
          borderLines.material.opacity = 0.85;
          isHovered = true;
        }
      } else if (isHovered) {
        canvas.style.cursor = 'default';
        borderLines.material.opacity = 0.55;
        isHovered = false;
      }
    }
  }

  function onPointerUp() {
    if (isDragging) {
      const elapsed = performance.now() - downTime;
      const moveDist = pointer.distanceTo(downPointer);
      const endNode = nodes[numNodes - 1];
      const vx = endNode.pos.x - endNode.oldPos.x;

      // 1. Quick click/tap -> Flip 180 degrees to show/hide QR backside!
      if (elapsed < 260 && moveDist < 0.06) {
        flipOffset += Math.PI;
        // Give it a tiny physical nudge when flipped
        endNode.oldPos.z += 0.08;
      }
      // 2. Fast horizontal release -> Spin 360 degrees with momentum!
      else if (Math.abs(vx) > 0.07) {
        const spins = Math.sign(vx) * Math.PI * 2;
        flipOffset += spins;
      }

      isDragging = false;
      canvas.style.cursor = isHovered ? 'grab' : 'default';
      borderLines.material.color.setHex(COLORS.accent);
      borderLines.material.opacity = isHovered ? 0.85 : 0.55;
    }
  }

  window.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  window.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);

  // ── 5. COMPLETE PHYSICS & ANIMATION LOOP ──────────────────────────────
  const gravity = new THREE.Vector3(0, -0.0065, 0);
  const damping = 0.975;
  const constraintSteps = 12;
  let cardRotZ = 0;
  let cardRotY = 0;

  function animate() {
    requestAnimationFrame(animate);

    // Step A: Verlet Integration
    for (let i = 0; i < numNodes; i++) {
      const n = nodes[i];
      if (n.isPinned) continue;
      if (isDragging && i === numNodes - 1) continue;

      const vx = (n.pos.x - n.oldPos.x) * damping;
      const vy = (n.pos.y - n.oldPos.y) * damping;
      const vz = (n.pos.z - n.oldPos.z) * damping;

      n.oldPos.copy(n.pos);
      n.pos.x += vx + gravity.x;
      n.pos.y += vy + gravity.y;
      n.pos.z += vz + gravity.z;
    }

    // Step B: Rope Elasticity Constraints
    for (let step = 0; step < constraintSteps; step++) {
      for (let i = 0; i < numNodes - 1; i++) {
        const n1 = nodes[i];
        const n2 = nodes[i + 1];

        const diff = new THREE.Vector3().subVectors(n2.pos, n1.pos);
        const dist = diff.length();
        if (dist === 0) continue;

        const difference = (segmentLength - dist) / dist;
        const offset = diff.multiplyScalar(difference * 0.5);

        if (!n1.isPinned) n1.pos.sub(offset);
        if (isDragging && i + 1 === numNodes - 1) {
          n1.pos.sub(offset);
        } else {
          n2.pos.add(offset);
        }
      }
    }

    // Step C: Update Lanyard Strap Geometry
    const posAttr = strapGeo.attributes.position;
    for (let i = 0; i < numNodes; i++) {
      const p = nodes[i].pos;
      posAttr.setXYZ(i * 2,     p.x - strapWidth / 2, p.y, p.z);
      posAttr.setXYZ(i * 2 + 1, p.x + strapWidth / 2, p.y, p.z);
    }
    posAttr.needsUpdate = true;
    strapGeo.computeVertexNormals();

    // Update Center Accent Stitch
    const updatedCurve = new THREE.CatmullRomCurve3(nodes.map(n => n.pos));
    stitchMesh.geometry.dispose();
    stitchMesh.geometry = new THREE.TubeGeometry(updatedCurve, 32, 0.012, 6, false);

    // Step D: Sync ID Card Position, Swing Tilt & 360 Flip Rotation
    const endNode = nodes[numNodes - 1];
    const prevNode = nodes[numNodes - 3];

    idGroup.position.copy(endNode.pos);

    const dx = endNode.pos.x - prevNode.pos.x;
    const dy = endNode.pos.y - prevNode.pos.y;
    const targetRotZ = Math.atan2(dx, -dy) * 0.65;
    cardRotZ += (targetRotZ - cardRotZ) * 0.15;
    idGroup.rotation.z = cardRotZ;

    // Combine flipOffset (0 or PI) with drag tilt and natural idle sway
    const vx = endNode.pos.x - endNode.oldPos.x;
    const swayY = isDragging ? pointer.x * 0.45 : vx * 4.5 + Math.sin(Date.now() * 0.0015) * 0.12;
    const targetRotY = flipOffset + swayY;
    cardRotY += (targetRotY - cardRotY) * 0.08;
    idGroup.rotation.y = cardRotY;

    renderer.render(scene, camera);
  }

  animate();

  // ── 6. HANDLE WINDOW RESIZE ───────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    nodes[0].pos.x = window.innerWidth < 768 ? 0 : 2.0;
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
