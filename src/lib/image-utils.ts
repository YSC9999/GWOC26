/**
 * Utility functions for image optimization, specifically for Cloudinary.
 */

/**
 * Optimizes a Cloudinary URL by adding transformations for quality and format.
 * 
 * @param url The original Cloudinary URL
 * @param options Optimization options (width, height, quality, format)
 * @returns Optimized URL
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
    crop?: string;
  } = {}
): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "fill",
  } = options;

  // Split the URL to insert transformations
  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop && (width || height)) transformations.push(`c_${crop}`);
  
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  const transformationString = transformations.join(",");
  
  return `${parts[0]}/upload/${transformationString}/${parts[1]}`;
}

/**
 * Generates a blur-up placeholder URL for a Cloudinary image.
 */
export function getBlurPlaceholderUrl(url: string): string {
  return getOptimizedCloudinaryUrl(url, {
    width: 30,
    quality: 20,
    format: "webp",
    crop: "scale",
  });
}
