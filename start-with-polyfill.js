#!/usr/bin/env node

// Apply URL.canParse polyfill globally before Metro starts
if (typeof URL !== 'undefined' && typeof URL.canParse === 'undefined') {
  URL.canParse = function(url, base) {
    try {
      new URL(url, base);
      return true;
    } catch {
      return false;
    }
  };
  console.log('✅ URL.canParse polyfill applied');
}

// Now start Expo CLI
const { spawn } = require('child_process');
const args = process.argv.slice(2);

const expo = spawn('npx', ['expo', ...args], {
  stdio: 'inherit',
  shell: true
});

expo.on('exit', (code) => {
  process.exit(code);
});
