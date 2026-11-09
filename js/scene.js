import * as THREE from "three";

const GOLD = 0xc9a45c;
const INK = 0x0a101c;

export class MysticalScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.shuffleActive = false;
    this.shuffleTime = 0;
    this.shuffleDuration = 3.2;
    this.shuffleResolve = null;
    this.floatCards = [];
    this.shuffleCards = [];
    this.particles = null;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0.4, 7.2);

    this.scene.add(new THREE.AmbientLight(0xb8c4d8, 0.55));
    const key = new THREE.DirectionalLight(0xe8d5a3, 0.85);
    key.position.set(3, 5, 4);
    this.scene.add(key);

    this._buildStarfield();
    this._buildMist();
    this._buildFloatingCards();
    this._buildShuffleDeck();

    this._onResize = this._onResize.bind(this);
    this._tick = this._tick.bind(this);
    window.addEventListener("resize", this._onResize);
    this._raf = requestAnimationFrame(this._tick);
  }

  _buildStarfield() {
    const count = 900;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = -4 - Math.random() * 16;
      const warm = Math.random() > 0.7;
      colors[i * 3] = warm ? 0.9 : 0.75;
      colors[i * 3 + 1] = warm ? 0.78 : 0.82;
      colors[i * 3 + 2] = warm ? 0.45 : 0.95;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  _buildMist() {
    const geo = new THREE.PlaneGeometry(22, 12);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x1a2438,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    });
    const mist = new THREE.Mesh(geo, mat);
    mist.position.set(0, -1.8, -2.5);
    this.scene.add(mist);
    this.mist = mist;
  }

  _makeCardMesh(w = 0.55, h = 0.92) {
    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshStandardMaterial({
      color: INK,
      metalness: 0.35,
      roughness: 0.55,
      emissive: GOLD,
      emissiveIntensity: 0.08,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.72,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.55 })
    );
    mesh.add(edge);
    return mesh;
  }

  _buildFloatingCards() {
    this.floatGroup = new THREE.Group();
    for (let i = 0; i < 8; i += 1) {
      const card = this._makeCardMesh();
      card.userData = {
        base: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4,
          -1 - Math.random() * 3
        ),
        speed: 0.15 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.25,
      };
      card.position.copy(card.userData.base);
      card.rotation.z = (Math.random() - 0.5) * 0.4;
      this.floatCards.push(card);
      this.floatGroup.add(card);
    }
    this.scene.add(this.floatGroup);
  }

  _buildShuffleDeck() {
    this.shuffleGroup = new THREE.Group();
    this.shuffleGroup.visible = false;
    this.shuffleGroup.position.set(0, -0.2, 2.2);
    for (let i = 0; i < 18; i += 1) {
      const card = this._makeCardMesh(0.7, 1.18);
      card.position.set(0, i * 0.012, 0);
      card.rotation.set(0, 0, 0);
      card.userData.home = card.position.clone();
      card.userData.index = i;
      this.shuffleCards.push(card);
      this.shuffleGroup.add(card);
    }
    this.scene.add(this.shuffleGroup);
  }

  setAmbientCardsVisible(visible) {
    if (this.floatGroup) this.floatGroup.visible = visible;
  }

  async playShuffle() {
    if (this.shuffleActive) return;
    this.shuffleActive = true;
    this.shuffleTime = 0;
    this.shuffleGroup.visible = true;
    this.floatGroup.visible = false;
    this.shuffleCards.forEach((c, i) => {
      c.position.set(0, i * 0.012, 0);
      c.rotation.set(0, 0, 0);
      c.material.opacity = 0.9;
    });

    return new Promise((resolve) => {
      this.shuffleResolve = resolve;
    });
  }

  _updateShuffle(dt) {
    if (!this.shuffleActive) return;
    this.shuffleTime += dt;
    const t = this.shuffleTime;
    const dur = this.shuffleDuration;

    this.shuffleCards.forEach((card, i) => {
      const phase = i / this.shuffleCards.length;
      if (t < dur * 0.35) {
        const p = t / (dur * 0.35);
        const lift = Math.sin(p * Math.PI) * (0.8 + phase);
        const swirl = p * Math.PI * 2 * (i % 2 === 0 ? 1 : -1);
        card.position.x = Math.cos(swirl + phase * 6) * (0.2 + p * 1.8);
        card.position.y = lift + Math.sin(swirl) * 0.35;
        card.position.z = Math.sin(swirl + phase * 6) * (0.2 + p * 1.2);
        card.rotation.y = swirl;
        card.rotation.z = Math.sin(swirl) * 0.4;
      } else if (t < dur * 0.75) {
        const p = (t - dur * 0.35) / (dur * 0.4);
        const angle = p * Math.PI * 4 + phase * Math.PI * 2;
        const radius = 1.6 * (1 - p * 0.35);
        card.position.x = Math.cos(angle) * radius;
        card.position.y = Math.sin(angle * 1.3) * 0.55 + 0.2;
        card.position.z = Math.sin(angle) * radius * 0.55;
        card.rotation.y = angle;
        card.rotation.x = Math.sin(angle) * 0.3;
      } else {
        const p = Math.min(1, (t - dur * 0.75) / (dur * 0.25));
        const ease = 1 - Math.pow(1 - p, 3);
        card.position.lerp(new THREE.Vector3(0, i * 0.012, 0), 0.12 + ease * 0.2);
        card.rotation.x *= 1 - ease * 0.2;
        card.rotation.y *= 1 - ease * 0.2;
        card.rotation.z *= 1 - ease * 0.2;
      }
    });

    if (t >= dur) {
      this.shuffleActive = false;
      this.shuffleGroup.visible = false;
      // Caller decides ambient cards via setAmbientCardsVisible()
      const done = this.shuffleResolve;
      this.shuffleResolve = null;
      if (done) done();
    }
  }

  _tick() {
    const dt = this.clock.getDelta();
    const t = this.clock.elapsedTime;

    this.camera.position.x = Math.sin(t * 0.12) * 0.35;
    this.camera.position.y = 0.35 + Math.sin(t * 0.18) * 0.12;
    this.camera.lookAt(0, 0, 0);

    if (this.particles) {
      this.particles.rotation.y = t * 0.02;
      this.particles.rotation.x = Math.sin(t * 0.05) * 0.04;
    }

    if (this.mist) {
      this.mist.material.opacity = 0.14 + Math.sin(t * 0.4) * 0.04;
    }

    this.floatCards.forEach((card) => {
      const { base, speed, phase, spin } = card.userData;
      card.position.x = base.x + Math.sin(t * speed + phase) * 0.35;
      card.position.y = base.y + Math.cos(t * speed * 0.8 + phase) * 0.28;
      card.rotation.y = Math.sin(t * speed + phase) * 0.35;
      card.rotation.z += spin * dt;
      card.material.opacity = 0.45 + Math.sin(t * speed + phase) * 0.15;
    });

    this._updateShuffle(dt);
    this.renderer.render(this.scene, this.camera);
    this._raf = requestAnimationFrame(this._tick);
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    window.removeEventListener("resize", this._onResize);
    this.renderer.dispose();
  }
}
