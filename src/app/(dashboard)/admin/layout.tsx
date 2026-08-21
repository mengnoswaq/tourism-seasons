import React from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role?.toUpperCase();
  const allowedRoles = ["SUPERADMIN", "ADMIN", "EDITOR", "AUTHOR"];

  // Strictly block USER role and unauthenticated users with HTTP 404 Not Found
  if (!session?.user || !userRole || !allowedRoles.includes(userRole)) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50/50 text-slate-900">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto min-w-0">
        <main className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">{children}</main>
      </div>
    </div>
  );
}
