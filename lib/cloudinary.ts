export interface CloudinaryUploadResponse {
  url?: string;
  secure_url?: string;
  public_id?: string;
  error?: string;
}

/**
 * Upload an image file directly to Cloudinary via our backend API route (/api/upload).
 * Returns the secure Cloudinary CDN URL (https://res.cloudinary.com/hesqv76c/image/upload/...)
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.url) {
    const errorMsg = data.error || `Cloudinary 업로드 실패 (HTTP ${response.status})`;
    console.error("Cloudinary upload failed:", errorMsg);
    throw new Error(errorMsg);
  }

  return data.url;
}
