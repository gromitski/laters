import { readdir, readFile, stat } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

const BUILD_DIRECTORY = resolve("dist");
const TEXT_EXTENSIONS = new Set([".css", ".html", ".js", ".json", ".svg", ".webmanifest"]);
const FORBIDDEN_FILE_NAMES = [
  /^\.env(?:\.|$)/u,
  /\.(?:key|map|md|p12|pem|pfx)$/iu,
  /(?:^|\/)(?:\.github|docs|evidence|memory)(?:\/|$)/iu,
  /(?:credential|secret)/iu,
];
const SENSITIVE_CONTENT = [
  ["private key", /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/u],
  ["GitHub token", /\bgh[opusr]_[A-Za-z0-9]{20,}\b/u],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/u],
  ["assigned secret", /\b(?:api[_-]?key|password|secret|token)\b\s*[:=]\s*["'][^"']{8,}["']/iu],
  ["local Unix path", /\/(?:Users|home)\/[^/\s"']+/u],
  ["local Windows path", /[A-Z]:\\Users\\[^\\\s"']+/iu],
  ["private IPv4 address", /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/u],
  ["email address", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu],
  ["source map reference", /sourceMappingURL=/u],
];
const EXTERNAL_RESOURCE_CONTENT = [
  ["external HTML resource", /<(?:iframe|img|link|script)\b[^>]*(?:href|src)=["']https?:\/\//iu],
  ["external CSS resource", /url\(["']?https?:\/\//iu],
  ["static third-party request", /\b(?:fetch|WebSocket|EventSource|sendBeacon)\s*\(\s*["']https?:\/\//u],
];
const APPROVED_PUBLIC_LITERALS = [
  "hello@dustyb.in",
  "66695716751-088llrf3kineuva2mq1tf7dujd47b2is.apps.googleusercontent.com",
  "https://accounts.google.com/gsi/client",
  "https://www.googleapis.com/drive/v3/files",
  "https://www.googleapis.com/upload/drive/v3/files",
];
const REQUIRED_PUBLIC_CONTENT = new Map([
  [
    "index.html",
    [
      'href="/privacy/"',
      'href="/terms/"',
      'id="frame-guard"',
      'src="/frame-guard.js"',
    ],
  ],
  [
    "frame-guard.js",
    ["window.self === window.top", "document.documentElement.replaceChildren()"],
  ],
  [
    "privacy/index.html",
    [
      "mailto:hello@dustyb.in",
      "laters-connection.json",
      "laters-reading-list.json",
      "laters-operation-*.json",
      "every 20 seconds",
      "short-lived Google access token",
      "Google API Services User Data Policy",
      "Delete hidden app data",
      "The Laters maintainer cannot see your reading list",
      'href="/terms/"',
    ],
  ],
  [
    "terms/index.html",
    [
      "Effective 24 August 2026",
      "Acceptable use",
      "Laters is not a guaranteed backup service",
      "The Laters maintainer cannot see your reading list",
      "reasonable care and skill",
      "death or personal injury caused by",
      "mailto:hello@dustyb.in",
      'href="/privacy/"',
    ],
  ],
]);

const files = await listFiles(BUILD_DIRECTORY);
const findings = [];
const auditedFileNames = new Set();
let totalBytes = 0;

for (const file of files) {
  const fileName = relative(BUILD_DIRECTORY, file);
  auditedFileNames.add(fileName);
  const fileStat = await stat(file);
  totalBytes += fileStat.size;

  for (const pattern of FORBIDDEN_FILE_NAMES) {
    if (pattern.test(fileName)) {
      findings.push(`${fileName}: forbidden filename`);
    }
  }

  const content = (await readFile(file)).toString("latin1");
  const auditedContent = APPROVED_PUBLIC_LITERALS.reduce(
    (result, literal) => result.replaceAll(literal, ""),
    content,
  );

  for (const [label, pattern] of SENSITIVE_CONTENT) {
    if (pattern.test(auditedContent)) {
      findings.push(`${fileName}: ${label}`);
    }
  }

  if (TEXT_EXTENSIONS.has(extname(file).toLowerCase())) {
    for (const [label, pattern] of EXTERNAL_RESOURCE_CONTENT) {
      if (pattern.test(auditedContent)) {
        findings.push(`${fileName}: ${label}`);
      }
    }
  }

  for (const requiredLiteral of REQUIRED_PUBLIC_CONTENT.get(fileName) ?? []) {
    if (!content.includes(requiredLiteral)) {
      findings.push(`${fileName}: missing required public content`);
    }
  }
}

for (const requiredFile of REQUIRED_PUBLIC_CONTENT.keys()) {
  if (!auditedFileNames.has(requiredFile)) {
    findings.push(`${requiredFile}: required public file missing`);
  }
}

if (findings.length > 0) {
  console.error("Public build audit failed:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exitCode = 1;
} else {
  console.log(`Public build audit passed: ${files.length} files, ${totalBytes} bytes.`);
}

async function listFiles(directory) {
  let entries;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new Error("Build directory not found. Run npm run build first.");
    }

    throw error;
  }

  const nestedFiles = await Promise.all(
    entries.map((entry) => {
      const path = resolve(directory, entry.name);
      return entry.isDirectory() ? listFiles(path) : [path];
    }),
  );

  return nestedFiles.flat().sort();
}
