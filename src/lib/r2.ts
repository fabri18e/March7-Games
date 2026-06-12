import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

// R2 is S3-compatible — endpoint uses your Cloudflare Account ID
export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

export const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? 'march7-games'
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ''

// Allowed file types for game uploads
export const GAME_ALLOWED_TYPES = [
  'text/html',
  'application/zip',
  'application/x-zip-compressed',
]

// 50MB max per game
export const GAME_MAX_SIZE = 50 * 1024 * 1024

export async function uploadGameFile(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Long cache since game files don't change (use versioned keys to update)
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )

  return `${R2_PUBLIC_URL}/${key}`
}

export async function deleteGameFile(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    })
  )
}
