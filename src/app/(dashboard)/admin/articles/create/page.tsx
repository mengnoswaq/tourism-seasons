"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createArticle } from "@/actions/articles";
import { getCategories } from "@/actions/categories";
import { getProvinces } from "@/actions/provinces";
import { uploadImage } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Upload, CheckCircle, PlusCircle } from "lucide-react";

import { useToast } from "@/components/ui/toast";

export default function CreateArticlePage() {
  const router = useRouter();
  const toast = useToast();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [provinces, setProvinces] = useState<{ id: string; name: string; nameKhmer?: string | null }[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [galleryImages, setGalleryImages] = useState<{ url: string; caption: string }[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newGalleryCaption, setNewGalleryCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    getCategories().then((data) => setCategories(data));
    getProvinces().then((data) => setProvinces(data));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setCoverImageUrl(url);
    } catch (err) {
      alert("Failed to process cover image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsGalleryUploading(true);
    try {
      const uploadedImages = await Promise.all(
        Array.from(files).map(async (file) => {
          const url = await uploadImage(file);
          return { url, caption: newGalleryCaption };
        })
      );
      setGalleryImages((prev) => [...prev, ...uploadedImages]);
      setNewGalleryUrl("");
      setNewGalleryCaption("");
    } catch (err) {
      alert("Failed to upload gallery images.");
    } finally {
      setIsGalleryUploading(false);
      e.target.value = "";
    }
  };

  const addGalleryImageByUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setGalleryImages((prev) => [...prev, { url: newGalleryUrl.trim(), caption: newGalleryCaption.trim() }]);
    setNewGalleryUrl("");
    setNewGalleryCaption("");
  };

  const moveGalleryImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= galleryImages.length) return;
    setGalleryImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Mouse Drag and Drop Reordering Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    setGalleryImages((prev) => {
      const updated = [...prev];
      const [draggedItem] = updated.splice(draggedIndex, 1);
      updated.splice(dropIndex, 0, draggedItem);
      return updated;
    });
    setDraggedIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    if (coverImageUrl) {
      formData.set("coverImage", coverImageUrl);
    }
    formData.set("youtubeUrl", youtubeUrl);
    formData.set("images", JSON.stringify(galleryImages));

    const res = await createArticle(formData);

    if (res.success) {
      toast.success("Article created successfully!", "Article Created");
      router.push("/admin/articles");
      router.refresh();
    } else {
      setError(res.error || "Failed to create article.");
      toast.error(res.error || "Failed to create article.", "Creation Failed");
    }
    setIsSubmitting(false);
  };

  const youtubeEmbedUrl = React.useMemo(() => {
    if (!youtubeUrl) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = youtubeUrl.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  }, [youtubeUrl]);

  return (
    <div className="space-y-8">
      
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <Link href="/admin/articles">
          <Button variant="outline" size="sm" className="p-2 border-slate-200 text-slate-700">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PlusCircle className="w-4 h-4 text-[#2791F5]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">Article Composer</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Create New Article</h1>
          <p className="text-xs text-slate-500">Publish a new story to Tourism Seasons with video & photo gallery</p>
        </div>
      </div>

      <Card className="max-w-4xl bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                🇬🇧 Article Title (English)
              </label>
              <Input
                name="title"
                placeholder="e.g. Siem Reap Tourism Highlights 2026 (Optional if Khmer Title entered)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                🇰🇭 Article Title (Khmer)
              </label>
              <Input
                name="titleKhmer"
                placeholder="e.g. ព័ត៌មានទេសចរណ៍ខេត្តសៀមរាប ២០២៦"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Category Section *
                </label>
                <select
                  name="categoryId"
                  required
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50 font-medium"
                >
                  <option value="">Select Category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      📂 {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  📍 Cambodian Province / Destination
                </label>
                <select
                  name="provinceId"
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50 font-medium"
                >
                  <option value="">-- Choose Province --</option>
                  {provinces.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      📍 {prov.nameKhmer ? `${prov.name} (${prov.nameKhmer})` : prov.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                🇬🇧 Summary / Excerpt (English)
              </label>
              <textarea
                name="summary"
                rows={2}
                placeholder="Short teaser in English (Optional if Khmer Summary entered)..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                🇰🇭 Summary / Excerpt (Khmer)
              </label>
              <textarea
                name="summaryKhmer"
                rows={2}
                placeholder="សេចក្តីសង្ខេបជាភាសាខ្មែរ..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50"
              />
            </div>

            {/* Main Cover Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Primary Cover Image
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 flex items-center gap-2 transition-colors">
                  <Upload className="w-4 h-4 text-[#2791F5]" /> {isUploading ? "Uploading..." : "Upload Main Cover"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              {coverImageUrl && (
                <div className="mt-2 h-32 w-64 rounded-xl overflow-hidden border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* YouTube Video URL Input */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>YouTube Video Link</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional (URL or Embed Link)</span>
              </label>
              <Input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              />
              {youtubeEmbedUrl && (
                <div className="mt-3 aspect-video w-full max-w-lg rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                  <iframe
                    src={youtubeEmbedUrl}
                    title="YouTube video preview"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* Article Multi-Image Gallery Manager */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Article Photo Gallery (Multiple Images)
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="sm:col-span-6">
                  <Input
                    placeholder="Image URL (https://...)"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-4">
                  <Input
                    placeholder="Caption (optional)"
                    value={newGalleryCaption}
                    onChange={(e) => setNewGalleryCaption(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addGalleryImageByUrl}
                    className="text-xs w-full font-bold"
                  >
                    Add URL
                  </Button>
                </div>
                <div className="sm:col-span-12 flex items-center gap-3 pt-1">
                  <span className="text-xs text-slate-500 font-medium">Or upload files:</span>
                  <label className="cursor-pointer bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#2791F5]" /> {isGalleryUploading ? "Uploading..." : "Upload Images to Gallery"}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryImageUpload} />
                  </label>
                </div>
              </div>

              {/* 3-Column Mouse Drag & Drop Reorderable Gallery Grid */}
              {galleryImages.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Reorder Gallery Images ({galleryImages.length})</span>
                    <span className="text-[11px] text-slate-400 font-normal">Drag image cards with mouse to reorder position</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryImages.map((img, idx) => (
                      <div
                        key={idx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                        className={`relative group rounded-xl overflow-hidden border bg-white shadow-xs p-3 space-y-2.5 flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all ${
                          draggedIndex === idx ? "opacity-40 border-dashed border-[#2791F5] bg-blue-50" : "border-slate-200 hover:border-[#2791F5]/50"
                        }`}
                      >
                        <div className="relative w-full rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt={`Gallery ${idx + 1}`} className="w-full h-40 object-contain block pointer-events-none" />
                          
                          {/* Position Badge */}
                          <span className="absolute top-2 left-2 bg-slate-900/90 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-md border border-white/20">
                            #{idx + 1}
                          </span>

                          {/* Remove Control */}
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute top-2 right-2 bg-white/95 text-red-600 hover:bg-red-600 hover:text-white text-xs w-7 h-7 rounded-lg flex items-center justify-center font-bold shadow-md border border-slate-200 transition-colors"
                            title="Remove Image"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Caption / Label</label>
                          <input
                            type="text"
                            value={img.caption || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGalleryImages((prev) => prev.map((item, i) => (i === idx ? { ...item, caption: val } : item)));
                            }}
                            placeholder="Add caption..."
                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2791F5]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Article Body (Markdown Supported) *
              </label>
              <textarea
                name="content"
                rows={12}
                placeholder="Write full article here... Use # for headings, > for quotes."
                required
                className="w-full bg-white border border-slate-300 rounded-xl p-4 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50"
              />
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input type="checkbox" name="published" value="true" defaultChecked className="w-4 h-4 rounded" />
                Publish Immediately
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input type="checkbox" name="featured" value="true" className="w-4 h-4 rounded" />
                Feature on Hero Banner
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/admin/articles">
                <Button variant="ghost" type="button">Cancel</Button>
              </Link>
              <Button variant="primary" type="submit" disabled={isSubmitting} className="font-bold">
                {isSubmitting ? "Publishing..." : "Create & Publish Article"}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>

    </div>
  );
}
