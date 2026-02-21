// Polyfill URL.canParse for Metro bundler
// This fixes the "TypeError: URL.canParse is not a function" error
if (typeof URL !== 'undefined' && typeof URL.canParse === 'undefined') {
  URL.canParse = function(url, base) {
    try {
      new URL(url, base);
      return true;
    } catch {
      return false;
    }
  };
  console.log('[Metro Setup] URL.canParse polyfill applied');
}
