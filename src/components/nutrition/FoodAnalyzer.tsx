"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { compressMealPhoto } from "@/lib/food-analyze-utils";
import type { FoodAnalysisResult } from "@/lib/food-analyze-types";
import type { UserProfile } from "@/lib/types";
import { Camera, ImagePlus, Loader2, Sparkles, X } from "lucide-react";
import { FoodAnalysisReview } from "./FoodAnalysisReview";

interface FoodAnalyzerProps {
  profile: UserProfile;
  onConfirm: (analysis: FoodAnalysisResult) => void;
}

export function FoodAnalyzer({ profile, onConfirm }: FoodAnalyzerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearPhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setAnalysis(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = (file: File | null) => {
    if (!file?.type.startsWith("image/")) {
      setError("Please choose a photo of your meal.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAnalysis(null);
    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      const { base64, mimeType } = await compressMealPhoto(selectedFile);
      const res = await fetch("/api/food-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          imageBase64: base64,
          mimeType,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not analyze this photo.");
      }
      setAnalysis(data.analysis as FoodAnalysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = (result: FoodAnalysisResult) => {
    onConfirm(result);
    clearPhoto();
  };

  if (analysis) {
    return (
      <div className="mb-6 pb-6 border-b border-lavender-100">
        <FoodAnalysisReview
          analysis={analysis}
          profile={profile}
          onConfirm={handleConfirm}
          onCancel={() => setAnalysis(null)}
        />
      </div>
    );
  }

  return (
    <div className="mb-6 pb-6 border-b border-lavender-100 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lavender-200 to-rose-200 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">AI Food Analyzer</p>
          <p className="text-xs text-gray-500">
            Snap or upload a meal photo for estimated nutrition
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {!previewUrl ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="p-4 rounded-xl border-2 border-dashed border-lavender-200 hover:border-lavender-400 hover:bg-lavender-50/50 transition-all text-center touch-manipulation"
          >
            <Camera className="w-6 h-6 mx-auto text-lavender-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">Take photo</p>
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="p-4 rounded-xl border-2 border-dashed border-lavender-200 hover:border-lavender-400 hover:bg-lavender-50/50 transition-all text-center touch-manipulation"
          >
            <ImagePlus className="w-6 h-6 mx-auto text-lavender-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">Upload photo</p>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-lavender-100 bg-lavender-50/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Meal preview"
              className="w-full max-h-56 object-cover"
            />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-gray-500 hover:text-gray-700 shadow-sm"
              aria-label="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <Button
            type="button"
            onClick={handleAnalyze}
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing meal…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze meal photo
              </>
            )}
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <p className="text-[11px] text-gray-400 leading-relaxed">
        AI estimates only — not a substitute for reading labels or measuring portions.
      </p>
    </div>
  );
}
