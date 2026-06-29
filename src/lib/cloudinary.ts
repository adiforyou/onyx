// Install on personal network: npm install cloudinary
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const generateUploadSignature = (publicId: string, folder: string) => {
  const timestamp = Math.round(Date.now() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, public_id: publicId, folder },
    process.env.CLOUDINARY_API_SECRET!
  )
  return { timestamp, signature, apiKey: process.env.CLOUDINARY_API_KEY!, cloudName: process.env.CLOUDINARY_CLOUD_NAME! }
}

export const getVideoUrl = (publicId: string) =>
  `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/${publicId}`

export const getThumbnailUrl = (publicId: string) =>
  `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/so_0,w_640,h_360,c_fill/${publicId}.jpg`

export const deleteVideo = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId, { resource_type: "video" })
}

export default cloudinary
