import type { CatAsset } from '../types'

export const CAT_ASSET_PATHS: Record<CatAsset, string> = {
  amberSit: '/assets/cats/amber-sit.webp',
  spottedSit: '/assets/cats/spotted-sit.webp',
  blackPaws: '/assets/cats/black-paws.webp',
  calicoStretch: '/assets/cats/calico-stretch.webp',
  sphynxStretch: '/assets/cats/sphynx-stretch.webp',
  grayStretch: '/assets/cats/gray-stretch.webp',
  brownCurl: '/assets/cats/brown-curl.webp',
  orangeLounge: '/assets/cats/orange-lounge.webp',
  ragdollSit: '/assets/cats/ragdoll-sit.webp',
  grayCurl: '/assets/cats/gray-curl.webp',
  siameseStretch: '/assets/cats/siamese-stretch.webp',
  tabbyLounge: '/assets/cats/tabby-lounge.webp',
  whiteCurl: '/assets/cats/white-curl.webp'
}

export function getCatTextureKey(asset: CatAsset): string {
  return `cat-${asset}`
}

export function getCatAssetPath(asset: CatAsset): string {
  return CAT_ASSET_PATHS[asset]
}
