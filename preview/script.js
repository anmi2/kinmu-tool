// English is the default. Hover (desktop) or tap (touch) reveals Japanese annotations.
(() => {
  const targets = [...document.querySelectorAll('.translation-target[data-jp]')];
  function closeOthers(except) {
    targets.forEach(el => { if(el !== except) el.classList.remove('show-translation'); });
  }
  targets.forEach(el => {
    el.addEventListener('click', event => {
      // Don't interfere with navigation: hover/focus remains available for links.
      if (el.tagName === 'A') return;
      const showing = el.classList.contains('show-translation');
      closeOthers(el); el.classList.toggle('show-translation', !showing);
      event.stopPropagation();
    });
    el.addEventListener('keydown', event => {
      if(event.key === 'Escape') {el.classList.remove('show-translation');el.blur();}
      if((event.key === 'Enter' || event.key === ' ') && el.tagName !== 'A') {event.preventDefault();el.click();}
    });
  });
  document.addEventListener('click', () => closeOthers(null));
})();
