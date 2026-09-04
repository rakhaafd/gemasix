import { collection, addDoc, serverTimestamp, Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { clientDb } from "./firebase-client";
import { uploadImageAction, deleteImageAction } from "./actions/upload";
import imageCompression from 'browser-image-compression';

export interface HeroImage {
  id?: string;
  imageUrl: string;
  order: number;
  createdAt?: Timestamp | Date;
}

export const uploadSingleHeroImage = async (file: File): Promise<string> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  
  const compressedFile = await imageCompression(file, options);
  const formData = new FormData();
  formData.append("file", compressedFile, file.name);
  return await uploadImageAction(formData);
};

export const uploadHeroImages = async (files: File[]): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  
  for (const file of files) {
    try {
      const url = await uploadSingleHeroImage(file);
      uploadedUrls.push(url);
    } catch (error) {
      console.error("Compression/Upload error for hero file:", file.name, error);
    }
  }
  
  return uploadedUrls;
};

export const addHeroImages = async (imageUrls: string[], startingOrder: number = 1) => {
  try {
    const promises = imageUrls.map((url, idx) => 
      addDoc(collection(clientDb, "hero_images"), {
        imageUrl: url,
        order: startingOrder + idx,
        createdAt: serverTimestamp(),
      })
    );
    await Promise.all(promises);
  } catch (error) {
    console.error("Error adding hero images: ", error);
    throw error;
  }
};

export const updateHeroImage = async (
  id: string,
  data: { order?: number; imageUrl?: string; oldImageUrl?: string }
) => {
  try {
    const updateData: Partial<HeroImage> = {};
    if (typeof data.order === "number") {
      updateData.order = data.order;
    }
    if (data.imageUrl) {
      updateData.imageUrl = data.imageUrl;
      if (data.oldImageUrl && data.oldImageUrl !== data.imageUrl) {
        try {
          await deleteImageAction(data.oldImageUrl);
        } catch (e) {
          console.error("Failed to delete old image:", data.oldImageUrl, e);
        }
      }
    }

    const docRef = doc(clientDb, "hero_images", id);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating hero image document: ", error);
    throw error;
  }
};

export const deleteHeroImage = async (id: string, imageUrl: string) => {
  try {
    if (imageUrl) {
      try {
        await deleteImageAction(imageUrl);
      } catch (e) {
        console.error("Failed to delete image from Cloudinary:", imageUrl, e);
      }
    }
    
    const docRef = doc(clientDb, "hero_images", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting hero image document: ", error);
    throw error;
  }
};
