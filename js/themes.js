let initThemes = () => {
  if (document.getElementById('theme-link')) return;

  let prefers = (query) => {
    return window.matchMedia('(prefers-color-scheme: ' + query + ')').matches;
  }

  // Query for the current theme now
  // default ~= dark
  let currentTheme = (() => {
    if (prefers('light')) {
      return 'light';
    } else {
      return 'dark';
    }
  })()

  let swapClasses = (prev, next) => {
    document.body.classList.remove('default-mode');
    document.body.classList.remove(prev + '-mode');
    document.body.classList.add(next + '-mode');
  }

  let updateDisplay = () => {
    if (currentTheme == 'dark') {
      darkLink.text = "🌞";
      darkLink.title = "Switch on Light Mode";
    } else {
      darkLink.text = "🌜";
      darkLink.title = "Switch on Dark Mode";
    }
  }

  let modeToggle = (event) => {
    event.preventDefault();

    if (currentTheme == 'dark') {
      currentTheme = 'light'
      swapClasses('dark', 'light');
    } else {
      currentTheme = 'dark'
      swapClasses('light', 'dark');
    }

    try { sessionStorage.setItem('theme', currentTheme); } catch (e) { }
    updateDisplay();
  }

  let darkLink = document.createElement('a');
  darkLink.id = "theme-link"
  darkLink.title = "Toggle Theme";
  darkLink.addEventListener('click', modeToggle);
  document.body.insertBefore(darkLink, document.body.children[0]);
  updateDisplay();

  try {

    // Ask for a theme preference
    let theme = sessionStorage.getItem('theme') || 'default'
    if (theme != 'default') {
      document.body.classList.add(theme + '-mode');
      document.body.classList.remove('default-mode');
    }

    // Don't perform the gradual CSS transition on first paint
    setTimeout(() => { document.body.classList.add('transitions') }, 0);
  } catch (e) { }

  updateDisplay();
}

export { initThemes };
