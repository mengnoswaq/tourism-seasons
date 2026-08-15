"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Newspaper,
  PlusCircle,
  Folder,
  Users,
  Globe,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const userRole = (session?.user as any)?.role || "USER";

  const navItems = [
    { label: "Dashboard & Analytics", href: "/admin", icon: LayoutDashboard },
    { label: "Articles & Status", href: "/admin/articles", icon: Newspaper },
    { label: "Create Story", href: "/admin/articles/create", icon: PlusCircle },
    { label: "Navbar Menu", href: "/admin/navbar", icon: Menu, roles: ["SUPERADMIN", "ADMIN"] },
    { label: "Categories", href: "/admin/categories", icon: Folder },
    { label: "User Roles", href: "/admin/users", icon: Users, roles: ["SUPERADMIN", "ADMIN"] },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside
      className={cn(
        "bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col justify-between transition-all duration-300 z-30 shadow-sm",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div>
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-100">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
            <img
              src="/logo.png"
              alt="Tourism Seasons Admin Dashboard"
              className={cn("w-auto object-contain transition-all", collapsed ? "h-10" : "h-12")}
            />
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors hidden sm:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200",
                  isActive
                    ? "bg-[#2791F5] text-white shadow-md shadow-[#2791F5]/25"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-[#2791F5]")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-100 space-y-3">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#2791F5] hover:bg-blue-50 transition-colors",
            collapsed && "justify-center"
          )}
          title="View Live Website"
        >
          <Globe className="w-4 h-4 text-[#2791F5] shrink-0" />
          {!collapsed && <span>View Live Website</span>}
        </Link>

        {session?.user && (
          <div className={cn("flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100", collapsed && "justify-center")}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar src={session.user.image} fallback={session.user.name || "U"} size="sm" />
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-slate-900 truncate">{session.user.name}</span>
                  <span className="text-[10px] text-[#2791F5] font-semibold">{userRole}</span>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={() => signOut()}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
