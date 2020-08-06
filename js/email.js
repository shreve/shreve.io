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
  const ebytes = [2, 21, 23, 31, 17, 122, 92, 71, 1, 13, 4, 0, 88, 12, 65];

  let emailLink = document.getElementById('email');
  if (emailLink) {
    emailLink.addEventListener('click', (e) => {
      e.preventDefault();
      let email = str(byte_xor(ebytes, bytes(location.origin)))
      window.location = "mailto:" + email;
    });
  }
}

export { initEmail };
