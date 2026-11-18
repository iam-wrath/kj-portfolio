import * as THREE from "three";
import { HOUSING_INNER, HOUSING_OUTER, bladeAngle, irisState } from "./aperture-math";

export type ApertureOptions = { mobile: boolean; interactive: boolean };

/**
 * Camera-iris aperture rendered with plain three.js.
 * - Orthographic camera: 1 world unit = half the canvas height, so it lines up with the DOM reel clip.
 * - Render on demand only (scroll progress / pointer / resize), and never while off-screen.
 * - Mobile: fewer blades and segments, DPR ≤ 1.5, no antialias, no environment map, no tilt.
 */
export function createApertureScene(canvas: HTMLCanvasElement, opts: ApertureOptions) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !opts.mobile,
    powerPreference: opts.mobile ? "low-power" : "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 20);
  camera.position.set(0, 0, 6);

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(o: T) => (disposables.push(o), o);

  // Lighting: neutral key + soft fill + a faint acid-lime rim.
  scene.add(new THREE.AmbientLight(0xffffff, opts.mobile ? 0.9 : 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-2, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc6ff3d, 0.7);
  rim.position.set(3, -2, 2);
  scene.add(rim);

  if (!opts.mobile) {
    // Small procedural environment for a metallic sheen (desktop only).
    void import("three/examples/jsm/environments/RoomEnvironment.js").then(({ RoomEnvironment }) => {
      const pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const env = pmrem.fromScene(room, 0.04).texture;
      scene.environment = env;
      scene.environmentIntensity = 0.55;
      track(env);
      pmrem.dispose();
      room.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose?.();
      });
      invalidate();
    });
  }

  // Clip blades to the housing circle (in lens-local space) with a tiny shader patch.
  const lensInverse = { value: new THREE.Matrix4() };
  const clipUniform = { value: HOUSING_OUTER - 0.01 };
  const bladeMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      metalness: opts.mobile ? 0.45 : 0.85,
      roughness: 0.4,
    })
  );
  bladeMat.onBeforeCompile = (shader) => {
    shader.uniforms.uClipR = clipUniform;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vLensPos;\nuniform mat4 uLensInverse;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLensPos = (uLensInverse * modelMatrix * vec4(transformed, 1.0)).xy;");
    shader.uniforms.uLensInverse = lensInverse;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vLensPos;\nuniform float uClipR;")
      .replace("void main() {", "void main() {\n  if (length(vLensPos) > uClipR) discard;");
  };

  const ringMat = track(new THREE.MeshStandardMaterial({ color: 0x1c1c1c, metalness: opts.mobile ? 0.5 : 0.9, roughness: 0.32 }));
  const tickMat = track(new THREE.MeshBasicMaterial({ color: 0x8a8a8a }));
  const accentMat = track(new THREE.MeshBasicMaterial({ color: 0xc6ff3d }));

  const lens = new THREE.Group();
  scene.add(lens);

  // Housing ring
  const ringShape = new THREE.Shape().absarc(0, 0, HOUSING_OUTER, 0, Math.PI * 2, false);
  ringShape.holes.push(new THREE.Path().absarc(0, 0, HOUSING_INNER, 0, Math.PI * 2, true));
  const ringGeo = track(
    new THREE.ExtrudeGeometry(ringShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.012,
      bevelSegments: opts.mobile ? 1 : 3,
      curveSegments: opts.mobile ? 48 : 128,
    })
  );
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.z = 0.25;
  lens.add(ring);

  // Lens markings: fine ticks + one signal-orange index mark
  const tickCount = opts.mobile ? 36 : 72;
  const tickGeo = track(new THREE.PlaneGeometry(0.006, 0.035));
  const ticks = new THREE.InstancedMesh(tickGeo, tickMat, tickCount);
  const m = new THREE.Matrix4();
  for (let i = 0; i < tickCount; i++) {
    const a = (i / tickCount) * Math.PI * 2;
    const r = (HOUSING_INNER + HOUSING_OUTER) / 2 + 0.02;
    m.makeRotationZ(a - Math.PI / 2).setPosition(Math.cos(a) * r, Math.sin(a) * r, 0.4);
    ticks.setMatrixAt(i, m);
  }
  lens.add(ticks);
  const index = new THREE.Mesh(track(new THREE.PlaneGeometry(0.014, 0.09)), accentMat);
  index.position.set(0, (HOUSING_INNER + HOUSING_OUTER) / 2, 0.41);
  lens.add(index);

  // Blades: thin extruded slabs whose inner straight edge forms the polygonal opening.
  const bladeCount = opts.mobile ? 6 : 9;
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0, -2.4);
  bladeShape.lineTo(2.6, -2.4);
  bladeShape.lineTo(2.6, 2.4);
  bladeShape.lineTo(0, 2.4);
  bladeShape.closePath();
  const bladeGeo = track(
    new THREE.ExtrudeGeometry(bladeShape, {
      depth: 0.012,
      bevelEnabled: !opts.mobile,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 1,
    })
  );
  const blades: THREE.Group[] = [];
  for (let i = 0; i < bladeCount; i++) {
    const pivot = new THREE.Group();
    const mesh = new THREE.Mesh(bladeGeo, bladeMat);
    // A slight tilt along the edge lets blades overlap cyclically, like a real iris.
    mesh.rotation.x = 0.045;
    pivot.add(mesh);
    lens.add(pivot);
    blades.push(pivot);
  }

  let progress = 0;
  let tiltX = 0;
  let tiltY = 0;
  let visible = true;
  let dirty = true;
  let raf = 0;
  let frames = 0;

  function applyState() {
    const s = irisState(progress);
    lens.scale.setScalar(s.scale);
    lens.rotation.x = tiltX;
    lens.rotation.y = tiltY;
    blades.forEach((pivot, i) => {
      const a = bladeAngle(i, bladeCount, s.twist);
      pivot.rotation.z = a;
      pivot.position.set(Math.cos(a) * s.opening, Math.sin(a) * s.opening, 0.1 + i * 0.002);
    });
    lens.updateMatrixWorld(true);
    lensInverse.value.copy(lens.matrixWorld).invert();
  }

  function render() {
    raf = 0;
    if (!visible || !dirty) return;
    dirty = false;
    applyState();
    renderer.render(scene, camera);
    frames++;
  }

  function invalidate() {
    dirty = true;
    if (!raf && visible) raf = requestAnimationFrame(render);
  }

  /** unitPx: pixels per world unit (half the stage height) so the lens lines up with the DOM reel. */
  function resize(width: number, height: number, unitPx: number) {
    if (!width || !height || !unitPx) return;
    renderer.setSize(width, height, false);
    const hx = width / 2 / unitPx;
    const hy = height / 2 / unitPx;
    camera.left = -hx;
    camera.right = hx;
    camera.top = hy;
    camera.bottom = -hy;
    camera.updateProjectionMatrix();
    invalidate();
  }

  return {
    setProgress(p: number) {
      if (p === progress) return;
      progress = p;
      invalidate();
    },
    setTilt(x: number, y: number) {
      if (!opts.interactive) return;
      tiltX = x;
      tiltY = y;
      invalidate();
    },
    setVisible(v: boolean) {
      visible = v;
      if (v) invalidate();
    },
    resize,
    invalidate,
    get frames() {
      return frames;
    },
    get pixelRatio() {
      return renderer.getPixelRatio();
    },
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      disposables.forEach((d) => d.dispose());
      ticks.dispose();
      renderer.dispose();
    },
  };
}

export type ApertureScene = ReturnType<typeof createApertureScene>;
