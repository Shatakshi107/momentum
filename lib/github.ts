// Minimal GitHub REST client for reading public PRs.
// A GITHUB_TOKEN (any classic/fine-grained read-only token) raises the rate limit
// from 60 to 5000 requests/hour. Without one, public PRs still work.

export type PullRequest = {
  url: string;
  title: string;
  body: string;
  author: string;
  files: { filename: string; status: string; additions: number; deletions: number; patch?: string }[];
};

const MAX_PATCH_CHARS = 120_000; // keep huge PRs from blowing up the prompt

export function parsePrUrl(prUrl: string): { owner: string; repo: string; number: number } {
  const m = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!m) throw new Error("Expected a URL like https://github.com/owner/repo/pull/123");
  return { owner: m[1], repo: m[2], number: Number(m[3]) };
}

async function gh<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "momentum-hackathon",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${path}`);
  return res.json() as Promise<T>;
}

export async function fetchPullRequest(prUrl: string): Promise<PullRequest> {
  const { owner, repo, number } = parsePrUrl(prUrl);
  const pr = await gh<{ title: string; body: string | null; user: { login: string } }>(
    `/repos/${owner}/${repo}/pulls/${number}`,
  );
  const files = await gh<PullRequest["files"]>(`/repos/${owner}/${repo}/pulls/${number}/files?per_page=100`);

  let budget = MAX_PATCH_CHARS;
  const trimmed = files.map((f) => {
    const patch = f.patch ?? "";
    const keep = patch.slice(0, Math.max(0, budget));
    budget -= keep.length;
    return { ...f, patch: keep.length < patch.length ? keep + "\n…[truncated]" : keep };
  });

  return { url: prUrl, title: pr.title, body: pr.body ?? "", author: pr.user.login, files: trimmed };
}

export function prToPrompt(pr: PullRequest): string {
  const files = pr.files
    .map((f) => `### ${f.filename} (${f.status}, +${f.additions}/-${f.deletions})\n\`\`\`diff\n${f.patch ?? ""}\n\`\`\``)
    .join("\n\n");
  return `PR: ${pr.title}\nAuthor: ${pr.author}\nURL: ${pr.url}\n\nDescription:\n${pr.body || "(none)"}\n\nChanged files:\n${files}`;
}

export type LiveIssue = {
  id: string;
  repo: string;
  title: string;
  labels: string[];
  url: string;
  comments: number;
  assigned: boolean;
  opened: string;
  body_excerpt: string;
};

// Real, currently open "good first issue"s from a public repo (GitHub search is case-insensitive on labels).
export async function fetchGoodFirstIssues(repo: string, limit = 12): Promise<LiveIssue[]> {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error("Use the form owner/repo, e.g. huggingface/diffusers");
  const q = encodeURIComponent(`repo:${repo} is:issue is:open label:"good first issue"`);
  const data = await gh<{ items: { number: number; title: string; html_url: string; comments: number; assignee: unknown; created_at: string; body: string | null; labels: { name: string }[] }[] }>(
    `/search/issues?q=${q}&sort=created&order=desc&per_page=${limit}`,
  );
  return data.items.map((i) => ({
    id: `#${i.number}`,
    repo,
    title: i.title,
    labels: i.labels.map((l) => l.name),
    url: i.html_url,
    comments: i.comments,
    assigned: Boolean(i.assignee),
    opened: i.created_at.slice(0, 10),
    body_excerpt: (i.body ?? "").replace(/\s+/g, " ").slice(0, 500),
  }));
}
