/* A readable example first; scroll simply connects each step to its record. */
(() => {
  const section = document.getElementById('business-story');
  if (!section) return;
  const steps = [...section.querySelectorAll('[data-story-step]')];
  const panels = [...section.querySelectorAll('[data-story-panel]')];
  const buttons = [...section.querySelectorAll('[data-story-select]')];
  const controls = section.querySelector('.story-controls');
  const summary = section.querySelector('.story-summary');
  if (steps.length !== 3 || panels.length !== 3 || buttons.length !== 3 || !controls || !summary) return;
  let current = -1;
  let scheduled = false;
  let manualSelection = false;
  const desktop = window.matchMedia('(min-width: 801px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const updateMotion = () => section.classList.toggle('story-instant', reduced.matches || document.documentElement.classList.contains('motion-off'));
  const select = (index, keyboard = false) => {
    if (index === current) return;
    current = index;
    updateMotion();
    if (keyboard) section.classList.add('story-instant');
    panels.forEach((panel, n) => { panel.hidden = n !== index; });
    buttons.forEach((button, n) => button.setAttribute('aria-pressed', String(n === index)));
    steps.forEach((step, n) => step.classList.toggle('is-current', n === index));
    section.style.setProperty('--story-fraction', String((index + 1) / steps.length));
  };
  const updateFromScroll = () => {
    scheduled = false;
    if (!desktop.matches) {
      manualSelection = false;
      return;
    }
    const sectionBounds = section.getBoundingClientRect();
    if (sectionBounds.bottom <= 0 || sectionBounds.top >= window.innerHeight) {
      // A new visit starts when the whole story has left the viewport.
      manualSelection = false;
      return;
    }
    // Keep an explicit choice while the visitor scrolls or resizes to read it.
    if (manualSelection) return;
    const marker = window.innerHeight * .43;
    let closest = 0;
    let distance = Infinity;
    steps.forEach((step, index) => {
      const bounds = step.getBoundingClientRect();
      const nextDistance = Math.abs(bounds.top + Math.min(bounds.height * .45, 120) - marker);
      if (nextDistance < distance) { distance = nextDistance; closest = index; }
    });
    select(closest);
  };
  const onScroll = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateFromScroll);
  };
  controls.hidden = false;
  summary.hidden = true;
  section.classList.add('story-enhanced');
  select(0);
  buttons.forEach((button, index) => button.addEventListener('click', event => {
    manualSelection = desktop.matches;
    select(index, event.detail === 0);
  }));
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  reduced.addEventListener?.('change', updateMotion);
  desktop.addEventListener?.('change', () => {
    if (!desktop.matches) manualSelection = false;
    onScroll();
  });
  new MutationObserver(updateMotion).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  onScroll();
})();
