export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  // If the src is an Unsplash URL, we can still handle the width parameter
  if (src.includes('images.unsplash.com')) {
    const url = new URL(src)
    url.searchParams.set('w', width.toString())
    if (quality) url.searchParams.set('q', quality.toString())
    return url.toString()
  }

  // If it's not a Cloudinary URL and not Unsplash, return as is
  if (!src.includes('cloudinary.com')) return src

  const params = [
    'f_auto',
    'q_auto',
    `w_${width}`,
    quality ? `q_${quality}` : '',
  ].filter(Boolean).join(',')

  // Handle both full URLs and partial paths
  if (src.includes('/upload/')) {
    return src.replace('/upload/', `/upload/${params}/`)
  }

  return src
}

/**
 * Transforms a raw Cloudinary URL to include optimization parameters
 */
export function getOptimizedImage(url: string, width = 800) {
  if (!url || !url.includes('cloudinary.com')) return url
  const params = `f_auto,q_auto,w_${width}`
  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/${params}/`)
  }
  return url
}
