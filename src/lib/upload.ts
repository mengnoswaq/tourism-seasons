/**
 * Media upload helper module for profile photos, article cover images & media assets.
 * Converts the uploaded image file into a compressed Base64 Data URL (WebP/JPEG format),
 * keeping the full image aspect ratio with auto-calculated height and uncropped quality.
 */
export async function uploadImage(
  file: File,
  options: { maxWidth?: number; quality?: number } = {}
): Promise<string> {
  const { maxWidth = 600, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Auto scale height proportionally if width exceeds maxWidth
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

        // Draw full image onto canvas without cropping
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to compressed WebP (fallback to JPEG if WebP unsupported)
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


