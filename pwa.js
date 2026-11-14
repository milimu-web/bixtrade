/* BRIXTRADE: registers the service worker and handles the install button */
(function () {
  // 1. Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/service-worker.js').catch(function (e) {
        console.warn('Service worker registration failed:', e);
      });
    });
  }

  // 2. Install button (Android / Chrome / Edge). Only works if the button exists on the page.
  var deferredPrompt = null;
  var btn = document.getElementById('installBtn');

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (btn) btn.style.display = 'inline-block';
  });

  if (btn) {
    btn.addEventListener('click', function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
        btn.style.display = 'none';
      });
    });
  }

  window.addEventListener('appinstalled', function () {
    if (btn) btn.style.display = 'none';
  });

  // 3. iPhone hint (Safari has no install prompt). Only shows if the hint element exists.
  var isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var isStandalone = window.navigator.standalone === true ||
                     window.matchMedia('(display-mode: standalone)').matches;
  var hint = document.getElementById('iosHint');
  if (hint && isIos && !isStandalone) hint.style.display = 'block';
})();