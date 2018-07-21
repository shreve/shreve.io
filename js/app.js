import { initThemes } from './themes.js';
import { initPageLinks } from './page-links.js';

document.addEventListener('turbolinks:load', () => {
  initThemes();
  initPageLinks();
});

initThemes();
