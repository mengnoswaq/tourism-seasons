import React from "react";
import Link from "next/link";
import { getAllNavItems } from "@/actions/navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";
import { NavbarManager } from "@/components/admin/navbar-manager";

export default async function AdminNavbarPage() {
  const navItems = await getAllNavItems();

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
              Add new links, edit menu items, adjust display order, and toggle Active/Inactive visibility
            </p>
          </div>
        </div>
      </div>

      <NavbarManager initialItems={navItems} />

    </div>
  );
}
