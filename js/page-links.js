import { ajax } from './ajax.js';

let initPageLinks = () => {
  window.pageCache = window.pageCache || {};
  let history = true;

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
    safeVisit(target)
  }

  let safeVisit = (url) => {
    if (!pageCache.hasOwnProperty(url.pathname)) {
      save(url.pathname);
    } else {
      visit(url.pathname);
    }
  }

  let writeToCache = (url, el) => {
    pageCache[url] = {
      title: el.querySelector('title').innerText,
      body: el.querySelector('body').cloneNode(true)
    }
  }

  let save = (url) => {
    ajax({ url: url,
           method: 'GET',
           success: (data, xhr) => {
             if (xhr.getResponseHeader('content-type') === "text/html; charset=utf-8") {
               let el = document.createElement('html');
               el.innerHTML = data;
               writeToCache(url, el);
               visit(url);
             } else {
               window.location = url;
             }
           }
         });
  }

  let visit = (url) => {
    let page = pageCache[url];

    document.title = page.title;
    document.querySelector('body').outerHTML = page.body.outerHTML;
    window.scrollTo(0, 0);
    evalJavascript();
    if (history)
      window.history.pushState({ url: url }, page.title, url);

    document.dispatchEvent(new Event('visit'));
  }

  let evalJavascript = () => {
    let scripts = document.querySelectorAll("body script");
    for (let i = 0; i < scripts.length; i++) {
      let script = scripts[i];
      let new_script = document.createElement('script');
      for (let j = 0; j < script.attributes.length; j++) {
        let pair = script.attributes.item(j);
        new_script.setAttribute(pair.nodeName, pair.nodeValue);
      }
      new_script.innerHTML = script.innerHTML;
      script.parentNode.replaceChild(new_script, script);
      script.remove();
    }
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

  writeToCache(window.location.pathname, document.children[0]);

  window.onpopstate = (event) => {
    history = false;
    safeVisit(window.location);
    history = true;
  }
}

export { initPageLinks };
