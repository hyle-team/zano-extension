import browser from '../app/utils/browserApi';

function injectPageScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime?.getURL
    ? chrome.runtime.getURL('static/js/inject.bundle.js')
    : (browser.runtime?.getURL ? browser.runtime.getURL('static/js/inject.bundle.js') : '');
  script.onload = function() {
    (this as HTMLScriptElement).remove();
  };
  (document.head || document.documentElement).appendChild(script);
}
injectPageScript();

window.addEventListener("message", async (event) => {
  if (event.source !== window) return;
  const data = event.data;
  if (!data || !data.zanoRequest) return;

  try {
    const response = await browser.runtime.sendMessage({
      method: data.method,
      ...data.params,
      timeout: data.timeout,
    });
    window.postMessage(
      {
        zanoResponse: true,
        id: data.id,
        response,
      },
      window.origin
    );
  } catch (error) {
    window.postMessage(
      {
        zanoResponse: true,
        id: data.id,
        response: { error: error instanceof Error ? error.message : String(error) },
      },
      window.origin
    );
  }
});

console.log("Zano wallet content script loaded");
