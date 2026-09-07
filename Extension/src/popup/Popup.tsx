import { useEffect, useState } from "react";
import browser from "webextension-polyfill";

const Popup = () => {
  const [tabInfo, setTabInfo] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(([tab]) => {
        if (tab?.url && tab?.title) {
          setTabInfo({ url: tab.url, title: tab.title });
        }
      });
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-lg font-bold text-brand-pink">Pocketly</h1>
      {tabInfo ? (
        <div className="mt-3 rounded-lg border border-gray-200 p-3">
          <p className="text-sm font-medium text-gray-900">{tabInfo.title}</p>
          <p className="mt-1 truncate text-xs text-gray-500">{tabInfo.url}</p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-400">Reading current tab…</p>
      )}
    </main>
  );
};

export default Popup;