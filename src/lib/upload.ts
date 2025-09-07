// lib/upload.ts
/**
 * Simple upload utility for S3 using existing infrastructure
 */
export async function uploadFileToS3(file: File): Promise<string> {
  // Validate file
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Unsupported file type");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File too large (max 5MB)");
  }

  // Get presigned URL
  const res = await fetch("/api/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ?? "Failed to get upload URL");
  }

  // Upload to S3
  const uploadResponse = await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file to S3");
  }

  return data.key;
}
