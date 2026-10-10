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
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ success: false, message: "URL is required" }, { status: 400 });
    }

    const match = url.match(/^https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/i);
    if (!match) {
      return NextResponse.json({ success: false, message: "Invalid GitHub URL format" }, { status: 400 });
    }

    const [, owner, rawRepo] = match;
    const cleanRepo = rawRepo.replace(/\.git$/, "");

    if (!GITHUB_PARAM_REGEX.test(owner) || !GITHUB_PARAM_REGEX.test(cleanRepo)) {
      return NextResponse.json(
        { success: false, message: "Invalid characters in GitHub repository owner or name" },
        { status: 400 }
      );
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "FYPFinder-App",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
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
          stars: data.stargazers_count,
          forks: data.forks_count,
          language: data.language,
          description: data.description,
        },
      },
      { status: 200 }
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
