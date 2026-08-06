"use client";

import React, { useState } from "react";
import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialShareProps {
  title: string;
  url: string;
}

export function SocialShare({ title, url }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const shareFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const shareLinkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="flex sm:flex-col items-center gap-2">
      <span className="hidden sm:block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Share</span>
      
      <a href={shareTwitter} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm" className="w-9 h-9 p-0 rounded-full text-slate-600 hover:text-blue-500">
          <Twitter className="w-4 h-4" />
        </Button>
      </a>

      <a href={shareFacebook} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm" className="w-9 h-9 p-0 rounded-full text-slate-600 hover:text-blue-700">
          <Facebook className="w-4 h-4" />
        </Button>
      </a>

      <a href={shareLinkedin} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm" className="w-9 h-9 p-0 rounded-full text-slate-600 hover:text-blue-600">
          <Linkedin className="w-4 h-4" />
        </Button>
      </a>

      <Button variant="outline" size="sm" onClick={handleCopy} className="w-9 h-9 p-0 rounded-full text-slate-600 hover:text-emerald-600">
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4" />}
      </Button>
    </div>
  );
}
