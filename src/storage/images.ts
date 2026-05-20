const maxImageSide = 1400;
const maxThumbSide = 320;

export async function compressImage(file: File, thumbnail = false): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const maxSide = thumbnail ? maxThumbSide : maxImageSide;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.drawImage(bitmap, 0, 0, width, height);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Unable to compress image"));
    }, "image/jpeg", thumbnail ? 0.72 : 0.82);
  });
}

export function blobUrl(blob?: Blob): string | undefined {
  return blob ? URL.createObjectURL(blob) : undefined;
}

export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function previewImageUrl(file: Blob): Promise<string> {
  try {
    return await fileToDataUrl(file);
  } catch {
    return URL.createObjectURL(file);
  }
}
