(() => {
  const guard = document.getElementById("frame-guard");

  if (window.self === window.top) {
    guard?.remove();
    return;
  }

  document.documentElement.replaceChildren();
  window.stop();
})();
