let initEmail = () => {
  const bytes = (str) => {
    return str.split('').map((c) => c.charCodeAt(0));
  }
  const str = (bytes) => {
    return bytes.map((b) => String.fromCharCode(b)).join('');
  }
  const byte_xor = (b1, b2) => {
    return b1.map((b, i) => { return b ^ b2[i] });
  }
  const ebytes = [25,  9, 17, 10, 20, 37, 93, 1,
                  29, 22, 30, 23, 75, 31, 10];

  document.querySelectorAll('a.email').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      let host = location.hostname;
      while (host.length < ebytes.length) { host = host + host; }
      let email = str(byte_xor(ebytes, bytes(host)))
      window.location = "mailto:" + email;
    });
  });
}

export { initEmail };
