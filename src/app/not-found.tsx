import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-[#2791F5] font-black text-3xl shadow-sm">
          404
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-500">
          The page you are looking for does not exist, has been removed, or is strictly restricted.
        </p>
        <div>
          <Link href="/">
            <Button variant="primary" size="lg" className="w-full justify-center">
              Back to Home Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
