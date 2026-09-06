const titleEl = document.getElementById("page-title");
const domainEl = document.getElementById("page-domain");

function domainOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

async function showActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.url) {
      titleEl.textContent = "No page to save";
      return;
    }

    titleEl.textContent = tab.title || tab.url;
    domainEl.textContent = domainOf(tab.url);
  } catch {
    titleEl.textContent = "Couldn't read this tab";
  }
}

showActiveTab();
