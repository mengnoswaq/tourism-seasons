import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSiteSettings } from "@/actions/settings";
import { SettingsManager } from "@/components/admin/settings-manager";
import { Settings } from "lucide-react";

export const metadata = {
  title: "Site Settings & Branding | Admin Panel",
};

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || (userRole !== "SUPERADMIN" && userRole !== "ADMIN")) {
    redirect("/admin");
  }

  const { settings } = await getSiteSettings();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-4 h-4 text-[#2791F5]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">
            Global Configuration
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Site Settings &amp; Logo Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your project name, logo image, subtitle, and footer branding dynamically.
        </p>
      </div>

      <SettingsManager initialSettings={settings} />
    </div>
  );
}
