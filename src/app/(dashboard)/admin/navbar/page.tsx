import React from "react";
import Link from "next/link";
import { getAllNavItems } from "@/actions/navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";
import { NavbarManager } from "@/components/admin/navbar-manager";

import { prisma } from "@/lib/prisma";

export default async function AdminNavbarPage() {
  const [navItems, rawCategories, rawArticles, rawProvinces] = await Promise.all([
    getAllNavItems(),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.article.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, title: true, slug: true },
    }),
    prisma.province.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, nameKhmer: true, slug: true },
    }),
  ]);

  const formattedCategories = rawCategories.map((c) => ({
    id: c.id,
    name: c.name || "Category",
    slug: c.slug,
  }));

  const formattedArticles = rawArticles.map((a) => ({
    id: a.id,
    title: a.title || "Article",
    slug: a.slug,
  }));

  const formattedProvinces = rawProvinces.map((p) => ({
    id: p.id,
    name: p.name || p.nameKhmer || "Province",
    slug: p.slug,
  }));

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="p-2 border-slate-200 text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Menu className="w-4 h-4 text-[#2791F5]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">
                Super Admin Navbar Control
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Header Navigation Bar Management</h1>
            <p className="text-xs text-slate-500">
              Decoupled multi-data type menu management. Support Categories, Specific Articles, Tags, System Routes & Custom URLs.
            </p>
          </div>
        </div>
      </div>

      <NavbarManager
        initialItems={navItems}
        categories={formattedCategories}
        articles={formattedArticles}
        provinces={formattedProvinces}
      />


    </div>
  );
}
