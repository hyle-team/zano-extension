const fs = require('fs');
const path = require('path');

const target = process.argv[2]; // 'chrome' or 'firefox'
if (!target || !['chrome', 'firefox'].includes(target)) {
  console.error('Usage: node build-manifest.js <chrome|firefox>');
  process.exit(1);
}

const baseManifestPath = path.join(__dirname, 'public', 'manifest.base.json');
const outputManifestPath = path.join(__dirname, 'public', 'manifest.json');

if (!fs.existsSync(baseManifestPath)) {
  console.error('public/manifest.base.json not found!');
  process.exit(1);
}

const baseManifest = JSON.parse(fs.readFileSync(baseManifestPath, 'utf8'));

if (target === 'chrome') {
  baseManifest.background = {
    service_worker: 'static/js/background.bundle.js'
  };
} else if (target === 'firefox') {
  baseManifest.background = {
    scripts: ['static/js/background.bundle.js']
  };
}

fs.writeFileSync(outputManifestPath, JSON.stringify(baseManifest, null, 2));
console.log(`Generated public/manifest.json for ${target}`); 