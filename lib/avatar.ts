const CLOUDFRONT_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL;

export function convertedImageUrl(
  path?: string,
  size?: string | number
): string | null {
  if (!path) return null;

  // full URLs or blobs should be returned as-is
  if (path.startsWith("http") || path.startsWith("blob:")) {
    return path;
  }

  let sizeSuffix: string | null = typeof size === "string" ? size : null;

  // if size is a number, decide suffix
  if (sizeSuffix == null && typeof size === "number") {
    if (size < 300) sizeSuffix = "sm";
    else if (size < 600) sizeSuffix = "md";
    else if (size < 900) sizeSuffix = "lg";
    else if (size < 1200) sizeSuffix = "xl";
    else sizeSuffix = "xxl";
  }

  const ext = path.split(".").pop();
  const pathNoExt = path.replace(/\.[^/.]+$/, "");

  // build final URL
  if (sizeSuffix) {
    return `${CLOUDFRONT_URL}${pathNoExt}-${sizeSuffix}.${ext}`;
  }

  return `${CLOUDFRONT_URL}${path}`;
}
