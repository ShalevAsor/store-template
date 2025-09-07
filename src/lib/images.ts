export const cdnBase = process.env.NEXT_PUBLIC_CLOUDFRONT_URL!;
export function getImageUrl(key: string) {
  return `${cdnBase}/${key}`;
}
