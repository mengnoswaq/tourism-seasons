import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/actions/articles";

export async function GET() {
  try {
    const { articles } = await getPublishedArticles({ limit: 10 });
    return NextResponse.json({ articles });
  } catch (error) {
    return NextResponse.json({ articles: [] }, { status: 500 });
  }
}
