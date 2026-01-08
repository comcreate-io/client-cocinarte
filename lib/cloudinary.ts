import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

/**
 * Upload an image to Cloudinary
 * @param file - Base64 encoded file or file path
 * @param folder - Folder name in Cloudinary (default: 'coci')
 * @returns Cloudinary upload result with secure_url
 */
export async function uploadToCloudinary(
  file: string,
  folder: string = 'coci'
): Promise<{ secure_url: string; public_id: string }> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 675, crop: 'limit' }, // Max size 1200x675 (16:9 ratio)
        { quality: 'auto' }, // Auto quality optimization
        { fetch_format: 'auto' }, // Auto format selection (WebP when supported)
      ],
    })

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload image to Cloudinary')
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete image from Cloudinary')
  }
}
