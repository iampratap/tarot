import { CARD_BACK } from "./cards.js";

/** Visible cards on each side of center (total ≈ 2*HALF + 1). */
const HALF = 11;
/** Degrees between neighboring cards on the arc — tighter = denser. */
const SPACING = 7.2;
/** Max |slot| that can be hovered / chosen. */
const PICK_SLOTS = 7;
/** Pixels of movement before a press becomes a drag. */
const DRAG_THRESHOLD = 10;

/**
 * Arc fan of cards — drag to spin, hover to lift, click to choose.
 */
export class CardWheel {
  constructor(root, options = {}) {
    this.root = root;
    this.stage = options.stage || root.parentElement?.parentElement || root;
    this.onChoose = options.onChoose || (() => {});
    this.available = [];
    this.nodes = new Map();
    this.offset = 0;
    this.velocity = 0;
    this.dragging = false;
    this.pressing = false;
    this.dragStartX = 0;
    this.dragStartOffset = 0;
    this.lastX = 0;
    this.lastT = 0;
    this.moved = false;
    this.pressCardId = null;
    this.radiusX = 320;
    this.radiusY = 90;
    this.raf = null;
    this._animFrame = null;
    this.choosingEnabled = true;
    this.hoverId = null;
    this.pointerId = null;

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onResize = this._onResize.bind(this);
    this._tick = this._tick.bind(this);
  }

  mount(cards) {
    this.destroy(false);
    this.available = [...cards];
    this.offset = 0;
    this.velocity = 0;
    this.hoverId = null;
    this.root.innerHTML = "";
    this.nodes.clear();
    this._measure();

    this.available.forEach((card, index) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "wheel-card";
      el.dataset.cardId = card.id;
      el.dataset.index = String(index);
      el.setAttribute("role", "listitem");
      el.innerHTML = `
        <div class="card-inner">
          <div class="card-face back"><img src="${CARD_BACK}" alt="" draggable="false" /></div>
        </div>
      `;

      el.addEventListener("pointerenter", () => {
        if (this.dragging || this.pressing || !this.choosingEnabled) return;
        if (!el.classList.contains("is-pickable")) return;
        this._setHover(card.id);
      });

      el.addEventListener("pointerleave", () => {
        if (this.pressing) return;
        if (this.hoverId === card.id) this._setHover(null);
      });

      this.root.appendChild(el);
      this.nodes.set(card.id, el);
    });

    this.stage.addEventListener("pointerdown", this._onPointerDown);
    window.addEventListener("pointermove", this._onPointerMove);
    window.addEventListener("pointerup", this._onPointerUp);
    window.addEventListener("pointercancel", this._onPointerUp);
    window.addEventListener("resize", this._onResize);

    this._layout();
    this._startLoop();
  }

  destroy(clearHtml = true) {
    this._stopLoop();
    this.stage.removeEventListener("pointerdown", this._onPointerDown);
    window.removeEventListener("pointermove", this._onPointerMove);
    window.removeEventListener("pointerup", this._onPointerUp);
    window.removeEventListener("pointercancel", this._onPointerUp);
    window.removeEventListener("resize", this._onResize);
    if (clearHtml) {
      this.root.innerHTML = "";
      this.nodes.clear();
      this.available = [];
      this.hoverId = null;
    }
  }

  get count() {
    return this.available.length;
  }

  getFrontIndex() {
    if (!this.count) return -1;
    return this._wrapIndex(Math.round(this.offset));
  }

  getFrontCard() {
    const i = this.getFrontIndex();
    return i >= 0 ? this.available[i] : null;
  }

  snapToCard(cardId) {
    const index = this.available.findIndex((c) => c.id === cardId);
    if (index < 0) return;
    this.velocity = 0;
    this._animateTo(this._shortestTarget(index), 420);
  }

  stepBy(dir) {
    if (!this.count) return;
    this.velocity = 0;
    const next = this.getFrontIndex() + dir;
    this._animateTo(this._shortestTarget(this._wrapIndex(next)), 320);
  }

  spin() {
    if (this.count < 2) return;
    this.velocity = 0;
    this._setHover(null);
    const land = Math.floor(Math.random() * this.count);
    const extra = (2 + Math.floor(Math.random() * 3)) * (Math.random() > 0.5 ? 1 : -1);
    const target = this.offset + extra * this.count + this._deltaTo(land);
    this._animateTo(target, 2100 + Math.random() * 900);
  }

  setChoosingEnabled(enabled) {
    this.choosingEnabled = enabled;
    this.stage.classList.toggle("choosing-locked", !enabled);
    if (!enabled) this._setHover(null);
    else this._layout();
  }

  chooseFront() {
    const card = this.getFrontCard();
    return card ? this.chooseCard(card.id) : null;
  }

  chooseCard(cardId) {
    if (!this.choosingEnabled) return null;
    const card = this.available.find((c) => c.id === cardId);
    if (!card) return null;
    const el = this.nodes.get(cardId);
    const fromRect = el ? el.getBoundingClientRect() : null;
    this._setHover(null);
    // Hide immediately so the flyer feels like the same card leaving
    if (el) {
      el.style.visibility = "hidden";
      el.style.pointerEvents = "none";
    }
    this.removeCard(cardId);
    this.onChoose(card, { fromRect });
    return card;
  }

  removeCard(cardId) {
    const index = this.available.findIndex((c) => c.id === cardId);
    if (index < 0) return;

    const el = this.nodes.get(cardId);
    if (el) {
      el.classList.add("is-leaving");
      setTimeout(() => el.remove(), 280);
      this.nodes.delete(cardId);
    }

    this.available.splice(index, 1);
    this.velocity = 0;

    if (!this.count) {
      this.offset = 0;
      this._layout();
      return;
    }

    if (index < this.offset) this.offset -= 1;
    this.offset = this._wrapIndex(Math.round(this.offset));
    this._layout();
  }

  markSelected(selectedIds) {
    const set = new Set(selectedIds);
    this.nodes.forEach((el, id) => {
      el.classList.toggle("is-selected", set.has(id));
    });
  }

  _wrapIndex(i) {
    const n = this.count;
    if (!n) return 0;
    return ((Math.round(i) % n) + n) % n;
  }

  _deltaTo(index) {
    const n = this.count;
    if (!n) return 0;
    let d = index - this._wrapIndex(this.offset);
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  }

  _shortestTarget(index) {
    return this.offset + this._deltaTo(index);
  }

  _setHover(cardId) {
    this.hoverId = cardId;
    this.stage.classList.toggle("has-hover", Boolean(cardId));
    this._layout();
  }

  _cardIdFromEvent(e) {
    const el = e.target.closest?.(".wheel-card");
    return el?.dataset.cardId || null;
  }

  _measure() {
    const w = this.stage.clientWidth || Math.min(window.innerWidth, 980);
    const h = this.stage.clientHeight || 320;
    // Wider arc holds the denser pack without crushing the center
    this.radiusX = Math.max(180, Math.min(w * 0.52, 520));
    this.radiusY = Math.max(70, Math.min(h * 0.38, 150));
  }

  _layout() {
    const n = this.count;
    if (!n) return;

    const center = this.offset;
    const centerRounded = Math.round(center);
    const frac = center - centerRounded;

    this.available.forEach((card, cardIndex) => {
      const el = this.nodes.get(card.id);
      if (!el) return;

      let rel = cardIndex - centerRounded;
      if (rel > n / 2) rel -= n;
      if (rel < -n / 2) rel += n;

      const slotPos = rel - frac;
      const absSlot = Math.abs(slotPos);

      if (absSlot > HALF + 0.55) {
        el.style.display = "none";
        el.classList.remove("is-front", "is-pickable", "is-popped");
        el.style.pointerEvents = "none";
        return;
      }

      const angleDeg = slotPos * SPACING;
      const angle = (angleDeg * Math.PI) / 180;
      const pickable = absSlot <= PICK_SLOTS + 0.4;
      const front = absSlot < 0.55;
      const hovered = this.hoverId === card.id;

      let x = Math.sin(angle) * this.radiusX;
      let y = (1 - Math.cos(angle)) * this.radiusY - (front ? 14 : 0);
      let rot = angleDeg * 1.05;
      let scale = Math.max(0.78, 1 - absSlot * 0.028) + (front ? 0.05 : 0);

      // Lift hovered card in-layout (avoids clipping + keeps z-index correct)
      if (hovered && this.choosingEnabled) {
        y -= 28;
        scale += 0.12;
      }

      let z = Math.round(40 + (HALF - absSlot) * 14);
      if (front) z = 400;
      if (hovered) z = 900;

      el.style.display = "";
      el.style.zIndex = String(z);
      el.style.opacity = String(Math.max(0.55, 1 - absSlot * 0.05));
      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`;
      el.style.pointerEvents = pickable ? "auto" : "none";
      el.classList.toggle("is-front", front);
      el.classList.toggle("is-pickable", pickable && this.choosingEnabled);
      el.classList.toggle("is-popped", hovered && this.choosingEnabled);
      el.tabIndex = pickable ? 0 : -1;
      el.setAttribute(
        "aria-label",
        pickable && this.choosingEnabled
          ? `Card ${cardIndex + 1}. Click to choose.`
          : `Card ${cardIndex + 1} of ${n}`
      );
    });
  }

  _animateTo(targetOffset, duration) {
    if (this._animFrame) cancelAnimationFrame(this._animFrame);
    const start = performance.now();
    const from = this.offset;
    const delta = targetOffset - from;
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      this.offset = from + delta * ease(t);
      this._layout();
      if (t < 1) {
        this._animFrame = requestAnimationFrame(frame);
      } else {
        this.offset = this._wrapIndex(Math.round(this.offset));
        this._layout();
        this._animFrame = null;
      }
    };

    this._animFrame = requestAnimationFrame(frame);
  }

  _onPointerDown(e) {
    if (e.button != null && e.button !== 0) return;
    if (e.target.closest(".slot-remove, .btn, .wheel-controls, .wheel-tip, .chosen-tray")) {
      return;
    }

    if (this._animFrame) {
      cancelAnimationFrame(this._animFrame);
      this._animFrame = null;
    }

    this.pressing = true;
    this.dragging = false;
    this.moved = false;
    this.velocity = 0;
    this.pointerId = e.pointerId;
    this.dragStartX = e.clientX;
    this.dragStartOffset = this.offset;
    this.lastX = e.clientX;
    this.lastT = performance.now();
    this.pressCardId = this._cardIdFromEvent(e);

    // Keep hover on the pressed card
    if (this.pressCardId && this.choosingEnabled) {
      const el = this.nodes.get(this.pressCardId);
      if (el?.classList.contains("is-pickable")) {
        this._setHover(this.pressCardId);
      }
    }
  }

  _onPointerMove(e) {
    if (!this.pressing && !this.dragging) return;
    if (this.pointerId != null && e.pointerId !== this.pointerId) return;

    const dx = e.clientX - this.dragStartX;

    // Promote press → drag only after threshold
    if (!this.dragging && Math.abs(dx) >= DRAG_THRESHOLD) {
      this.dragging = true;
      this.moved = true;
      this._setHover(null);
      this.stage.classList.add("is-dragging");
      try {
        this.stage.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }

    if (!this.dragging) return;

    const now = performance.now();
    const dt = Math.max(8, now - this.lastT);
    const frameDx = e.clientX - this.lastX;
    this.lastX = e.clientX;
    this.lastT = now;

    // Slightly faster travel so dense packs still feel snappy to spin
    const cardsPerPx = 1 / 42;
    this.offset = this.dragStartOffset - dx * cardsPerPx;
    this.velocity = (-frameDx * cardsPerPx) / (dt / 16.7);
    this._layout();
  }

  _onPointerUp(e) {
    if (!this.pressing && !this.dragging) return;
    if (this.pointerId != null && e.pointerId !== this.pointerId) return;

    const wasDragging = this.dragging;
    const cardId = this.pressCardId;
    this.pressing = false;
    this.dragging = false;
    this.pointerId = null;
    this.stage.classList.remove("is-dragging");

    try {
      this.stage.releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }

    // Tap / click → choose that card
    if (!wasDragging && !this.moved && cardId && this.choosingEnabled) {
      const el = this.nodes.get(cardId);
      if (el?.classList.contains("is-pickable")) {
        this.chooseCard(cardId);
        this.pressCardId = null;
        return;
      }
      if (el) this.snapToCard(cardId);
      this.pressCardId = null;
      return;
    }

    this.pressCardId = null;

    if (Math.abs(this.velocity) < 0.04) {
      this.velocity = 0;
      this._animateTo(Math.round(this.offset), 280);
    } else {
      this.velocity = Math.max(-1.8, Math.min(1.8, this.velocity));
    }
  }

  _tick() {
    if (!this.dragging && Math.abs(this.velocity) > 0.01) {
      this.offset += this.velocity;
      this.velocity *= 0.94;
      if (Math.abs(this.velocity) < 0.02) {
        this.velocity = 0;
        this.offset = Math.round(this.offset);
      }
      this._layout();
    }
    this.raf = requestAnimationFrame(this._tick);
  }

  _startLoop() {
    this._stopLoop();
    this.raf = requestAnimationFrame(this._tick);
  }

  _stopLoop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    if (this._animFrame) cancelAnimationFrame(this._animFrame);
    this._animFrame = null;
  }

  _onResize() {
    this._measure();
    this._layout();
  }
}
