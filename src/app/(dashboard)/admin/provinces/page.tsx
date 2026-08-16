import React from "react";
import Link from "next/link";
import { getAllProvincesAdmin } from "@/actions/provinces";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import { ProvinceManager } from "@/components/admin/province-manager";

export default async function AdminProvincesPage() {
  const provinces = await getAllProvincesAdmin();

  const formattedProvinces = provinces.map((p) => ({
    id: p.id,
    name: p.name,
    nameKhmer: p.nameKhmer,
    slug: p.slug,
    code: p.code,
    image: p.image,
    description: p.description,
    descriptionKhmer: p.descriptionKhmer,
    status: p.status,
    _count: p._count,
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
              <MapPin className="w-4 h-4 text-[#2791F5]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">
                Super Admin Province Control
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Cambodia 25 Provinces Management</h1>
            <p className="text-xs text-slate-500">
              Manage bilingual Khmer names, codes, hero images & stories for all provinces of Cambodia.
            </p>
          </div>
        </div>
      </div>

      <ProvinceManager initialProvinces={formattedProvinces} />
    </div>
  );
}
