const fs = require('fs');
const path = require('path');

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix import paths - replace various levels of relative imports with @/ alias
  const patterns = [
    // import from '../../../../../lib/db' -> '@/api/lib/db'
    { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/lib\/db['"]/g, to: "from '@/api/lib/db'" },
    { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/lib\/db['"]/g, to: "from '@/api/lib/db'" },
    { from: /from ['"]\.\.\/\.\.\/\.\.\/lib\/db['"]/g, to: "from '@/api/lib/db'" },
    { from: /from ['"]\.\.\/\.\.\/lib\/db['"]/g, to: "from '@/api/lib/db'" },
    { from: /from ['"]\.\.\/lib\/db['"]/g, to: "from '@/api/lib/db'" },
    
    // import from '../../../../../lib/helpers' -> '@/api/lib/helpers'
    { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/lib\/helpers['"]/g, to: "from '@/api/lib/helpers'" },
    { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/lib\/helpers['"]/g, to: "from '@/api/lib/helpers'" },
    { from: /from ['"]\.\.\/\.\.\/\.\.\/lib\/helpers['"]/g, to: "from '@/api/lib/helpers'" },
    { from: /from ['"]\.\.\/\.\.\/lib\/helpers['"]/g, to: "from '@/api/lib/helpers'" },
    { from: /from ['"]\.\.\/lib\/helpers['"]/g, to: "from '@/api/lib/helpers'" },

    // import from '../../../../../lib/webhooks' -> '@/api/lib/webhooks'
    { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/lib\/webhooks['"]/g, to: "from '@/api/lib/webhooks'" },
    { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/lib\/webhooks['"]/g, to: "from '@/api/lib/webhooks'" },
    { from: /from ['"]\.\.\/\.\.\/\.\.\/lib\/webhooks['"]/g, to: "from '@/api/lib/webhooks'" },
    { from: /from ['"]\.\.\/\.\.\/lib\/webhooks['"]/g, to: "from '@/api/lib/webhooks'" },
  ];

  for (const { from, to } of patterns) {
    if (from.test(content)) {
      content = content.replace(from, to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
  return changed;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let totalFixed = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      totalFixed += walkDir(fullPath);
    } else if (file === 'route.ts' || file === 'route.js') {
      if (fixImportsInFile(fullPath)) {
        totalFixed++;
      }
    }
  }
  
  return totalFixed;
}

const apiDir = path.join(__dirname, 'apps/web/src/app/api');
const fixed = walkDir(apiDir);
console.log(`\nTotal files fixed: ${fixed}`);