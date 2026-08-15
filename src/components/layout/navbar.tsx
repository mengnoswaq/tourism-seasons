"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

import { NewsTicker } from "@/components/layout/ticker";

interface NavbarProps {
  categories: { id: string; name: string; slug: string }[];
  navItems?: { id: string; label: string; url: string }[];
  headlines?: (string | { title: string; slug?: string })[];
}

export function Navbar({ categories, navItems, headlines }: NavbarProps) {
  const { data: session } = useSession();
  const router = useRouter();
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
  const displayItems = navItems && navItems.length > 0
    ? navItems
    : [
        { id: "all", label: "All News", url: "/" },
        ...categories.map((cat) => ({ id: cat.id, label: cat.name, url: `/category/${cat.slug}` })),
      ];

  return (
    <>
      <NewsTicker headlines={headlines} />
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group py-1">
              <img
                src="/logo.png"
                alt="Tourism Seasons - រដូវកាលទេសចរណ៍"
                className="h-14 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search news, topics, authors..."
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
              {session?.user ? (
                <div className="flex items-center gap-3">
                  {canAccessAdmin && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#2791F5]" />
                        Dashboard
                      </Button>
                    </Link>
                  )}

                  {/* User Avatar & Profile Badge (Clickable to /profile) */}
                  <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                    <Link href="/profile" className="flex items-center gap-2 group" title="Manage Profile">
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
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      Subscribe / Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Dynamic Navigation Bar Items */}
          <nav className="hidden md:flex items-center gap-1 py-2 border-t border-slate-100 overflow-x-auto text-xs font-semibold text-slate-600">
            {displayItems.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className="px-3.5 py-1.5 rounded-lg hover:text-[#2791F5] hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation Drawer */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 space-y-4">
              <form onSubmit={handleSearch} className="flex items-center relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-4 pr-10 text-base md:text-sm text-slate-900 placeholder:text-slate-400"
                />
                <button type="submit" className="absolute right-3 text-slate-400">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              <div className="grid grid-cols-2 gap-2 text-sm font-medium text-slate-700">
                {displayItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg hover:bg-slate-100"
                  >
                    {item.label}
                  </Link>
                ))}
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
                        View Profile
                      </span>
                    </Link>

                    {canAccessAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#2791F5]" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut();
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg w-full text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-1">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center text-sm font-semibold">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="primary" className="w-full justify-center text-sm font-semibold">
                        Subscribe / Register
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
