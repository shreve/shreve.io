let ajax = (opts) => {
  let http = new XMLHttpRequest();
  http.open(opts.method, opts.url);
  http.onreadystatechange = () => {
    if (http.readyState === 4 && http.status === 200) {
      opts.success(http.responseText);
    }
  }
  http.send();
  return http.responseText;
}

export { ajax };
