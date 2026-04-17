import {
  load,
  toggle,
  favouritesChangeEvent,
  favouritesStorageKey,
} from './favourites';

const FAVOURITED_ATTR = 'data-favourited';

function syncCardsFromStorage() {
  const favs = new Set(load());
  const cards = document.querySelectorAll<HTMLElement>('.schedule-talk[data-talk-id]');
  cards.forEach(card => {
    const id = card.dataset.talkId!;
    const favourited = favs.has(id);
    if (favourited) card.setAttribute(FAVOURITED_ATTR, '');
    else card.removeAttribute(FAVOURITED_ATTR);
    const btn = card.querySelector<HTMLButtonElement>('.favourite-btn');
    if (btn) {
      btn.setAttribute('aria-pressed', favourited ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        favourited ? 'Fjern fra mine favoritter' : 'Legg til i mine favoritter'
      );
    }
  });
}

function wireFavouriteButtons() {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const btn = target.closest<HTMLButtonElement>('.favourite-btn');
    if (!btn) return;
    event.preventDefault();
    const id = btn.dataset.talkId;
    if (!id) return;
    toggle(id);
  });
}

function wireCrossTabSync() {
  window.addEventListener('storage', (event) => {
    if (event.key === favouritesStorageKey) syncCardsFromStorage();
  });
}

function revealJsOnly() {
  document.querySelectorAll('.js-only').forEach(el => el.classList.remove('js-only'));
}

function activateTab(tabId: string) {
  const tab = document.querySelector<HTMLElement>(
    `.program-tablist [role="tab"][data-tab="${CSS.escape(tabId)}"]`
  );
  if (!tab) return;
  const tablist = tab.closest<HTMLElement>('[role="tablist"]');
  const container = tab.closest<HTMLElement>('.ds-tabs');
  if (!tablist || !container) return;
  tablist.querySelectorAll<HTMLElement>('[role="tab"]').forEach(t => {
    t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
  });
  container.querySelectorAll<HTMLElement>('[role="tabpanel"]').forEach(panel => {
    panel.hidden = panel.dataset.panel !== tabId;
  });
}

function tabFromHash(): string | null {
  const raw = location.hash.replace(/^#/, '');
  if (!raw) return null;
  const tab = document.querySelector(
    `.program-tablist [role="tab"][data-tab="${CSS.escape(raw)}"]`
  );
  return tab ? raw : null;
}

function wireTabUrlSync() {
  document.querySelectorAll<HTMLElement>('.program-tablist [role="tab"]').forEach(tab => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.tab;
      if (!id) return;
      history.replaceState(null, '', `#${id}`);
    });
  });
  window.addEventListener('hashchange', () => {
    const id = tabFromHash();
    if (id) activateTab(id);
  });
}

function init() {
  revealJsOnly();
  document.addEventListener(favouritesChangeEvent, () => syncCardsFromStorage());
  wireFavouriteButtons();
  wireCrossTabSync();
  wireTabUrlSync();
  const initialTab = tabFromHash();
  if (initialTab) activateTab(initialTab);
  syncCardsFromStorage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
