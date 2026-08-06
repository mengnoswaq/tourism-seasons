import { NextResponse } from "next/server";
import { getNavItems } from "@/actions/navbar";

export async function GET() {
  try {
    const navItems = await getNavItems();
    return NextResponse.json({ navItems });
  } catch (error) {
    return NextResponse.json({ navItems: [] }, { status: 500 });
  }
}
