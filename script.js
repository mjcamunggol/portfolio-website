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
  // >>> ID PHOTO <<<
  const idImageUrl = './pictures/idpic.png';
  const fullBleedPhoto = false; //'true' if your image is already a full ID card

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
   10. AI CHATBOT & AUTO-CHATTER (HYBRID LLM + LOCAL KNOWLEDGE ENGINE)

══════════════════════════════════════════════════════════════════════════ */
(function initChatbot() {
  function setupChat() {
    const chatTrigger  = document.getElementById('chatTrigger');
    const chatWindow   = document.getElementById('chatWindow');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput    = document.getElementById('chatInput');
    const chatSend     = document.getElementById('chatSend');
    const chatTyping   = document.getElementById('chatTyping');
    const chatClear    = document.getElementById('chatClear');
    const suggestions  = document.getElementById('chatSuggestions');

    if (!chatTrigger || !chatWindow || !chatMessages || !chatInput || !chatSend) {
      console.warn('[Auto-Chatter] Chat HTML elements not found on page.');
      return;
    }

    // Prevent double-binding if script is initialized twice
    if (chatTrigger.dataset.bound === 'true') return;
    chatTrigger.dataset.bound = 'true';

    // ── SMART AUTO-CHATTER KNOWLEDGE ENGINE (MARISA'S PROFILE) ──────────
    function generateLocalReply(query) {
      const q = query.toLowerCase();

      // 1. Projects & Portfolio
      if (/project|built|portfolio|work sample|app|system|foodlink|ocr|24 chicken|renovation/.test(q)) {
        return `Here are the key software, AI, and hardware projects I've built:\n\n` +
          `• **AI Daily Briefing & Meeting Note-Taker (2026):** Python pipeline syncing screen capture + audio with the **Gemini API, Notion, and Zapier** to automate daily summaries.\n` +
          `• **FoodLink & Student Violation Systems (2025–2026):** Full-stack web platforms built with **Flutter, PHP, MySQL, JavaScript, and Bootstrap**.\n` +
          `• **Automated Document OCR Extractor (2026):** **Python, OpenCV, and PyTesseract** pipeline for scanning serial numbers and denominations.\n` +
          `• **Edge Defect Detection & FPGA Logic (2026):** **YOLOv8 / TensorFlow Lite** vision model + custom 4-bit hex to 7-segment decoder on a **Tang Nano 9K FPGA**.\n` +
          `• **Residential Renovation & Space Planning (2023–Present):** End-to-end **AutoCAD, SketchUp, and Lumion** 2D/3D design and material coordination.`;
      }

      // 2. AI & Workflow Automation
      if (/\bai\b|artificial intelligence|automat|zapier|make|integromat|gemini|note-taker|briefing|workflow/.test(q)) {
        return `I specialize in building **AI & Workflow Automations** that eliminate repetitive manual tasks:\n\n` +
          `• **Automation Platforms:** **Zapier, Make (Integromat)**, and custom **Gemini API** pipelines.\n` +
          `• **AI Meeting & Briefing Systems:** Built a custom Python tool that records screen + audio and routes structured action items directly into **Notion**.\n` +
          `• **Computer Vision & OCR:** Experienced with **YOLOv8, TensorFlow Lite, OpenCV, and PyTesseract** for automated document data extraction.`;
      }

      // 3. Virtual Assistant, Customer Support & Work Experience
      if (/\bva\b|virtual assistant|support|customer|csr|admin|executive|experience|work|job|intern|teams|notion/.test(q)) {
        return `I combine formal **multi-channel Customer Support experience** with technical Virtual Assistant & engineering skills:\n\n` +
          `• **Customer Support Representative (Pasay, Metro Manila — 2024):** Managed high-volume inbound/outbound inquiries across **phone, live chat, and email**. Handled team coordination, shift handovers, and escalations via **Microsoft Teams** with a focus on empathy and rapid resolution.\n` +
          `• **Web Development Intern | GoCrayons Digital Solutions (2019):** Supported web and game dev teams with bug troubleshooting, QA testing, and documentation.\n` +
          `• **Workspace Organization:** Advanced setup & database management in **Notion, Google Workspace, and MS Office**.`;
      }

      // 4. Workstation Specs & Typing Speed
      if (/spec|workstation|laptop|pc|computer|ram|ryzen|nvidia|gtx|typing|wpm|setup|hardware spec/.test(q)) {
        return `Here are my workstation and typing specifications:\n\n` +
          `• **Processor:** AMD Ryzen 5 4600H\n` +
          `• **Memory:** 16.0 GB RAM\n` +
          `• **Storage:** 256GB NVMe SSD + 1TB HDD\n` +
          `• **Graphics:** NVIDIA GeForce GTX 1650 (4 GB)\n` +
          `• **Typing Speed:** **41 WPM with 98% accuracy**`;
      }

      // 5. Tech Stack, Programming, CAD & Hardware Repair
      if (/stack|skill|tech|language|code|program|coding|python|php|flutter|cad|design|repair|fpga|arduino|iot/.test(q)) {
        return `My technical stack covers software, automation, 3D design, and hardware:\n\n` +
          `• **AI & Automation:** Zapier, Make, Gemini API, Notion, OCR Data Extraction.\n` +
          `• **Programming & Web:** Python, PHP, JavaScript, jQuery, Flutter, Bootstrap, HTML/CSS, MySQL, MongoDB, R, C/C++, Java, GitHub.\n` +
          `• **Design & CAD:** Canva, Procreate, AutoCAD, SketchUp, Lumion.\n` +
          `• **Hardware, IoT & Repair:** Raspberry Pi 4, Tang Nano 9K FPGA (Verilog/VHDL), Arduino, plus hands-on diagnostics & component repair for **laptops, TVs, and smart robot vacuums**.`;
      }

      // 6. Education, Mapúa & Coursera Certifications
      if (/educat|school|college|university|mapua|mapúa|degree|architect|student|certif|coursera|graduate/.test(q)) {
        return `Here is my educational background and certification list:\n\n` +
          `• **BS Computer Engineering — Mapúa University** (2024–Present | Expected Grad: **Jan 2028**): Focus on Database Management, Agile/SDLC, Networking, and Microcontrollers.\n` +
          `• **BS Architecture — Mapúa University** (2020–2023): Completed 3 years of coursework in CAD, 3D rendering, and project planning.\n` +
          `• **Senior High School (STEM) — IIST Cavite** (2018–2020): Graduated **With Honors**.\n` +
          `• **Verified Coursera Certifications:** *FPGA Design with HDL (CU Boulder)*, *Intro to AI (IBM)*, *Data Analysis with R (IBM)*, *Linear Circuits (Georgia Tech)*, *Vector Calculus (Johns Hopkins)*, *Inferential Statistics (Duke)*, and *Mechanics of Materials I–III (Georgia Tech/Rice)*.`;
      }

      // 7. Hiring, Availability, Contact & Location
      if (/hire|hiring|available|availability|contact|reach|email|location|where|rate|resume|cv/.test(q)) {
        return `Yes! I am **available for hire** and based in **Imus City, Cavite, Philippines**.\n\n` +
          `I am looking for opportunities as a:\n` +
          `• **Technical Virtual Assistant / AI & Workflow Automation VA**\n` +
          `• **Executive Assistant**\n` +
          `• **Customer Support Representative / IT & Tech Support Specialist**\n\n` +
          `You can reach me directly using the **Get in Touch / Contact** section on this page!`;
      }

      // 8. Greeting / Introduction
      if (/^(hi|hello|hey|good|who are you|about you|introduce|marisa)/.test(q)) {
        return `Hi! 👋 I'm **Marisa Jonnel P. Camunggol**, a Computer Engineering student at **Mapúa University** and former Architecture major from Cavite, Philippines.\n\n` +
          `I combine formal **multi-channel Customer Support experience** with **AI workflow automation (Zapier, Make, Gemini API), Notion organization, full-stack web dev, 2D/3D CAD, and electronics repair**.\n\n` +
          `Ask me about my **projects**, **AI automations**, **VA & support background**, **workstation specs**, or **availability**!`;
      }

      // 9. Default Overview
      return `Here's a quick snapshot of how I can help your team:\n\n` +
        `• **Target Roles:** Technical VA, AI/Workflow Automation VA, Executive Assistant, Customer Support Rep, or IT Support Specialist.\n` +
        `• **Core Toolkit:** Zapier, Make, Gemini API, Notion, MS Teams, Python, PHP, Flutter, JS, MySQL, AutoCAD/SketchUp, and hardware repair.\n` +
        `• **Experience & Education:** 2024 Multi-Channel Customer Support Rep, 2019 Web Dev Intern, and Mapúa University CpE student (Expected Grad: Jan 2028).\n\n` +
        `Try asking me: *"What projects have you built?"*, *"Tell me about your AI work"*, or *"What are your PC & typing specs?"*`;
    }

    // ── Helpers ──────────────────────────────────────────────────────────
    function timeStr() {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function formatBubbleHTML(text) {
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return escaped
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    }

    function appendMessage(role, text, isError = false) {
      const wrapper = document.createElement('div');
      wrapper.className = `chat-msg ${role}`;

      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble' + (isError ? ' error' : '');
      bubble.innerHTML = formatBubbleHTML(text);

      const time = document.createElement('span');
      time.className = 'msg-time';
      time.textContent = timeStr();

      wrapper.appendChild(bubble);
      wrapper.appendChild(time);
      chatMessages.appendChild(wrapper);

      chatMessages.scrollTop = chatMessages.scrollHeight;
      return bubble;
    }

    function setTyping(show) {
      if (chatTyping) chatTyping.classList.toggle('visible', show);
      if (show) chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function setInputDisabled(disabled) {
      chatInput.disabled = disabled;
      chatSend.disabled  = disabled;
    }

    // ── Toggle open/close ────────────────────────────────────────────────
    chatTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = chatWindow.classList.toggle('open');
      chatTrigger.classList.toggle('active', isOpen);
      if (isOpen) {
        setTimeout(() => chatInput.focus(), 300);
      }
    });

    // ── Suggestion chips ─────────────────────────────────────────────────
    if (suggestions) {
      suggestions.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (chip) {
          sendMessage(chip.textContent);
          suggestions.style.display = 'none';
        }
      });
    }

    // ── Clear chat ────────────────────────────────────────────────────────
    if (chatClear) {
      chatClear.addEventListener('click', () => {
        const msgs = chatMessages.querySelectorAll('.chat-msg');
        msgs.forEach((m, i) => { if (i > 0) m.remove(); });
        if (suggestions) suggestions.style.display = 'flex';
      });
    }

    // ── Send on button click or Enter ────────────────────────────────────
    chatSend.addEventListener('click', () => sendMessage());
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
    });

    // ── Instant Local Send Function ──────────────────────────────────────
    function sendMessage(overrideText) {
      const text = (typeof overrideText === 'string' ? overrideText : chatInput.value).trim();
      if (!text) return;

      appendMessage('user', text);
      chatInput.value = '';
      chatInput.style.height = 'auto';

      setInputDisabled(true);
      setTyping(true);

      setTimeout(() => {
        const reply = generateLocalReply(text);
        setTyping(false);
        appendMessage('bot', reply);
        setInputDisabled(false);
        chatInput.focus();
      }, 420);
    }
  }

  // Ensures elements exist whether script is in <head> or at bottom of <body>
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupChat);
  } else {
    setupChat();
  }
})();


// ─── Image data for tech stack banner ──────────────────────────────────
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
