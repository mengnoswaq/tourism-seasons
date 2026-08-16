"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  Folder,
  PlusCircle,
  Edit3,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { createCategory, updateCategory, toggleCategoryActiveStatus, deleteCategory } from "@/actions/categories";

export interface CategoryData {
  id: string;
  name?: string | null;
  nameKhmer?: string | null;
  slug: string;
  description?: string | null;
  descriptionKhmer?: string | null;
  status?: string | null;
  _count?: {
    articles: number;
  };
}

interface CategoryManagerProps {
  initialCategories: CategoryData[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const toast = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);

  const [name, setName] = useState("");
  const [nameKhmer, setNameKhmer] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionKhmer, setDescriptionKhmer] = useState("");

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const resetForm = () => {
    setEditingCategory(null);
    setName("");
    setNameKhmer("");
    setDescription("");
    setDescriptionKhmer("");
  };

  const startEditing = (cat: CategoryData) => {
    setEditingCategory(cat);
    setName(cat.name || "");
    setNameKhmer(cat.nameKhmer || "");
    setDescription(cat.description || "");
    setDescriptionKhmer(cat.descriptionKhmer || "");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !nameKhmer.trim()) {
      toast.error("Please enter a Category Name in English or Khmer.", "Validation Error");
      return;
    }

    startTransition(async () => {
      let res;
      if (editingCategory) {
        res = await updateCategory(
          editingCategory.id,
          name.trim(),
          description.trim(),
          nameKhmer.trim(),
          descriptionKhmer.trim()
        );
      } else {
        res = await createCategory(
          name.trim(),
          description.trim(),
          nameKhmer.trim(),
          descriptionKhmer.trim()
        );
      }

      if (res.success) {
        toast.success(
          editingCategory
            ? `Category updated successfully!`
            : `Category created successfully!`,
          editingCategory ? "Updated" : "Created"
        );
        resetForm();
        router.refresh();
      } else {
        toast.error(res.error || "Action failed.", "Error");
      }
    });
  };

  const handleToggleStatus = (id: string, currentStatus?: string | null, label?: string) => {
    const activeCurrent = currentStatus !== "INACTIVE";

    setCategories((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: activeCurrent ? "INACTIVE" : "ACTIVE" } : c
      )
    );

    startTransition(async () => {
      const res = await toggleCategoryActiveStatus(id);
      if (res.success) {
        const nextStatus = activeCurrent ? "Inactive" : "Active";
        toast.success(`Category visibility is now ${nextStatus}`, "Status Updated");
        router.refresh();
      } else {
        setCategories(initialCategories);
        toast.error(res.error || "Failed to toggle visibility.", "Update Failed");
      }
    });
  };

  const handleDelete = (id: string, label?: string) => {
    if (!confirm(`Are you sure you want to delete category "${label || id}"?`)) return;

    setCategories((prev) => prev.filter((c) => c.id !== id));

    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res.success) {
        toast.success(`Category deleted successfully!`, "Deleted");
        router.refresh();
      } else {
        setCategories(initialCategories);
        toast.error(res.error || "Failed to delete category.", "Delete Failed");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      
      {/* Form Column: Create / Edit Category */}
      <Card className="bg-white border-slate-200 shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
            {editingCategory ? (
              <>
                <Edit3 className="w-4 h-4 text-[#2791F5]" /> Edit Navbar Category
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 text-[#2791F5]" /> Add Navbar Category (Dual-Language)
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {editingCategory && (
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2791F5]">
                  Editing: {editingCategory.name || editingCategory.nameKhmer}
                </span>
                <Button variant="ghost" size="sm" type="button" onClick={resetForm} className="h-6 text-xs p-1">
                  Cancel
                </Button>
              </div>
            )}

            {/* 🇬🇧 Category Name English */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                🇬🇧 Category Name (English)
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Technology, Destinations"
              />
            </div>

            {/* 🇰🇭 Category Name Khmer */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                🇰🇭 Category Name (Khmer)
              </label>
              <Input
                value={nameKhmer}
                onChange={(e) => setNameKhmer(e.target.value)}
                placeholder="e.g. បច្ចេកវិទ្យា, តំបន់ទេសចរណ៍"
              />
            </div>

            {/* 🇬🇧 Description English */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                🇬🇧 Description (English)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short section summary in English..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50"
              />
            </div>

            {/* 🇰🇭 Description Khmer */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                🇰🇭 Description (Khmer)
              </label>
              <textarea
                rows={2}
                value={descriptionKhmer}
                onChange={(e) => setDescriptionKhmer(e.target.value)}
                placeholder="ការពណ៌នាជាភាសាខ្មែរ..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50"
              />
            </div>

            {/* Form Submit / Cancel Buttons */}
            <div className="pt-2">
              {editingCategory ? (
                <div className="flex gap-2">
                  <Button variant="outline" type="button" onClick={resetForm} className="w-1/2 text-xs">
                    <X className="w-3.5 h-3.5 mr-1" /> Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={isPending} className="w-1/2 text-xs font-bold">
                    <Check className="w-3.5 h-3.5 mr-1" /> Save Update
                  </Button>
                </div>
              ) : (
                <Button variant="primary" type="submit" disabled={isPending} className="w-full text-xs font-bold gap-1.5">
                  <PlusCircle className="w-4 h-4" /> Add Category to Navbar
                </Button>
              )}
            </div>

          </form>
        </CardContent>
      </Card>

      {/* Table Column: Categories List */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Folder className="w-5 h-5 text-[#2791F5]" /> Live Categories &amp; Desks ({categories.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">Click status badge to toggle active visibility</span>
        </div>

        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3">English Name (🇬🇧)</th>
                <th className="p-3">Khmer Name (🇰🇭)</th>
                <th className="p-3">Route Slug</th>
                <th className="p-3 text-center">Articles</th>
                <th className="p-3 text-center">Visibility</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No categories found. Use the form on the left to add your first category!
                  </td>
                </tr>
              ) : (
                categories.map((cat) => {
                  const isActive = cat.status !== "INACTIVE";
                  const isEditingThis = editingCategory?.id === cat.id;
                  const articleCount = cat._count?.articles || 0;

                  return (
                    <tr
                      key={cat.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isEditingThis ? "bg-blue-50/60 font-semibold" : ""
                      }`}
                    >
                      {/* English Name */}
                      <td className="p-3 font-bold text-slate-900">
                        {cat.name || <span className="text-slate-300 italic text-[11px]">N/A</span>}
                      </td>

                      {/* Khmer Name */}
                      <td className="p-3 font-bold text-[#2791F5]">
                        {cat.nameKhmer || <span className="text-slate-300 italic text-[11px]">N/A</span>}
                      </td>

                      {/* Route Slug */}
                      <td className="p-3 font-mono text-slate-500">/category/{cat.slug}</td>

                      {/* Article Count */}
                      <td className="p-3 text-center font-bold text-[#2791F5]">
                        <Badge variant="outline">{articleCount}</Badge>
                      </td>

                      {/* Active / Inactive Status Toggle */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat.id, cat.status, cat.name || cat.nameKhmer || cat.id)}
                          disabled={isPending}
                          className="cursor-pointer"
                        >
                          {isActive ? (
                            <Badge variant="success" className="gap-1 cursor-pointer">
                              <Eye className="w-3 h-3 text-emerald-600" /> Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="danger"
                              className="gap-1 cursor-pointer bg-red-50 text-red-600 border-red-200"
                            >
                              <EyeOff className="w-3 h-3 text-red-500" /> Inactive
                            </Badge>
                          )}
                        </button>
                      </td>

                      {/* Action Buttons: Edit & Delete */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => startEditing(cat)}
                            disabled={isPending}
                            className="w-8 h-8 p-0 rounded-lg border-blue-200 text-[#2791F5] hover:bg-blue-50"
                            title="Edit Category"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            type="button"
                            onClick={() => handleDelete(cat.id, cat.name || cat.nameKhmer || cat.id)}
                            disabled={isPending || articleCount > 0}
                            className="w-8 h-8 p-0 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 shadow-none disabled:opacity-30"
                            title={articleCount > 0 ? "Cannot delete category with associated articles" : "Delete Category"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
