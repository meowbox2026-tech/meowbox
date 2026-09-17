import { mergePlayerSaves, type PlayerSave } from './playerSave'

export interface CloudSaveProvider {
  isAvailable: () => Promise<boolean>
  download: () => Promise<PlayerSave | null>
  upload: (save: PlayerSave) => Promise<void>
}

export async function synchronisePlayerSave(local: PlayerSave, provider?: CloudSaveProvider): Promise<PlayerSave> {
  if (!provider || !(await provider.isAvailable())) return local

  const cloud = await provider.download()
  const merged = cloud ? mergePlayerSaves(local, cloud) : local
  await provider.upload(merged)
  return merged
}
