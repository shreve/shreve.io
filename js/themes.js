let initThemes = () => {
  if (document.getElementById('dark-mode-link')) return;

  let updateDisplay = () => {
    if (document.body.classList.contains('dark-mode')) {
      darkLink.text = "🌞";
      darkLink.title = "Switch on Light Mode";
    } else {
      darkLink.text = "🌜";
      darkLink.title = "Switch on Dark Mode";
    }
  }

  let modeToggle = (event) => {
    event.preventDefault();
    document.body.classList.toggle('dark-mode');
    let darkMode = document.body.classList.contains('dark-mode');
    try { sessionStorage.setItem('dark-mode', darkMode); } catch (e) { }
    updateDisplay();
  }

  let darkLink = document.createElement('a');
  darkLink.id = "dark-mode-link"
  darkLink.title = "Dark Mode";
  darkLink.text = "🌞";
  darkLink.addEventListener('click', modeToggle);
  document.body.insertBefore(darkLink, document.body.children[0]);

  try {
    if (sessionStorage.getItem('dark-mode') === "false") {
      document.body.classList.remove('dark-mode');
    }
    setTimeout(() => { document.body.classList.add('transitions') }, 0);
  } catch (e) { }

  updateDisplay();
}

export { initThemes };
