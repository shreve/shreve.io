let initImages = () => {
  let preloadImage = (image) => {
    let preload = new Image();
    preload.onload = () => {
      image.src = preload.src;
      image.classList.remove('img-loading');
    }
    preload.src = image.getAttribute('data-src');
  }

  for (let image of document.getElementsByClassName('img-loading')) {
    preloadImage(image);
  }
};

export { initImages };
