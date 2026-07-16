import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const isPlaceholderKey = (key) => !key || key.includes('your_') || key === '';

const hasRealCredentials =
  !isPlaceholderKey(env.CLOUDINARY_CLOUD_NAME) &&
  !isPlaceholderKey(env.CLOUDINARY_API_KEY) &&
  !isPlaceholderKey(env.CLOUDINARY_API_SECRET);

if (hasRealCredentials) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

const MIME_EXT_MAP = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

export const uploadToCloudinary = (fileBuffer, folder = 'onlineGarage', options = {}) => {
  if (!hasRealCredentials) {
    return new Promise((resolve, reject) => {
      const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '_');
      const dir = path.join(UPLOADS_DIR, sanitizedFolder);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const ext = (options.mimetype && MIME_EXT_MAP[options.mimetype]) || '.bin';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      const filepath = path.join(dir, filename);
      fs.writeFile(filepath, fileBuffer, (err) => {
        if (err) reject(err);
        else resolve({ secure_url: `/uploads/${sanitizedFolder}/${filename}` });
      });
    });
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!hasRealCredentials) {
    return Promise.resolve({ result: 'local deletion not supported' });
  }
  return cloudinary.uploader.destroy(publicId);
};

export default hasRealCredentials ? cloudinary : null;
