import React from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50/50 text-slate-900">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto min-w-0">
        <main className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">{children}</main>
      </div>
    </div>
  );
}
