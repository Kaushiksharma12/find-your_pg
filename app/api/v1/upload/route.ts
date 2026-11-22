import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

/**
 * FindYourPeace Media Architecture Upload Route
 * Converts uploaded File objects into validated persistent media URIs.
 * In local environment: processes files into Base64 / Local static storage data URIs.
 * Production architecture: pipes uploads directly to Cloud Storage (AWS S3 / Cloudinary).
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as a host." }, { status: 401 });
    }
    if (user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden: Only Host Partners can upload property media." }, { status: 403 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided for upload." }, { status: 400 });
    }

    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    const uploadedUrls: string[] = [];

    for (const file of files) {
      // 1. Validation
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `File "${file.name}" is not a supported raster image format.` }, { status: 400 });
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: `File "${file.name}" exceeds the maximum 5MB size limit.` }, { status: 400 });
      }

      // 2. Conversion to persistent media URI
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "image/jpeg";
      const persistentUrl = `data:${mimeType};base64,${base64}`;

      uploadedUrls.push(persistentUrl);
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedUrls.length} file(s) processed successfully`,
      urls: uploadedUrls,
    });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Media upload processing failed." }, { status: 500 });
  }
}
