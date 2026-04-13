import "dotenv/config";
import { createDevBot } from "./devBotFramework.js";

(async () => {
  const bot = await createDevBot({
    token: process.env.TELEGRAM_BOT_TOKEN!,
    ownerId: parseInt(process.env.TELEGRAM_OWNER_ID!, 10),
    workspaceRoot: process.env.WORKSPACE_ROOT || "/Volumes/SAMSUNG 500gb/Antigravity/T3kniQ",
    workspaceName: "T3kniQ",
    firebaseProjectId: "studio-1410114603-9e1f6",
  });

  console.log("⚡ T3kniQ Dev Bot starting...");

  async function startWithRetry(maxRetries = 5, delayMs = 5000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await bot.start({
          onStart: () => console.log("✅ @T3kniQDevBot is running"),
        });
        return;
      } catch (err: any) {
        if (err?.error_code === 409 && attempt < maxRetries) {
          console.warn(`⚠️ 409 conflict (attempt ${attempt}/${maxRetries}). Retrying in ${delayMs / 1000}s...`);
          await new Promise((r) => setTimeout(r, delayMs));
        } else {
          throw err;
        }
      }
    }
  }

  await startWithRetry().catch((err) => {
    console.error("❌ Bot failed after retries:", err.message || err);
    process.exit(1);
  });
})();
