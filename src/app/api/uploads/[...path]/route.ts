import { readLocalImage } from "@/app/lib/local-upload";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, context: { params: { path: string[] } }) {
  try {
    const data = await readLocalImage(context.params.path.join("/"));
    return new NextResponse(new Uint8Array(data), { headers: {
      "Content-Type": "image/webp",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
    } });
  } catch {
    return NextResponse.json({ message: "Gambar tidak ditemukan." }, { status: 404 });
  }
}
