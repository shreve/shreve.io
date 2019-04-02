import { initThemes } from './themes.js';
import { initPageLinks } from './page-links.js';
import { initPosts } from './posts.js';
import { initImages } from './images.js';
import { initFlexText } from './flex-text.js';

let init = () => {
  initPosts();
  initThemes();
  initPageLinks();
  initImages();
  initFlexText();
}

init();

document.addEventListener('visit', init);
