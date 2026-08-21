#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ZERO_SHA = /^0{40}$/;
const MANAGED_HOOK_MARKER = "# managed by scripts/no-ai-attribution.mjs";
const AI_IDENTITY = /\b(?:cursor|cursoragent|chatgpt|claude|copilot|gemini|grok|openai|anthropic)\b/i;
const AI_EMAIL = /(?:cursoragent@cursor\.com|(?:cursor|chatgpt|claude|copilot|gemini|grok|openai|anthropic)[^@\s]*@)/i;
const ATTRIBUTION_LINE = /^(?:co-authored-by|generated-by|authored-by|assisted-by|written-by):\s*(.+)$/gim;

function runGit(args, input) {
  const result = spawnSync("git", args, {
    encoding: "utf8",
    input,
    shell: false,
  });

  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "Git command failed").trim();
    throw new Error(detail);
  }

  return (result.stdout || "").trim();
}

function scanMessage(message) {
  const issues = [];
  ATTRIBUTION_LINE.lastIndex = 0;

  for (const match of message.matchAll(ATTRIBUTION_LINE)) {
    const value = match[1] || "";
    if (AI_IDENTITY.test(value) || AI_EMAIL.test(value)) {
      issues.push(`AI attribution trailer: ${match[0].trim()}`);
    }
  }

  if (AI_EMAIL.test(message)) {
    issues.push("AI-associated email address in commit message");
  }

  return [...new Set(issues)];
}

function scanIdentity(label, value) {
  if (!value) return [];
  if (AI_IDENTITY.test(value) || AI_EMAIL.test(value)) {
    return [`AI identity in ${label}`];
  }
  return [];
}

function inspectCommit(sha) {
  const output = runGit([
    "show",
    "-s",
    "--format=%H%x00%B%x00%an%x00%ae%x00%cn%x00%ce",
    sha,
  ]);
  const [commitSha, message, authorName, authorEmail, committerName, committerEmail] =
    output.split("\0");

  const issues = [
    ...scanMessage(message || ""),
    ...scanIdentity("author name", authorName),
    ...scanIdentity("author email", authorEmail),
    ...scanIdentity("committer name", committerName),
    ...scanIdentity("committer email", committerEmail),
  ];

  return { sha: commitSha || sha, issues: [...new Set(issues)] };
}

function reportCommitFailures(results) {
  const failed = results.filter((result) => result.issues.length > 0);
  if (failed.length === 0) return;

  console.error("Push blocked: AI authorship metadata was detected.");
  for (const result of failed) {
    console.error(`- ${result.sha.slice(0, 7)}: ${result.issues.join("; ")}`);
  }
  console.error("Create or amend the commit with clean human authorship metadata, then retry.");
  process.exit(1);
}

function writeManagedHook(filePath, content) {
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, "utf8");
    if (!existing.includes(MANAGED_HOOK_MARKER)) {
      throw new Error(
        `Refusing to overwrite existing hook ${filePath}. Integrate the attribution check manually or remove the hook deliberately.`,
      );
    }
  }

  fs.writeFileSync(filePath, content, { mode: 0o755 });
  fs.chmodSync(filePath, 0o755);
}

function installHooks() {
  const repoRoot = runGit(["rev-parse", "--show-toplevel"]);
  const hooksPath = runGit(["rev-parse", "--git-path", "hooks"]);
  const hooksDir = path.isAbsolute(hooksPath)
    ? hooksPath
    : path.resolve(repoRoot, hooksPath);
  fs.mkdirSync(hooksDir, { recursive: true });

  const commitMsgHook = `#!/bin/sh\n${MANAGED_HOOK_MARKER}\nrepo_root=$(git rev-parse --show-toplevel) || exit 1\nexec node "$repo_root/scripts/no-ai-attribution.mjs" message-file "$1"\n`;
  const prePushHook = `#!/bin/sh\n${MANAGED_HOOK_MARKER}\nrepo_root=$(git rev-parse --show-toplevel) || exit 1\nexec node "$repo_root/scripts/no-ai-attribution.mjs" pre-push "$@"\n`;

  const commitMsgPath = path.join(hooksDir, "commit-msg");
  const prePushPath = path.join(hooksDir, "pre-push");
  writeManagedHook(commitMsgPath, commitMsgHook);
  writeManagedHook(prePushPath, prePushHook);

  console.log(`Installed no-AI-attribution hooks in ${hooksDir}`);
}

function checkMessageFile(filePath) {
  const message = fs.readFileSync(filePath, "utf8");
  const issues = scanMessage(message);
  if (issues.length === 0) return;

  console.error("Commit blocked: AI authorship metadata was detected.");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

function inspectCommits(shas) {
  const unique = [...new Set(shas.filter(Boolean))];
  reportCommitFailures(unique.map(inspectCommit));
}

function checkPrePush(remoteName) {
  const input = fs.readFileSync(0, "utf8");
  const commits = [];

  for (const line of input.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const [, localSha, , remoteSha] = line.trim().split(/\s+/);
    if (!localSha || ZERO_SHA.test(localSha)) continue;

    let revisionArgs;
    if (remoteSha && !ZERO_SHA.test(remoteSha)) {
      revisionArgs = [`${remoteSha}..${localSha}`];
    } else if (remoteName) {
      revisionArgs = [localSha, "--not", `--remotes=${remoteName}`];
    } else {
      revisionArgs = [localSha];
    }

    const output = runGit(["rev-list", ...revisionArgs]);
    if (output) commits.push(...output.split(/\r?\n/));
  }

  inspectCommits(commits);
}

function selfTest() {
  const cases = [
    ["clean message", "Update Cursor project rule", true],
    ["Cursor co-author", "Fix issue\n\nCo-authored-by: Cursor <cursoragent@cursor.com>", false],
    ["ChatGPT generator", "Generated-by: ChatGPT", false],
    ["Claude author", "Authored-by: Claude", false],
    ["ordinary OpenAI prose", "Document OpenAI API integration", true],
  ];

  for (const [label, message, shouldPass] of cases) {
    const passed = scanMessage(message).length === 0;
    if (passed !== shouldPass) {
      console.error(`FAIL ${label}`);
      process.exit(1);
    }
    console.log(`PASS ${label}`);
  }
}

function usage() {
  console.log(`Usage:
  node scripts/no-ai-attribution.mjs install
  node scripts/no-ai-attribution.mjs self-test
  node scripts/no-ai-attribution.mjs message-file <path>
  node scripts/no-ai-attribution.mjs commit <sha> [sha...]
  node scripts/no-ai-attribution.mjs range <revision-range>
  node scripts/no-ai-attribution.mjs pre-push <remote-name> <remote-url>`);
}

try {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "install":
      installHooks();
      break;
    case "self-test":
      selfTest();
      break;
    case "message-file":
      if (!args[0]) throw new Error("message-file requires a path");
      checkMessageFile(args[0]);
      break;
    case "commit":
      if (args.length === 0) throw new Error("commit requires at least one SHA");
      inspectCommits(args);
      break;
    case "range": {
      if (!args[0]) throw new Error("range requires a Git revision range");
      const output = runGit(["rev-list", args[0]]);
      inspectCommits(output ? output.split(/\r?\n/) : []);
      break;
    }
    case "pre-push":
      checkPrePush(args[0]);
      break;
    default:
      usage();
      process.exit(command ? 1 : 0);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
