"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, LogOut, LayoutDashboard, Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

import { NewsTicker } from "@/components/layout/ticker";
import { useLanguage } from "@/context/language-context";
import { getAdminPath } from "@/lib/admin-route";

interface NavItemType {

  id: string;
  label: string;
  labelKhmer?: string | null;
  url: string;
}

interface NavbarProps {
  categories: { id: string; name: string; slug: string }[];
  navItems?: NavItemType[];
  headlines?: (string | { title: string; slug?: string })[];
  siteSettings?: {
    siteName?: string;
    siteSubtitle?: string | null;
    logoUrl?: string | null;
    logoKhmerUrl?: string | null;
  };
}

export function Navbar({ categories, navItems, headlines, siteSettings }: NavbarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const userRole = (session?.user as any)?.role;
  const canAccessAdmin = userRole === "SUPERADMIN" || userRole === "ADMIN" || userRole === "EDITOR" || userRole === "AUTHOR";

  // Use dynamic navItems from database or fallback to categories
  const displayItems: NavItemType[] = navItems && navItems.length > 0
    ? navItems
    : [
        { id: "all", label: "All News", labelKhmer: "ព័ត៌មានទាំងអស់", url: "/" },
        ...categories.map((cat) => ({ id: cat.id, label: cat.name, url: `/category/${cat.slug}` })),
      ];

  const logoSrc = siteSettings?.logoUrl || "/logo.png";
  const siteTitle = siteSettings?.siteName || "Tourism Seasons";
  const siteSubtitle = siteSettings?.siteSubtitle || "Travel & Seasonal Guides";

  const titleWords = siteTitle.toUpperCase().split(" ");
  const firstWord = titleWords[0] || "";
  const remainingWords = titleWords.slice(1).join(" ");

  return (
    <>
      <NewsTicker headlines={headlines} />
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group py-1">
              <img
                src={logoSrc}
                alt={siteTitle}
                className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-slate-900 leading-none">
                  {firstWord}
                  {remainingWords && <span className="text-[#2791F5] ml-1">{remainingWords}</span>}
                </span>
                <span className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase mt-0.5">
                  {siteSubtitle}
                </span>
              </div>
            </Link>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative max-w-xs w-full">
              <input
                type="text"
                placeholder={t("Search news, topics, authors...", "ស្វែងរកព័ត៌មាន...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-full py-2 pl-4 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#2791F5]/50 transition-all"
              />
              <button type="submit" className="absolute right-3 text-slate-400 hover:text-[#2791F5] transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Right Action buttons */}
            <div className="hidden md:flex items-center gap-3">
              
              {/* Language Switcher Toggle Button */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    lang === "en"
                      ? "bg-white text-[#2791F5] shadow-xs font-extrabold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="Switch to English"
                >
                  🇬🇧 EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang("kh")}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    lang === "kh"
                      ? "bg-[#2791F5] text-white shadow-xs font-extrabold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="ប្តូរទៅភាសាខ្មែរ"
                >
                  🇰🇭 ខ្មែរ
                </button>
              </div>

              {session?.user ? (
                <div className="flex items-center gap-3">
                  {canAccessAdmin && (
                    <Link href={getAdminPath()}>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#2791F5]" />
                        {t("Dashboard", "ផ្ទាំងគ្រប់គ្រង")}
                      </Button>
                    </Link>
                  )}

                  {/* User Avatar & Profile Badge */}
                  <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                    <Link href="/profile" className="flex items-center gap-2 group" title={t("Manage Profile", "គ្រប់គ្រងគណនី")}>
                      <Avatar src={session.user.image} fallback={session.user.name || "U"} size="sm" className="group-hover:ring-2 group-hover:ring-[#2791F5] transition-all" />
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-semibold text-slate-900 leading-tight group-hover:text-[#2791F5] transition-colors">
                          {session.user.name}
                        </span>
                        <span className="text-[10px] text-[#2791F5] font-medium capitalize">
                          {userRole?.toLowerCase()}
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-100 ml-1"
                      title={t("Sign Out", "ចាកចេញ")}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      {t("Sign In", "ចូលប្រើ")}
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      {t("Subscribe / Register", "ចុះឈ្មោះ")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              {/* Mobile Language Switcher */}
              <button
                type="button"
                onClick={() => setLang(lang === "en" ? "kh" : "en")}
                className="p-2 text-xs font-bold bg-slate-100 text-slate-800 rounded-lg border border-slate-200"
              >
                {lang === "en" ? "🇰🇭 ខ្មែរ" : "🇬🇧 EN"}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 rounded-lg hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Dynamic Navigation Bar Items */}
          <nav className="hidden md:flex items-center py-2 border-t border-slate-100 text-xs font-semibold text-slate-600 overflow-x-auto gap-1">
            {displayItems.map((item) => {
              const displayLabel = lang === "kh" && item.labelKhmer ? item.labelKhmer : item.label;

              return (
                <Link
                  key={item.id}
                  href={item.url}
                  className="px-3.5 py-1.5 rounded-lg hover:text-[#2791F5] hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  {displayLabel}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Navigation Drawer */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 space-y-4">
              <form onSubmit={handleSearch} className="flex items-center relative">
                <input
                  type="text"
                  placeholder={t("Search articles...", "ស្វែងរកអត្ថបទ...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-4 pr-10 text-base md:text-sm text-slate-900 placeholder:text-slate-400"
                />
                <button type="submit" className="absolute right-3 text-slate-400">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              <div className="grid grid-cols-2 gap-2 text-sm font-medium text-slate-700">
                {displayItems.map((item) => {
                  const displayLabel = lang === "kh" && item.labelKhmer ? item.labelKhmer : item.label;

                  return (
                    <Link
                      key={item.id}
                      href={item.url}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg hover:bg-slate-100"
                    >
                      {displayLabel}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                {session?.user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={session.user.image} fallback={session.user.name || "U"} size="sm" />
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-semibold text-slate-900 leading-tight">
                            {session.user.name}
                          </span>
                          <span className="text-[11px] text-[#2791F5] font-medium capitalize">
                            {userRole?.toLowerCase()}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-white rounded-md border border-slate-200">
                        {t("View Profile", "មើលគណនី")}
                      </span>
                    </Link>

                    {canAccessAdmin && (
                      <Link
                        href={getAdminPath()}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#2791F5]" /> {t("Admin Dashboard", "ផ្ទាំងគ្រប់គ្រង")}
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut();
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg w-full text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> {t("Sign Out", "ចាកចេញ")}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-1">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center text-sm font-semibold">
                        {t("Sign In", "ចូលប្រើ")}
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="primary" className="w-full justify-center text-sm font-semibold">
                        {t("Subscribe / Register", "ចុះឈ្មោះ")}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
