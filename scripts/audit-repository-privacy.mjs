#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { spawnSync } from "node:child_process";

import { inspectRepositoryCommitIdentity } from "./repository-privacy-identity.mjs";

const ALLOWED_EMAILS = new Set([
  "hello@dustyb.in",
  "i@izs.me",
  "secret@example.com",
  "cursoragent@cursor.com",
]);
const FORBIDDEN_FILE_NAMES = [
  /(?:^|\/)\.env(?:\.|$)/iu,
  /\.(?:key|p12|pem|pfx)$/iu,
  /(?:credential|client[_-]?secret|refresh[_-]?token)/iu,
];
const SENSITIVE_CONTENT = [
  ["Google OAuth client secret", new RegExp(["GOC", "SPX-"].join(""), "u")],
  ["private key", new RegExp(["-----BEGIN ", "PRIVATE KEY-----"].join(""), "u")],
  ["GitHub token", /\bgh[opusr]_[A-Za-z0-9]{20,}\b/u],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/u],
  ["assigned secret", /\b(?:api[_-]?key|client[_-]?secret|password|refresh[_-]?token)\b\s*[:=]\s*["'][^"']{8,}["']/iu],
  ["local Unix home path", /\/(?:Users|home)\/[^/\s"']+/u],
  ["local Windows home path", /[A-Z]:\\Users\\[^\\\s"']+/iu],
  ["private IPv4 address", /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/u],
];
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu;
const TEXT_EXTENSIONS = new Set([
  "",
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".svg",
  ".ts",
  ".txt",
  ".webmanifest",
  ".yml",
]);

const findings = [];
const files = runGit(["ls-files"]).split(/\r?\n/u).filter(Boolean);

for (const file of files) {
  for (const pattern of FORBIDDEN_FILE_NAMES) {
    if (pattern.test(file)) {
      findings.push(`${file}: forbidden credential-like filename`);
    }
  }

  if (!TEXT_EXTENSIONS.has(extname(file).toLowerCase())) {
    continue;
  }

  const buffer = await readFile(file);

  if (buffer.includes(0)) {
    continue;
  }

  const content = buffer.toString("utf8");

  for (const [label, pattern] of SENSITIVE_CONTENT) {
    if (pattern.test(content)) {
      findings.push(`${file}: ${label}`);
    }
  }

  for (const match of content.matchAll(EMAIL)) {
    const email = match[0].toLowerCase();

    if (!ALLOWED_EMAILS.has(email)) {
      findings.push(`${file}: unapproved email address ${email}`);
    }
  }
}

const [authorName, authorEmail, committerName, committerEmail] = runGit([
  "log",
  "-1",
  "--format=%an%x00%ae%x00%cn%x00%ce",
]).split("\0");
const commitHeaders = runGit(["cat-file", "commit", "HEAD"]).split("\n\n", 1)[0];

findings.push(...inspectRepositoryCommitIdentity({
  authorName,
  authorEmail,
  committerName,
  committerEmail,
  hasSignature: /(?:^|\n)gpgsig /u.test(commitHeaders),
}));

if (findings.length > 0) {
  console.error("Repository privacy audit failed:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exitCode = 1;
} else {
  console.log(`Repository privacy audit passed: ${files.length} tracked files and HEAD metadata.`);
}

function runGit(args) {
  const result = spawnSync("git", args, { encoding: "utf8", shell: false });

  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "Git command failed").trim());
  }

  return (result.stdout || "").trim();
}
