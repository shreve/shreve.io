import { initThemes } from './themes.js';
import { initPageLinks } from './page-links.js';
import { initPosts } from './posts.js';
import { initImages } from './images.js';

document.addEventListener('turbolinks:load', () => {
  initPosts();
  initThemes();
  initPageLinks();
  initImages();
});

initThemes();
