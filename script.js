'use strict';

window.siteLayoutReady.then(() => {

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
});

/* ══════════════════════════════════════════════════════════════════════════
   4. THREE.JS HERO SCENE
══════════════════════════════════════════════════════════════════════════ */
(function initThreeScene() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  // ── 3D PALETTE ────────────────────────────────────────────────────────
  const COLORS = {
    accent:     0x29aa9b,
    accentGlow: 0x00ffe0,
    bg:         0x080c12,
    surface:    0x0e1420,
    text:       0xe8edf5,
    textMuted:  0x6b7a99
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
  const fullBleedPhoto = false;

  const qrImageUrl = './pictures/qr-themed.png';

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

    // Base Card Surface
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

    // Outer Border
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
    fCtx.fillText('AI · AUTOMATION · WEB · EMBEDDED', 256, 600);

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
    // Deep Dark Base
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

    // QR Code Image Frame
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
    bCtx.fillText('SCAN TO ADD ME ON VIBER', 256, 495);

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

  const cardMesh = new THREE.Mesh(cardGeo, [sideMat, sideMat, sideMat, sideMat, frontMat, backMat]);
  cardMesh.position.y = -cardHeight / 2;
  idGroup.add(cardMesh);

  // 3D Edge Highlight
  const borderEdges = new THREE.EdgesGeometry(cardGeo);
  const borderLines = new THREE.LineSegments(
    borderEdges,
    new THREE.LineBasicMaterial({ color: COLORS.accent, transparent: true, opacity: 0.55 })
  );
  cardMesh.add(borderLines);

  // Metal Clasp
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

  // Lanyard Ribbon
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

  // Center Stitch
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
  let flipOffset = 0;

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

      if (elapsed < 260 && moveDist < 0.06) {
        flipOffset += Math.PI;
        endNode.oldPos.z += 0.08;
      }
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
   /* 8. CONTACT FORM
══════════════════════════════════════════════════════════════════════════ */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const sendBtn     = contactForm?.querySelector('.btn-send');
const btnText     = sendBtn?.querySelector('.btn-text');

const FORMSPREE_URL = "https://formspree.io/f/mvkzenqk"; 

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    
    // Validation
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

    const formData = new FormData(contactForm);

    fetch(FORMSPREE_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        contactForm.reset();
        if (btnText) btnText.textContent = 'Sent ✓';
        formSuccess.classList.add('visible');
        
        setTimeout(() => {
          if (btnText) btnText.textContent = 'Send Message';
          sendBtn.disabled = false;
          formSuccess.classList.remove('visible');
        }, 3500);
      } else {
        response.json().then(data => {
          if (Object.hasOwn(data, 'errors')) {
            alert(data["errors"].map(error => error["message"]).join(", "));
          } else {
            alert("Oops! There was a problem submitting your form");
          }
        });
        if (btnText) btnText.textContent = 'Error';
        sendBtn.disabled = false;
      }
    })
    .catch(error => {
      alert("Oops! There was a problem submitting your form");
      if (btnText) btnText.textContent = 'Error';
      sendBtn.disabled = false;
    });
  });
}

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

    if (chatTrigger.dataset.bound === 'true') return;
    chatTrigger.dataset.bound = 'true';

    // ── GEMINI API CONFIGURATION ─────────────────────────────────────────
    // No API key needed here! Cloudflare handles it on the server.
    const API_URL = '/api/chat';

    // ── SYSTEM INSTRUCTIONS (MARISA'S PROFILE CONTEXT) ───────────────────
    const systemInstruction = {
      role: "model",
      parts: [{
        text: `You are the AI portfolio assistant for Marisa Jonnel P. Camunggol, a Computer Engineering student at Mapúa University (Expected Grad: Jan 2028) based in Imus City, Cavite.
        
        Use this knowledge to answer questions about her:
        - Target Roles: Technical VA, AI/Workflow Automation VA, Executive Assistant, Customer Support Rep.
        - Tech Stack: Zapier, Make, Gemini API, Notion, Python, PHP, Flutter, JS, MySQL, AutoCAD, SketchUp, Lumion.
        - Hardware/Repair: Raspberry Pi 4, Tang Nano 9K FPGA (Verilog/VHDL), Arduino, and component repair for laptops, TVs, and smart vacuums.
        - Workstation Specs: AMD Ryzen 5 4600H, 16GB RAM, 256GB NVMe SSD + 1TB HDD, NVIDIA GTX 1650 (4 GB). Typing: 41 WPM (98% accuracy).
        - Key Projects: 
          1. AI Daily Briefing & Meeting Note-Taker (Python, Gemini API, Notion, Zapier).
          2. Edge Defect Detection & FPGA Logic (YOLOv8, TF Lite, Tang Nano 9K).
          3. FoodLink & Student Violation Systems (Flutter, PHP, MySQL).
          4. Automated Document OCR Extractor (Python, OpenCV, PyTesseract).
          5. Residential Renovation & Space Planning (AutoCAD, SketchUp).
        - Work Experience: Customer Support Rep (2024, Pasay - MS Teams, Live Chat, Email), Web Dev Intern (2019).
        
        Keep your answers concise, friendly, and formatted with markdown (bolding key tech terms). If asked for contact info, tell them to use the Get in Touch section on the page.`
      }]
    };

    // Store conversation history so Gemini remembers context
    let chatHistory = [];

    // ── Helpers ──────────────────────────────────────────────────────────
    function timeStr() {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function formatBubbleHTML(text) {
      // Basic markdown to HTML conversion for bold text and line breaks
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return escaped
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
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
        chatHistory = []; // Clear AI memory
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

    // ── GEMINI API CALL FUNCTION ─────────────────────────────────────────
    async function sendMessage(overrideText) {
      const text = (typeof overrideText === 'string' ? overrideText : chatInput.value).trim();
      if (!text) return;

      appendMessage('user', text);
      chatInput.value = '';
      chatInput.style.height = 'auto';

      setInputDisabled(true);
      setTyping(true);

      // Add user message to history
      chatHistory.push({
        role: "user",
        parts: [{ text: text }]
      });

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: systemInstruction,
            contents: chatHistory,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            }
          })
        });

        const data = await response.json();

        // 1. Check if Cloudflare or Gemini returned an error payload
        if (data.error) {
          console.error("Detailed API Error:", data.error);
          throw new Error(data.error.message || JSON.stringify(data.error));
        }

        // 2. Safety check to ensure candidates exist before reading [0]
        if (!data.candidates || data.candidates.length === 0) {
          console.error("Unexpected empty response format:", data);
          throw new Error("No response candidates returned.");
        }

        const botReply = data.candidates[0].content.parts[0].text;

        // Add bot reply to history
        chatHistory.push({
          role: "model",
          parts: [{ text: botReply }]
        });

        setTyping(false);
        appendMessage('bot', botReply);

      } catch (error) {
        console.error("Gemini API Error:", error);
        setTyping(false);
        appendMessage('bot', "I'm having trouble connecting to my AI brain right now. Please try again later!", true);
        chatHistory.pop();
      } finally {
        setInputDisabled(false);
        chatInput.focus();
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupChat);
  } else {
    setupChat();
  }
})();


// ─── Image data for tech stack banner ──────────────────────────────────
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
    const html = [...items, ...items].map((img, i) => makeCard(img, i)).join('');
    trackEl.innerHTML = html;
  }

  const techStackTrack = document.getElementById('track1');
  if (techStackTrack) buildTrack(techStackTrack, images1);

  // ─── Speed control ────────────────────────────────────────────────────────
  function setSpeed(seconds) {
    document.documentElement.style.setProperty('--speed', 30 + 's');
  }

function scrollCertificates(direction) {
  const track = document.getElementById('certTrack');
  if (!track) return;

  track.scrollBy({
    left: direction * 270,
    behavior: 'smooth'
  });
}

document.querySelector('.left-btn')?.addEventListener('click', () => scrollCertificates(-1));
document.querySelector('.right-btn')?.addEventListener('click', () => scrollCertificates(1));

const setupViewMore = () => {
  const viewMoreBtn = document.getElementById('viewMoreBtn');
  const projectsGrid = document.getElementById('projectsGrid');

  if (viewMoreBtn && projectsGrid) {
    viewMoreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      projectsGrid.classList.toggle('show-all');

      if (projectsGrid.classList.contains('show-all')) {
        viewMoreBtn.textContent = 'View less';
      } else {
        viewMoreBtn.textContent = 'View more';
      }
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupViewMore);
} else {
  setupViewMore();
}
}).catch(error => {
  console.error('Unable to initialize the portfolio because its shared layout did not load.', error);
});