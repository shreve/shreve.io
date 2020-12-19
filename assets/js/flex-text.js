let initFlexText = () => {
  let flexTexts = [];
  let timeout;

  let flexText = el => {
    const ratio = el.parentNode.clientWidth / el.scrollWidth;
    if (Math.abs(ratio - 1.0) < 0.05) { return; }

    const style = window.getComputedStyle(el);
    const current = parseInt(style.getPropertyValue('font-size'));
    el.style.cssText = `font-size: ${current * ratio}px`;
  }

  let flexAllTexts = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      for (let el of flexTexts) { flexText(el); }
    }, 0);
  }

  for (let el of document.getElementsByClassName('flex-text')) {
    el.classList.add('flexing');
    flexTexts.push(el);
    flexText(el);
  }

  window.addEventListener('resize', flexAllTexts);
}

export { initFlexText };
