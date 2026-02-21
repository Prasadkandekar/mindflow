const fs = require('fs');
const path = require('path');

// File 1: parseBundleOptionsFromBundleRequestUrl.js
const metroFilePath1 = path.join(
  __dirname,
  'node_modules',
  '@expo',
  'metro',
  'node_modules',
  'metro',
  'src',
  'lib',
  'parseBundleOptionsFromBundleRequestUrl.js'
);

// File 2: Server.js
const metroFilePath2 = path.join(
  __dirname,
  'node_modules',
  '@expo',
  'metro',
  'node_modules',
  'metro',
  'src',
  'Server.js'
);

function patchFile(filePath, fileName) {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if fix is already applied
      if (content.includes('URL.canParse')) {
        // Replace URL.canParse with try-catch
        const originalContent = content;
        
        // Pattern 1: parseBundleOptionsFromBundleRequestUrl
        content = content.replace(
          /if \(!URL\.canParse\(rawNonJscSafeUrlEncodedUrl, RESOLVE_BASE_URL\)\) \{[\s\S]*?cause: rawNonJscSafeUrlEncodedUrl,[\s\S]*?\}\);[\s\S]*?\}/,
          `// Polyfill URL.canParse inline
  let isValidUrl = false;
  try {
    new URL(rawNonJscSafeUrlEncodedUrl, RESOLVE_BASE_URL);
    isValidUrl = true;
  } catch {
    isValidUrl = false;
  }
  
  if (!isValidUrl) {
    throw new Error("Invalid URL", {
      cause: rawNonJscSafeUrlEncodedUrl,
    });
  }`
        );
        
        // Pattern 2: _processSingleAssetRequest
        content = content.replace(
          /if \(!URL\.canParse\(req\.url, "resolve:\/\/"\)\) \{[\s\S]*?cause: req\.url,[\s\S]*?\}\);[\s\S]*?\}/,
          `// Polyfill URL.canParse inline
    let isValidUrl = false;
    try {
      new URL(req.url, "resolve://");
      isValidUrl = true;
    } catch {
      isValidUrl = false;
    }
    
    if (!isValidUrl) {
      throw new Error("Could not parse URL", {
        cause: req.url,
      });
    }`
        );
        
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ ${fileName}: URL.canParse fix applied`);
        } else {
          console.log(`✅ ${fileName}: URL.canParse fix already applied`);
        }
      } else {
        console.log(`✅ ${fileName}: No URL.canParse found (already fixed)`);
      }
    } else {
      console.log(`⚠️  ${fileName}: File not found, skipping`);
    }
  } catch (error) {
    console.error(`❌ ${fileName}: Error applying fix:`, error.message);
  }
}

// Patch both files
console.log('Applying Metro URL.canParse fixes...');
patchFile(metroFilePath1, 'parseBundleOptionsFromBundleRequestUrl.js');
patchFile(metroFilePath2, 'Server.js');
console.log('Done!');
