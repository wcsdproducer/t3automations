const fs = require('fs');
const path = require('path');

const dir = 'src/app/landing-pages/_components';
const files = [
  'junk-removal-template.tsx',
  'paving-concrete-template.tsx',
  'pest-control-template.tsx',
  'template-1-content.tsx',
  'template-2-content.tsx',
  'template-3-content.tsx',
  'template-4-content.tsx'
];

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove import
  content = content.replace(/import \{ AeoSchema \} from '@\/components\/AeoSchema';\r?\n/g, '');
  
  // Remove usage
  content = content.replace(/<AeoSchema[\s\S]*?\/>\r?\n?/g, '');
  
  fs.writeFileSync(filePath, content);
  console.log(`Cleaned ${file}`);
});
