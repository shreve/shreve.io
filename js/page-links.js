import { ajax } from './ajax.js';

let initPageLinks = () => {
  let cache = {};

  let scrollTo = (target) => {
    let top = target.getBoundingClientRect().top;
    window.scrollTo(0, top);
  };

  let elementWithName = (name) => {
    if (name[0] === '#') name = name.slice(1);
    return document.querySelector(`[name="${name}"]`);
  };

  let scrollCallback = (event) => {
    event.preventDefault();
    let name = event.target.getAttribute('href')
    let target = elementWithName(name);
    scrollTo(target);
    window.location.hash = name;
  }

  let ajaxCallback = (event) => {
    event.preventDefault();
    let target = new URL(event.target.href || event.target.parentNode.href)

    if (!cache.hasOwnProperty(target.pathname)) {
      save(target.pathname);
    } else {
      visit(target.pathname);
    }
  }

  let saveView = (url, el) => {
    cache[url] = {
      title: el.querySelector('title').innerText,
      body: el.children[1].cloneNode(true)
    }
  }

  let save = (url) => {
    ajax({ url: url,
           method: 'GET',
           success: (data) => {
             let el = document.createElement('html');
             el.innerHTML = data;
             saveView(url, el);
             visit(url);
           }
         });
  }

  let visit = (url) => {
    let page = cache[url];

    document.title = page.title;
    document.querySelector('body').outerHTML = page.body.outerHTML;
    window.scrollTo(0, 0);
    window.history.pushState({ url: url }, page.title, url);

    document.dispatchEvent(new Event('visit'));
  }

  let addListeners = () => {
    for (var link of document.querySelectorAll('a')) {
      if (!link.href) continue;

      let url;
      try {
        url = new URL(link.getAttribute('href'));
      } catch {
        url = new URL(window.location.origin + link.getAttribute('href'));
      }

      if (url.origin !== window.location.origin) continue;

      if (link.getAttribute('href')[0] === '#') {
        link.addEventListener('click', scrollCallback);
      } else {
        link.addEventListener('click', ajaxCallback);
      }
    }
  }

  addListeners();

  if (window.location.hash.length > 0) {
    scrollTo(elementWithName(window.location.hash));
  }
}

export { initPageLinks };
