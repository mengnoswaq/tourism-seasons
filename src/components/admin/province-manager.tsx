"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  MapPin,
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Check,
  X,
  FileText,
} from "lucide-react";
import {
  createProvince,
  updateProvince,
  toggleProvinceStatus,
  deleteProvince,
  ProvinceInput,
} from "@/actions/provinces";

export interface ProvinceData {
  id: string;
  name: string;
  nameKhmer?: string | null;
  slug: string;
  code?: string | null;
  image?: string | null;
  description?: string | null;
  descriptionKhmer?: string | null;
  status: string;
  _count?: {
    articles: number;
  };
}

interface ProvinceManagerProps {
  initialProvinces: ProvinceData[];
}

export function ProvinceManager({ initialProvinces }: ProvinceManagerProps) {
  const toast = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [provinces, setProvinces] = useState<ProvinceData[]>(initialProvinces);
  const [search, setSearch] = useState("");
  const [editingProvince, setEditingProvince] = useState<ProvinceData | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [nameKhmer, setNameKhmer] = useState("");
  const [code, setCode] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionKhmer, setDescriptionKhmer] = useState("");

  const resetForm = () => {
    setEditingProvince(null);
    setName("");
    setNameKhmer("");
    setCode("");
    setImage("");
    setDescription("");
    setDescriptionKhmer("");
  };

  const startEditing = (p: ProvinceData) => {
    setEditingProvince(p);
    setName(p.name);
    setNameKhmer(p.nameKhmer || "");
    setCode(p.code || "");
    setImage(p.image || "");
    setDescription(p.description || "");
    setDescriptionKhmer(p.descriptionKhmer || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Province English Name is required.", "Validation Error");
      return;
    }

    const payload: ProvinceInput = {
      name: name.trim(),
      nameKhmer: nameKhmer.trim() || undefined,
      code: code.trim() || undefined,
      image: image.trim() || undefined,
      description: description.trim() || undefined,
      descriptionKhmer: descriptionKhmer.trim() || undefined,
      status: editingProvince ? editingProvince.status : "ACTIVE",
    };

    startTransition(async () => {
      let res;
      if (editingProvince) {
        res = await updateProvince(editingProvince.id, payload);
      } else {
        res = await createProvince(payload);
      }

      if (res.success) {
        toast.success(
          editingProvince
            ? `Province "${name}" updated successfully!`
            : `Province "${name}" created successfully!`,
          editingProvince ? "Updated" : "Created"
        );
        resetForm();
        router.refresh();
      } else {
        toast.error(res.error || "Action failed.", "Error");
      }
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string, provName: string) => {
    setProvinces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : p))
    );

    startTransition(async () => {
      const res = await toggleProvinceStatus(id);
      if (res.success) {
        const nextStatus = currentStatus === "ACTIVE" ? "Hidden" : "Shown";
        toast.success(`Province "${provName}" is now ${nextStatus}`, "Status Updated");
        router.refresh();
      } else {
        setProvinces(initialProvinces);
        toast.error(res.error || "Failed to toggle status.", "Error");
      }
    });
  };

  const handleDelete = (id: string, provName: string) => {
    if (!confirm(`Are you sure you want to delete "${provName}" province?`)) return;

    setProvinces((prev) => prev.filter((p) => p.id !== id));

    startTransition(async () => {
      const res = await deleteProvince(id);
      if (res.success) {
        toast.success(`Province "${provName}" deleted.`, "Deleted");
        router.refresh();
      } else {
        setProvinces(initialProvinces);
        toast.error(res.error || "Failed to delete province.", "Error");
      }
    });
  };

  const filtered = provinces.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.nameKhmer && p.nameKhmer.includes(search))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Form: Add / Edit Province */}
      <Card className="bg-white border-slate-200 shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
            {editingProvince ? (
              <>
                <Edit3 className="w-4 h-4 text-[#2791F5]" /> Edit Province ({editingProvince.name})
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 text-[#2791F5]" /> Add Cambodian Province
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {editingProvince && (
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2791F5]">Editing: {editingProvince.name}</span>
                <Button variant="ghost" size="sm" type="button" onClick={resetForm} className="h-6 text-xs p-1">
                  Cancel
                </Button>
              </div>
            )}

            {/* 🇬🇧 English Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                🇬🇧 Province Name (English) *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Siem Reap, Kampot, Mondulkiri"
                required
              />
            </div>

            {/* 🇰🇭 Khmer Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                🇰🇭 Province Name (Khmer)
              </label>
              <Input
                value={nameKhmer}
                onChange={(e) => setNameKhmer(e.target.value)}
                placeholder="e.g. សៀមរាប, កំពត, មណ្ឌលគិរី"
              />
            </div>

            {/* Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Province Code / Abbreviation
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SR, KMP, MDK"
              />
            </div>

            {/* Photo Image URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Cover Photo URL
              </label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            {/* Description English */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Description (English)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Short province summary in English..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/40"
              />
            </div>

            {/* Description Khmer */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Description (Khmer)
              </label>
              <textarea
                value={descriptionKhmer}
                onChange={(e) => setDescriptionKhmer(e.target.value)}
                rows={2}
                placeholder="សេចក្តីពិពណ៌នាអំពីខេត្តជាភាសាខ្មែរ..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/40"
              />
            </div>

            <div className="pt-2">
              {editingProvince ? (
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
                  <PlusCircle className="w-4 h-4" /> Add Province
                </Button>
              )}
            </div>

          </form>
        </CardContent>
      </Card>

      {/* Right Column: Province Table */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#2791F5]" /> Cambodian Provinces ({provinces.length})
            </h2>
            <p className="text-xs text-slate-500">Manage 25 provinces of Cambodia with bilingual titles & stories.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search province..."
              className="pl-9 text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3">Province</th>
                <th className="p-3">Khmer Title (🇰🇭)</th>
                <th className="p-3">Slug</th>
                <th className="p-3 text-center">Stories</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No provinces found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isActive = p.status === "ACTIVE";
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#2791F5]" /> {p.name}
                        {p.code && <Badge variant="outline" className="text-[10px] py-0 px-1">{p.code}</Badge>}
                      </td>
                      <td className="p-3 font-medium text-[#2791F5]">
                        {p.nameKhmer || <span className="text-slate-300 italic">N/A</span>}
                      </td>
                      <td className="p-3 font-mono text-slate-500">{p.slug}</td>
                      <td className="p-3 text-center font-bold text-slate-700">
                        <span className="flex items-center justify-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400" /> {p._count?.articles || 0}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p.id, p.status, p.name)}
                          disabled={isPending}
                          className="cursor-pointer"
                        >
                          {isActive ? (
                            <Badge variant="success" className="gap-1 cursor-pointer">
                              <Eye className="w-3 h-3 text-emerald-600" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="danger" className="gap-1 cursor-pointer bg-red-50 text-red-600 border-red-200">
                              <EyeOff className="w-3 h-3 text-red-500" /> Hidden
                            </Badge>
                          )}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => startEditing(p)}
                            disabled={isPending}
                            className="w-8 h-8 p-0 border-blue-200 text-[#2791F5] hover:bg-blue-50"
                            title="Edit Province"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={isPending}
                            className="w-8 h-8 p-0 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 shadow-none"
                            title="Delete Province"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
