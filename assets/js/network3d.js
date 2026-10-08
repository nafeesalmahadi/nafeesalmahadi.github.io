/* Hero: a 3D neural network. Layers of glowing neurons, weighted connections,
   and signal pulses travelling layer-by-layer (a live "forward pass"). */
import * as THREE from "../vendor/three.module.min.js";

const canvas = document.querySelector("[data-hero]");
const hero = canvas?.closest(".hero");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function hasWebGL() { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } }
if (canvas && hasWebGL()) { try { init(); } catch (e) { console.warn("3D disabled:", e); } }

function init() {
  const mobile = innerWidth < 720;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 13);

  const root = new THREE.Group(); scene.add(root);
  const net = new THREE.Group(); root.add(net);

  /* ---------- neurons ---------- */
  const LAYERS = mobile ? [5, 8, 8, 4] : [6, 10, 12, 10, 4];
  const spanX = mobile ? 6 : 8.4;
  const palette = [new THREE.Color("#22d3ee"), new THREE.Color("#60a5fa"), new THREE.Color("#8b5cf6"), new THREE.Color("#c084fc"), new THREE.Color("#f472b6")];
  const nodes = []; // {pos, layer, color}
  LAYERS.forEach((count, li) => {
    const x = -spanX / 2 + (spanX * li) / (LAYERS.length - 1);
    const radius = 0.9 + count * 0.13;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + li * 0.4;
      const y = Math.sin(a) * radius, z = Math.cos(a) * radius * 0.75;
      const c = palette[Math.round((li / (LAYERS.length - 1)) * (palette.length - 1))];
      nodes.push({ pos: new THREE.Vector3(x, y, z), layer: li, color: c });
    }
  });
  const layerIdx = LAYERS.map((_, li) => nodes.map((n, i) => (n.layer === li ? i : -1)).filter((i) => i >= 0));

  const nGeo = new THREE.BufferGeometry();
  const nPos = new Float32Array(nodes.length * 3), nCol = new Float32Array(nodes.length * 3), nAct = new Float32Array(nodes.length);
  nodes.forEach((n, i) => { nPos.set([n.pos.x, n.pos.y, n.pos.z], i * 3); nCol.set([n.color.r, n.color.g, n.color.b], i * 3); });
  nGeo.setAttribute("position", new THREE.BufferAttribute(nPos, 3));
  nGeo.setAttribute("color", new THREE.BufferAttribute(nCol, 3));
  nGeo.setAttribute("act", new THREE.BufferAttribute(nAct, 1));
  const glowVS = `
    attribute vec3 color; attribute float act; uniform float uSize; varying vec3 vCol; varying float vAct;
    void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv;
      gl_PointSize = uSize * (1.0 + act*0.9) / -mv.z; vCol = color; vAct = act; }`;
  const glowFS = `
    varying vec3 vCol; varying float vAct;
    void main(){ float d = length(gl_PointCoord-0.5);
      float core = smoothstep(0.17,0.0,d); float glow = smoothstep(0.5,0.0,d)*0.55;
      vec3 c = mix(vCol, vec3(1.0), core*0.85 + vAct*0.3);
      float a = core + glow*(0.55+vAct);
      if(a<0.01) discard; gl_FragColor = vec4(c, a); }`;
  const nMat = new THREE.ShaderMaterial({ uniforms: { uSize: { value: (mobile ? 150 : 190) * renderer.getPixelRatio() } }, vertexShader: glowVS, fragmentShader: glowFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  net.add(new THREE.Points(nGeo, nMat));

  /* ---------- connections ---------- */
  const edges = [];
  for (let li = 0; li < LAYERS.length - 1; li++) {
    layerIdx[li].forEach((a) => layerIdx[li + 1].forEach((b) => { if (Math.random() < (mobile ? 0.7 : 0.8)) edges.push([a, b]); }));
  }
  const ePos = new Float32Array(edges.length * 6), eCol = new Float32Array(edges.length * 6);
  edges.forEach(([a, b], k) => {
    const A = nodes[a], B = nodes[b];
    ePos.set([A.pos.x, A.pos.y, A.pos.z, B.pos.x, B.pos.y, B.pos.z], k * 6);
    eCol.set([A.color.r, A.color.g, A.color.b, B.color.r, B.color.g, B.color.b], k * 6);
  });
  const eGeo = new THREE.BufferGeometry();
  eGeo.setAttribute("position", new THREE.BufferAttribute(ePos, 3));
  eGeo.setAttribute("color", new THREE.BufferAttribute(eCol, 3));
  const eMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false });
  net.add(new THREE.LineSegments(eGeo, eMat));
  const outEdges = nodes.map(() => []);
  edges.forEach(([a, b]) => outEdges[a].push(b));

  /* ---------- signal pulses (forward pass) ---------- */
  const P = mobile ? 40 : 80;
  const pulses = [];
  const pPos = new Float32Array(P * 3), pCol = new Float32Array(P * 3), pAct = new Float32Array(P).fill(0.6);
  function spawn(p) {
    const start = layerIdx[0][Math.floor(Math.random() * layerIdx[0].length)];
    p.from = start; p.to = pick(start); p.t = Math.random() * -1.5; p.speed = 0.7 + Math.random() * 0.7;
  }
  const pick = (a) => { const o = outEdges[a]; return o.length ? o[Math.floor(Math.random() * o.length)] : -1; };
  for (let i = 0; i < P; i++) { const p = {}; spawn(p); p.t = Math.random() * 3 - 2; pulses.push(p); }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
  pGeo.setAttribute("act", new THREE.BufferAttribute(pAct, 1));
  const pMat = new THREE.ShaderMaterial({ uniforms: { uSize: { value: (mobile ? 80 : 95) * renderer.getPixelRatio() } }, vertexShader: glowVS, fragmentShader: glowFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  net.add(new THREE.Points(pGeo, pMat));

  /* ---------- data dust ---------- */
  const D = mobile ? 350 : 800, dPos = new Float32Array(D * 3);
  for (let i = 0; i < D; i++) dPos.set([(Math.random() - .5) * 30, (Math.random() - .5) * 18, (Math.random() - .5) * 14 - 3], i * 3);
  const dGeo = new THREE.BufferGeometry(); dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
  const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ color: 0x9fb3ff, size: 0.035, transparent: true, opacity: 0.55, depthWrite: false }));
  scene.add(dust);

  /* ---------- layout ---------- */
  let baseY = 0;
  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visW = visH * camera.aspect;
    if (w > 1080) { root.position.set(visW * 0.2, 0.4, 0); root.scale.setScalar(Math.min(1, visW / 26)); baseY = 0.4; }
    else if (w > 720) { root.position.set(visW * 0.16, visH * 0.2, -2); root.scale.setScalar(0.75); baseY = visH * 0.2; }
    else { // phone: network sits above the name
      baseY = (0.5 - 190 / h) * visH; root.position.set(0, baseY, 0);
      root.scale.setScalar(Math.min((visW * 0.92) / spanX, ((250 / h) * visH) / 5.2));
    }
    renderer.render(scene, camera);
  }
  new ResizeObserver(resize).observe(hero); resize();

  /* ---------- interaction ---------- */
  const tilt = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => { tilt.x = e.clientX / innerWidth - .5; tilt.y = e.clientY / innerHeight - .5; }, { passive: true });
  let scrollP = 0;
  addEventListener("scroll", () => { scrollP = Math.min(scrollY / innerHeight, 1.2); }, { passive: true });

  /* ---------- loop ---------- */
  let visible = true, running = false, last = performance.now(), time = 0, loss = 0.42;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(hero);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });
  const tmp = new THREE.Vector3();

  function step(dt) {
    for (let i = 0; i < nAct.length; i++) nAct[i] *= Math.pow(0.12, dt);
    pulses.forEach((p, i) => {
      p.t += dt * p.speed;
      if (p.to < 0) { spawn(p); }
      if (p.t >= 1) {
        nAct[p.to] = Math.min(nAct[p.to] + 0.9, 1.6);
        const nxt = pick(p.to);
        if (nxt < 0) { spawn(p); } else { p.from = p.to; p.to = nxt; p.t = 0; }
      }
      const tt = Math.max(p.t, 0);
      tmp.lerpVectors(nodes[p.from].pos, nodes[p.to].pos, tt);
      pPos.set([tmp.x, tmp.y, tmp.z], i * 3);
      const c = nodes[p.to].color;
      pCol.set([c.r * 0.6 + 0.4, c.g * 0.6 + 0.4, c.b * 0.6 + 0.4], i * 3);
      pAct[i] = p.t < 0 ? 0 : 0.6;
    });
    nGeo.attributes.act.needsUpdate = true;
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true; pGeo.attributes.act.needsUpdate = true;
  }

  function frame(now) {
    if (!visible || document.hidden) { running = false; return; }
    const dt = Math.min((now - last) / 1000, 0.05); last = now; time += dt;
    step(dt);
    cur.x += (tilt.x - cur.x) * 0.05; cur.y += (tilt.y - cur.y) * 0.05;
    net.rotation.y = Math.sin(time * 0.18) * 0.55 + cur.x * 0.6 + scrollP * 0.8;
    net.rotation.x = Math.sin(time * 0.13) * 0.12 + cur.y * 0.3;
    dust.rotation.y = time * 0.01 + cur.x * 0.08;
    root.position.y += (baseY + Math.sin(time * 0.7) * 0.08 + scrollP * 1.5 - root.position.y) * 0.1;
    const lossEl = document.querySelector("[data-loss]");
    if (lossEl && Math.floor(time * 4) !== Math.floor((time - dt) * 4)) {
      loss = loss > 0.07 ? loss * 0.985 : 0.42;
      lossEl.textContent = loss.toFixed(3) + " ↓";
    }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  function start() {
    if (reduce) { step(0.5); renderer.render(scene, camera); return; }
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
  }
  for (let i = 0; i < 40; i++) step(0.05); // warm up so pulses are spread out
  renderer.render(scene, camera);
  requestAnimationFrame(() => canvas.classList.add("ready"));
  start();
}
