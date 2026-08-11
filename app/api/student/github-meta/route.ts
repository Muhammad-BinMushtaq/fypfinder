import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ success: false, message: "URL is required" }, { status: 400 });
    }

    let match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return NextResponse.json({ success: false, message: "Invalid GitHub URL" }, { status: 400 });
    }

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, "");

    const response = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "FYPFinder-App",
      },
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
  } catch (error) {
    logger.error("GitHub meta fetch error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
