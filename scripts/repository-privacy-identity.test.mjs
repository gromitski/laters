import { describe, expect, it } from "vitest";

import { inspectRepositoryCommitIdentity } from "./repository-privacy-identity.mjs";

const maintainerIdentity = {
  authorName: "gromitski",
  authorEmail: ["3911244+gromitski", "users.noreply.github.com"].join("@"),
  committerName: "gromitski",
  committerEmail: ["3911244+gromitski", "users.noreply.github.com"].join("@"),
  hasSignature: false,
};

describe("repository privacy commit identity", () => {
  it("accepts the configured local maintainer identity", () => {
    expect(inspectRepositoryCommitIdentity(maintainerIdentity)).toEqual([]);
  });

  it("accepts a signed GitHub web commit from the maintainer noreply account", () => {
    expect(inspectRepositoryCommitIdentity({
      ...maintainerIdentity,
      authorName: "Public GitHub Profile Name",
      committerName: "GitHub",
      committerEmail: ["noreply", "github.com"].join("@"),
      hasSignature: true,
    })).toEqual([]);
  });

  it("rejects an unsigned commit that imitates GitHub web-flow metadata", () => {
    expect(inspectRepositoryCommitIdentity({
      ...maintainerIdentity,
      authorName: "Public GitHub Profile Name",
      committerName: "GitHub",
      committerEmail: ["noreply", "github.com"].join("@"),
      hasSignature: false,
    })).toContain("HEAD: GitHub web commit is not signed");
  });

  it("rejects a GitHub web commit attributed to another noreply account", () => {
    expect(inspectRepositoryCommitIdentity({
      ...maintainerIdentity,
      authorName: "Another User",
      authorEmail: ["123456+another-user", "users.noreply.github.com"].join("@"),
      committerName: "GitHub",
      committerEmail: ["noreply", "github.com"].join("@"),
      hasSignature: true,
    })).toContain("HEAD: GitHub web author email is not the approved maintainer noreply address");
  });

  it("rejects a local commit with an unexpected identity", () => {
    expect(inspectRepositoryCommitIdentity({
      ...maintainerIdentity,
      authorName: "Unexpected Author",
      authorEmail: ["private", "example.com"].join("@"),
    })).toEqual([
      "HEAD: unexpected author name",
      "HEAD: author email is not the approved maintainer noreply address",
    ]);
  });
});
