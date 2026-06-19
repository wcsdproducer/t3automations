const fs = require('fs');
const path = require('path');
const pkgPath = path.join(__dirname, '../package.json');
const pkg = require(pkgPath);

const versionParts = pkg.version.split('.').map(Number);
versionParts[2] += 1; // Bump patch version
pkg.version = versionParts.join('.');

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`Successfully bumped version in package.json to: ${pkg.version}`);
