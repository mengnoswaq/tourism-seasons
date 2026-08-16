/**
 * Media upload helper module for profile photos, article cover images & media assets.
 * Converts the uploaded image file into a high-quality Base64 Data URL (WebP format with JPEG fallback),
 * retaining full resolution up to high-definition (1920px+) with uncropped high quality.
 */
export async function uploadImage(
  file: File,
  options: { maxWidth?: number; quality?: number } = {}
): Promise<string> {
  const { maxWidth = 1920, quality = 0.95 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Auto scale height proportionally only if width exceeds maxWidth (e.g. 1920px)
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Failed to get 2D canvas context"));
        }

        // Enable high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw full image onto canvas without cropping
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to high-quality compressed WebP (fallback to JPEG if WebP unsupported)
        let dataUrl = canvas.toDataURL("image/webp", quality);
        if (!dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error("Failed to load image file"));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}


