const fs = require('fs');
const path = require('path');

const files = [
  'scripts/scrape-tampa-contractors.ts',
  'scripts/prospect-tampa-services.ts',
  'scripts/email-digest.ts',
  'GEMINI.md',
  'firestore.rules',
  'CLAUDE.md',
  'bot/soul.md',
  'bot/index.ts'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace exact T3kniQ with T3 Automations
    content = content.replace(/T3kniQ/g, 'T3 Automations');
    
    // Fix email
    content = content.replace(/john@t3kniq\.com/g, 'john@t3automations.com');
    
    // Fix DevBot mentions without spaces if needed
    content = content.replace(/T3 AutomationsDevBot/g, 'T3AutomationsDevBot');
    content = content.replace(/@T3 AutomationsDevBot/g, '@T3AutomationsDevBot');
    
    // Fix workspace path
    content = content.replace(/\/Antigravity\/T3 Automations"/g, '/Antigravity/T3 Automations"'); // this is a bit redundant but the original was /Antigravity/T3kniQ

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
