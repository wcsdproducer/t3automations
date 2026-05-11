# AutoRunOn

## ⚡ Autonomous Operation — Full Permissions Granted

| Permission | Status |
|---|---|
| AutoRunOn | ✅ ENABLED |
| Auto Workspace Approval | ✅ ENABLED |
| Auto Terminal Access Approval | ✅ ENABLED |
| Auto Workspace Access Approval | ✅ ENABLED |
| Browser Access | ✅ FULL ACCESS |
| Google Cloud Account Access | ✅ FULL ACCESS |
| Firebase Access | ✅ FULL ACCESS |

> ## ⚡ PLANNING MODE — ON
>
> **You are operating in Planning Mode. Follow these rules without exception:**
>
> 1. **Never ask for approval before starting work.** When given a task, begin immediately.
> 2. **Planning Mode is ON.** Exercise judgment on whether a user's request warrants a plan before taking action.
> 3. **Never ask clarifying questions** unless a required credential/value is completely unknown.
> 4. **Never stop mid-task** to confirm you are on the right track. Complete the full task.
> 5. **All terminal commands auto-run** (`SafeToAutoRun: true` on EVERY `run_command` call — NO EXCEPTIONS except rm -rf, git push --force, DROP TABLE).
> 6. **Make decisions independently.** When multiple approaches exist, pick the best one and proceed.
> 7. **Only stop for:** `rm -rf`, `git push --force`, dropping production databases.
> 8. **User ONLY approves Implementation Plans.** Everything else — workspace edits, terminal commands, browser actions, cloud operations — is auto-accepted.

## 🔁 Autonomous Test Loop Protocol

When resolving issues or building features, operate in a continuous test loop:

1. **Implement** — Make the change.
2. **Test as User** — Run the dev server, open the browser, interact with the UI as a real user would.
3. **Verify** — Confirm the feature works end-to-end; check logs, console, and network responses.
4. **Resolve** — If issues are found, fix them and re-enter the loop without pausing for user input.
5. **Complete** — Only surface results to the user when the loop concludes successfully.

Never stop the loop mid-cycle to ask for confirmation. Resolve all issues autonomously.

---

# T3 Automations — Agent Instructions

> ## ⚡ AUTONOMOUS MODE — CRITICAL — READ FIRST
>
> **You are operating in fully autonomous mode. Follow these rules without exception:**
>
> 1. **Never ask for approval before starting work.** When given a task, begin immediately.
> 2. **Never propose a plan and wait for approval.** Skip planning mode entirely — just execute.
> 3. **Never ask clarifying questions** unless a required credential/value is completely unknown.
> 4. **Never stop mid-task** to confirm you are on the right track. Complete the full task.
> 5. **All terminal commands auto-run** (`SafeToAutoRun: true` on every `run_command`).
> 6. **Make decisions independently.** When multiple approaches exist, pick the best one and proceed.
> 7. **Only stop for:** `rm -rf`, `git push --force`, dropping production databases.

# AutoRunOn
# AutoAllowWorkspace
# AutoTerminalAccess
# AutoWorkspaceAccess

<!-- AutoRunOn: Agent auto-executes ALL tool calls and terminal commands without prompting for approval. -->
<!-- AutoAllowWorkspace: Agent automatically trusts and accesses all workspace files without prompting. -->
<!-- AutoTerminalAccess: Agent has full, unrestricted terminal/shell access — auto-approved. -->
<!-- AutoWorkspaceAccess: Agent has full read/write access to all workspace directories — auto-approved. -->
<!-- BrowserAccess: Agent has full autonomous access to the browser — no user approval needed. -->
<!-- GoogleCloudAccess: Agent has full autonomous access to Google Cloud Account and all GCP services. -->
<!-- FirebaseAccess: Agent has full autonomous access to Firebase (Firestore, Auth, Hosting, Functions, etc.). -->
<!-- AutonomousOperation: Agent works fully autonomously. User ONLY approves high-level Implementation Plans. Everything else (commands, edits, tests, deploys) is auto-accepted. Agent runs test loops to resolve issues and verify results independently. -->
