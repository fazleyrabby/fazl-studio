import { Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer } from "three";

// Hero scene (spec §7.2, §11.1): one fragment shader. A slow noise field drawn
// as contour lines, like a moving survey map. The pointer presses a dent into
// the field; scroll dives into it. No textures, no models.

const vertex = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform vec2 uRes;
  uniform float uTime;
  uniform vec2 uMouse;     // 0..1, y up
  uniform float uPress;    // pointer energy, 0..1
  uniform float uProgress; // scroll through the hero, 0..1
  uniform float uReveal;   // fade-in, 0..1
  uniform vec3 uFg;
  uniform vec3 uBg;
  uniform vec3 uAccent;

  // Simplex 3D noise (Ashima Arts / Ian McEwan, MIT)
  vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float aspect = uRes.x / uRes.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);

    // scroll: dive toward the pointer side of the field
    float dive = uProgress * uProgress;
    float zoom = mix(1.0, 0.28, dive);
    vec2 q = p * zoom + vec2(0.0, uProgress * 0.35);

    float t = uTime * 0.045;
    // domain warp so the lines fold instead of sitting like rings
    vec2 warp = vec2(snoise(vec3(q * 0.9 + 3.1, t)), snoise(vec3(q * 0.9 - 7.3, t + 4.0)));
    float field = snoise(vec3(q * 1.15 + warp * 0.42, t * 1.6));
    field += 0.35 * snoise(vec3(q * 2.6 - warp * 0.3, t * 2.2 + 9.0));

    // pointer dent
    float d = length(p - m);
    float dent = exp(-d * d * 9.0);
    field -= dent * (0.28 + uPress * 0.55);

    // contour lines, anti-aliased in screen space
    float bands = mix(7.0, 13.0, dive);
    float f = field * bands;
    float w = fwidth(f);
    float line = 1.0 - smoothstep(0.0, w * 1.35, abs(fract(f) - 0.5));
    // every fourth line is heavier, like an index contour
    float idx = 1.0 - smoothstep(0.0, w * 2.4, abs(fract(f * 0.25) - 0.5) * 4.0);

    // keep the lower-left quiet where the headline sits, brighter toward top-right
    float lift = smoothstep(-0.15, 1.05, uv.x * 0.55 + uv.y * 0.75);
    float vignette = smoothstep(1.25, 0.25, length(p * vec2(0.8, 1.0)));
    float strength = (0.16 + 0.34 * lift) * vignette;
    strength += dent * 0.38;
    strength *= mix(1.0, 1.6, dive);

    float ink = clamp(line * strength + idx * strength * 0.55, 0.0, 1.0);
    vec3 lineColor = mix(uFg, uAccent, clamp(dent * (0.55 + uPress), 0.0, 1.0));
    vec3 color = mix(uBg, lineColor, ink);

    color = mix(uBg, color, uReveal);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export type HeroScene = { setProgress: (p: number) => void; dispose: () => void };

const hexToVec3 = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

export function mountHeroScene(canvas: HTMLCanvasElement, opts: { reducedMotion: boolean; onReady: () => void; onFail: () => void }): HeroScene | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  } catch {
    opts.onFail();
    return null;
  }
  if (!renderer.capabilities.isWebGL2) {
    renderer.dispose();
    opts.onFail();
    return null;
  }

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const maxDpr = coarse ? 1.5 : 2;

  const uniforms = {
    uRes: { value: new Vector2(1, 1) },
    uTime: { value: 0 },
    uMouse: { value: new Vector2(0.72, 0.62) },
    uPress: { value: 0 },
    uProgress: { value: 0 },
    uReveal: { value: 0 },
    uFg: { value: hexToVec3("#ecebe8") },
    uBg: { value: hexToVec3("#0a0a0b") },
    uAccent: { value: hexToVec3("#ff5a2b") },
  };

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, depthTest: false, depthWrite: false });
  const geometry = new PlaneGeometry(2, 2);
  scene.add(new Mesh(geometry, material));

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    renderer.setPixelRatio(dpr);
    renderer.setSize(rect.width, rect.height, false);
    uniforms.uRes.value.set(rect.width * dpr, rect.height * dpr);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // pointer is sampled here and eased in the frame loop
  const target = new Vector2(0.72, 0.62);
  let energy = 0;
  let lastX = 0;
  let lastY = 0;
  const onPointer = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    target.set((e.clientX - rect.left) / rect.width, 1 - (e.clientY - rect.top) / rect.height);
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    energy = Math.min(1, energy + Math.hypot(dx, dy) / 600);
  };
  if (!opts.reducedMotion) window.addEventListener("pointermove", onPointer, { passive: true });

  let raf = 0;
  let onScreen = true;
  let running = false;
  let start = performance.now();
  let revealed = false;

  const frame = (now: number) => {
    raf = 0;
    const u = uniforms;
    u.uTime.value = (now - start) / 1000;
    u.uMouse.value.lerp(target, 0.06);
    energy *= 0.94;
    u.uPress.value += (energy - u.uPress.value) * 0.12;
    u.uReveal.value = Math.min(1, u.uReveal.value + 0.02);
    renderer.render(scene, camera);
    if (!revealed) {
      revealed = true;
      opts.onReady();
    }
    if (running) raf = requestAnimationFrame(frame);
  };

  const update = () => {
    const shouldRun = onScreen && !document.hidden && !opts.reducedMotion;
    if (shouldRun && !running) {
      running = true;
      raf = requestAnimationFrame(frame);
    } else if (!shouldRun && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  };

  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    update();
  });
  io.observe(canvas);
  document.addEventListener("visibilitychange", update);

  const onLost = (e: Event) => {
    e.preventDefault();
    running = false;
    cancelAnimationFrame(raf);
    opts.onFail();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  if (opts.reducedMotion) {
    // one still frame, fully revealed
    uniforms.uReveal.value = 1;
    uniforms.uTime.value = 12;
    renderer.render(scene, camera);
    opts.onReady();
  } else {
    update();
  }

  return {
    setProgress: (p) => {
      uniforms.uProgress.value = p;
    },
    dispose: () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("webglcontextlost", onLost);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
