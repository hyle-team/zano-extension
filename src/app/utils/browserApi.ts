// Browser API compatibility wrapper
// Uses webextension-polyfill if available, otherwise falls back to chrome

// @ts-ignore
import browserPolyfill from 'webextension-polyfill';

// Add this at the top to suppress missing types error for webextension-polyfill
// @ts-ignore
// If you see a type error, run: npm i --save-dev @types/webextension-polyfill or add a .d.ts file

// If webextension-polyfill is available, use it. Otherwise, fallback to chrome with Promises where possible.
const browser = (typeof window !== 'undefined' && (window as any).browser)
  ? (window as any).browser
  : (typeof browserPolyfill !== 'undefined' ? browserPolyfill : (typeof chrome !== 'undefined' ? chrome : {}));

export default browser; 