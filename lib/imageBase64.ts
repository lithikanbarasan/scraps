/** Read a File as a raw base64 string (no data-URL prefix). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      const base64 = dataUrl.split(",")[1] ?? "";
      if (!base64) {
        reject(new Error("Unable to process the selected image."));
        return;
      }
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });
}

/** Create an object URL for image preview; caller should revoke when done. */
export function createImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}
