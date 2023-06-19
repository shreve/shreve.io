let initImages = () => {
  let preloadImage = (image) => {
    let preload = new Image();
    preload.onload = () => {
      image.src = preload.src;
      image.classList.remove("img-to-load");
      image.removeAttribute("data-src");
    };
    preload.src = image.getAttribute("data-src");
  };

  for (let image of document.getElementsByClassName("img-to-load")) {
    preloadImage(image);
  }
};

export { initImages };
