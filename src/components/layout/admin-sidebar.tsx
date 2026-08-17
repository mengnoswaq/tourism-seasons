"use client";

import React, { useState, useEffect } from "react";
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
  X,
  Settings,
  Tag,
  UserCircle,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer automatically when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const userRole = (session?.user as any)?.role || "USER";

  const navItems = [
    { label: t("Dashboard & Analytics", "ផ្ទាំងគ្រប់គ្រង & វិភាគ"), href: "/admin", icon: LayoutDashboard },
    { label: t("Articles & Status", "អត្ថបទ & ស្ថានភាព"), href: "/admin/articles", icon: Newspaper },
    { label: t("Create Story", "បង្កើតអត្ថបទថ្មី"), href: "/admin/articles/create", icon: PlusCircle },
    { label: t("Provinces Control", "គ្រប់គ្រង ២៥ ខេត្ត"), href: "/admin/provinces", icon: Tag, roles: ["SUPERADMIN", "ADMIN"] },
    { label: t("Reader Comments", "មតិអ្នកអាន"), href: "/admin/comments", icon: Users, roles: ["SUPERADMIN", "ADMIN"] },
    { label: t("Navbar Menu", "ម៉ឺនុយ របាររកមើល"), href: "/admin/navbar", icon: Menu, roles: ["SUPERADMIN", "ADMIN"] },
    { label: t("Categories", "ប្រភេទព័ត៌មាន"), href: "/admin/categories", icon: Folder, roles: ["SUPERADMIN", "ADMIN"] },
    { label: t("User Roles", "តួនាទីអ្នកប្រើប្រាស់"), href: "/admin/users", icon: Users, roles: ["SUPERADMIN", "ADMIN"] },
    { label: t("Site Settings", "ការកំណត់គេហទំព័រ"), href: "/admin/settings", icon: Settings, roles: ["SUPERADMIN", "ADMIN"] },
    { label: t("Edit My Profile", "កែប្រែប្រវត្តិរូបខ្ញុំ"), href: "/admin/profile", icon: UserCircle },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <>
      {/* ========================================== */}
      {/* 1. Mobile & Tablet Top Bar (< lg screen)   */}
      {/* ========================================== */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/admin" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Tourism Seasons Admin Dashboard"
            className="h-8 w-auto object-contain shrink-0"
          />
          <div className="flex flex-col">
            <span className="font-black text-xs tracking-tight text-slate-900 leading-none">
              ADMIN<span className="text-[#2791F5]">PANEL</span>
            </span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">
              Tourism Seasons
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {session?.user && (
            <Avatar src={session.user.image} fallback={session.user.name || "U"} size="sm" />
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-600 rounded-xl hover:bg-slate-100 focus:outline-none transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. Mobile & Tablet Slide-Over Drawer      */}
      {/* ========================================== */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Menu Panel */}
          <div className="relative bg-white w-72 max-w-[85vw] h-full flex flex-col justify-between z-50 shadow-2xl transition-transform duration-300 p-4 space-y-4">
            <div>
              {/* Mobile Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-2">
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
                  <img src="/logo.png" alt="Logo" className="h-9 w-auto object-contain" />
                  <div className="flex flex-col">
                    <span className="font-black text-sm tracking-tight text-slate-900 leading-none">
                      ADMIN<span className="text-[#2791F5]">PANEL</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                      Tourism Seasons
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="space-y-1">
                {filteredNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200",
                        isActive
                          ? "bg-[#2791F5] text-white shadow-md shadow-[#2791F5]/25"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-[#2791F5]")} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#2791F5] hover:bg-blue-50 transition-colors"
              >
                <Globe className="w-4 h-4 text-[#2791F5] shrink-0" />
                <span>{t("View Live Website", "មើលគេហទំព័រផ្ទាល់")}</span>
              </Link>

              {session?.user && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 group">
                  <Link
                    href="/admin/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 overflow-hidden flex-1 cursor-pointer"
                  >
                    <Avatar src={session.user.image} fallback={session.user.name || "U"} size="sm" />
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-slate-900 truncate group-hover:text-[#2791F5] transition-colors">{session.user.name}</span>
                      <span className="text-[10px] text-[#2791F5] font-semibold">{userRole}</span>
                    </div>
                  </Link>

                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200 transition-colors shrink-0"
                    title={t("Sign Out", "ចាកចេញ")}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. Desktop Sticky Sidebar (≥ lg screen)    */}
      {/* ========================================== */}
      <aside
        className={cn(
          "hidden lg:flex bg-white border-r border-slate-200 h-screen sticky top-0 flex-col justify-between transition-all duration-300 z-30 shadow-sm shrink-0",
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
                className="h-10 w-auto object-contain shrink-0"
              />
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="font-black text-sm tracking-tight text-slate-900 leading-none">
                    ADMIN<span className="text-[#2791F5]">PANEL</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 truncate">
                    Tourism Seasons
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
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
            title={t("View Live Website", "មើលគេហទំព័រផ្ទាល់")}
          >
            <Globe className="w-4 h-4 text-[#2791F5] shrink-0" />
            {!collapsed && <span>{t("View Live Website", "មើលគេហទំព័រផ្ទាល់")}</span>}
          </Link>

          {session?.user && (
            <div className={cn("flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 group hover:bg-slate-100/80 transition-colors", collapsed && "justify-center")}>
              <Link href="/admin/profile" className="flex items-center gap-2.5 overflow-hidden flex-1 cursor-pointer" title={t("Edit Profile", "កែប្រែប្រវត្តិរូប")}>
                <Avatar src={session.user.image} fallback={session.user.name || "U"} size="sm" className="group-hover:ring-2 group-hover:ring-[#2791F5]/40 transition-all" />
                {!collapsed && (
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-bold text-slate-900 truncate group-hover:text-[#2791F5] transition-colors">{session.user.name}</span>
                    <span className="text-[10px] text-[#2791F5] font-semibold">{userRole}</span>
                  </div>
                )}
              </Link>

              {!collapsed && (
                <button
                  onClick={() => signOut()}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200 transition-colors shrink-0"
                  title={t("Sign Out", "ចាកចេញ")}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
