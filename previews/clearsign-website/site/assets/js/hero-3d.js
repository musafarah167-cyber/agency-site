import * as THREE from '../vendor/three.module.js';

// The sculpture uses the final ClearSign vector geometry, with SVG y inverted.
function brandShape() {
  const s = new THREE.Shape();
  s.moveTo(40, -8); s.lineTo(26, -8);
  s.bezierCurveTo(14.954, -8, 6, -16.954, 6, -28);
  s.lineTo(6, -36); s.bezierCurveTo(6, -47.046, 14.954, -56, 26, -56);
  s.lineTo(58, -56); s.lineTo(58, -44); s.lineTo(26, -44);
  s.bezierCurveTo(21.582, -44, 18, -40.418, 18, -36);
  s.lineTo(18, -28); s.bezierCurveTo(18, -23.582, 21.582, -20, 26, -20);
  s.lineTo(40, -20); s.closePath();
  return s;
}

function studioTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 512;
  const c = canvas.getContext('2d');
  const base = c.createLinearGradient(0, 0, 0, 512);
  base.addColorStop(0, '#c5c0b5'); base.addColorStop(.46, '#b9b4a9'); base.addColorStop(1, '#615d54');
  c.fillStyle = base; c.fillRect(0, 0, 1024, 512);
  // Soft studio strip lights reflected by the brushed metal. No external map.
  for (const [x, y, w, h, colour] of [[80, 50, 200, 190, '#fffdf7'], [550, 80, 80, 340, '#fff7e7'], [760, 20, 200, 110, '#ffffff']]) {
    c.shadowBlur = 35; c.shadowColor = colour; c.fillStyle = colour; c.fillRect(x, y, w, h);
  }
  const map = new THREE.CanvasTexture(canvas);
  map.mapping = THREE.EquirectangularReflectionMapping;
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

// A broad, twisting strip with real thickness; not a tube or a screen overlay.
function ribbonGeometry(curve, width, thickness = .035, from = 0, to = 1, segments = 120, phase = 0) {
  const frames = curve.computeFrenetFrames(segments, false);
  const vertices = [], indices = [];
  for (let i = 0; i <= segments; i++) {
    const t = from + (to - from) * i / segments;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    let across = new THREE.Vector3(0, 1, .15).cross(tangent).normalize();
    if (across.lengthSq() < .01) across.copy(frames.normals[i]);
    across.applyAxisAngle(tangent, Math.sin(t * Math.PI * 1.7 + phase) * .9 + .4);
    const normal = new THREE.Vector3().crossVectors(tangent, across).normalize();
    for (const [side, face] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const v = p.clone().addScaledVector(across, side * width / 2).addScaledVector(normal, face * thickness / 2);
      vertices.push(v.x, v.y, v.z);
    }
    if (i < segments) for (let j = 0; j < 4; j++) {
      const a = i * 4 + j, b = i * 4 + (j + 1) % 4, next = a + 4, nextB = b + 4;
      indices.push(a, next, b, b, next, nextB);
    }
  }
  indices.push(0, 1, 2, 0, 2, 3);
  const end = segments * 4; indices.push(end, end + 2, end + 1, end, end + 3, end + 2);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  g.setIndex(indices); g.computeVertexNormals();
  return g;
}

export async function initHeroScene({ canvas, stage, onReady = () => {} } = {}) {
  if (!(canvas instanceof HTMLCanvasElement) || !(stage instanceof HTMLElement)) throw new TypeError('A canvas and its stage are required.');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (error) {
    stage.dataset.hero3d = 'fallback'; onReady(false); throw error;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0xf7f6f2, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 60);
  const sculpture = new THREE.Group(); scene.add(sculpture);
  const environmentSource = studioTexture();
  const pmrem = new THREE.PMREMGenerator(renderer);
  let environment = pmrem.fromEquirectangular(environmentSource);
  scene.environment = environment.texture;
  scene.environmentIntensity = .65;
  environmentSource.dispose(); pmrem.dispose();

  const face = new THREE.MeshPhysicalMaterial({ color: 0x242420, metalness: .32, roughness: .3, clearcoat: .4, clearcoatRoughness: .3, envMapIntensity: 1.1 });
  const edge = new THREE.MeshPhysicalMaterial({ color: 0x171714, metalness: .45, roughness: .32, envMapIntensity: 1.15 });
  const ribbonSilver = new THREE.MeshPhysicalMaterial({ color: 0xb8b5ac, metalness: .95, roughness: .24, clearcoat: .4, side: THREE.DoubleSide });
  const amber = new THREE.MeshPhysicalMaterial({ color: 0xd69a34, metalness: .3, roughness: .35, envMapIntensity: .8 });

  const mark = new THREE.Group(); sculpture.add(mark);
  const extrusion = { depth: 8, bevelEnabled: true, bevelThickness: 1, bevelSize: 1, bevelSegments: 5, curveSegments: 36, steps: 1 };
  const cGeometry = new THREE.ExtrudeGeometry(brandShape(), extrusion);
  cGeometry.translate(-32, 32, -4); cGeometry.scale(.075, .075, .075);
  const cMark = new THREE.Mesh(cGeometry, [face, edge]); cMark.castShadow = true; cMark.receiveShadow = true; mark.add(cMark);
  const squareShape = new THREE.Shape();
  squareShape.moveTo(46, -8); squareShape.lineTo(58, -8); squareShape.lineTo(58, -20); squareShape.lineTo(46, -20); squareShape.closePath();
  const squareGeometry = new THREE.ExtrudeGeometry(squareShape, extrusion);
  squareGeometry.translate(-32, 32, -4); squareGeometry.scale(.075, .075, .075);
  const terminal = new THREE.Mesh(squareGeometry, amber); terminal.castShadow = true; mark.add(terminal);
  // The complete detached square is amber: the owner asked for a stronger
  // accent while keeping the much larger C charcoal.
  // The original broad silver ribbon passes around the C. Its long ends extend
  // beyond the canvas like a continuous connection, while the mark stays dominant.
  const ribbonPath = [[-5, -1.8, -1.1], [-3.5, -1.5, -.8], [-2.45, -.15, .4], [-1.3, .35, .65], [.2, .05, .2], [2.2, .2, -.4], [3.7, 1.7, -1.1], [5.2, 1.9, -1.5]];
  const curve = new THREE.CatmullRomCurve3(ribbonPath.map(p => new THREE.Vector3(...p)), false, 'catmullrom', .45);
  const ribbon = new THREE.Mesh(ribbonGeometry(curve, .24, .032, 0, 1, 128), ribbonSilver);
  ribbon.castShadow = true; ribbon.receiveShadow = true; sculpture.add(ribbon);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8c877a, 1.35));
  const key = new THREE.DirectionalLight(0xfff9ef, 2.8);
  key.position.set(-3, 6, 6); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -7; key.shadow.camera.right = 7;
  key.shadow.camera.top = 6; key.shadow.camera.bottom = -6; key.shadow.normalBias = .04; key.shadow.radius = 5;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe0ba, 1.6); rim.position.set(4, 2, -3); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 1.3); fill.position.set(3, -1, 4); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), new THREE.ShadowMaterial({ color: 0x454238, opacity: .07 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -2.65; floor.receiveShadow = true; scene.add(floor);

  let disposed = false, lost = false, ready = false, paused = false, visible = true, suspended = false;
  let elapsed = 0, last = 0, progress = 0, displayedProgress = 0, painted = 0;
  const introSeconds = 4;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const pose = { time: 0, progress: 0 };

  function updateComposition() {
    // Freeze the exact displayed pose on manual pause. Reduced motion receives
    // a deliberately composed static pose, rather than a running hidden loop.
    if (reduce.matches) { pose.time = 0; pose.progress = 0; }
    else if (!paused) { pose.time = elapsed; pose.progress = displayedProgress; }
    const time = pose.time, p = pose.progress;
    sculpture.rotation.set(.06 + Math.sin(time * .19) * .018, -.3 + p * .15 + Math.sin(time * .21) * .065, -.075);
    sculpture.position.set(0, .1 + Math.sin(time * .34) * .045, 0);
    mark.scale.setScalar(1.12);
    // Frame the C rather than the much wider ribbon. Its exact geometry remains
    // intact on a narrow phone canvas as well as the larger desktop hero.
    const verticalHalf = THREE.MathUtils.degToRad(35) / 2;
    const horizontalHalf = Math.atan(Math.tan(verticalHalf) * camera.aspect);
    const distance = Math.max(8.65, 3.08 / Math.tan(horizontalHalf));
    camera.position.set(.32 + p * .15, .62, distance);
    camera.lookAt(0, 0, 0);
    stage.dataset.heroPhase = time.toFixed(3);
  }

  function render() {
    if (disposed || lost) return;
    updateComposition();
    renderer.render(scene, camera);
    painted++; stage.dataset.heroFrames = String(painted);
    if (!ready) { ready = true; stage.dataset.hero3d = 'ready'; onReady(true); }
  }
  function frame(now) {
    if (disposed || lost) return;
    if (!last) last = now;
    const delta = now - last;
    if (delta < 32) return;
    const dt = Math.min(delta / 1000, .06);
    elapsed = Math.min(introSeconds, elapsed + delta / 1000);
    displayedProgress = elapsed === introSeconds ? progress : displayedProgress + (progress - displayedProgress) * (1 - Math.exp(-dt * 8));
    last = now;
    render();
    if (elapsed === introSeconds) sync();
  }
  function sync() {
    if (disposed) return;
    const state = lost ? 'fallback' : reduce.matches ? 'reduced' : paused ? 'paused' : document.hidden || suspended ? 'hidden' : !visible ? 'offscreen' : elapsed >= introSeconds ? 'settled' : 'running';
    stage.dataset.heroMotion = state;
    renderer.setAnimationLoop(state === 'running' ? frame : null);
    last = 0;
    if (state === 'settled') displayedProgress = progress;
    if (state === 'paused' || state === 'reduced' || state === 'settled') render();
  }
  function resize() {
    if (disposed || lost) return;
    const { width, height } = stage.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix(); render();
  }
  function contextLost(event) {
    event.preventDefault(); lost = true; ready = false;
    stage.dataset.hero3d = 'fallback'; onReady(false); sync();
  }
  function contextRestored() {
    if (disposed) return;
    // Render-target environments need repainting after the GPU context returns.
    const source = studioTexture();
    const generator = new THREE.PMREMGenerator(renderer);
    const renewed = generator.fromEquirectangular(source);
    source.dispose(); generator.dispose(); environment.dispose();
    environment = renewed; scene.environment = renewed.texture;
    lost = false; resize(); sync();
  }
  function pageHide() { suspended = true; sync(); }
  function pageShow() { suspended = false; resize(); sync(); }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage);
  const intersectionObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .01 });
  intersectionObserver.observe(stage);
  reduce.addEventListener('change', sync); document.addEventListener('visibilitychange', sync);
  canvas.addEventListener('webglcontextlost', contextLost); canvas.addEventListener('webglcontextrestored', contextRestored);
  window.addEventListener('pagehide', pageHide); window.addEventListener('pageshow', pageShow);

  const api = {
    setPaused(value) { paused = Boolean(value); sync(); },
    setProgress(value) {
      if (disposed || lost) return;
      const next = Math.min(1, Math.max(0, Number(value) || 0));
      if (Math.abs(next - progress) < .001) return;
      progress = next;
      // After the introduction, draw only when the visitor scrolls.
      if (stage.dataset.heroMotion === 'settled') {
        displayedProgress = progress;
        render();
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true; renderer.setAnimationLoop(null);
      resizeObserver.disconnect(); intersectionObserver.disconnect();
      reduce.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync);
      canvas.removeEventListener('webglcontextlost', contextLost); canvas.removeEventListener('webglcontextrestored', contextRestored);
      window.removeEventListener('pagehide', pageHide); window.removeEventListener('pageshow', pageShow);
      const geometries = new Set(), materials = new Set();
      scene.traverse(o => { if (o.geometry) geometries.add(o.geometry); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m)); });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
      environment.dispose(); key.shadow.dispose(); scene.environment = null; renderer.dispose();
      stage.dataset.hero3d = 'disposed'; stage.dataset.heroMotion = 'disposed'; onReady(false);
    }
  };
  try { resize(); sync(); } catch (error) { api.dispose(); stage.dataset.hero3d = 'fallback'; throw error; }
  return api;
}
