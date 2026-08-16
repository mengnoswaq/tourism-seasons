"use client";

import React, { useState } from "react";
import { updateSiteSettings } from "@/actions/settings";
import { uploadImage } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Image as ImageIcon, Upload, Save, Building, Eye, RefreshCw, Languages } from "lucide-react";

interface SettingsManagerProps {
  initialSettings: {
    id: string;
    siteName: string;
    siteNameKhmer?: string | null;
    siteSubtitle?: string | null;
    siteSubtitleKhmer?: string | null;
    logoUrl?: string | null;
    logoKhmerUrl?: string | null;
    description?: string | null;
    descriptionKhmer?: string | null;
  };
}

export function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const toast = useToast();
  const [siteName, setSiteName] = useState(initialSettings.siteName || "Tourism Seasons");
  const [siteNameKhmer, setSiteNameKhmer] = useState(initialSettings.siteNameKhmer || "រដូវកាលទេសចរណ៍");
  const [siteSubtitle, setSiteSubtitle] = useState(initialSettings.siteSubtitle || "Travel & Seasonal Guides");
  const [siteSubtitleKhmer, setSiteSubtitleKhmer] = useState(initialSettings.siteSubtitleKhmer || "មគ្គុទ្ទេសក៍ទេសចរណ៍");
  const [logoUrl, setLogoUrl] = useState(initialSettings.logoUrl || "/logo.png");
  const [logoKhmerUrl, setLogoKhmerUrl] = useState(initialSettings.logoKhmerUrl || "/logo-khmer.png");
  const [description, setDescription] = useState(
    initialSettings.description ||
      "Discover top travel destinations, seasonal vacation recommendations, local culture, and tourism insights across the world."
  );
  const [descriptionKhmer, setDescriptionKhmer] = useState(
    initialSettings.descriptionKhmer ||
      "ស្វែងរកតំបន់ទេសចរណ៍កំពូលៗ អត្ថបទ និងការណែនាំអំពីការធ្វើដំណើរកម្សាន្តនៅគ្រប់រដូវកាល។"
  );

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const dataUrl = await uploadImage(file, { maxWidth: 800, quality: 0.9 });
      setLogoUrl(dataUrl);
      toast.success("Main logo uploaded successfully! Preview updated.");
    } catch (err) {
      toast.error("Failed to upload logo image.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) {
      toast.error("Site Name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateSiteSettings({
        siteName,
        siteNameKhmer,
        siteSubtitle,
        siteSubtitleKhmer,
        logoUrl,
        logoKhmerUrl,
        description,
        descriptionKhmer,
      });

      if (res.success) {
        toast.success("Site settings & dual-language branding updated successfully!");
      } else {
        toast.error(res.error || "Failed to update site settings.");
      }
    } catch (error) {
      toast.error("An error occurred while saving site settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Settings */}
      <div className="lg:col-span-7 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2 text-[#2791F5] font-bold text-xs uppercase tracking-wider">
                <Building className="w-4 h-4" /> Identity &amp; Dual-Language Branding
              </div>
              <CardTitle className="text-xl font-black text-slate-900">
                Site Name &amp; Identity (English 🇬🇧 / Khmer 🇰🇭)
              </CardTitle>
              <CardDescription>
                Configure the primary project name, subtitle, and description in English and Khmer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* English Site Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  🇬🇧 Site Name (English) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. Tourism Seasons"
                  required
                />
              </div>

              {/* Khmer Site Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  🇰🇭 Site Name (Khmer)
                </label>
                <Input
                  value={siteNameKhmer}
                  onChange={(e) => setSiteNameKhmer(e.target.value)}
                  placeholder="e.g. រដូវកាលទេសចរណ៍"
                />
              </div>

              {/* English Subtitle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  🇬🇧 Subtitle / Tagline (English)
                </label>
                <Input
                  value={siteSubtitle}
                  onChange={(e) => setSiteSubtitle(e.target.value)}
                  placeholder="e.g. Travel & Seasonal Guides"
                />
              </div>

              {/* Khmer Subtitle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  🇰🇭 Subtitle / Tagline (Khmer)
                </label>
                <Input
                  value={siteSubtitleKhmer}
                  onChange={(e) => setSiteSubtitleKhmer(e.target.value)}
                  placeholder="e.g. មគ្គុទ្ទេសក៍ទេសចរណ៍"
                />
              </div>

              {/* English Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  🇬🇧 Description (English)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50 transition-all"
                  placeholder="Brief publication description in English..."
                />
              </div>

              {/* Khmer Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  🇰🇭 Description (Khmer)
                </label>
                <textarea
                  value={descriptionKhmer}
                  onChange={(e) => setDescriptionKhmer(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50 transition-all"
                  placeholder="ការពណ៌នាជាភាសាខ្មែរ..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Logo Upload Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2 text-[#2791F5] font-bold text-xs uppercase tracking-wider">
                <ImageIcon className="w-4 h-4" /> Media &amp; Graphic Assets
              </div>
              <CardTitle className="text-xl font-black text-slate-900">
                Logo Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Main Brand Logo Image</span>
                  <span className="text-[10px] text-slate-400 font-normal">PNG, SVG or WebP</span>
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <div className="w-24 h-24 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Main Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          disabled={isUploadingLogo}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2 pointer-events-none"
                          disabled={isUploadingLogo}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {isUploadingLogo ? "Uploading..." : "Upload New Logo"}
                        </Button>
                      </label>
                      {logoUrl !== "/logo.png" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setLogoUrl("/logo.png")}
                          className="text-xs text-slate-500 hover:text-slate-700"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" /> Reset Default
                        </Button>
                      )}
                    </div>
                    <Input
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Or paste image URL (e.g. /logo.png)"
                      className="text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 text-sm font-bold gap-2 shadow-lg shadow-[#2791F5]/25"
            disabled={isSaving}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving Settings..." : "Save & Update Site Settings"}
          </Button>
        </form>
      </div>

      {/* Live Preview Card */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-slate-200 shadow-sm sticky top-24">
          <CardHeader>
            <div className="flex items-center gap-2 text-[#2791F5] font-bold text-xs uppercase tracking-wider">
              <Eye className="w-4 h-4" /> Real-time Live Preview
            </div>
            <CardTitle className="text-lg font-black text-slate-900">
              Branding Display Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                English Branding (🇬🇧)
              </span>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {logoUrl && (
                    <img src={logoUrl} alt="Logo Preview" className="h-10 w-auto object-contain" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-black text-base tracking-tight text-slate-900 leading-none">
                      {siteName}
                    </span>
                    <span className="text-[9px] tracking-widest text-slate-400 font-semibold uppercase mt-0.5">
                      {siteSubtitle}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2791F5]">
                Khmer Branding (🇰🇭)
              </span>
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {logoUrl && (
                    <img src={logoUrl} alt="Khmer Logo Preview" className="h-10 w-auto object-contain" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-black text-base tracking-tight text-[#2791F5] leading-none">
                      {siteNameKhmer || siteName}
                    </span>
                    <span className="text-[9px] tracking-widest text-slate-500 font-semibold uppercase mt-0.5">
                      {siteSubtitleKhmer || siteSubtitle}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
