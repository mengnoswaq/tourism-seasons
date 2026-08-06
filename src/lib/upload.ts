/**
 * Media upload helper module for article cover images & media assets.
 * Integrates with Cloudinary / S3 or fallback placeholder images.
 */
export async function uploadImage(file: File): Promise<string> {
  // In production, upload to Cloudinary or AWS S3 via API endpoint
  // For demonstration, return an object URL or Unsplash image URL fallback
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80");
    }, 500);
  });
}
