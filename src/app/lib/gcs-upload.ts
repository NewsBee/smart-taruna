import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";
import path from "path";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

let storageClient: Storage | null = null;

function getStorageClient() {
  if (!storageClient) {
    storageClient = new Storage();
  }

  return storageClient;
}

function getBucketName() {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("GCS_BUCKET_NOT_CONFIGURED");
  }

  return bucketName;
}

function getPublicUrl(bucketName: string, objectName: string) {
  const publicBaseUrl = process.env.GCS_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (publicBaseUrl) {
    return `${publicBaseUrl}/${objectName}`;
  }

  return `https://storage.googleapis.com/${bucketName}/${objectName}`;
}

function sanitizeFileName(fileName: string) {
  const parsed = path.parse(fileName || "image");
  const safeName = parsed.name
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const safeExtension = parsed.ext.toLowerCase().replace(/[^a-z0-9.]/g, "");

  return `${safeName || "image"}${safeExtension || ""}`;
}

export async function uploadImageToGcs(file: Blob, folder: string, fileName?: string) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("INVALID_IMAGE_TYPE");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("IMAGE_TOO_LARGE");
  }

  const bucketName = getBucketName();
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeFolder = folder
    .toLowerCase()
    .replace(/[^a-z0-9-_/]+/g, "-")
    .replace(/^\/+|\/+$/g, "");
  const safeFileName = sanitizeFileName(fileName || "image");
  const objectName = `${safeFolder}/${randomUUID()}-${safeFileName}`;

  const bucket = getStorageClient().bucket(bucketName);
  const object = bucket.file(objectName);

  await object.save(buffer, {
    resumable: false,
    metadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  return {
    objectName,
    url: getPublicUrl(bucketName, objectName),
  };
}

export function getUploadErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Gagal mengunggah gambar.";
  }

  if (error.message === "GCS_BUCKET_NOT_CONFIGURED") {
    return "Google Cloud Storage belum dikonfigurasi.";
  }

  if (error.message === "INVALID_IMAGE_TYPE") {
    return "Format gambar harus JPG, PNG, WEBP, atau GIF.";
  }

  if (error.message === "IMAGE_TOO_LARGE") {
    return "Ukuran gambar maksimal 5 MB.";
  }

  return "Gagal mengunggah gambar.";
}
