import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      }
    : undefined,
});

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

export function toSafeKey(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "bin";
  const stem = filename.replace(/\.[^/.]+$/, "");
  const safe =
    stem
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "file";
  return `products/${safe.slice(0, 60)}-${randomUUID()}.${ext}`;
}

export async function getPresignedUploadUrl(opts: {
  filename: string;
  contentType: AllowedImageType;
  sizeBytes?: number; // client-reported (for pre-check)
  expiresInSec?: number; // default 60
}) {
  const { filename, contentType, sizeBytes, expiresInSec = 60 } = opts;

  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    throw new Error("Unsupported file type");
  }
  if (sizeBytes && sizeBytes > MAX_UPLOAD_BYTES) {
    throw new Error("File too large (max 5MB)");
  }

  const Key = toSafeKey(filename);
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: expiresInSec,
  });
  return { uploadUrl, key: Key };
}

export async function deleteImagesFromS3(imageKeys: string[]): Promise<void> {
  if (imageKeys.length === 0) return;

  try {
    const deletePromises = imageKeys.map((key) =>
      s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: key,
        })
      )
    );

    await Promise.all(deletePromises);
    console.log(`Deleted ${imageKeys.length} images from S3:`, imageKeys);
  } catch (error) {
    console.error("Failed to delete images from S3:", error);
  }
}
