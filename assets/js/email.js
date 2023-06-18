let initEmail = () => {
  const bytes = (str) => {
    return str.split("").map((c) => c.charCodeAt(0));
  };
  const str = (bytes) => {
    return bytes.map((b) => String.fromCharCode(b)).join("");
  };
  const byte_xor = (b1, b2) => {
    return b1.map((b, i) => {
      return b ^ b2[i % b2.length];
    });
  };
  const ebytes = [5, 1, 29, 9, 19, 17, 110, 26, 7, 1, 13, 4, 0, 88, 12, 65];
  str(byte_xor(ebytes, bytes(location.hostname)));

  document.querySelectorAll("a.email").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      let host = location.hostname;
      while (host.length < ebytes.length) {
        host = host + host;
      }
      let email = str(byte_xor(ebytes, bytes(host)));
      window.location = "mailto:" + email;
    });
  });
};

export { initEmail };
