import { CARD_BACK, DECK } from "./cards.js";
import { buildGoogleAiUrl, composeReading, shuffleDeck } from "./reading.js";
import { MysticalScene } from "./scene.js";
import { CardWheel } from "./wheel.js";
import { CardWiki } from "./wiki.js";

const SESSION_KEY = "veil-arcana-session";

const state = {
  name: "",
  question: "",
  pool: [],
  selected: [],
  reading: null,
};

const els = {
  screens: [...document.querySelectorAll(".screen")],
  welcomeForm: document.getElementById("welcome-form"),
  name: document.getElementById("user-name"),
  greeting: document.getElementById("session-greeting"),
  questionForm: document.getElementById("question-form"),
  question: document.getElementById("user-question"),
  shuffleStatus: document.getElementById("shuffle-status"),
  selectCount: document.getElementById("select-count"),
  selectHint: document.getElementById("select-hint"),
  cardWheel: document.getElementById("card-wheel"),
  wheelStage: document.getElementById("wheel-stage"),
  wheelControls: document.querySelector(".wheel-controls"),
  chosenTray: document.getElementById("chosen-tray"),
  btnReveal: document.getElementById("btn-reveal"),
  selectActions: document.getElementById("select-result-actions"),
  btnPrev: document.getElementById("btn-wheel-prev"),
  btnNext: document.getElementById("btn-wheel-next"),
  btnSpin: document.getElementById("btn-spin"),
  wheelTip: document.getElementById("wheel-tip"),
  selectScreen: document.getElementById("screen-select"),
  readingTitle: document.getElementById("reading-title"),
  readingQuestion: document.getElementById("reading-question"),
  readingBody: document.getElementById("reading-body"),
  readingMini: document.getElementById("reading-spread-mini"),
  btnGoogleAi: document.getElementById("btn-google-ai"),
  btnAgain: document.getElementById("btn-again"),
  btnRestart: document.getElementById("btn-restart"),
  btnOpenWiki: document.getElementById("btn-open-wiki"),
  btnWelcomeWiki: document.getElementById("btn-welcome-wiki"),
  btnReadingWiki: document.getElementById("btn-reading-wiki"),
  btnCloseWiki: document.getElementById("btn-close-wiki"),
  wikiRoot: document.getElementById("wiki"),
  wikiGrid: document.getElementById("wiki-grid"),
  wikiSearch: document.getElementById("wiki-search"),
  wikiFilters: document.getElementById("wiki-filters"),
  wikiDetail: document.getElementById("wiki-detail"),
  canvas: document.getElementById("bg-canvas"),
};

let scene = null;
let wheel = null;
let wiki = null;
let screenBeforeWiki = "welcome";

function showScreen(id) {
  els.screens.forEach((screen) => {
    const active = screen.dataset.screen === id;
    screen.classList.toggle("active", active);
    screen.toggleAttribute("hidden", !active);
    screen.setAttribute("aria-hidden", active ? "false" : "true");
    if (active) screen.removeAttribute("inert");
    else screen.setAttribute("inert", "");
  });
  // Tear down the wheel when leaving select so it can't steal focus/a11y
  if (id !== "select" && wheel) {
    wheel.destroy();
    wheel = null;
  }
  // Hide floating 3D cards during selection so they don't clutter the tray
  if (scene) {
    scene.setAmbientCardsVisible(id !== "select" && id !== "shuffle");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function saveSession() {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name: state.name }));
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data.name) return false;
    state.name = data.name;
    els.name.value = data.name;
    return true;
  } catch {
    return false;
  }
}

function clearReadingState() {
  state.question = "";
  state.pool = [];
  state.selected = [];
  state.reading = null;
  els.question.value = "";
  els.readingBody.innerHTML = "";
  els.readingBody.classList.add("is-hidden");
  els.readingMini.innerHTML = "";
  els.readingQuestion.textContent = "";
  document.querySelector(".reading-actions")?.classList.add("is-hidden");
  els.btnReveal.disabled = true;
  els.selectCount.textContent = "0";
  if (wheel) wheel.destroy();
  resetChosenTray();
  updateSelectUI();
}

function resetChosenTray() {
  els.chosenTray.querySelectorAll(".chosen-slot").forEach((slot, i) => {
    slot.classList.remove("filled", "revealed", "awaiting");
    slot.innerHTML = `<span>${i + 1}</span>`;
  });
}

function updateChosenTray({ locked = false } = {}) {
  const slots = [...els.chosenTray.querySelectorAll(".chosen-slot")];
  slots.forEach((slot, i) => {
    const card = state.selected[i];
    if (!card) {
      slot.classList.remove("filled", "revealed");
      slot.innerHTML = `<span>${i + 1}</span>`;
      return;
    }
    // Always show card backs on the select screen — flip happens on result
    slot.classList.add("filled");
    slot.classList.remove("revealed");
    slot.innerHTML = `
      <img src="${CARD_BACK}" alt="Chosen card ${i + 1}" />
      ${
        locked
          ? ""
          : `<button type="button" class="slot-remove" data-remove-id="${card.id}" aria-label="Remove chosen card ${i + 1}">×</button>`
      }
    `;
  });

  els.chosenTray.querySelectorAll(".slot-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeChosen(btn.dataset.removeId);
    });
  });
}

function updateSelectUI() {
  const n = state.selected.length;
  const ready = n === 3;
  els.selectCount.textContent = String(n);
  els.btnReveal.disabled = !ready;
  if (wheel) wheel.setChoosingEnabled(!ready);

  // Hide spinner/wheel once all 3 cards are chosen; show result button
  els.selectScreen.classList.toggle("selection-complete", ready);
  els.wheelStage.hidden = ready;
  els.wheelControls.hidden = ready;
  els.wheelTip.hidden = ready;
  els.selectActions.classList.toggle("is-visible", ready);
  els.btnReveal.classList.toggle("is-ready", ready);

  if (n === 0) {
    els.selectHint.textContent =
      "Drag to spin the arc. Hover a card to lift it, then click to choose.";
    els.wheelTip.textContent = "Drag to spin · Hover to lift · Click to choose";
  } else if (n < 3) {
    els.selectHint.textContent = `${3 - n} more to complete your draw.`;
    els.wheelTip.textContent = "Hover a card and click to choose it.";
  } else {
    els.selectHint.textContent = "Your three cards are ready.";
  }

  updateChosenTray({ locked: ready });
  if (wheel) {
    wheel.markSelected(state.selected.map((c) => c.id));
  }
}

async function onWheelChoose(card, meta = {}) {
  if (state.selected.length >= 3) return;
  if (state.selected.some((c) => c.id === card.id)) return;

  const slotIndex = state.selected.length;
  if (wheel) wheel.setChoosingEnabled(false);

  if (meta.fromRect) {
    await flyCardToSlot(meta.fromRect, slotIndex);
  }

  state.selected.push(card);
  updateSelectUI();
}

function flyCardToSlot(fromRect, slotIndex) {
  return new Promise((resolve) => {
    const slot = els.chosenTray.querySelectorAll(".chosen-slot")[slotIndex];
    if (!slot || !fromRect?.width) {
      resolve();
      return;
    }

    // Reserve the slot visually while the card is in flight
    slot.classList.add("awaiting");

    const toRect = slot.getBoundingClientRect();
    const flyer = document.createElement("div");
    flyer.className = "card-flyer";
    flyer.innerHTML = `<img src="${CARD_BACK}" alt="" draggable="false" />`;
    flyer.style.left = `${fromRect.left}px`;
    flyer.style.top = `${fromRect.top}px`;
    flyer.style.width = `${fromRect.width}px`;
    flyer.style.height = `${fromRect.height}px`;
    document.body.appendChild(flyer);

    const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
    const dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);
    const scaleX = toRect.width / fromRect.width;
    const scaleY = toRect.height / fromRect.height;

    // Force layout, then animate toward the placeholder
    flyer.getBoundingClientRect();
    requestAnimationFrame(() => {
      flyer.classList.add("is-flying");
      flyer.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY}) rotate(8deg)`;
    });

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      flyer.remove();
      slot.classList.remove("awaiting");
      resolve();
    };

    flyer.addEventListener("transitionend", finish, { once: true });
    setTimeout(finish, 700);
  });
}

function removeChosen(cardId) {
  const index = state.selected.findIndex((c) => c.id === cardId);
  if (index < 0) return;
  const [card] = state.selected.splice(index, 1);
  const remainingIds = new Set(state.selected.map((c) => c.id));
  const remount = state.pool.filter((c) => !remainingIds.has(c.id));
  wheel.mount(remount);
  if (card && remount.some((c) => c.id === card.id)) {
    wheel.snapToCard(card.id);
  }
  updateSelectUI();
}

function renderWheel() {
  if (!wheel) {
    wheel = new CardWheel(els.cardWheel, {
      stage: els.wheelStage,
      onChoose: onWheelChoose,
    });
  }
  const remainingIds = new Set(state.selected.map((c) => c.id));
  const available = state.pool.filter((c) => !remainingIds.has(c.id));
  wheel.mount(available);
  updateSelectUI();
}

function renderReadingCardsFaceDown() {
  els.readingMini.innerHTML = "";
  state.selected.forEach((card, i) => {
    const fig = document.createElement("figure");
    fig.className = "result-card";
    fig.dataset.index = String(i);
    fig.innerHTML = `
      <div class="result-card-inner">
        <div class="result-face back"><img src="${CARD_BACK}" alt="" /></div>
        <div class="result-face front"><img src="${card.image}" alt="${card.name}" /></div>
      </div>
      <figcaption class="result-caption"></figcaption>
    `;
    els.readingMini.appendChild(fig);
  });
}

async function flipReadingCardsOneByOne() {
  const cards = [...els.readingMini.querySelectorAll(".result-card")];
  for (let i = 0; i < cards.length; i += 1) {
    const fig = cards[i];
    const card = state.selected[i];
    await delay(i === 0 ? 280 : 420);
    fig.classList.add("is-flipped");
    const caption = fig.querySelector(".result-caption");
    if (caption) caption.textContent = card.name;
  }
  await delay(500);
}

function revealReadingText(paragraphs) {
  els.readingBody.innerHTML = "";
  els.readingBody.classList.remove("is-hidden");
  paragraphs.forEach((text, i) => {
    const p = document.createElement("p");
    if (i >= 1 && i <= 3) {
      const match = text.match(/^Card (\d+) — ([^:]+):\s*(.*)$/);
      if (match) {
        const [, num, name, meaning] = match;
        p.innerHTML = `<span class="position">Card ${escapeHtml(num)} — ${escapeHtml(name)}</span><br>${escapeHtml(meaning)}`;
      } else {
        p.textContent = text;
      }
    } else {
      p.textContent = text;
    }
    els.readingBody.appendChild(p);
    setTimeout(() => p.classList.add("visible"), 180 + i * 380);
  });
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function startShuffleFlow() {
  showScreen("shuffle");
  els.shuffleStatus.textContent = "Shuffling the cards…";
  state.pool = shuffleDeck(DECK);
  state.selected = [];
  resetChosenTray();

  const shufflePromise = scene ? scene.playShuffle() : delay(2800);
  await Promise.all([shufflePromise, delay(1600)]);

  els.shuffleStatus.textContent = "The deck is ready.";
  await delay(700);
  renderWheel();
  showScreen("select");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function goToQuestion() {
  els.greeting.textContent = `Welcome, ${state.name}`;
  showScreen("question");
}

function onWelcomeSubmit(e) {
  e.preventDefault();
  const name = els.name.value.trim();
  if (!name) return;
  state.name = name;
  saveSession();
  clearReadingState();
  goToQuestion();
}

function onQuestionSubmit(e) {
  e.preventDefault();
  const question = els.question.value.trim();
  if (!question) return;
  state.question = question;
  startShuffleFlow();
}

async function onReveal() {
  if (state.selected.length !== 3) return;

  state.reading = composeReading({
    name: state.name,
    question: state.question,
    cards: state.selected,
  });

  els.readingTitle.textContent = state.reading.title;
  els.readingQuestion.textContent = `Question: ${state.question}`;
  els.btnGoogleAi.href = buildGoogleAiUrl(state.reading.prompt);

  // Start face-down, then flip one by one, then show the reading
  els.readingBody.innerHTML = "";
  els.readingBody.classList.add("is-hidden");
  document.querySelector(".reading-actions")?.classList.add("is-hidden");
  renderReadingCardsFaceDown();
  showScreen("reading");

  await flipReadingCardsOneByOne();
  revealReadingText(state.reading.paragraphs);
  document.querySelector(".reading-actions")?.classList.remove("is-hidden");
}

function onAgain() {
  clearReadingState();
  goToQuestion();
}

function onRestart() {
  sessionStorage.removeItem(SESSION_KEY);
  state.name = "";
  clearReadingState();
  els.name.value = "";
  showScreen("welcome");
}

function openWiki() {
  screenBeforeWiki =
    document.querySelector(".screen.active")?.dataset.screen || "welcome";
  wiki?.open();
}

function bindEvents() {
  els.welcomeForm.addEventListener("submit", onWelcomeSubmit);
  els.questionForm.addEventListener("submit", onQuestionSubmit);
  els.btnReveal.addEventListener("click", onReveal);
  els.btnAgain.addEventListener("click", onAgain);
  els.btnRestart.addEventListener("click", onRestart);

  els.btnPrev.addEventListener("click", () => wheel?.stepBy(-1));
  els.btnNext.addEventListener("click", () => wheel?.stepBy(1));
  els.btnSpin.addEventListener("click", () => wheel?.spin());

  els.btnOpenWiki.addEventListener("click", openWiki);
  els.btnWelcomeWiki.addEventListener("click", openWiki);
  els.btnReadingWiki.addEventListener("click", openWiki);
  els.btnCloseWiki.addEventListener("click", () => wiki?.close());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && els.wikiRoot.classList.contains("is-open")) {
      if (els.wikiDetail.classList.contains("is-open")) wiki.hideDetail();
      else wiki.close();
    }
  });
}

function registerPwa() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* offline install optional */
    });
  });
}

function init() {
  bindEvents();
  registerPwa();
  scene = new MysticalScene(els.canvas);
  wiki = new CardWiki({
    root: els.wikiRoot,
    grid: els.wikiGrid,
    search: els.wikiSearch,
    filters: els.wikiFilters,
    detail: els.wikiDetail,
    onClose: () => {
      // Keep whatever screen was active; wiki is an overlay
      void screenBeforeWiki;
    },
  });
  wiki.mount();

  setTimeout(() => {
    shuffleDeck(DECK)
      .slice(0, 6)
      .forEach((c) => {
        const img = new Image();
        img.src = c.image;
      });
  }, 800);

  if (loadSession()) {
    goToQuestion();
  } else {
    showScreen("welcome");
  }
}

init();
