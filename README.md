# Zano Companion

Zano Companion is a browser extension that enhances your experience with Zano-based dApps by providing seamless wallet integration, transaction signing, and more.

## Features

- Connect your Zano wallet to web applications securely.
- Sign transactions and messages directly from the extension.
- Easily access your balance and transaction history.
- Compatible with dApps in the Zano ecosystem.

## Installation

### Chrome Web Store

Install Zano Companion from the [Chrome Web Store](https://chromewebstore.google.com/detail/zano-companion/akcgnllhhhkcpmlenfpicmcpgfpindlb)

### Manual Installation

If you prefer to install manually:

- Download the latest release from [GitHub Releases](https://github.com/hyle-team/zano-extension/releases).
- Extract the archive.
- Open Chrome and navigate to chrome://extensions/.
- Enable Developer mode (top-right corner).
- Click Load unpacked and select the extracted folder.

## Usage

Open the extension and connect your Zano wallet.
Approve connection requests from supported dApps.
Sign transactions securely.

## Cross-Platform (Chrome & Firefox) Support

This extension is now fully cross-browser compatible! The codebase and build process have been updated to support both Chrome and Firefox with a single codebase. Key changes include:

- All Chrome-specific APIs are now accessed via a browser API wrapper (`webextension-polyfill`), ensuring compatibility with both browsers.
- The manifest is generated dynamically for each browser using a build script, so the correct background script format is used for Chrome (Manifest V3 service worker) and Firefox (background scripts).
- The build output (`build/` directory) now contains all required files (HTML, manifest, JS, images) for loading the extension in either browser.
- The build process is automated with npm scripts for each browser.

## Recent Cross-Browser Refactors & Fixes

- **Promise-based APIs:** All usages of `browser.storage.local.get`, `set`, `remove`, and `browser.runtime.sendMessage` have been refactored to use the Promise-based API (async/await), which is required for Manifest V3 and `webextension-polyfill` compatibility. Callback-style usage is no longer present.
- **Component and Utility Updates:** All React components and utility functions that interacted with extension storage or messaging have been updated to use async/await and the Promise-based API.
- **Manifest Build System:** The manifest is now generated dynamically for each browser, and the build output is copied to the correct location for both Chrome and Firefox.
- **API Compatibility:** All extension code now uses a unified `browser` API wrapper, ensuring that Chrome and Firefox differences (such as callback vs. Promise APIs) are handled automatically.
- **SCSS Modernization:** All SCSS files have been migrated from the deprecated `@import` syntax to the modern `@use`/`@forward` module system. Variables are now referenced with their namespace (e.g., `variables.$appHeight` instead of `$appHeight`). The main variables file was renamed from `_variables.scss` to `variables.scss` to follow the new convention and ensure compatibility with `@use`.

### Secure Cross-Browser SDK Communication (2024 Update)

- **Robust SDK Bridge:** The extension now injects `window.zano` into the web page context using a dynamically added `<script>` tag, ensuring the Zano Web3 SDK works seamlessly in both Chrome and Firefox.
- **postMessage Bridge:** Communication between the SDK (web page) and the extension is handled via `window.postMessage` and a content script bridge, following best practices for browser extension security and interoperability (as used by MetaMask, Keplr, etc.).
- **No SDK Changes Required:** The Zano Web3 SDK did not require any changes for this compatibility update. All improvements were made on the extension side.
- **Background API Contract:** As long as the extension background script supports the same API methods, the SDK will work in any browser supporting the WebExtension API.
- **Security:** Only messages from the same window and with the correct structure are processed, ensuring safe and reliable operation.

If you encounter any further issues or see new errors in the console, please open an issue or pull request!

### Additional 2024 Codebase Improvements

- **Robust State Handling:**
  All major React components now guard against `null` or `undefined` wallet and user state, preventing crashes and providing clear fallback UI.

- **React Hook Compliance:**
  Refactored components to ensure all React hooks are called unconditionally at the top level, in line with React's best practices.

- **Debug Logging:**
  Added debug logging to wallet data fetch logic to aid in diagnosing loading and state transition issues.

- **Dependency Upgrades:**
  Upgraded `sass` and `sass-loader` to the latest versions, and removed all legacy references to `node-sass` for improved build performance and compatibility.

- **Codebase Cleanup:**
  Searched for and removed unused or deprecated code, and improved performance/resource usage throughout the codebase.

## Building for Each Browser

### Chrome

1. Build the extension:
   ```bash
   npm run build
   ```
2. Load the `build/` directory as an unpacked extension in Chrome (`chrome://extensions`).

### Firefox

1. Build the extension:
   ```bash
   npm run build
   npm run manifest:firefox
   npm run copy:public
   ```
   Or, using build script:
   ```bash
   npm run build:firefox
   ```
2. In Firefox, go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on...", and select the `manifest.json` file inside the `build/` directory.

---

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

MIT License
