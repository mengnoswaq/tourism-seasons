import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, hasPermission } from "@/lib/auth";
import { getCategories, createCategory, toggleCategoryActiveStatus, deleteCategory } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, FolderPlus, Folder, CheckCircle2, XCircle, Trash2, Globe } from "lucide-react";

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
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
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
                Navbar & Desk Management
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Navigation Bar & Section Desks</h1>
            <p className="text-xs text-slate-500">
              Add new categories to the main Navigation Bar, manage desk descriptions, and toggle Active/Inactive visibility
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Create Category / Navbar Item Form */}
        <Card className="bg-white border-slate-200 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
              <FolderPlus className="w-4 h-4 text-[#2791F5]" /> Add Navbar Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={async (formData) => {
              "use server";
              const name = formData.get("name") as string;
              const description = formData.get("description") as string;
              if (name) {
                await createCategory(name, description);
              }
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Category Name *
                </label>
                <Input name="name" placeholder="e.g. Opinion, Health, Sports" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Description / Desk Summary
                </label>
                <textarea
                  name="description"
                  placeholder="Short section summary..."
                  rows={3}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50"
                />
              </div>
              <Button variant="primary" type="submit" className="w-full text-xs font-bold">
                Add Category to Navbar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Categories & Navbar Table */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Folder className="w-5 h-5 text-[#2791F5]" /> Live Navbar Items & Desks ({categories.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">Active items display in top Header</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3">Category Name</th>
                  <th className="p-3">Slug / Route</th>
                  <th className="p-3">Articles</th>
                  <th className="p-3 text-center">Navbar Visibility</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => {
                  const isActive = cat.status !== "INACTIVE";

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{cat.name}</td>
                      <td className="p-3 font-mono text-slate-500">/category/{cat.slug}</td>
                      <td className="p-3 font-bold text-[#2791F5]">{cat._count.articles}</td>
                      
                      {/* Active / Inactive Status Toggle */}
                      <td className="p-3 text-center">
                        <form action={async () => {
                          "use server";
                          await toggleCategoryActiveStatus(cat.id);
                        }}>
                          <button type="submit" className="cursor-pointer">
                            {isActive ? (
                              <Badge variant="success" className="gap-1 cursor-pointer">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Visible on Navbar
                              </Badge>
                            ) : (
                              <Badge variant="danger" className="gap-1 cursor-pointer bg-red-50 text-red-600 border-red-200">
                                <XCircle className="w-3 h-3 text-red-500" /> Hidden from Navbar
                              </Badge>
                            )}
                          </button>
                        </form>
                      </td>

                      {/* Delete Category Button */}
                      <td className="p-3 text-right">
                        <form action={async () => {
                          "use server";
                          await deleteCategory(cat.id);
                        }} className="inline-block">
                          <Button
                            variant="danger"
                            size="sm"
                            type="submit"
                            disabled={cat._count.articles > 0}
                            className="w-8 h-8 p-0 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 shadow-none disabled:opacity-40"
                            title={cat._count.articles > 0 ? "Cannot delete category with active articles" : "Delete category"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
