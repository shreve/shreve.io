import { initThemes } from './themes.js';
import { initPageLinks } from './page-links.js';
import { initImages } from './images.js';
import { initFlexText } from './flex-text.js';
import { initEmail } from './email.js';
import { clipboard } from './clipboard.js';

window.clipboard = clipboard();

let init = () => {
  initThemes();
  initPageLinks();
  initImages();
  initFlexText();
  initEmail();
}

document.addEventListener('visit', init);

document.addEventListener('DOMContentLoaded', () => {
  document.dispatchEvent(new Event('visit'));
});
