import React from "react";
import Link from "next/link";
import { getAllNavItems, createNavItem, toggleNavItemStatus, deleteNavItem } from "@/actions/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Menu, PlusCircle, CheckCircle2, XCircle, Trash2, Globe, Eye, EyeOff } from "lucide-react";

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
              Add new links to the top main Navigation Bar, reorder links, and toggle Active/Inactive visibility
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Add Navbar Item Form */}
        <Card className="bg-white border-slate-200 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
              <PlusCircle className="w-4 h-4 text-[#2791F5]" /> Add Navbar Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={async (formData) => {
              "use server";
              const label = formData.get("label") as string;
              const url = formData.get("url") as string;
              const order = parseInt(formData.get("order") as string || "0", 10);
              if (label && url) {
                await createNavItem(label, url, order);
              }
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Menu Label *
                </label>
                <Input name="label" placeholder="e.g. Podcasts, Live TV, Opinion" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  URL / Route Path *
                </label>
                <Input name="url" placeholder="e.g. /category/technology or /podcasts" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Display Order Position
                </label>
                <Input name="order" type="number" defaultValue={navItems.length + 1} placeholder="1" required />
              </div>
              <Button variant="primary" type="submit" className="w-full text-xs font-bold">
                Add Menu Item to Navbar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Navbar Menu Items Table */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#2791F5]" /> Navbar Items Table ({navItems.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">Items marked Active display on top Navbar</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Menu Label</th>
                  <th className="p-3">URL Path</th>
                  <th className="p-3 text-center">Status / Visibility</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {navItems.map((item) => {
                  const isActive = item.status !== "INACTIVE";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#2791F5]">#{item.order}</td>
                      <td className="p-3 font-bold text-slate-900">{item.label}</td>
                      <td className="p-3 font-mono text-slate-500">{item.url}</td>
                      
                      {/* Active / Inactive Status Toggle */}
                      <td className="p-3 text-center">
                        <form action={async () => {
                          "use server";
                          await toggleNavItemStatus(item.id);
                        }}>
                          <button type="submit" className="cursor-pointer">
                            {isActive ? (
                              <Badge variant="success" className="gap-1 cursor-pointer">
                                <Eye className="w-3 h-3 text-emerald-600" /> Active (Shown)
                              </Badge>
                            ) : (
                              <Badge variant="danger" className="gap-1 cursor-pointer bg-red-50 text-red-600 border-red-200">
                                <EyeOff className="w-3 h-3 text-red-500" /> Inactive (Hidden)
                              </Badge>
                            )}
                          </button>
                        </form>
                      </td>

                      {/* Delete Navbar Item Button */}
                      <td className="p-3 text-right">
                        <form action={async () => {
                          "use server";
                          await deleteNavItem(item.id);
                        }} className="inline-block">
                          <Button
                            variant="danger"
                            size="sm"
                            type="submit"
                            className="w-8 h-8 p-0 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 shadow-none"
                            title="Delete Navbar Item"
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
