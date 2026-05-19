const fs = require('fs');
const path = '/Volumes/SAMSUNG 500gb/Antigravity/T3 Automations/src/app/dashboard/[userId]/agent-settings/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add isAutoProvisioning state
content = content.replace(
  "const [isSaving, setIsSaving] = useState(false);",
  "const [isSaving, setIsSaving] = useState(false);\n  const [isAutoProvisioning, setIsAutoProvisioning] = useState(false);"
);

// 2. Add useEffect for auto-provisioning
const autoProvisionCode = `
  useEffect(() => {
    const autoProvisionAgent = async () => {
      if (isLoading || isAutoProvisioning || agent?.elevenLabsAgentId || !user || !db) return;
      
      setIsAutoProvisioning(true);
      try {
        const apiPayload = {
          systemPrompt: defaultPromptPlaceholder,
          voiceId: 'cjVigY5qzO86Huf0OWa1',
          firstMessage: 'Hello! How can I assist you today?',
          userId: user.uid
        };

        const res = await fetch(\`/api/elevenlabs/agents\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPayload)
        });
        
        if (!res.ok) throw new Error('Failed to auto-provision agent');
        
        const data = await res.json();
        const newElevenLabsAgentId = data.agent_id;
        setElevenLabsAgentId(newElevenLabsAgentId);

        if (agentDocRef) {
          await updateDoc(agentDocRef, {
            systemPrompt: defaultPromptPlaceholder,
            firstMessage: 'Hello! How can I assist you today?',
            voiceId: 'cjVigY5qzO86Huf0OWa1',
            elevenLabsAgentId: newElevenLabsAgentId,
          });
        } else {
          const newDocRef = doc(collection(db, \`businessProfiles/\${user.uid}/agents\`));
          await setDoc(newDocRef, {
            id: newDocRef.id,
            businessProfileId: user.uid,
            systemPrompt: defaultPromptPlaceholder,
            firstMessage: 'Hello! How can I assist you today?',
            voiceId: 'cjVigY5qzO86Huf0OWa1',
            elevenLabsAgentId: newElevenLabsAgentId,
          });
        }
      } catch (err) {
        console.error('Auto-provisioning failed:', err);
      } finally {
        setIsAutoProvisioning(false);
      }
    };

    autoProvisionAgent();
  }, [isLoading, agent, user, db, isAutoProvisioning]);
`;

content = content.replace(
  "useEffect(() => {\n    if (agent) {",
  autoProvisionCode + "\n  useEffect(() => {\n    if (agent) {"
);

// 3. Unsaved changes tracking
content = content.replace(
  "const [systemPrompt, setSystemPrompt] = useState(defaultPromptPlaceholder);",
  "const [systemPrompt, setSystemPrompt] = useState(defaultPromptPlaceholder);\n  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);"
);

content = content.replace(
  "setSystemPrompt(agent.systemPrompt || defaultPromptPlaceholder);\n      setFirstMessage(agent.firstMessage || 'Hello! How can I assist you today?');\n      setVoiceId(agent.voiceId || 'cjVigY5qzO86Huf0OWa1');",
  "setSystemPrompt(agent.systemPrompt || defaultPromptPlaceholder);\n      setFirstMessage(agent.firstMessage || 'Hello! How can I assist you today?');\n      setVoiceId(agent.voiceId || 'cjVigY5qzO86Huf0OWa1');\n      setHasUnsavedChanges(false);"
);

content = content.replace(
  "setIsSaving(false);\n    }",
  "setIsSaving(false);\n      setHasUnsavedChanges(false);\n    }"
);

// Track changes in inputs
content = content.replace(
  "onChange={(e) => setFirstMessage(e.target.value)}",
  "onChange={(e) => { setFirstMessage(e.target.value); setHasUnsavedChanges(true); }}"
);

content = content.replace(
  "onChange={(e) => setSystemPrompt(e.target.value)}",
  "onChange={(e) => { setSystemPrompt(e.target.value); setHasUnsavedChanges(true); }}"
);

// Hide save button
content = content.replace(
  "<Button onClick={handleSave} disabled={isSaving}>",
  "{hasUnsavedChanges && (\n                <Button onClick={handleSave} disabled={isSaving}>\n                  {isSaving && <Loader2 className=\"mr-2 h-4 w-4 animate-spin\" />}\n                  Save Prompt\n                </Button>\n              )}"
);
content = content.replace(
  "{isSaving && <Loader2 className=\"mr-2 h-4 w-4 animate-spin\" />}\n                Save Prompt\n              </Button>",
  ""
);

fs.writeFileSync(path, content, 'utf8');
