"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateArticle } from "@/actions/articles";
import { getCategories } from "@/actions/categories";
import { uploadImage } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Upload, CheckCircle, Edit3 } from "lucide-react";

interface EditArticlePageProps {
  params: { id: string };
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [article, setArticle] = useState<any>(null);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [galleryImages, setGalleryImages] = useState<{ url: string; caption: string }[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newGalleryCaption, setNewGalleryCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories().then((data) => setCategories(data));
    
    // Fetch article details
    fetch(`/api/articles/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.article) {
          setArticle(data.article);
          setCoverImageUrl(data.article.coverImage || "");
          setYoutubeUrl(data.article.youtubeUrl || "");
          if (Array.isArray(data.article.images)) {
            setGalleryImages(data.article.images.map((img: any) => ({ url: img.url, caption: img.caption || "" })));
          }
        }
      })
      .catch(() => {});
  }, [params.id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setCoverImageUrl(url);
    } catch (err) {
      alert("Failed to upload image.");
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

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
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

    const res = await updateArticle(params.id, formData);

    if (res.success) {
      router.push("/admin/articles");
      router.refresh();
    } else {
      setError(res.error || "Failed to update article.");
    }
    setIsSubmitting(false);
  };

  const youtubeEmbedUrl = React.useMemo(() => {
    if (!youtubeUrl) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = youtubeUrl.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  }, [youtubeUrl]);

  if (!article) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading article data...
      </div>
    );
  }

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
            <Edit3 className="w-4 h-4 text-[#2791F5]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">Article Editor</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Edit Article</h1>
          <p className="text-xs text-slate-500">Update story details, video links, photo gallery, tags, and cover image</p>
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
                Article Title *
              </label>
              <Input
                name="title"
                defaultValue={article.title}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Category Section *
                </label>
                <select
                  name="categoryId"
                  defaultValue={article.categoryId}
                  required
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50"
                >
                  <option value="">Select Category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tags (Comma Separated)
                </label>
                <Input
                  name="tags"
                  defaultValue={article.tags?.map((t: any) => t.tag?.name).join(", ") || ""}
                  placeholder="AI, Tech, Quantum"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Summary / Excerpt *
              </label>
              <textarea
                name="summary"
                rows={2}
                defaultValue={article.summary}
                required
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50"
              />
            </div>

            {/* Primary Cover Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Primary Cover Image
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 flex items-center gap-2 transition-colors">
                  <Upload className="w-4 h-4 text-[#2791F5]" /> {isUploading ? "Uploading..." : "Upload New Cover"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                {coverImageUrl && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Cover image set
                  </span>
                )}
              </div>
              {coverImageUrl && (
                <div className="mt-2 h-32 w-64 rounded-xl overflow-hidden border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* YouTube Video Link Input */}
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
            <div className="space-y-3 pt-2 border-t border-slate-100">
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

              {/* Gallery Image List Preview */}
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs p-2 space-y-2">
                      <div className="h-28 rounded-lg overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold hover:bg-red-700 shadow-md"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate font-medium px-1">
                        {img.caption || `Image #${idx + 1}`}
                      </p>
                    </div>
                  ))}
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
                defaultValue={article.content}
                required
                className="w-full bg-white border border-slate-300 rounded-xl p-4 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50"
              />
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input type="checkbox" name="published" value="true" defaultChecked={article.published} className="w-4 h-4 rounded" />
                Published (Active)
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input type="checkbox" name="featured" value="true" defaultChecked={article.featured} className="w-4 h-4 rounded" />
                Featured on Hero Banner
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/admin/articles">
                <Button variant="ghost" type="button">Cancel</Button>
              </Link>
              <Button variant="primary" type="submit" disabled={isSubmitting} className="font-bold">
                {isSubmitting ? "Saving Changes..." : "Save & Update Article"}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>

    </div>
  );
}
