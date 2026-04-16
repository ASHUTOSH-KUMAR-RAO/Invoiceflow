
"use client";

import { useUploadThing } from "@/lib/uploadthing"; // generated hook
import { useState } from "react";
import Image from "next/image";

interface Props {
  currentImage?: string | null;
  onSuccess: (url: string) => void;
}

export function AvatarUpload({ currentImage, onSuccess }: Props) {
  const [preview, setPreview] = useState<string | null>(currentImage ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { startUpload } = useUploadThing("profileImage", {
    onUploadBegin: () => {
      setUploading(true);
      setError(null);
    },
    onClientUploadComplete: (res) => {
      setUploading(false);
      const url = res?.[0]?.url;
      if (!url) return;

      setPreview(url);
      onSuccess(url); // parent ko URL do — woh PATCH call karega
    },
    onUploadError: (err) => {
      setUploading(false);
      setError(err.message);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately dikhao
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    await startUpload([file]);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        <Image
          src={preview ?? "/default-avatar.png"}
          alt="Profile photo"
          fill
          className="rounded-full object-cover"
        />
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">Uploading...</span>
          </div>
        )}
      </div>

      <label className="cursor-pointer text-sm text-blue-500 hover:underline">
        {uploading ? "Uploading..." : "Change photo"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={handleFileChange}
        />
      </label>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
