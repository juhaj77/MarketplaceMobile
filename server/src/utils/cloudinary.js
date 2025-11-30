import { v2 as cloudinary } from 'cloudinary';

export function initCloudinary() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary env vars not set');
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadBuffer(buffer, options = {}) {
  initCloudinary();
  const streamifier = await import('streamifier');
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
    streamifier.default.createReadStream(buffer).pipe(uploadStream);
  });
}

export async function deleteResource(publicId) {
  initCloudinary();
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
}

export default { uploadBuffer, deleteResource, initCloudinary };
