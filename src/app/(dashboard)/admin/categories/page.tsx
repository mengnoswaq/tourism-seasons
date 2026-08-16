import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, hasPermission } from "@/lib/auth";
import { getCategories } from "@/actions/categories";
import { CategoryManager } from "@/components/admin/category-manager";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe } from "lucide-react";

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role as string;

  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    redirect("/admin");
  }

  const categories = await getCategories();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="p-2 border-slate-200 text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-[#2791F5]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">
                Navbar &amp; Desk Management (Dual-Language)
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Navigation Bar &amp; Section Desks</h1>
            <p className="text-xs text-slate-500">
              Add and edit categories in English &amp; Khmer to the main Navigation Bar and manage active visibility
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Category Manager Component */}
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
