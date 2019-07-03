import { initThemes } from './themes.js';
import { initPageLinks } from './page-links.js';
import { initPosts } from './posts.js';
import { initImages } from './images.js';
import { initFlexText } from './flex-text.js';
import { clipboard } from './clipboard.js';

window.clipboard = clipboard();

let init = () => {
  initPosts();
  initThemes();
  initPageLinks();
  initImages();
  initFlexText();
}

document.addEventListener('visit', init);

document.addEventListener('DOMContentLoaded', () => {
  document.dispatchEvent(new Event('visit'));
});
