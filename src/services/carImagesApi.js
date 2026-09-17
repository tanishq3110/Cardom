import { supabase } from '@/lib/supabase'

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
export const MAX_IMAGES_PER_LISTING = 6
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

/**
 * Validates a single image file for size and type.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  // Type check
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `"${file.name}" is an unsupported format. Only JPG, PNG, and WEBP are allowed.`,
    }
  }

  // Size check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `"${file.name}" is ${sizeMb} MB. Maximum allowed size is 5 MB.`,
    }
  }

  return { valid: true }
}

/**
 * Validates a batch of files against limits.
 * @param {File[]} files
 * @param {number} currentCount
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageBatch(files, currentCount = 0) {
  if (!files || !files.length) {
    return { valid: true }
  }

  if (currentCount + files.length > MAX_IMAGES_PER_LISTING) {
    return {
      valid: false,
      error: `You can upload a maximum of ${MAX_IMAGES_PER_LISTING} photos per listing.`,
    }
  }

  for (const file of files) {
    const res = validateImageFile(file)
    if (!res.valid) return res
  }

  return { valid: true }
}

/**
 * Creates a database record in public.car_images.
 *
 * @param {string} carId
 * @param {string} imageUrl
 * @param {string} storagePath
 * @param {number} displayOrder
 * @returns {Promise<{ data: Object|null, error: Error|null }>}
 */
export async function createCarImageRecord(carId, imageUrl, storagePath, displayOrder = 0) {
  try {
    const { data, error } = await supabase
      .from('car_images')
      .insert({
        car_id: carId,
        image_url: imageUrl,
        storage_path: storagePath,
        display_order: displayOrder,
      })
      .select()
      .single()

    if (error) {
      console.error('[Cardom car_images] Record creation error:', error.message)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('[Cardom car_images] Record creation exception:', err)
    return { data: null, error: err }
  }
}

/**
 * Uploads a file to Supabase Storage in bucket 'car-images' and creates the db record.
 * File path: car-images/{userId}/{carId}/{timestamp}-{random}.{ext}
 *
 * @param {File} file
 * @param {string} userId
 * @param {string} carId
 * @param {number} displayOrder
 * @returns {Promise<{ data: Object|null, error: Error|null }>}
 */
export async function uploadCarImage(file, userId, carId, displayOrder = 0) {
  if (!file || !userId || !carId) {
    return { data: null, error: new Error('File, User ID, and Car ID are required.') }
  }

  const validation = validateImageFile(file)
  if (!validation.valid) {
    return { data: null, error: new Error(validation.error) }
  }

  try {
    // Generate clean safe storage path
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeExt = ALLOWED_EXTENSIONS.includes(ext) ? ext : 'jpg'
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    const storagePath = `${userId}/${carId}/${uniqueId}.${safeExt}`

    // 1. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('car-images')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('[Cardom Storage] Upload error:', uploadError.message)
      return { data: null, error: uploadError }
    }

    // 2. Get Public URL
    const { data: urlData } = supabase.storage
      .from('car-images')
      .getPublicUrl(storagePath)

    const publicUrl = urlData.publicUrl

    // 3. Create database record in public.car_images
    const { data: dbRecord, error: dbError } = await createCarImageRecord(
      carId,
      publicUrl,
      storagePath,
      displayOrder,
    )

    if (dbError) {
      // Clean up uploaded file if db record fails
      await supabase.storage.from('car-images').remove([storagePath]).catch(() => {})
      return { data: null, error: dbError }
    }

    return { data: dbRecord, error: null }
  } catch (err) {
    console.error('[Cardom Storage] Upload exception:', err)
    return { data: null, error: err }
  }
}

/**
 * Fetches all images for a car from public.car_images sorted by display_order.
 *
 * @param {string} carId
 * @returns {Promise<{ data: Array, error: Error|null }>}
 */
export async function fetchCarImages(carId) {
  if (!carId) return { data: [], error: null }

  try {
    const { data, error } = await supabase
      .from('car_images')
      .select('*')
      .eq('car_id', carId)
      .order('display_order', { ascending: true })

    if (error) {
      // If table does not exist or permission pending, fail gracefully
      console.warn('[Cardom car_images] fetchCarImages error:', error.message)
      return { data: [], error }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('[Cardom car_images] fetchCarImages exception:', err)
    return { data: [], error: err }
  }
}

/**
 * Deletes a single image record and its backing storage file.
 *
 * @param {string} imageId
 * @param {string} [storagePath]
 * @returns {Promise<{ success: boolean, error: Error|null }>}
 */
export async function deleteCarImage(imageId, storagePath = null) {
  try {
    // 1. Remove from storage if path provided
    if (storagePath) {
      await supabase.storage.from('car-images').remove([storagePath]).catch(() => {})
    }

    // 2. Delete row from car_images
    const { error } = await supabase
      .from('car_images')
      .delete()
      .eq('id', imageId)

    if (error) {
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err }
  }
}

/**
 * Updates display order of an existing car image record.
 * @param {string} imageId
 * @param {number} displayOrder
 * @returns {Promise<{ success: boolean, error: Error|null }>}
 */
export async function updateCarImageOrder(imageId, displayOrder) {
  try {
    const { error } = await supabase
      .from('car_images')
      .update({ display_order: displayOrder })
      .eq('id', imageId)

    if (error) {
      console.warn('[Cardom car_images] updateCarImageOrder error:', error.message)
      return { success: false, error }
    }
    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err }
  }
}

/**
 * Deletes all image records and storage files associated with a car.
 * Used during listing deletion.
 *
 * @param {string} carId
 * @returns {Promise<{ success: boolean, error: Error|null }>}
 */
export async function deleteCarImagesForCar(carId) {
  if (!carId) return { success: true, error: null }

  try {
    // Fetch images to retrieve storage paths
    const { data: images } = await supabase
      .from('car_images')
      .select('storage_path')
      .eq('car_id', carId)

    if (images && images.length > 0) {
      const paths = images
        .map((img) => img.storage_path)
        .filter(Boolean)

      if (paths.length > 0) {
        await supabase.storage.from('car-images').remove(paths).catch(() => {})
      }
    }

    // Delete DB rows (cascade handles this if car deleted, but explicit delete is safe)
    await supabase.from('car_images').delete().eq('car_id', carId).catch(() => {})

    return { success: true, error: null }
  } catch (err) {
    console.warn('[Cardom car_images] deleteCarImagesForCar exception:', err.message)
    return { success: false, error: err }
  }
}
