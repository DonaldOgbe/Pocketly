# Extension

Chrome extension (Manifest V3) for saving the current tab to Pocketly.

## Load it

1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. **Load unpacked** and pick this `Extension/` folder

Reload from the same page after changing any file.

## Layout

```
manifest.json   MV3 config: permissions, icons, popup
popup.html      popup markup
popup.css       popup styles
popup.js        reads the active tab
icons/          16/32/48/128 png
```

Plain HTML/CSS/JS with no build step, so the folder loads unpacked as-is.

`storage` is declared ahead of the sign-in work, which persists the session in
`chrome.storage.local`.
