// Kufu Hive bilingual interface: English default, Japanese on demand.
(() => {
  const storageKey = 'kufuhive-language';
  const hint = document.querySelector('.hint-caption');
  const actions = document.querySelector('.header-actions');
  const switcher = document.createElement('div');
  switcher.className = 'lang-switch';
  switcher.setAttribute('role', 'group');
  switcher.setAttribute('aria-label', 'Display language');
  switcher.innerHTML = '<button type="button" data-lang="en" aria-pressed="true">EN</button><button type="button" data-lang="ja" aria-pressed="false">JP</button>';
  if (hint) hint.replaceWith(switcher);
  else if (actions) actions.appendChild(switcher);

  // Preserve exact original markup to restore English without losing decorations.
  const targets = [...document.querySelectorAll('.translation-target[data-jp]')]
    .filter(el => !el.classList.contains('hero-annotation') && !(el.tagName === 'H3' && el.textContent.trim() === 'NextGuess'))
    .map(el => ({ el, en: el.innerHTML, jp: el.dataset.jp, label: el.getAttribute('aria-label') }));
  document.querySelectorAll('.translation-target').forEach(el => {
    el.classList.remove('translation-target', 'show-translation');
    if (el.getAttribute('role') === 'button') el.removeAttribute('role');
    if (el.hasAttribute('tabindex')) el.removeAttribute('tabindex');
  });

  const extras = [
    ['.primary-cta [data-i18n="explore"]', '作品を見る'],
    ['.visual-side-note', '発想 / 創作 / 遊び / 反復'],
    ['.notes-foot', '完成品の目録ではなく、育っていく記録。'],
    ['.skip-link', '本文へ移動']
  ].map(([selector, jp]) => {
    const el = document.querySelector(selector);
    return el ? { el, en: el.textContent, jp } : null;
  }).filter(Boolean);

  function setLanguage(language) {
    const ja = language === 'ja';
    // Restore parent nodes first, then any nested elements.
    targets.forEach(({ el, en, label }) => {
      if (!ja) {
        el.innerHTML = en;
        if (label === null) el.removeAttribute('aria-label');
        else el.setAttribute('aria-label', label);
      }
    });
    if (ja) {
      [...targets].reverse().forEach(({ el, jp }) => {
        // Nested content is handled by its own translation target.
        if (!el.isConnected) return;
        el.textContent = jp;
        el.setAttribute('aria-label', jp);
      });
    }
    extras.forEach(({ el, en, jp }) => { if (el.isConnected) el.textContent = ja ? jp : en; });
    document.querySelectorAll('[data-jp-link][data-en-link]').forEach(el => { el.textContent = ja ? el.dataset.jpLink : el.dataset.enLink; });
    document.documentElement.lang = ja ? 'ja' : 'en';
    switcher.querySelectorAll('button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.lang === language));
    });
    try { localStorage.setItem(storageKey, language); } catch (_) {}
  }

  switcher.addEventListener('click', event => {
    const button = event.target.closest('button[data-lang]');
    if (button) setLanguage(button.dataset.lang);
  });
  let initial = 'en';
  try { if (localStorage.getItem(storageKey) === 'ja') initial = 'ja'; } catch (_) {}
  setLanguage(initial);
})();
