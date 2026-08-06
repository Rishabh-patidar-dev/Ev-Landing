'use client'

export type GPSCoords = {
  lat: number
  lng: number
  accuracy?: number
  altitude?: number
}

export async function extractGPSFromImage(file: File): Promise<GPSCoords | null> {
  try {
    const { default: exifr } = await import('exifr')
    const gps = await exifr.gps(file)
    if (!gps || !gps.latitude || !gps.longitude) return null
    return {
      lat: gps.latitude,
      lng: gps.longitude,
    }
  } catch {
    return null
  }
}

export async function extractExifData(file: File): Promise<Record<string, unknown> | null> {
  try {
    const { default: exifr } = await import('exifr')
    const exif = await exifr.parse(file, { gps: true, tiff: true })
    return exif ?? null
  } catch {
    return null
  }
}
