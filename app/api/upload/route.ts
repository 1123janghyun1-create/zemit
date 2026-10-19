import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "hesqv76c",
  api_key: process.env.CLOUDINARY_API_KEY || "359583373841384",
  api_secret: process.env.CLOUDINARY_API_SECRET || "V6PwfsOwNGh2UteKB4JPUFeodHM",
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "업로드할 파일이 없습니다." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise<NextResponse>((resolve) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "lumio", resource_type: "auto" },
          (error, result) => {
            if (error || !result) {
              console.error("Cloudinary upload error:", error);
              resolve(
                NextResponse.json(
                  { error: error?.message || "Cloudinary 이미지 업로드 실패" },
                  { status: 500 }
                )
              );
            } else {
              resolve(
                NextResponse.json({
                  url: result.secure_url,
                  public_id: result.public_id,
                  format: result.format,
                  width: result.width,
                  height: result.height,
                })
              );
            }
          }
        )
        .end(buffer);
    });
  } catch (error: any) {
    console.error("API upload error:", error);
    return NextResponse.json({ error: error?.message || "서버 오류 발생" }, { status: 500 });
  }
}
