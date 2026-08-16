"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  PlusCircle,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Globe,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Link2,
  AlertTriangle,
  FolderTree,
  FileText,
  Tag as TagIcon,
  Compass,
  Languages,
} from "lucide-react";
import {
  createNavItem,
  updateNavItem,
  toggleNavItemStatus,
  deleteNavItem,
  reorderNavItems,
  deleteAllNavItems,
  NavItemInput,
} from "@/actions/navbar";

export interface NavItemData {
  id: string;
  label: string;
  labelKhmer?: string | null;
  type?: string | null;
  targetId?: string | null;
  url: string;
  order: number;
  status: string;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ArticleOption {
  id: string;
  title: string;
  slug: string;
}

interface ProvinceOption {
  id: string;
  name: string;
  slug: string;
}

interface NavbarManagerProps {
  initialItems: NavItemData[];
  categories?: CategoryOption[];
  articles?: ArticleOption[];
  provinces?: ProvinceOption[];
}

const SYSTEM_PAGES = [
  { label: "Home", labelKhmer: "ទំព័រដើម", url: "/", icon: "🏡" },
  { label: "Search News", labelKhmer: "ស្វែងរក", url: "/search", icon: "🔍" },
  { label: "User Profile", labelKhmer: "ប្រវត្តិរូប", url: "/profile", icon: "👤" },
];

export function NavbarManager({
  initialItems,
  categories = [],
  articles = [],
  provinces = [],
}: NavbarManagerProps) {
  const toast = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local synced state for responsive updates
  const [items, setItems] = useState<NavItemData[]>(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Form Decoupled State
  const [selectedType, setSelectedType] = useState<string>("CATEGORY");
  const [targetId, setTargetId] = useState<string>("");
  const [label, setLabel] = useState<string>("");
  const [labelKhmer, setLabelKhmer] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [order, setOrder] = useState<number>(initialItems.length + 1);

  // Editing Item State
  const [editingItem, setEditingItem] = useState<NavItemData | null>(null);

  // When Data Type changes, reset selection
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setTargetId("");
    setLabel("");
    setLabelKhmer("");
    setUrl("");
  };

  // Data Type Entity Handlers (Emits default English & Khmer labels + resolved URL)
  const handleCategorySelect = (catId: string) => {
    setTargetId(catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      setLabel(cat.name);
      setUrl(`/category/${cat.slug}`);
    }
  };

  const handleArticleSelect = (artId: string) => {
    setTargetId(artId);
    const art = articles.find((a) => a.id === artId);
    if (art) {
      setLabel(art.title);
      setUrl(`/articles/${art.slug}`);
    }
  };

  const handleProvinceSelect = (provId: string) => {
    setTargetId(provId);
    const prov = provinces.find((p) => p.id === provId);
    if (prov) {
      setLabel(`📍 ${prov.name}`);
      setUrl(`/province/${prov.slug}`);
    }
  };

  const handleSystemPageSelect = (sysUrl: string) => {
    const sys = SYSTEM_PAGES.find((s) => s.url === sysUrl);
    if (sys) {
      setLabel(sys.label);
      setLabelKhmer(sys.labelKhmer || "");
      setUrl(sys.url);
      setTargetId(sys.url);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setSelectedType("CATEGORY");
    setTargetId("");
    setLabel("");
    setLabelKhmer("");
    setUrl("");
    setOrder(items.length + 1);
  };

  const startEditing = (item: NavItemData) => {
    setEditingItem(item);
    setSelectedType(item.type || "CUSTOM");
    setTargetId(item.targetId || "");
    setLabel(item.label);
    setLabelKhmer(item.labelKhmer || "");
    setUrl(item.url);
    setOrder(item.order);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) {
      toast.error("Please fill in both English Menu Label and URL Path.", "Validation Error");
      return;
    }

    const payload: NavItemInput = {
      label: label.trim(),
      labelKhmer: labelKhmer.trim() || undefined,
      type: selectedType,
      targetId: targetId || undefined,
      url: url.trim(),
      order,
    };

    startTransition(async () => {
      let res;
      if (editingItem) {
        res = await updateNavItem(editingItem.id, payload);
      } else {
        res = await createNavItem(payload);
      }

      if (res.success) {
        toast.success(
          editingItem
            ? `Navbar menu "${label}" updated successfully!`
            : `Navbar menu "${label}" created successfully!`,
          editingItem ? "Updated" : "Created"
        );
        resetForm();
        router.refresh();
      } else {
        toast.error(res.error || "Action failed.", "Error");
      }
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string, itemLabel: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : item
      )
    );

    startTransition(async () => {
      const res = await toggleNavItemStatus(id);
      if (res.success) {
        const nextStatus = currentStatus === "ACTIVE" ? "Hidden" : "Shown";
        toast.success(`Navbar item "${itemLabel}" is now ${nextStatus}`, "Status Updated");
        router.refresh();
      } else {
        setItems(initialItems);
        toast.error(res.error || "Failed to toggle status.", "Update Failed");
      }
    });
  };

  const handleDelete = (id: string, itemLabel: string) => {
    if (!confirm(`Are you sure you want to delete "${itemLabel}" from the navbar?`)) return;

    setItems((prev) => prev.filter((i) => i.id !== id));

    startTransition(async () => {
      const res = await deleteNavItem(id);
      if (res.success) {
        toast.success(`Navbar item "${itemLabel}" deleted successfully!`, "Deleted");
        router.refresh();
      } else {
        setItems(initialItems);
        toast.error(res.error || "Failed to delete navbar item.", "Delete Failed");
      }
    });
  };

  const handleClearAll = () => {
    if (!confirm("Are you sure you want to clear ALL navbar items? This action cannot be undone.")) return;

    setItems([]);

    startTransition(async () => {
      const res = await deleteAllNavItems();
      if (res.success) {
        toast.success("All navbar items cleared successfully!", "Cleared");
        router.refresh();
      } else {
        setItems(initialItems);
        toast.error(res.error || "Failed to clear navbar items.", "Clear Failed");
      }
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === items.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...items];

    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setItems(reordered);

    startTransition(async () => {
      const payload = reordered.map((item) => ({ id: item.id, order: item.order }));
      const res = await reorderNavItems(payload);
      if (res.success) {
        toast.success("Navbar display order updated!", "Order Saved");
        router.refresh();
      } else {
        setItems(initialItems);
        toast.error(res.error || "Failed to reorder items.", "Reorder Failed");
      }
    });
  };

  const getTypeBadge = (type?: string | null) => {
    switch (type) {
      case "CATEGORY":
        return (
          <Badge variant="brand" className="gap-1 bg-blue-50 text-blue-700 border-blue-200">
            <FolderTree className="w-3 h-3" /> Category
          </Badge>
        );
      case "ARTICLE":
        return (
          <Badge variant="success" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
            <FileText className="w-3 h-3" /> Article
          </Badge>
        );
      case "PROVINCE":
        return (
          <Badge className="gap-1 bg-purple-50 text-purple-700 border-purple-200">
            <Compass className="w-3 h-3" /> Province
          </Badge>
        );
      case "SYSTEM_PAGE":
        return (
          <Badge className="gap-1 bg-amber-50 text-amber-700 border-amber-200">
            <Compass className="w-3 h-3" /> System
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 text-slate-600">
            <Link2 className="w-3 h-3" /> Custom
          </Badge>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      
      {/* Left Column: Dual-Language Multi-Data Type Form */}
      <Card className="bg-white border-slate-200 shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
            {editingItem ? (
              <>
                <Edit3 className="w-4 h-4 text-[#2791F5]" /> Edit Navbar Menu Link (Dual-Language)
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 text-[#2791F5]" /> Add Navbar Menu Link (Dual-Language)
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {editingItem && (
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2791F5]">Editing: {editingItem.label}</span>
                <Button variant="ghost" size="sm" type="button" onClick={resetForm} className="h-6 text-xs p-1">
                  Cancel
                </Button>
              </div>
            )}

            {/* LAYER 1: DATA TYPE SELECTION */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2791F5]" /> 1. Select Link Data Type
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleTypeChange("CATEGORY")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    selectedType === "CATEGORY"
                      ? "bg-white text-[#2791F5] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📂 Category
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("ARTICLE")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    selectedType === "ARTICLE"
                      ? "bg-white text-emerald-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📰 Article
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("PROVINCE")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    selectedType === "PROVINCE"
                      ? "bg-white text-purple-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📍 Province
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("SYSTEM_PAGE")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    selectedType === "SYSTEM_PAGE"
                      ? "bg-white text-amber-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ⚙️ System
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("CUSTOM")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 col-span-2 ${
                    selectedType === "CUSTOM"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🔗 Custom Link / URL
                </button>
              </div>
            </div>

            {/* LAYER 2: ENTITY SELECTION */}
            {selectedType === "CATEGORY" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Category Entity *
                </label>
                <select
                  value={targetId}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/40"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      📂 {c.name} (/category/{c.slug})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedType === "ARTICLE" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Article Story Entity *
                </label>
                <select
                  value={targetId}
                  onChange={(e) => handleArticleSelect(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/40"
                >
                  <option value="">-- Choose Published Article --</option>
                  {articles.map((a) => (
                    <option key={a.id} value={a.id}>
                      📰 {a.title} (/articles/{a.slug})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedType === "PROVINCE" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Cambodian Province Entity *
                </label>
                <select
                  value={targetId}
                  onChange={(e) => handleProvinceSelect(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/40"
                >
                  <option value="">-- Choose Province --</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      📍 {p.name} (/province/{p.slug})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedType === "SYSTEM_PAGE" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Built-in System Route *
                </label>
                <select
                  value={targetId}
                  onChange={(e) => handleSystemPageSelect(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/40"
                >
                  <option value="">-- Choose Built-in Route --</option>
                  {SYSTEM_PAGES.map((s) => (
                    <option key={s.url} value={s.url}>
                      {s.icon} {s.label} ({s.url})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* LAYER 3: 2-LANGUAGE MENU CONFIGURATION */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <span className="text-[10px] uppercase tracking-widest text-[#2791F5] font-extrabold flex items-center gap-1">
                <Languages className="w-3.5 h-3.5" /> 2. Dual-Language Menu Configuration
              </span>

              {/* 🇬🇧 English Label */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  🇬🇧 English Menu Label *
                </label>
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Technology, Destinations, Special Feature"
                  required
                />
              </div>

              {/* 🇰🇭 Khmer Label */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  🇰🇭 Khmer Menu Label (Optional)
                </label>
                <Input
                  value={labelKhmer}
                  onChange={(e) => setLabelKhmer(e.target.value)}
                  placeholder="e.g. បច្ចេកវិទ្យា, តំបន់ទេសចរណ៍, ព័ត៌មាន"
                />
              </div>

              {/* Resolved URL Path */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5 text-slate-400" /> Resolved URL Path *
                </label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. /category/technology or /articles/slug"
                  required
                />
              </div>

              {/* Display Order Position */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Display Order Position
                </label>
                <Input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value || "0", 10))}
                  required
                />
              </div>
            </div>

            {/* Action Submit Buttons */}
            <div className="pt-2">
              {editingItem ? (
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
                  <PlusCircle className="w-4 h-4" /> Add Item to Navbar
                </Button>
              )}
            </div>

          </form>
        </CardContent>
      </Card>

      {/* Right Column: Existing Navbar Items Table */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#2791F5]" /> Header Navbar Menu Items ({items.length})
          </h2>

          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleClearAll}
              disabled={isPending}
              className="text-xs text-red-600 border-red-200 hover:bg-red-50 gap-1 font-semibold"
              title="Delete all navbar links"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Clear All Items
            </Button>
          )}
        </div>

        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3 w-20">Order</th>
                <th className="p-3">Data Type</th>
                <th className="p-3">English Label (🇬🇧)</th>
                <th className="p-3">Khmer Label (🇰🇭)</th>
                <th className="p-3">URL Path</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Globe className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-600">Navbar is currently empty!</p>
                      <p className="text-xs text-slate-400">Use the dual-language form on the left to add items.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const isActive = item.status !== "INACTIVE";
                  const isEditingThis = editingItem?.id === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isEditingThis ? "bg-blue-50/60 font-semibold" : ""
                      }`}
                    >
                      {/* Order column */}
                      <td className="p-3 font-mono font-bold text-[#2791F5] flex items-center gap-1">
                        <span>#{item.order}</span>
                        <div className="flex flex-col ml-1">
                          <button
                            type="button"
                            onClick={() => handleMove(index, "up")}
                            disabled={index === 0 || isPending}
                            className="p-0.5 text-slate-400 hover:text-[#2791F5] disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(index, "down")}
                            disabled={index === items.length - 1 || isPending}
                            className="p-0.5 text-slate-400 hover:text-[#2791F5] disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Data Type Badge */}
                      <td className="p-3">{getTypeBadge(item.type)}</td>

                      {/* English Label */}
                      <td className="p-3 font-bold text-slate-900">{item.label}</td>

                      {/* Khmer Label */}
                      <td className="p-3 font-medium text-[#2791F5]">
                        {item.labelKhmer || <span className="text-slate-300 italic text-[11px]">N/A</span>}
                      </td>

                      {/* URL Path */}
                      <td className="p-3 font-mono text-slate-500">{item.url}</td>

                      {/* Active / Inactive Status Toggle */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item.id, item.status, item.label)}
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
                            onClick={() => startEditing(item)}
                            disabled={isPending}
                            className="w-8 h-8 p-0 rounded-lg border-blue-200 text-[#2791F5] hover:bg-blue-50"
                            title="Edit Navbar Item"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            type="button"
                            onClick={() => handleDelete(item.id, item.label)}
                            disabled={isPending}
                            className="w-8 h-8 p-0 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 shadow-none"
                            title="Delete Navbar Item"
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
