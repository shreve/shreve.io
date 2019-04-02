let initFlexText = () => {
  let flexTexts = [];

  let flexText = el => {
    const width = el.scrollWidth;
    const parent = el.parentNode.clientWidth;
    const style = window.getComputedStyle(el);
    const current = parseInt(style.getPropertyValue('font-size'));
    console.log((current *parent)/ width);
    el.style.cssText = `font-size: ${current * (parent / width)}px`;
  }

  for (let el of document.getElementsByClassName('flex-text')) {
    el.classList.add('flexing');
    flexTexts.push(el);
    flexText(el);
  }

  let flexAllTexts = () => { for (let el of flexTexts) { flexText(el); } }
  window.addEventListener('resize', flexAllTexts);
}

export { initFlexText };
