import { NextResponse } from "next/server";
import { getCategories } from "@/actions/categories";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}
