const fs = require('fs');
const path = '/Volumes/SAMSUNG 500gb/Antigravity/T3 Automations/src/app/dashboard/[userId]/agent-settings/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const beforeUnloadCode = `
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
`;

content = content.replace(
  "useEffect(() => {\n    if (agent) {",
  beforeUnloadCode + "\n  useEffect(() => {\n    if (agent) {"
);

fs.writeFileSync(path, content, 'utf8');
