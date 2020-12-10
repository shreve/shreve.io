let clipboard = () => {
  let copy = (text) => {
    let false_input = document.createElement('textarea');
    false_input.classList.add('copy-dummy');
    false_input.setAttribute('readonly', true);
    false_input.value = text;
    document.body.appendChild(false_input);
    false_input.select();
    document.execCommand('copy');
    false_input.remove();
  }

  return {
    copy
  };
};

export { clipboard };
