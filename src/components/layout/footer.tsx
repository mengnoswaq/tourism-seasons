import React from "react";
import Link from "next/link";
import { Globe, ShieldCheck, Mail, Rss } from "lucide-react";

interface FooterProps {
  siteSettings?: {
    siteName?: string;
    description?: string | null;
    logoUrl?: string | null;
  };
}

export function Footer({ siteSettings }: FooterProps = {}) {
  const logo = siteSettings?.logoUrl || "/logo.png";
  const title = siteSettings?.siteName || "Tourism Seasons";
  const desc =
    siteSettings?.description ||
    "Discover top travel destinations, seasonal vacation recommendations, local culture, and tourism insights across the world.";

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1 */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-white p-2 rounded-xl shadow-md group-hover:scale-105 transition-transform">
                <img
                  src={logo}
                  alt={title}
                  className="h-10 w-auto object-contain"
                />
              </div>
              <span className="font-bold text-lg text-white group-hover:text-[#2791F5] transition-colors">
                {title.toUpperCase()}
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              {desc}
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Sections</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/category/technology" className="hover:text-white transition-colors">Technology & AI</Link></li>
              <li><Link href="/category/world" className="hover:text-white transition-colors">World News</Link></li>
              <li><Link href="/category/business" className="hover:text-white transition-colors">Business & Finance</Link></li>
              <li><Link href="/category/science" className="hover:text-white transition-colors">Science & Cosmos</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Editorial & Governance</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Editorial Standards</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ethics & Fact Checking</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers & Internships</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press Room</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Newsletter Dispatch</h4>
            <p className="text-xs text-slate-400 mb-3">
              Get our daily morning briefing directly in your inbox.
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter your work email"
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2791F5]"
              />
              <button
                type="button"
                className="bg-[#2791F5] hover:bg-[#1b73c7] text-white text-xs font-semibold py-2 rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Tourism Seasons. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="/sitemap.xml" className="hover:text-slate-400">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
