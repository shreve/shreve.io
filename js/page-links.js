let initPageLinks = () => {
  let scrollTo = (target) => {
    let top = target.getBoundingClientRect().top;
    window.scrollTo(0, top);
  };

  let elementWithName = (name) => {
    if (name[0] === '#') name = name.slice(1);
    return document.querySelector(`[name="${name}"]`);
  };

  let callback = (event) => {
    event.preventDefault();
    let name = event.target.getAttribute('href')
    let target = elementWithName(name);
    scrollTo(target);
    window.location.hash = name;
  }

  for (var link of document.querySelectorAll('a')) {
    if (link.href && link.getAttribute('href')[0] === '#') {
      link.addEventListener('click', callback);
    }
  }

  if (window.location.hash.length > 0) {
    scrollTo(elementWithName(window.location.hash));
  }
}

export { initPageLinks };
