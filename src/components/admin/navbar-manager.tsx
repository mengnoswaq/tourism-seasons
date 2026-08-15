"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { PlusCircle, Eye, EyeOff, Trash2, Edit3, Globe, Check, X } from "lucide-react";
import { createNavItem, updateNavItem, toggleNavItemStatus, deleteNavItem } from "@/actions/navbar";

interface NavItemData {
  id: string;
  label: string;
  url: string;
  order: number;
  status: string;
}

export function NavbarManager({ initialItems }: { initialItems: NavItemData[] }) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  // Create Form State
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newOrder, setNewOrder] = useState<number>(initialItems.length + 1);

  // Editing Item State
  const [editingItem, setEditingItem] = useState<NavItemData | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editOrder, setEditOrder] = useState<number>(0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newUrl.trim()) return;

    startTransition(async () => {
      const res = await createNavItem(newLabel.trim(), newUrl.trim(), newOrder);
      if (res.success) {
        toast.success(`Navbar menu "${newLabel}" created successfully!`, "Navbar Item Created");
        setNewLabel("");
        setNewUrl("");
        setNewOrder(initialItems.length + 2);
      } else {
        toast.error(res.error || "Failed to create navbar item.", "Creation Failed");
      }
    });
  };

  const startEditing = (item: NavItemData) => {
    setEditingItem(item);
    setEditLabel(item.label);
    setEditUrl(item.url);
    setEditOrder(item.order);
  };

  const cancelEditing = () => {
    setEditingItem(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editLabel.trim() || !editUrl.trim()) return;

    startTransition(async () => {
      const res = await updateNavItem(editingItem.id, editLabel.trim(), editUrl.trim(), editOrder);
      if (res.success) {
        toast.success(`Navbar menu "${editLabel}" updated successfully!`, "Navbar Item Updated");
        setEditingItem(null);
      } else {
        toast.error(res.error || "Failed to update navbar item.", "Update Failed");
      }
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string, label: string) => {
    startTransition(async () => {
      const res = await toggleNavItemStatus(id);
      if (res.success) {
        const nextStatus = currentStatus === "ACTIVE" ? "Inactive (Hidden)" : "Active (Shown)";
        toast.success(`Navbar item "${label}" status updated to ${nextStatus}`, "Status Updated");
      } else {
        toast.error(res.error || "Failed to toggle status.", "Update Failed");
      }
    });
  };

  const handleDelete = (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete "${label}" from navbar?`)) return;

    startTransition(async () => {
      const res = await deleteNavItem(id);
      if (res.success) {
        toast.success(`Navbar item "${label}" deleted successfully!`, "Navbar Item Deleted");
      } else {
        toast.error(res.error || "Failed to delete navbar item.", "Delete Failed");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      
      {/* Left Column: Create or Edit Card */}
      <Card className="bg-white border-slate-200 shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
            {editingItem ? (
              <>
                <Edit3 className="w-4 h-4 text-[#2791F5]" /> Edit Navbar Link
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 text-[#2791F5]" /> Add Navbar Link
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingItem ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Menu Label *
                </label>
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  placeholder="e.g. Podcasts, Guides, Opinion"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  URL Path / Route *
                </label>
                <Input
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="e.g. /category/technology or /guides"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Display Order
                </label>
                <Input
                  type="number"
                  value={editOrder}
                  onChange={(e) => setEditOrder(parseInt(e.target.value || "0", 10))}
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" type="button" onClick={cancelEditing} className="w-1/2 text-xs">
                  <X className="w-3.5 h-3.5 mr-1" /> Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isPending} className="w-1/2 text-xs font-bold">
                  <Check className="w-3.5 h-3.5 mr-1" /> Save Update
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Menu Label *
                </label>
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Podcasts, Live TV, Opinion"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  URL / Route Path *
                </label>
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="e.g. /category/technology or /podcasts"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Display Order Position
                </label>
                <Input
                  type="number"
                  value={newOrder}
                  onChange={(e) => setNewOrder(parseInt(e.target.value || "0", 10))}
                  required
                />
              </div>
              <Button variant="primary" type="submit" disabled={isPending} className="w-full text-xs font-bold">
                Add Menu Item to Navbar
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Right Column: Existing Navbar Items Table */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#2791F5]" /> Navbar Items Table ({initialItems.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">Items marked Active display on top Navbar</span>
        </div>

        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs min-w-[550px]">
            <thead className="text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Menu Label</th>
                <th className="p-3">URL Path</th>
                <th className="p-3 text-center">Status / Visibility</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialItems.map((item) => {
                const isActive = item.status !== "INACTIVE";
                const isEditingThis = editingItem?.id === item.id;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isEditingThis ? "bg-blue-50/60 font-semibold" : ""
                    }`}
                  >
                    <td className="p-3 font-mono font-bold text-[#2791F5]">#{item.order}</td>
                    <td className="p-3 font-bold text-slate-900">{item.label}</td>
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
                            <Eye className="w-3 h-3 text-emerald-600" /> Active (Shown)
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="gap-1 cursor-pointer bg-red-50 text-red-600 border-red-200">
                            <EyeOff className="w-3 h-3 text-red-500" /> Inactive (Hidden)
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
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
