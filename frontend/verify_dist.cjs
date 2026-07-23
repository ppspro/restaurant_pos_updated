const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');

const RULES = [
  { id: 'localhost', regex: /http:\/\/localhost/gi, allowFail: false, exception: 'window.location.href||"http://localhost"' }, // Axios internal string
  { id: '127.0.0.1', regex: /127\.0\.0\.1/gi, allowFail: false },
  { id: 'demo-cashier', regex: /demo-cashier/gi, allowFail: false },
  { id: 'fetch(', regex: /fetch\(/g, allowFail: false },
  { id: 'axios.create', regex: /axios\.create/g, allowFail: false, allowedCount: 1 } // Only 1 allowed in the whole bundle (the core axios.ts)
];

let globalAxiosCreateCount = 0;
let errors = [];

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.html') || fullPath.endsWith('.css')) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  for (const rule of RULES) {
    let match;
    while ((match = rule.regex.exec(content)) !== null) {
      const snippetStart = Math.max(0, match.index - 30);
      const snippetEnd = Math.min(content.length, match.index + 30);
      const snippet = content.substring(snippetStart, snippetEnd);
      
      if (rule.exception && snippet.includes(rule.exception)) {
        continue;
      }

      if (rule.id === 'axios.create') {
        globalAxiosCreateCount++;
      } else {
        errors.push(`Rule violation [${rule.id}] in ${path.basename(filePath)}: "...${snippet}..."`);
      }
    }
  }
}

console.log('--- Starting dist/ Audit ---');
if (!fs.existsSync(DIST_DIR)) {
  console.error(`Error: Directory not found - ${DIST_DIR}`);
  process.exit(1);
}

scanDirectory(DIST_DIR);

if (globalAxiosCreateCount > 1) {
  errors.push(`Rule violation [axios.create]: Found ${globalAxiosCreateCount} instances, expected exactly 1.`);
} else if (globalAxiosCreateCount === 0) {
  console.log('Note: axios.create count is 0 (it may have been mangled/minified by Rollup, which is fine as long as there are no duplicate clients).');
} else {
  console.log(`✅ Verified exactly ${globalAxiosCreateCount} axios.create instance(s).`);
}

if (errors.length > 0) {
  console.error('\n❌ AUDIT FAILED with the following violations:');
  errors.forEach(err => console.error(err));
  process.exit(1);
} else {
  console.log('\n✅ DIST AUDIT PASSED: No localhost, 127.0.0.1, demo-cashier, or rogue fetch calls found in bundle.');
}
