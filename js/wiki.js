import { DECK } from "./cards.js";

/**
 * Card study wiki — browse and search all 78 meanings.
 */
export class CardWiki {
  constructor({ root, grid, search, filters, detail, onClose }) {
    this.root = root;
    this.grid = grid;
    this.search = search;
    this.filters = filters;
    this.detail = detail;
    this.onClose = onClose || (() => {});
    this.filter = "all";
    this.query = "";
    this.activeId = null;

    this._onSearch = this._onSearch.bind(this);
    this._onFilterClick = this._onFilterClick.bind(this);
  }

  mount() {
    this.search.addEventListener("input", this._onSearch);
    this.filters.addEventListener("click", this._onFilterClick);
    this.render();
  }

  open(cardId = null) {
    this.root.classList.add("is-open");
    this.root.setAttribute("aria-hidden", "false");
    document.getElementById("btn-open-wiki")?.classList.add("is-hidden");
    document.body.classList.add("wiki-open");
    this.query = "";
    this.search.value = "";
    this.filter = "all";
    this._syncFilterButtons();
    this.render();
    if (cardId) this.showDetail(cardId);
    else this.hideDetail();
    this.search.focus();
  }

  close() {
    this.root.classList.remove("is-open");
    this.root.setAttribute("aria-hidden", "true");
    document.getElementById("btn-open-wiki")?.classList.remove("is-hidden");
    document.body.classList.remove("wiki-open");
    this.hideDetail();
    this.onClose();
  }

  _onSearch(e) {
    this.query = e.target.value.trim().toLowerCase();
    this.render();
  }

  _onFilterClick(e) {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    this.filter = btn.dataset.filter;
    this._syncFilterButtons();
    this.render();
  }

  _syncFilterButtons() {
    this.filters.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.filter === this.filter);
    });
  }

  filteredDeck() {
    return DECK.filter((card) => {
      if (this.filter === "major" && card.arcana !== "Major") return false;
      if (this.filter === "wands" && card.suit !== "Wands") return false;
      if (this.filter === "cups" && card.suit !== "Cups") return false;
      if (this.filter === "swords" && card.suit !== "Swords") return false;
      if (this.filter === "pentacles" && card.suit !== "Pentacles") return false;

      if (!this.query) return true;
      const hay = [
        card.name,
        card.arcana,
        card.suit || "",
        card.keywords.join(" "),
        card.meaning,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(this.query);
    });
  }

  render() {
    const cards = this.filteredDeck();
    this.grid.innerHTML = "";

    if (!cards.length) {
      this.grid.innerHTML = `<p class="wiki-empty">No cards match your search.</p>`;
      return;
    }

    const frag = document.createDocumentFragment();
    cards.forEach((card) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "wiki-card";
      btn.dataset.cardId = card.id;
      btn.innerHTML = `
        <img src="${card.image}" alt="${card.name}" loading="lazy" />
        <span class="wiki-card-name">${card.name}</span>
        <span class="wiki-card-meta">${card.suit || "Major Arcana"}</span>
      `;
      btn.addEventListener("click", () => this.showDetail(card.id));
      frag.appendChild(btn);
    });
    this.grid.appendChild(frag);
  }

  showDetail(cardId) {
    const card = DECK.find((c) => c.id === cardId);
    if (!card) return;
    this.activeId = cardId;
    this.detail.classList.add("is-open");
    this.detail.setAttribute("aria-hidden", "false");
    this.detail.innerHTML = `
      <button type="button" class="btn ghost icon-btn wiki-detail-close" aria-label="Close card detail">×</button>
      <div class="wiki-detail-art">
        <img src="${card.image}" alt="${card.name}" />
      </div>
      <div class="wiki-detail-copy">
        <p class="eyebrow">${card.suit ? `Suit of ${card.suit}` : "Major Arcana"}</p>
        <h3>${card.name}</h3>
        <p class="wiki-keywords">${card.keywords.join(" · ")}</p>
        <p class="wiki-meaning">${card.meaning}</p>
      </div>
    `;
    this.detail.querySelector(".wiki-detail-close").addEventListener("click", () => {
      this.hideDetail();
    });
  }

  hideDetail() {
    this.activeId = null;
    this.detail.classList.remove("is-open");
    this.detail.setAttribute("aria-hidden", "true");
    this.detail.innerHTML = "";
  }
}
