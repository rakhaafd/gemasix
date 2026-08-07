"use server";

import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Cloudinary configures itself automatically if CLOUDINARY_URL is present in the environment
// We just need to make sure we export a function to handle the upload.
export async function uploadImageAction(formData: FormData): Promise<string> {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  // 1MB limit check (1024 * 1024 bytes)
  if (file.size > 1048576) {
    throw new Error("Ukuran file tidak boleh lebih dari 1MB");
  }

  // Convert the file to a buffer for Cloudinary
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "gemasix_finance", // Optional: organize files in a folder
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Signed Upload Error:", error);
          reject(new Error(`Cloudinary Error: ${error.message || "Failed to upload image"}`));
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Unknown Cloudinary error"));
        }
      }
    );

    // Pipe the buffer stream to Cloudinary
    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function deleteImageAction(imageUrl: string): Promise<boolean> {
  if (!imageUrl) return false;

  try {
    // Cloudinary URLs usually look like:
    // https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
    // We need to extract 'folder/filename' as the public_id
    const regex = /\/v\d+\/(.+)\.[a-zA-Z]+$/;
    const match = imageUrl.match(regex);
    
    if (match && match[1]) {
      const publicId = match[1];
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result !== 'ok' && result.result !== 'not found') {
        console.error("Cloudinary Delete Warning:", result);
        return false;
      }
      return true;
    }
    
    // Fallback if URL format is different (e.g., without version)
    const fallbackRegex = /\/upload\/(.+)\.[a-zA-Z]+$/;
    const fallbackMatch = imageUrl.match(fallbackRegex);
    if (fallbackMatch && fallbackMatch[1]) {
      const publicId = fallbackMatch[1];
      await cloudinary.uploader.destroy(publicId);
      return true;
    }

    console.warn("Could not extract public_id from imageUrl:", imageUrl);
    return false;
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    return false;
  }
}
