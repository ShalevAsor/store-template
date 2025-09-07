import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getPresignedUploadUrl,
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/services/s3";

const Body = z.object({
  filename: z.string().min(1),
  contentType: z.enum(ALLOWED_IMAGE_TYPES),
  size: z.number().int().positive().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { filename, contentType, size } = Body.parse(body);
    const { uploadUrl, key } = await getPresignedUploadUrl({
      filename,
      contentType,
      sizeBytes: size,
      expiresInSec: 60,
    });
    return NextResponse.json({
      uploadUrl,
      key,
      maxBytes: MAX_UPLOAD_BYTES,
    });
  } catch (error) {
    console.error("upload-url error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Bad request",
    });
  }
}
