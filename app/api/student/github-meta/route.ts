import { NextResponse } from "next/server";
import logger from "@/lib/logger";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma/enums";
import { githubMetaRateLimiter } from "@/lib/rate-limit";

const GITHUB_PARAM_REGEX = /^[a-zA-Z0-9_.-]+$/;

export async function GET(req: Request) {
  try {
    const user = await requireRole(UserRole.STUDENT);

    const rateLimit = await githubMetaRateLimiter.checkAsync(`student:${user.id}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many requests. Please try again in ${rateLimit.retryAfter || 60} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter || 60),
          },
        }
      );
    }

    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get("url")?.trim() || "";
    const rawUsername = searchParams.get("username")?.trim() || "";
    const typeParam = searchParams.get("type")?.trim().toLowerCase();

    if (!rawUrl && !rawUsername) {
      return NextResponse.json(
        { success: false, message: "GitHub URL or username is required" },
        { status: 400 }
      );
    }

    // Determine whether this request is for a user profile or a repository
    // Case A: Explicit type="user" or "username" query parameter provided
    if (typeParam === "user" || rawUsername) {
      let username = rawUsername;
      if (!username && rawUrl) {
        // Parse from URL like https://github.com/username or @username
        username = rawUrl
          .replace(/^https?:\/\/(?:www\.)?github\.com\//i, "")
          .replace(/^@/, "")
          .split("/")[0]
          .trim();
      }

      if (!username || !GITHUB_PARAM_REGEX.test(username)) {
        return NextResponse.json(
          { success: false, message: "Invalid GitHub username format" },
          { status: 400 }
        );
      }

      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "FYPFinder-App",
        },
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json(
            { success: false, message: `GitHub user "${username}" was not found` },
            { status: 404 }
          );
        }
        if (response.status === 403) {
          return NextResponse.json(
            { success: false, message: "GitHub API rate limit exceeded. Please try again later." },
            { status: 403 }
          );
        }
        return NextResponse.json(
          { success: false, message: "Failed to fetch GitHub profile metadata" },
          { status: response.status }
        );
      }

      const data = await response.json();

      return NextResponse.json(
        {
          success: true,
          data: {
            type: "user",
            username: data.login,
            name: data.name || null,
            avatarUrl: data.avatar_url,
            bio: data.bio || null,
            publicRepos: typeof data.public_repos === "number" ? data.public_repos : 0,
            followers: typeof data.followers === "number" ? data.followers : 0,
            following: typeof data.following === "number" ? data.following : 0,
            location: data.location || null,
            company: data.company || null,
            profileUrl: data.html_url || `https://github.com/${data.login}`,
          },
        },
        { status: 200 }
      );
    }

    // Case B: URL is provided — check if it is a repository or a user profile URL
    const repoMatch = rawUrl.match(/^https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/i);

    if (repoMatch) {
      const [, owner, rawRepo] = repoMatch;
      const cleanRepo = rawRepo.replace(/\.git$/, "");

      if (!GITHUB_PARAM_REGEX.test(owner) || !GITHUB_PARAM_REGEX.test(cleanRepo)) {
        return NextResponse.json(
          { success: false, message: "Invalid characters in GitHub repository owner or name" },
          { status: 400 }
        );
      }

      const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(cleanRepo)}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "FYPFinder-App",
        },
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json(
            { success: false, message: `Repository "${owner}/${cleanRepo}" was not found` },
            { status: 404 }
          );
        }
        if (response.status === 403) {
          return NextResponse.json(
            { success: false, message: "GitHub API rate limit exceeded. Please try again later." },
            { status: 403 }
          );
        }
        return NextResponse.json(
          { success: false, message: "Failed to fetch repository metadata" },
          { status: response.status }
        );
      }

      const data = await response.json();

      return NextResponse.json(
        {
          success: true,
          data: {
            type: "repo",
            stars: typeof data.stargazers_count === "number" ? data.stargazers_count : 0,
            forks: typeof data.forks_count === "number" ? data.forks_count : 0,
            language: data.language || null,
            description: data.description || null,
          },
        },
        { status: 200 }
      );
    }

    // Check if it's a single-segment user URL like https://github.com/Muhammad-BinMushtaq
    const userMatch = rawUrl.match(/^https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/?$/i);
    if (userMatch) {
      const username = userMatch[1].trim();
      if (!GITHUB_PARAM_REGEX.test(username)) {
        return NextResponse.json(
          { success: false, message: "Invalid characters in GitHub username" },
          { status: 400 }
        );
      }

      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "FYPFinder-App",
        },
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json(
            { success: false, message: `GitHub user "${username}" was not found` },
            { status: 404 }
          );
        }
        if (response.status === 403) {
          return NextResponse.json(
            { success: false, message: "GitHub API rate limit exceeded. Please try again later." },
            { status: 403 }
          );
        }
        return NextResponse.json(
          { success: false, message: "Failed to fetch GitHub profile metadata" },
          { status: response.status }
        );
      }

      const data = await response.json();

      return NextResponse.json(
        {
          success: true,
          data: {
            type: "user",
            username: data.login,
            name: data.name || null,
            avatarUrl: data.avatar_url,
            bio: data.bio || null,
            publicRepos: typeof data.public_repos === "number" ? data.public_repos : 0,
            followers: typeof data.followers === "number" ? data.followers : 0,
            following: typeof data.following === "number" ? data.following : 0,
            location: data.location || null,
            company: data.company || null,
            profileUrl: data.html_url || `https://github.com/${data.login}`,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid GitHub URL. Must be a repository or user profile URL." },
      { status: 400 }
    );
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }
    logger.error("GitHub meta fetch error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
