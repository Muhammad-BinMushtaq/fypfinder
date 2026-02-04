// components/student/ProfilePictureUpload.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useMyProfile } from "@/hooks/student/useMyProfile";

interface ProfilePictureUploadProps {
  currentPicture?: string | null;
  studentId: string;
  name: string;
}

export function ProfilePictureUpload({ currentPicture, studentId, name }: ProfilePictureUploadProps) {
  const { updateProfileAsync } = useMyProfile();
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPicture || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, GIF, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError(null);
    setSuccess(null);

    // Create local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Start upload
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const supabase = createSupabaseBrowserClient();
      
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${studentId}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Simulate progress for better UX (Supabase doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      setUploadProgress(95);

      // Update profile with new picture URL
      await updateProfileAsync({ profilePicture: publicUrl });

      setUploadProgress(100);
      setSuccess("Profile picture updated successfully!");
      
      // Update preview to use the actual URL
      setPreviewUrl(publicUrl);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image");
      // Revert to previous picture on error
      setPreviewUrl(currentPicture || null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [studentId, currentPicture, updateProfileAsync]);

  const handleRemovePicture = async () => {
    if (!currentPicture) return;

    setError(null);
    setSuccess(null);
    setIsUploading(true);

    try {
      await updateProfileAsync({ profilePicture: "" });
      setPreviewUrl(null);
      setSuccess("Profile picture removed successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove picture");
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Avatar Container */}
      <div className="relative group">
        {/* Avatar */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 relative">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl sm:text-4xl font-bold text-white">
                {getInitials(name)}
              </span>
            </div>
          )}
          
          {/* Upload Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
              <div className="w-14 h-14 relative">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeDasharray={`${uploadProgress} 100`}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  {uploadProgress}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Camera Button - Hidden while uploading */}
        {!isUploading && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all border-2 border-white"
            title="Change profile picture"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Name Display */}
      <h2 className="mt-3 text-xl sm:text-2xl font-bold text-gray-900">{name}</h2>

      {/* Upload Status Messages - Compact */}
      <div className="mt-2 min-h-[24px] text-center max-w-[200px]">
        {error && (
          <p className="text-red-600 text-xs font-medium bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
            ⚠️ {error}
          </p>
        )}
        {success && (
          <p className="text-green-600 text-xs font-medium bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
            ✅ {success}
          </p>
        )}
        {!error && !success && !isUploading && (
          <p className="text-gray-400 text-xs">
            Click 📷 to change photo
          </p>
        )}
        {isUploading && (
          <p className="text-indigo-600 text-xs font-medium">
            Uploading...
          </p>
        )}
      </div>

      {/* Remove Picture Button */}
      {previewUrl && !isUploading && (
        <button
          onClick={handleRemovePicture}
          className="mt-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Remove
        </button>
      )}
    </div>
  );
}
