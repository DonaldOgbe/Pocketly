# Pocketly Browser Extension

A lightweight browser extension for saving bookmarks to Pocketly from any tab, without leaving the page you're on. Save the current tab, assign it to a collection and tags, and mark it as a favorite — all from the popup.

Cross-browser (Chrome + Firefox), built with Vite + React + TypeScript + Tailwind, sharing the same visual theme (Inter font, pink/green palette) as the Pocketly web app.

---


## Getting started

```bash
cd Extension
npm install
```

Make sure the Pocketly backend is running locally on `http://localhost:3000` (see the Backend README) — the extension talks to it directly, same as the web app.

### Development

```bash
npm run build
```

This outputs an unpacked extension to `Extension/dist/`. Load it into your browser:

**Chrome**
1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select `Extension/dist`

**Firefox**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select any file inside `Extension/dist` (e.g. `manifest.json`)


### First use

1. Open the popup (extension icon in the toolbar)
2. Log in with a Pocketly account (register first on the web app if you don't have one — there's a link in the popup)
3. Navigate to any page, open the popup, optionally pick a collection/tags, hit **Save**


