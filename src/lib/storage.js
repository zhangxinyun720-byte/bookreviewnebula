import { supabase } from './supabase'

const BUCKET_NAME = 'covers'
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function uploadCover(file) {
  if (!file) throw new Error('No file provided')
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('invalid_type')
  }
  if (file.size > MAX_SIZE) {
    throw new Error('file_too_large')
  }

  const ext = file.type.split('/')[1] || 'jpg'
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
  const filePath = `${fileName}`

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function removeCover(url) {
  if (!url) return
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname
    const match = path.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/)
    if (match) {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([match[1]])
      if (error) console.warn('Failed to remove old cover:', error)
    }
  } catch {
    // silently ignore if URL parsing fails
  }
}