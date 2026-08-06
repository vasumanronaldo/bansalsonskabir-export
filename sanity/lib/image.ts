import imageUrlBuilder from '@sanity/image-url'
import { dataset, projectId } from '../env'

const builder = imageUrlBuilder({ projectId, dataset })

/** The image source type, derived from the builder (avoids a fragile deep import). */
export type ImageSource = Parameters<typeof builder.image>[0]

/** Build a CDN transform URL for a Sanity image (hotspot/crop aware). */
export function urlFor(source: ImageSource) {
  return builder.image(source)
}
