import {
  normaliseArticleUrl,
  SavedItemValidationError,
  type SavedItemInput,
} from "../domain/savedItem";

export interface ShareTargetPayload {
  title?: string;
  text?: string;
  url?: string;
}

const URL_IN_TEXT = /https?:\/\/[^\s<>"']+/giu;
const MAX_TITLE_LENGTH = 240;

export function parseShareTarget(payload: ShareTargetPayload): SavedItemInput {
  const directUrl = normaliseCandidateUrl(payload.url);
  const textUrl = findArticleUrl(payload.text);
  const titleUrl = findArticleUrl(payload.title);
  const url = directUrl ?? textUrl ?? titleUrl;

  if (!url) {
    throw new SavedItemValidationError("The shared item did not contain a valid article URL.");
  }

  const sharedTitle = cleanCandidateTitle(payload.title, url);
  const textTitle = cleanCandidateTitle(payload.text, url);
  const fallbackTitle = new URL(url).hostname.replace(/^www\./i, "");

  return {
    url,
    title: (sharedTitle || textTitle || fallbackTitle).slice(0, MAX_TITLE_LENGTH),
  };
}

function findArticleUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  for (const match of value.matchAll(URL_IN_TEXT)) {
    const candidate = stripTrailingPunctuation(match[0]);
    const url = normaliseCandidateUrl(candidate, false);

    if (url) {
      return url;
    }
  }

  return normaliseCandidateUrl(value, true);
}

function normaliseCandidateUrl(
  value: string | undefined,
  addDefaultScheme = true,
): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return normaliseArticleUrl(value, addDefaultScheme);
  } catch {
    return undefined;
  }
}

function cleanCandidateTitle(value: string | undefined, url: string): string {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed || normaliseCandidateUrl(trimmed) === url) {
    return "";
  }

  return trimmed
    .replace(URL_IN_TEXT, "")
    .replace(/[\s\-–—|:([{]+$/u, "")
    .trim();
}

function stripTrailingPunctuation(value: string): string {
  let candidate = value.replace(/[.,;!?]+$/u, "");

  for (const [opening, closing] of [
    ["(", ")"],
    ["[", "]"],
    ["{", "}"],
  ] as const) {
    while (
      candidate.endsWith(closing) &&
      countCharacter(candidate, closing) > countCharacter(candidate, opening)
    ) {
      candidate = candidate.slice(0, -1);
    }
  }

  return candidate;
}

function countCharacter(value: string, character: string): number {
  return [...value].filter((candidate) => candidate === character).length;
}
