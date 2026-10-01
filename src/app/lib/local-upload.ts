import { randomUUID } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const folderPattern = /^(profile\/[1-9]\d*|questions\/[1-9]\d*\/(prompts|explanations))$/;
const objectPattern = /^(profile\/[1-9]\d*|questions\/[1-9]\d*\/(prompts|explanations))\/[0-9a-f-]{36}\.webp$/;
export const UPLOAD_URL_PREFIX = "/api/uploads/";

export function getUploadRoot() {
  return path.resolve(process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), "data", "uploads"));
}

export function resolveUploadPath(objectName: string) {
  if (!objectPattern.test(objectName)) throw new Error("INVALID_UPLOAD_PATH");
  const root = getUploadRoot();
  const target = path.resolve(root, ...objectName.split("/"));
  if (!target.startsWith(root + path.sep)) throw new Error("INVALID_UPLOAD_PATH");
  return target;
}

export async function uploadImageLocally(file: Blob, folder: string, _fileName?: string) {
  if (!folderPattern.test(folder)) throw new Error("INVALID_UPLOAD_PATH");
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) throw new Error("INVALID_IMAGE_TYPE");
  if (!file.size || file.size > MAX_IMAGE_SIZE) throw new Error("IMAGE_TOO_LARGE");
  let buffer: Buffer;
  try {
    // Decode and re-encode the actual content; filenames and MIME claims are untrusted.
    buffer = await sharp(Buffer.from(await file.arrayBuffer()), { animated: true, limitInputPixels: 25000000 })
      .rotate().webp({ quality: 90 }).toBuffer();
  } catch { throw new Error("INVALID_IMAGE_TYPE"); }
  const objectName = `${folder}/${randomUUID()}.webp`;
  const target = resolveUploadPath(objectName);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, buffer, { flag: "wx" });
  return { objectName, url: UPLOAD_URL_PREFIX + objectName };
}

export const readLocalImage = (objectName: string) => readFile(resolveUploadPath(objectName));

export async function deleteLocalImage(url?: string | null) {
  if (!url?.startsWith(UPLOAD_URL_PREFIX)) return;
  const target = resolveUploadPath(url.slice(UPLOAD_URL_PREFIX.length));
  try { await unlink(target); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
}

export function getUploadErrorMessage(error: unknown) {
  if (error instanceof Error && error.message === "IMAGE_TOO_LARGE") return "Ukuran gambar harus antara 1 byte dan 5 MB.";
  if (error instanceof Error && error.message === "INVALID_IMAGE_TYPE") return "Gunakan file JPG, PNG, WEBP, atau GIF yang valid.";
  return "Gagal menyimpan gambar di server lokal.";
}
