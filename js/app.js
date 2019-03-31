import { initThemes } from './themes.js';
import { initPageLinks } from './page-links.js';
import { initPosts } from './posts.js';
import { initImages } from './images.js';

let init = () => {
  initPosts();
  initThemes();
  initPageLinks();
  initImages();
}

init();

document.addEventListener('visit', init);
