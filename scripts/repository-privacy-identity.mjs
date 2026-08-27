const MAINTAINER_NAME = "gromitski";
const MAINTAINER_EMAIL = ["3911244+gromitski", "users.noreply.github.com"].join("@");
const GITHUB_WEB_COMMITTER_NAME = "GitHub";
const GITHUB_WEB_COMMITTER_EMAIL = ["noreply", "github.com"].join("@");

export function inspectRepositoryCommitIdentity(identity) {
  const {
    authorName,
    authorEmail,
    committerName,
    committerEmail,
    hasSignature,
  } = identity;

  if (
    authorName === MAINTAINER_NAME &&
    authorEmail === MAINTAINER_EMAIL &&
    committerName === MAINTAINER_NAME &&
    committerEmail === MAINTAINER_EMAIL
  ) {
    return [];
  }

  const usesGitHubWebCommitter =
    committerName === GITHUB_WEB_COMMITTER_NAME ||
    committerEmail === GITHUB_WEB_COMMITTER_EMAIL;

  if (usesGitHubWebCommitter) {
    const findings = [];

    if (!authorName?.trim()) {
      findings.push("HEAD: GitHub web author name is missing");
    }
    if (authorEmail !== MAINTAINER_EMAIL) {
      findings.push("HEAD: GitHub web author email is not the approved maintainer noreply address");
    }
    if (committerName !== GITHUB_WEB_COMMITTER_NAME) {
      findings.push("HEAD: unexpected GitHub web committer name");
    }
    if (committerEmail !== GITHUB_WEB_COMMITTER_EMAIL) {
      findings.push("HEAD: unexpected GitHub web committer email");
    }
    if (!hasSignature) {
      findings.push("HEAD: GitHub web commit is not signed");
    }

    return findings;
  }

  const findings = [];

  if (authorName !== MAINTAINER_NAME) {
    findings.push("HEAD: unexpected author name");
  }
  if (authorEmail !== MAINTAINER_EMAIL) {
    findings.push("HEAD: author email is not the approved maintainer noreply address");
  }
  if (committerName !== MAINTAINER_NAME) {
    findings.push("HEAD: unexpected committer name");
  }
  if (committerEmail !== MAINTAINER_EMAIL) {
    findings.push("HEAD: committer email is not the approved maintainer noreply address");
  }

  return findings;
}
