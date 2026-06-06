const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { randomUUID } = require("crypto");

/**
 * Supabase Storage via S3-compatible protocol
 *
 * Required env vars:
 *   SUPABASE_S3_ENDPOINT   — e.g. https://<project-ref>.supabase.co/storage/v1/s3
 *   SUPABASE_S3_REGION     — e.g. ap-south-1  (your project region)
 *   SUPABASE_S3_ACCESS_KEY — from Supabase Dashboard → Storage → S3 Access Keys
 *   SUPABASE_S3_SECRET_KEY — from Supabase Dashboard → Storage → S3 Access Keys
 *   SUPABASE_BUCKET        — bucket name, e.g. sg_media
 *   SUPABASE_URL           — your project URL, e.g. https://<ref>.supabase.co
 */

const s3 = new S3Client({
  endpoint: process.env.SUPABASE_S3_ENDPOINT,
  region: process.env.SUPABASE_S3_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY,
  },
  forcePathStyle: true, // required for Supabase S3
});

const BUCKET = process.env.SUPABASE_BUCKET || "sg_media";

/**
 * Build the public URL for an uploaded file.
 * Supabase public URL pattern:
 *   https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
 */
const getPublicUrl = (filePath) => {
  const base = process.env.SUPABASE_URL.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${BUCKET}/${filePath}`;
};

/**
 * Upload a file buffer to Supabase Storage via S3 protocol.
 * @param {Buffer} fileBuffer
 * @param {string} mimetype
 * @param {string} folder   — subfolder inside bucket, e.g. "products" | "banners"
 * @returns {Promise<{ url: string, path: string }>}
 */
const uploadToSupabase = async (fileBuffer, mimetype, folder = "products") => {
  const ext = mimetype.split("/")[1].replace("jpeg", "jpg");
  const filePath = `${folder}/${randomUUID()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: filePath,
      Body: fileBuffer,
      ContentType: mimetype,
    })
  );

  return { url: getPublicUrl(filePath), path: filePath };
};

/**
 * Delete a file from Supabase Storage via S3 protocol.
 * @param {string} filePath — path inside bucket, e.g. "products/uuid.jpg"
 */
const deleteFromSupabase = async (filePath) => {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: filePath,
    })
  );
};

module.exports = { uploadToSupabase, deleteFromSupabase };
